# PRD：情绪角色图片与视频生成工作流

**版本**: v2.0  
**状态**: 开发就绪  
**最后更新**: 2026-03

---

## 一、项目概述

从单张中立人物图片出发，自动生成50种情绪的4K高清图片及对应10秒情绪视频。

**核心价值**：一张中立图 + Prompt0 → 50张4K情绪图 → 50段情绪视频

**技术栈**：Gemini API（图片生成/增强）+ Runway Gen-3 API（视频生成）

---

## 二、输入 / 输出

| 项目 | 内容 |
|------|------|
| **输入（每次变化）** | ① 中立情绪人物图片（PNG/JPG）<br>② Prompt 0：生成该图片时的原始提示词 |
| **预设（固定不变）** | Prompt 1-5（见 prompts.md） |
| **最终输出** | 50张4K情绪图片 + 50段10秒情绪视频 |

---

## 三、工作流步骤

```
┌─────────────────────────────────────────────────────────────────────┐
│                         输入: 中立图 + Prompt0                        │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 步骤1: 生成25宫格图                                                   │
│   • Prompt1 → positive_grid.png (25种积极情绪)                        │
│   • Prompt2 → negative_grid.png (25种消极情绪)                        │
│   • 使用Gemini图像生成，参考输入图保持人物一致性                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 步骤2: 裁剪宫格为独立图片                                              │
│   • Prompt3 → 将每个25宫格裁剪为25张独立图                             │
│   • 去除文字标签，保留人物和透明背景                                    │
│   • 按情绪名称命名: joy.png, sadness.png, ...                         │
│   • 输出: crops/ 共50张                                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 步骤3: 4K超清提升                                                     │
│   • Prompt4 + Prompt0 → 将每张裁剪图提升至4K                          │
│   • 结合Prompt0人物描述还原细节                                        │
│   • 补充皮肤纹理、发丝、眼部细节                                        │
│   • 输出: 4k_images/ 共50张 *_4k.png                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 步骤4: 生成情绪视频                                                   │
│   • Prompt5 × 50 → 每张4K图作为首帧生成10秒视频                        │
│   • 包含面部微表情、自然眨眼、轻微头部运动                               │
│   • 输出: videos/ 共50个 *.mp4                                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 四、情绪列表

### 积极情绪 (25种)
| # | 英文 | 中文 | # | 英文 | 中文 |
|---|------|------|---|------|------|
| 1 | joy | 喜悦 | 14 | compassion | 同情 |
| 2 | contentment | 满足 | 15 | elevation | 升华 |
| 3 | amusement | 愉悦 | 16 | enthusiasm | 热情 |
| 4 | pride | 骄傲 | 17 | playfulness | 俏皮 |
| 5 | love | 爱 | 18 | curiosity | 好奇 |
| 6 | gratitude | 感恩 | 19 | interest | 兴趣 |
| 7 | awe | 敬畏 | 20 | anticipation | 期待 |
| 8 | inspiration | 灵感 | 21 | satisfaction | 满意 |
| 9 | serenity | 宁静 | 22 | affection | 喜爱 |
| 10 | hope | 希望 | 23 | triumph | 胜利 |
| 11 | relief | 释然 | 24 | calm_confidence | 沉稳自信 |
| 12 | trust | 信任 | 25 | delight | 欣喜 |
| 13 | admiration | 钦佩 |   |   |   |

### 消极情绪 (25种)
| # | 英文 | 中文 | # | 英文 | 中文 |
|---|------|------|---|------|------|
| 1 | sadness | 悲伤 | 14 | annoyance | 恼怒 |
| 2 | grief | 悲痛 | 15 | anger | 愤怒 |
| 3 | disappointment | 失望 | 16 | rage | 暴怒 |
| 4 | regret | 后悔 | 17 | disgust | 厌恶 |
| 5 | shame | 羞耻 | 18 | contempt | 蔑视 |
| 6 | guilt | 内疚 | 19 | jealousy | 嫉妒 |
| 7 | embarrassment | 尴尬 | 20 | envy | 羡慕 |
| 8 | anxiety | 焦虑 | 21 | distrust | 不信任 |
| 9 | fear | 恐惧 | 22 | suspicion | 怀疑 |
| 10 | panic | 恐慌 | 23 | confusion | 困惑 |
| 11 | worry | 担忧 | 24 | stress | 压力 |
| 12 | frustration | 挫败 | 25 | exhaustion | 疲惫 |
| 13 | irritation | 烦躁 |   |   |   |

---

## 五、文件目录结构

```
Character_Image_Gen/
├── PRD.md                   # 本文档
├── prompts.md               # 所有提示词（Prompt 1-5）
├── workflow.py              # 主工作流脚本
├── requirements.txt         # Python依赖
├── .env.template            # API Key配置模板
├── .env                     # 实际配置（git忽略）
├── input/                   # 输入目录
│   └── neutral.png          # 中立人物图片
└── output/                  # 输出目录（自动生成）
    ├── config.json          # 本次运行配置
    ├── step1_grids/         # 步骤1：宫格图
    │   ├── positive_grid.png
    │   └── negative_grid.png
    ├── step2_crops/         # 步骤2：裁剪图
    │   ├── joy.png
    │   ├── sadness.png
    │   └── ... (50张)
    ├── step3_4k/            # 步骤3：4K图
    │   ├── joy_4k.png
    │   └── ... (50张)
    └── step4_videos/        # 步骤4：视频
        ├── joy.mp4
        └── ... (50个)
