# Character_Image_Gen

从一张中立角色图出发，批量生成 50 种情绪图片，并可继续生成对应视频。

## 功能概览

- Step 1: 生成正/负情绪 5x5 宫格图（共 50 情绪）
- Step 2: 自动裁剪为 50 张独立情绪图
- Step 3: 每张情绪图进行 4K 增强
- Step 4: 可选生成情绪视频

主入口脚本：`workflow.py`

## 环境要求

- Python 3.10+
- 可联网访问 API 服务

## 安装依赖

```bash
cd Character_Image_Gen
pip install -r requirements.txt
```

## 配置环境变量

```bash
cp .env.example .env
```

在 `.env` 中至少填写：

```bash
GEMINI_API_KEY=your_key
JIMENG_API_KEY=your_key   # 可选，不填则跳过视频步骤
```

说明：
- `GEMINI_API_KEY`：必填，用于图片生成与增强
- `JIMENG_API_KEY`：仅主工作流 Step 4 生成视频时需要

## 快速开始

### 1) 基本用法（推荐从文件读取 prompt0）

```bash
python workflow.py \
  --name Akari \
  --image input/Chracter_Neutral/Akari_Neutral.png \
  --prompt0-file input/prompt0.txt
```

### 2) 仅生成图片（跳过视频）

```bash
python workflow.py \
  --name Akari \
  --image input/Chracter_Neutral/Akari_Neutral.png \
  --prompt0-file input/prompt0.txt \
  --skip-video
```

### 3) 断点续跑（从 Step 3 开始）

```bash
python workflow.py \
  --name Akari \
  --image input/Chracter_Neutral/Akari_Neutral.png \
  --prompt0-file input/prompt0.txt \
  --from-step 3
```

### 4) 只跑某一个步骤

```bash
python workflow.py \
  --name Akari \
  --image input/Chracter_Neutral/Akari_Neutral.png \
  --prompt0-file input/prompt0.txt \
  --only-step 2
```

## 参数说明

- `--name/-n`：角色名（必填），用于输出目录和文件命名
- `--image/-i`：中立人物图片路径（必填）
- `--prompt0/-p`：原始角色描述文本
- `--prompt0-file/-pf`：从文件读取 prompt0（优先级高于 `--prompt0`）
- `--output/-o`：输出根目录（默认 `./output`）
- `--skip-video`：跳过 Step 4
- `--from-step`：从指定步骤开始（1/2/3/4）
- `--only-step`：仅执行一个步骤（1/2/3/4）

## 输出结构

默认输出在 `output/<角色名>/`：

```text
output/<name>/
├── config.json
├── workflow.log
├── step1_grids/
├── step2_crops/
├── step3_4k/
└── step4_videos/   # 仅在视频步骤执行时出现
```

## 其他脚本

- `test_gemini.py`：Gemini 图片生成连通性测试
- `test_video.py` / `gen_videos.py`：基于火山方舟（`ARK_API_KEY`）的视频脚本

注意：`test_video.py` 与 `gen_videos.py` 使用 `ARK_API_KEY`，与 `workflow.py` 的 `JIMENG_API_KEY` 是两套视频调用方式。

## 常见问题

1. 报错“请在 .env 文件中设置 GEMINI_API_KEY”
- 检查当前目录是否为 `Character_Image_Gen`
- 确认 `.env` 文件存在且键名正确

2. 没有生成视频
- 未配置 `JIMENG_API_KEY` 或使用了 `--skip-video`

3. 中断后想继续
- 用 `--from-step` 从后续步骤续跑，避免重复消耗

## 参考文档

- 产品与流程：`PRD.md`
- 提示词细节：`prompts.md`
