# HelloSoul (LingLove MVP)

一个面向「AI 角色陪伴」场景的全栈项目，核心能力包括：
- 实时聊天（SSE 流式返回）
- 关系亲密度成长
- 记忆提取与回忆注入
- 深度用户画像（Deep Profile）
- 主动消息与生日内容
- 语音消息与语音通话占位能力

项目是 monorepo，前后端分别在 `frontend` 和 `backend`，数据库使用 Prisma + SQLite。

## 1. 技术栈

- Frontend: React 18 + TypeScript + Vite + Zustand + Tailwind
- Backend: Node.js + Express + TypeScript
- DB: Prisma + SQLite
- LLM: Anthropic Claude（`@anthropic-ai/sdk`）
- TTS: ElevenLabs（可选，未配置时前端可回退浏览器 TTS）

## 2. 目录结构

```text
HelloSoul/
├── frontend/              # 前端应用（Vite）
├── backend/               # 后端 API（Express）
├── prisma/schema.prisma   # Prisma 数据模型
├── Character_Image_Gen/   # 角色表情图/视频生成工具（独立 Python 工作流）
├── package.json           # 根 workspace 脚本
└── package-lock.json
```

## 3. 核心业务模块（快速理解）

后端路由入口：
- `/api/auth`：注册/登录/当前用户
- `/api/chat`：核心聊天接口（SSE），串联记忆、情绪状态、内心戏、深度画像提取
- `/api/memory`：记忆摘要、时间线、里程碑
- `/api/relationship`：亲密度关系与偏好设置
- `/api/feed`：生活流内容、互动、角色 SNS 档案
- `/api/profile`：深度画像、成长报告、反思问题
- `/api/proactive`：主动消息收件箱、生日内容、历史
- `/api/voice`：语音消息、内心语音、睡前故事、语音通话入口

数据库核心实体：
- `User` / `Relationship`
- `ChatMessage` / `Memory` / `Milestone`
- `DeepProfileField` / `ReflectionQuestion` / `GrowthReport`
- `ProactiveMessage` / `LifestyleFeedPost` / `FeedInteraction`

前端页面主流程：
- 登录 (`/login`)
- 角色选择 (`/onboarding`)
- 聊天 (`/chat`)
- Feed (`/feed`)
- Journal (`/journal`)
- Voice (`/call`)
- 画像与成长报告 (`/deep-profile`, `/growth-report`)

## 4. 本地启动（推荐）

### 4.1 环境要求

- Node.js 20+
- npm 10+

### 4.2 安装依赖

在仓库根目录执行：

```bash
npm install
```

### 4.3 配置后端环境变量

新建文件：`backend/.env`

参考内容：

```bash
# 必填（聊天/内容生成依赖）
ANTHROPIC_API_KEY=your_anthropic_api_key

# 必填（JWT 鉴权，生产环境务必替换）
JWT_SECRET=replace_with_a_secure_secret

# 必填（SQLite）
DATABASE_URL="file:../prisma/dev.db"

# 可选
PORT=3001
ELEVENLABS_API_KEY=
AKARI_VOICE_ID=
MINA_VOICE_ID=
SOPHIE_VOICE_ID=
CARLOS_VOICE_ID=
```

### 4.4 初始化 Prisma（当前目录结构建议命令）

```bash
cd backend
npx prisma generate --schema ../prisma/schema.prisma
npx prisma db push --schema ../prisma/schema.prisma
cd ..
```

### 4.5 启动前后端

在根目录执行：

```bash
npm run dev
```

启动后：
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health: `http://localhost:3001/api/health`

### 4.6 本地自动化回归（Playwright + Stubbed Backend）

用于替代大部分人工点测的本地回归命令：

```bash
npm run test
npm run qa:smoke
npm run qa:full
npm run qa:triage
```

说明：
- `npm run test`
  - 运行后端 `node:test` 集成/单测，以及前端 `Vitest` 单测。
- `npm run qa:smoke`
  - 启动本地 `TEST_PROFILE=e2e` 环境，运行 Playwright 核心回归。
- `npm run qa:full`
  - 在同一套 stubbed 环境下运行完整浏览器回归。
- `npm run qa:triage`
  - 读取最近一次 Playwright 失败结果，整理 AI 可读的故障包。

本地浏览器回归使用：
- 隔离 SQLite 数据库：`prisma/e2e.db`
- 固定 seed 用户：`qa@hellosoul.local / 123456`
- Stubbed LLM / Voice provider，不调用真实 Anthropic 或 ElevenLabs
- 失败产物目录：`.cache/qa/`

第一次使用 Playwright 时先安装浏览器：

```bash
npm run qa:install-browsers
```

## 5. 开发常用命令

根目录：

```bash
npm run dev
npm run build
npm run test
npm run qa:smoke
npm run qa:full
npm run qa:triage
```

后端（在 `backend`）：

```bash
npm run dev
npm run build
npm run start
npx prisma studio --schema ../prisma/schema.prisma
```

前端（在 `frontend`）：

```bash
npm run dev
npm run build
npm run preview
```

## 6. 调度任务说明（后端内置）

后端启动时会初始化定时任务（UTC）：
- 每日生成 feed 内容
- 每日关系衰减计算
- 每日生日检查
- 周期性补发 follow-up / miss-you 主动消息
- 每 5 分钟处理待发送主动消息

注意：这些任务依赖后端进程持续运行。

## 7. Character_Image_Gen 子项目说明

`Character_Image_Gen/` 是独立的 Python 工作流，用于从一张中立角色图批量生成 50 种情绪图与对应视频，不是主站点运行必需。

仅当你需要生产角色视觉素材时再使用它。详细说明见：
- `Character_Image_Gen/PRD.md`
- `Character_Image_Gen/workflow.py`

## 8. 新人上手建议（1 小时）

1. 跑通本地：完成 `.env`、Prisma 初始化、`npm run dev`。
2. 用 `register -> login -> /chat` 走通一条完整链路。
3. 打开 `prisma/schema.prisma` 看清核心表关系。
4. 看 `backend/src/routes/chat.ts`，这是主业务编排入口。
5. 再按模块读 `memory` / `proactive` / `profile` 三块服务。

---

如果你刚加入开发，优先理解两条主链路：
- 用户聊天链路：`Auth -> Chat -> Memory/Intimacy/Emotion`
- 长周期运营链路：`Proactive Scheduler -> Feed -> Growth/Reflection`