```

---

## 六、技术规格

| 项目 | 规格 |
|------|------|
| 语言 | Python 3.10+ |
| 图片生成 | Google Gemini API (gemini-2.0-flash-exp-image-generation) |
| 图片增强 | Google Gemini API (imagen-3.0-generate-002) |
| 视频生成 | 即梦 (Jimeng) API |
| 图片格式 | PNG，透明背景 |
| 图片分辨率 | 最终4K（3840×2160 或等效） |
| 视频时长 | 每段10秒 |
| 视频格式 | MP4，1080p+ |

---

## 七、使用方法

### 1. 环境初始化（仅首次）

```bash
cd Character_Image_Gen

# 安装依赖
pip install -r requirements.txt

# 配置API Key
cp .env.template .env
# 编辑.env，填入GEMINI_API_KEY和JIMENG_API_KEY
```

### 2. 每次运行

```bash
# 基本用法
python workflow.py \
  --image input/neutral.png \
  --prompt0 "A photorealistic portrait of a young Asian woman with long black hair..."

# 从prompt0.txt文件读取（推荐长提示词）
python workflow.py \
  --image input/neutral.png \
  --prompt0-file input/prompt0.txt
```

### 3. 可选参数

```bash
# 跳过视频生成（仅生成图片）
python workflow.py --image input/neutral.png --prompt0 "..." --skip-video

# 从指定步骤开始（1=宫格 2=裁剪 3=4K 4=视频）
python workflow.py --image input/neutral.png --prompt0 "..." --from-step 3

# 自定义输出目录
python workflow.py --image input/neutral.png --prompt0 "..." --output ./character_alice

# 仅运行单个步骤
python workflow.py --image input/neutral.png --prompt0 "..." --only-step 2
```

---

## 八、API 成本估算

| 步骤 | 调用次数 | 单价估算 | 小计 |
|------|---------|---------|------|
| 步骤1: 宫格生成 | 2次 | $0.02/次 | $0.04 |
| 步骤2: 裁剪 | 2次 | $0.01/次 | $0.02 |
| 步骤3: 4K提升 | 50次 | $0.04/次 | $2.00 |
| 步骤4: 视频生成 | 50次 | $0.50/次 | $25.00 |
| **总计** | | | **~$27** |

*注: 价格为估算，实际以API官方定价为准*

---

## 九、注意事项

1. **API 限速**: 工作流内置延迟保护，避免触发Rate Limit
2. **人物一致性**: Prompt0透传是保持人物一致性的关键
3. **透明背景**: 所有中间图片要求透明背景（PNG）
4. **断点续跑**: 支持从任意步骤继续，避免API浪费
5. **成本控制**: 建议先用 `--only-step 1` 验证宫格效果再继续
