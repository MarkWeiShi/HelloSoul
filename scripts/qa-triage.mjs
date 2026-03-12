import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const qaRoot = path.join(root, '.cache', 'qa');
const reportPath = path.join(qaRoot, 'report.json');

const reportRaw = await safeRead(reportPath);
if (!reportRaw) {
  console.error('No Playwright JSON report found at .cache/qa/report.json');
  process.exit(1);
}

const report = JSON.parse(reportRaw);
const failedTests = collectFailedTests(report.suites || []);

if (failedTests.length === 0) {
  console.log('No failed Playwright tests were found in the latest report.');
  process.exit(0);
}

const latestFailure = failedTests[0];
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const triageDir = path.join(qaRoot, 'triage', timestamp);
await fs.mkdir(triageDir, { recursive: true });

const attachments = (latestFailure.attachments || []).filter((attachment) => attachment.path);
for (const attachment of attachments) {
  const source = attachment.path;
  const target = path.join(triageDir, path.basename(attachment.path));
  await fs.copyFile(source, target);
}

const backendLogPath = path.join(qaRoot, 'backend.log');
const frontendLogPath = path.join(qaRoot, 'frontend.log');
await copyIfExists(backendLogPath, path.join(triageDir, 'backend.log'));
await copyIfExists(frontendLogPath, path.join(triageDir, 'frontend.log'));

const networkLog = await readJsonAttachment(attachments, 'network.json');
const browserConsole = await readJsonAttachment(attachments, 'browser-console.json');
const pageErrors = await readJsonAttachment(attachments, 'page-errors.json');

const suspiciousRequest =
  networkLog?.find((entry) => entry.type === 'requestfailed')
  || networkLog?.find((entry) => typeof entry.status === 'number' && entry.status >= 400)
  || null;

const firstConsoleError =
  browserConsole?.find((entry) => entry.type === 'error')
  || pageErrors?.[0]
  || null;

const likelyLayer = inferLikelyLayer({
  suspiciousRequest,
  firstConsoleError,
});

const summary = [
  `# QA Triage Summary`,
  ``,
  `- Test: ${latestFailure.titlePath.join(' > ')}`,
  `- File: ${latestFailure.file}`,
  `- Project: ${latestFailure.projectName || 'default'}`,
  `- Likely layer: ${likelyLayer}`,
  `- First suspicious request: ${formatRequest(suspiciousRequest)}`,
  `- First suspicious component/log: ${formatConsoleError(firstConsoleError)}`,
  ``,
  `## Failure`,
  ``,
  '```',
  latestFailure.errorText || 'No error text captured.',
  '```',
  ``,
  `## Next checks`,
  ``,
  `1. Re-run the failing test in isolation with the repro script.`,
  `2. Inspect ${suspiciousRequest ? path.basename(findAttachmentPath(attachments, 'network.json') || 'network.json') : 'backend.log'} for the first broken request.`,
  `3. Compare browser console and backend log timestamps around the first failure.`,
  ``,
].join('\n');

await fs.writeFile(path.join(triageDir, 'summary.md'), summary);

const repro = [
  '#!/usr/bin/env bash',
  'set -euo pipefail',
  '',
  `cd ${shellEscape(root)}`,
  `npx playwright test ${shellEscape(latestFailure.file)} --grep ${shellEscape(latestFailure.titlePath[latestFailure.titlePath.length - 1])}`,
  '',
].join('\n');

await fs.writeFile(path.join(triageDir, 'repro.sh'), repro, { mode: 0o755 });

console.log(`Triage bundle created: ${triageDir}`);

function collectFailedTests(suites, parents = []) {
  const failures = [];

  for (const suite of suites) {
    const nextParents = suite.title ? [...parents, suite.title] : parents;

    for (const spec of suite.specs || []) {
      for (const test of spec.tests || []) {
        const failedResult = (test.results || []).find((result) => result.status === 'failed');
        if (failedResult) {
          failures.push({
            titlePath: [...nextParents, spec.title].filter(Boolean),
            file: spec.file,
            projectName: test.projectName,
            errorText: failedResult.error?.message || failedResult.error?.stack,
            attachments: failedResult.attachments || [],
          });
        }
      }
    }

    failures.push(...collectFailedTests(suite.suites || [], nextParents));
  }

  return failures;
}

async function safeRead(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

async function copyIfExists(source, target) {
  try {
    await fs.copyFile(source, target);
  } catch {
    // Ignore missing logs.
  }
}

async function readJsonAttachment(attachments, fileName) {
  const attachmentPath = findAttachmentPath(attachments, fileName);
  if (!attachmentPath) return null;

  try {
    const raw = await fs.readFile(attachmentPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function findAttachmentPath(attachments, fileName) {
  return attachments.find((attachment) => attachment.path?.endsWith(fileName))?.path || null;
}

function inferLikelyLayer(params) {
  if (params.suspiciousRequest?.status >= 500 || params.suspiciousRequest?.type === 'requestfailed') {
    return 'backend';
  }
  if (params.suspiciousRequest?.status >= 400) {
    return 'test-data or backend contract';
  }
  if (params.firstConsoleError) {
    return 'frontend';
  }
  return 'unknown';
}

function formatRequest(request) {
  if (!request) return 'none';
  if (request.type === 'requestfailed') {
    return `${request.method} ${request.url} failed: ${request.failureText || 'unknown error'}`;
  }
  return `${request.method} ${request.url} -> ${request.status}`;
}

function formatConsoleError(entry) {
  if (!entry) return 'none';
  return entry.text || entry.message || 'unknown error';
}

function shellEscape(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}
