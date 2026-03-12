export const TEST_PROFILE = (process.env.TEST_PROFILE || '').trim();

export function isE2EProfile(): boolean {
  return TEST_PROFILE === 'e2e';
}

export function isAutomatedProfile(): boolean {
  return TEST_PROFILE === 'e2e' || TEST_PROFILE === 'test';
}

export function shouldExposeTestRoutes(): boolean {
  return isAutomatedProfile();
}

export function shouldRunScheduledJobs(): boolean {
  return !isAutomatedProfile() && process.env.DISABLE_SCHEDULED_JOBS !== '1';
}

export function getPort(): number {
  return Number.parseInt(process.env.PORT || '3001', 10);
}
