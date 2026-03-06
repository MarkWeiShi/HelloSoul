#!/usr/bin/env python3
"""
情绪角色图片与视频生成工作流
Emotion Character Image & Video Generation Workflow

从单张中立人物图片出发，自动生成50种情绪的4K高清图片及对应10秒情绪视频。
"""

import os
import sys
import json
import time
import base64
import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass, asdict
from PIL import Image
import io

# ============================================================================
# 配置与常量
# ============================================================================

# 情绪列表
POSITIVE_EMOTIONS = [
    "joy", "contentment", "amusement", "pride", "love",
    "gratitude", "awe", "inspiration", "serenity", "hope",
    "relief", "trust", "admiration", "compassion", "elevation",
    "enthusiasm", "playfulness", "curiosity", "interest", "anticipation",
    "satisfaction", "affection", "triumph", "calm_confidence", "delight"
]

NEGATIVE_EMOTIONS = [
    "sadness", "grief", "disappointment", "regret", "shame",
    "guilt", "embarrassment", "anxiety", "fear", "panic",
    "worry", "frustration", "irritation", "annoyance", "anger",
    "rage", "disgust", "contempt", "jealousy", "envy",
    "distrust", "suspicion", "confusion", "stress", "exhaustion"
]

ALL_EMOTIONS = POSITIVE_EMOTIONS + NEGATIVE_EMOTIONS

# API 延迟设置（秒）
API_DELAY_GEMINI = 2.0
API_DELAY_JIMENG = 5.0

# ============================================================================
# 数据类
# ============================================================================

@dataclass
class WorkflowConfig:
    """工作流配置"""
    input_image: str
    prompt0: str
    output_dir: str
    character_name: str = "character"  # 角色名称，用于文件夹和文件命名
    skip_video: bool = False
    from_step: int = 1
    only_step: Optional[int] = None
    created_at: str = ""
    
    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.now().isoformat()

# ============================================================================
# 提示词模板
# ============================================================================

PROMPT_1_POSITIVE_GRID = """Use the provided reference image as the character identity to generate a 5×5 grid (25 images) of different POSITIVE emotions for the SAME character.

=== CHARACTER CONSISTENCY REQUIREMENTS ===
Keep IDENTICAL across all grid cells:
- Face structure and features
- Hairstyle and hair color
- Clothing and accessories
- Body proportions
- Art style and rendering
- Lighting direction
- Background (transparent)
- Camera framing (chest-up, upper body visible)

=== VARY ONLY THESE ELEMENTS ===
- Facial expression (muscle configuration)
- Eyebrow position and shape
- Eye openness and gaze direction
- Mouth shape and position
- Head tilt angle
- Subtle hand gestures
- Posture and body language

=== 25 POSITIVE EMOTIONS (Grid Order: Left→Right, Top→Bottom) ===
1. Joy — genuine Duchenne smile, cheeks raised, eyes crinkling warmly
2. Contentment — relaxed gentle smile, soft calm eyes, peaceful posture
3. Amusement — laughing expression, eyes squinting with humor
4. Pride — chin slightly raised, confident smile, upright posture
5. Love — soft affectionate eyes, warm gentle smile, leaning forward

6. Gratitude — appreciative smile, hands touching chest, humble posture
7. Awe — wide eyes, mouth slightly open, head tilted upward
8. Inspiration — bright focused eyes, excited smile, hand raised explaining
9. Serenity — peaceful expression, eyes half-closed, completely relaxed
10. Hope — optimistic smile, eyes looking forward to distance

11. Relief — shoulders dropped, eyes briefly closed, relaxed smile forming
12. Trust — calm open expression, steady eye contact, relaxed posture
13. Admiration — attentive gaze upward, respectful slight smile
14. Compassion — empathetic soft eyes, gentle concerned expression
15. Elevation — emotionally moved, eyes shining, hand on heart

16. Enthusiasm — energetic wide smile, animated gestures, lively posture
17. Playfulness — mischievous grin, raised eyebrow, teasing gesture
18. Curiosity — raised eyebrows, head tilted forward, examining closely
19. Interest — focused attentive gaze, slightly parted lips
20. Anticipation — excited expectation, raised eyebrows, leaning forward

21. Satisfaction — small pleased smile, relaxed confident posture
22. Affection — warm fond smile, soft loving eyes, caring gesture
23. Triumph — arms suggesting victory, confident victorious smile
24. Calm_Confidence — composed expression, steady gaze, balanced posture
25. Delight — sparkling eyes, joyful smile, hands lifted in excitement

=== GRID CELL SPACING REQUIREMENTS ===
- Each grid cell MUST have clear visible gaps/margins on all sides (top, bottom, left, right)
- Character in each cell should be centered with padding around them
- Leave at least 5-8% empty space as margin on each side of each cell
- NO character element (hands, hair, clothing) should touch or extend to cell edges
- Characters must NOT overlap or bleed into adjacent cells
- Clear separation between all 25 grid cells for easy cropping

=== QUALITY REQUIREMENTS ===
- Transparent background (NO solid color background)
- NO text labels on the image
- Each grid cell: highest resolution possible
- Must show 100% full upper body in each cell
- Each emotion clearly distinct through facial muscles
- All 25 images SAME character identity
"""

PROMPT_2_NEGATIVE_GRID = """Use the provided reference image as the character identity to generate a 5×5 grid (25 images) of different NEGATIVE emotions for the SAME character.

=== CHARACTER CONSISTENCY REQUIREMENTS ===
Keep IDENTICAL across all grid cells:
- Face structure and features
- Hairstyle and hair color
- Clothing and accessories
- Body proportions
- Art style and rendering
- Lighting direction
- Background (transparent)
- Camera framing (chest-up, upper body visible)

=== VARY ONLY THESE ELEMENTS ===
- Facial expression (muscle configuration)
- Eyebrow position and shape
- Eye openness and gaze direction
- Mouth shape and position
- Head tilt angle
- Subtle hand gestures
- Posture and body language

=== 25 NEGATIVE EMOTIONS (Grid Order: Left→Right, Top→Bottom) ===
1. Sadness — downturned mouth, drooping eyelids, slumped posture
2. Grief — intense sorrow, brows raised in middle, moist eyes
3. Disappointment — slight frown, lowered gaze, subtle head shake
4. Regret — sad reflective expression, eyes looking down, tense lips
5. Shame — head lowered, eyes avoiding contact, tense mouth

6. Guilt — conflicted expression, brows drawn together, tight lips
7. Embarrassment — awkward smile, eyes looking away, head lowered
8. Anxiety — wide tense eyes, brows raised and pulled together
9. Fear — widened eyes, raised brows, slightly open mouth, tense
10. Panic — very wide eyes, mouth open, rigid trembling posture

11. Worry — brows knitted, lips pressed together, concerned gaze
12. Frustration — clenched jaw, brows lowered, tense posture
13. Irritation — narrowed eyes, slight sneer, head tilted back
14. Annoyance — subtle scowl, raised eyebrow, impatient expression
15. Anger — brows sharply lowered, glaring eyes, tight lips

16. Rage — intense glaring, teeth bared, aggressive expression
17. Disgust — wrinkled nose, upper lip raised, eyes narrowed
18. Contempt — one-sided smirk, raised lip corner, dismissive gaze
19. Jealousy — suspicious narrowed eyes, tight mouth, guarded
20. Envy — resentful expression, forced smile, watching another

21. Distrust — skeptical eyes, brows slightly lowered, guarded
22. Suspicion — narrowed evaluating eyes, head tilted, scrutinizing
23. Confusion — brows raised unevenly, unfocused eyes, mouth open
24. Stress — tense facial muscles, furrowed brows, tight lips
25. Exhaustion — drooping eyelids, slumped posture, fatigued

=== GRID CELL SPACING REQUIREMENTS ===
- Each grid cell MUST have clear visible gaps/margins on all sides (top, bottom, left, right)
- Character in each cell should be centered with padding around them
- Leave at least 5-8% empty space as margin on each side of each cell
- NO character element (hands, hair, clothing) should touch or extend to cell edges
- Characters must NOT overlap or bleed into adjacent cells
- Clear separation between all 25 grid cells for easy cropping

=== QUALITY REQUIREMENTS ===
- Transparent background (NO solid color background)
- NO text labels on the image
- Each grid cell: highest resolution possible
- Must show 100% full upper body in each cell
- Each emotion clearly distinct through facial muscles
- All 25 images SAME character identity
"""

PROMPT_3_CROP = """Split the provided 5×5 image grid into 25 separate individual images.

=== CROPPING RULES ===
1. Processing Order: Left to right, top to bottom (Cell 1→25)
2. Output: Exactly 25 individual PNG images

=== BOUNDARY REQUIREMENTS ===
- Crop strictly within each grid cell boundaries
- Do NOT include pixels from neighboring cells
- NO cross-cell artifacts or overlapping content
- Top margin: slightly above character's head, but NO content from row above

=== CHARACTER FRAMING ===
- Each image: complete upper body of character
- Maintain consistent character size across all outputs
- Character centered and proportionally aligned
- Preserve the exact pose and expression from the grid cell

=== RESOLUTION ===
- Output resolution: 2160 × 3840 (4K vertical)
- Preserve facial details during upscaling
- Maintain sharp edges and clean lines

=== CLEANUP REQUIREMENTS ===
- Remove ANY text labels or annotations
- Keep character and transparent background only
- Clean edges with no artifacts
"""

PROMPT_4_UPSCALE_TEMPLATE = """Enhance and upscale this emotion portrait image to 4K ultra-high definition quality.

=== CHARACTER REFERENCE ===
Use the following character description to restore and enhance details:
{prompt0}

=== ENHANCEMENT REQUIREMENTS ===

1. Resolution Enhancement:
   - Upscale to 4K resolution (3840×2160 or equivalent)
   - Remove blur and noise artifacts
   - Sharpen edges while maintaining natural look

2. Detail Restoration:
   - Skin texture: Add realistic pores, subtle imperfections
   - Hair: Individual strand definition, natural highlights
   - Eyes: Iris detail, reflections, moisture
   - Lips: Natural texture and color depth
   - Clothing: Fabric texture and fold details

3. Preserve Exactly:
   - Original emotion/expression (DO NOT alter)
   - Character identity from reference (face structure, features)
   - Original pose and body position
   - Original lighting direction and mood
   - Transparent background

4. Quality Standards:
   - Photorealistic quality (if original is photorealistic)
   - Or maintain original art style (if stylized)
   - Natural color grading
   - No over-sharpening or artificial look
   - Clean alpha channel for transparency

=== OUTPUT ===
- Format: PNG with transparency
- Resolution: 4K (3840×2160 minimum)
- The enhanced image should look like a high-budget professional production
"""

# 视频提示词字典
VIDEO_PROMPTS = {
    # 积极情绪
    "joy": "Joy emotion animation, genuine Duchenne smile animation, cheeks gradually lifting, eyes crinkling warmly, bright joyful eyes sparkling, lively upright posture with small happy bounce of shoulders, natural breathing motion, joyful facial muscles relaxing and returning to starting position, seamless 10-second loop, first and last frame identical for perfect looping, character centered, consistent body scale, smooth expression transition, 4K ultra-high definition, transparent background.",
    "contentment": "Contentment emotion animation, relaxed gentle smile slowly appearing, soft calm eyes blinking naturally, shoulders gently lowering in relaxation, slow breathing chest movement, peaceful posture with subtle head tilt, expression softly returning to neutral relaxed smile for loop closure, seamless 10-second loop animation, first and last frame identical, character size fixed, smooth motion, 4K ultra-HD, transparent background.",
    "amusement": "Amusement laughing expression animation, mouth opening into light laughter, eyes squinting with humor, shoulders bouncing slightly as if chuckling, playful head tilt, brief laugh motion then returning to smiling start pose, seamless 10-second loop, first and last frame identical, smooth continuous motion, character centered, 4K ultra-HD, transparent background.",
    "pride": "Pride expression animation, chin slowly lifting, confident upright posture, subtle confident smile forming, eyes steady and proud, chest slightly expanding, small nod of self-confidence, returning smoothly to initial pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "love": "Love emotion animation, soft affectionate eyes, warm gentle smile slowly growing, body leaning slightly forward with caring warmth, subtle head tilt, small heartwarming expression change, returning smoothly to initial loving pose for loop, seamless 10-second loop, first and last frame identical, 4K ultra-HD, transparent background.",
    "gratitude": "Gratitude expression animation, warm appreciative smile forming, hands gently touching chest in thankful gesture, eyes soft and sincere, slight bow of the head, gentle breathing motion, returning to initial thankful pose for seamless loop, 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "awe": "Awe expression animation, eyes widening slowly, mouth slightly open in wonder, head tilting upward as if seeing something magnificent, subtle inhaling motion of surprise, expression gradually relaxing back to initial wonder pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "inspiration": "Inspiration animation, bright focused eyes lighting up, subtle excited smile appearing, one hand raising as if explaining a brilliant idea, expressive gesture movement, thoughtful head tilt, returning smoothly to initial thoughtful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "serenity": "Serenity calm animation, peaceful facial expression, eyes gently closed then slowly half-opening, relaxed breathing motion, shoulders loose and calm, head slightly tilted in tranquility, returning to original serene pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "hope": "Hope expression animation, optimistic soft smile appearing gradually, eyes looking gently forward into the distance, subtle uplift of posture as if gaining confidence, calm breathing movement, expression returning to initial hopeful pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "relief": "Relief emotion animation, shoulders slowly dropping after tension, eyes briefly closing in relaxation, soft relieved smile forming, gentle exhale motion, posture relaxing fully then returning to initial pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "trust": "Trust expression animation, calm open face, steady eye contact forward, relaxed open posture, gentle reassuring nod, soft smile, returning to original trusting pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "admiration": "Admiration animation, attentive gaze looking slightly upward toward someone admirable, respectful slight smile, subtle nod of appreciation, calm posture, expression returning to starting admiring pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "compassion": "Compassion expression animation, empathetic eyes softening, gentle concerned expression, body leaning slightly forward as if offering support, subtle head tilt, calm breathing motion, returning smoothly to starting compassionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "elevation": "Elevation emotion animation, emotionally moved expression, eyes shining with warmth, hand touching heart slowly, gentle smile forming, slight upward head tilt, returning to initial heartfelt pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "enthusiasm": "Enthusiasm animation, energetic wide smile, lively expressive gestures with hands moving excitedly, animated posture with slight bounce, bright eyes sparkling, returning smoothly to initial excited pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "playfulness": "Playfulness animation, mischievous grin forming, one eyebrow raising teasingly, playful head tilt, subtle cheeky gesture with hands, expression returning to initial playful pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "curiosity": "Curiosity expression animation, eyebrows raising slowly, head tilting slightly forward, eyes focusing closely as if examining something interesting, subtle leaning motion, returning smoothly to starting curious pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "interest": "Interest animation, focused attentive gaze forward, lips slightly parted, engaged posture leaning forward slightly, subtle nod of understanding, returning to initial attentive pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "anticipation": "Anticipation emotion animation, raised eyebrows with excited expectation, slight forward lean, bright eyes waiting eagerly, subtle body tension building then relaxing back to start pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "satisfaction": "Satisfaction animation, small pleased smile forming, relaxed confident posture, subtle nod of approval, calm breathing motion, expression returning smoothly to initial satisfied pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "affection": "Affection emotion animation, warm fond smile, soft loving eyes, gentle caring body language with slight forward lean, small tender gesture with hands, returning to initial affectionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "triumph": "Triumph animation, arms raising overhead in victory, confident victorious smile appearing, chest expanding proudly, celebratory gesture, returning smoothly to starting victorious pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "calm_confidence": "Calm confidence animation, composed facial expression, steady confident gaze forward, upright balanced posture, subtle nod of assurance, gentle breathing motion, returning to initial confident pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "delight": "Delight animation, bright sparkling eyes, joyful smile widening, hands lifting slightly in happy excitement, playful bounce of posture, returning smoothly to starting delighted pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    # 消极情绪
    "sadness": "Sadness emotion animation, downturned mouth slowly forming, drooping eyelids, gaze gradually lowering toward the ground, slumped shoulders and tired posture, subtle sigh and slow breathing motion, expression gently returning to the initial sad neutral pose, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "grief": "Grief emotion animation, intense sorrow expression, eyebrows raised in the middle, mouth trembling slightly, moist eyes blinking slowly as if holding tears, shoulders subtly shaking with deep emotional pain, expression slowly settling back to the initial grieving pose for loop closure, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "disappointment": "Disappointment expression animation, slight frown appearing, gaze lowering slowly, small disappointed head shake, shoulders dropping subtly, lips pressing briefly before relaxing back to initial disappointed pose, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "regret": "Regret emotion animation, sad reflective expression, eyes looking downward thoughtfully, lips tightening slightly with tension, subtle slow head tilt as if reflecting on a mistake, gentle sigh motion, expression returning to the original regretful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "shame": "Shame expression animation, head slowly lowering, eyes avoiding eye contact and glancing downward, tense mouth with lips pressed together, shoulders curling inward slightly, shy embarrassed breathing motion, returning smoothly to initial shame pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "guilt": "Guilt emotion animation, conflicted facial expression, brows drawn together tightly, lips pressed and trembling slightly, eyes glancing downward and sideways uneasily, subtle tense posture, expression gradually returning to the initial guilty pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "embarrassment": "Embarrassment animation, awkward small smile appearing nervously, eyes looking away to the side, head slightly lowered with shy posture, brief nervous shoulder movement, expression returning gently to starting embarrassed pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "anxiety": "Anxiety expression animation, wide tense eyes shifting slightly, brows raised and pulled together, tight mouth and shallow breathing, subtle restless head movement, shoulders slightly tense, expression returning to the starting anxious pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "fear": "Fear emotion animation, widened eyes scanning quickly, raised brows, slightly open mouth, tense posture with subtle backward lean, quick breathing motion, expression returning smoothly to initial fearful pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "panic": "Panic animation, extremely wide eyes, mouth open in alarm, rigid body posture with trembling motion, shoulders tense and lifted, fast breathing motion, expression gradually settling back to initial panic pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "worry": "Worry expression animation, brows knitted tightly, lips pressed together, concerned gaze shifting downward, subtle head tilt while thinking anxiously, shoulders tense then relaxing slightly back to original worried pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "frustration": "Frustration emotion animation, clenched jaw appearing gradually, brows lowered, tense posture with shoulders tightening, small irritated head movement, lips pressing then relaxing back to starting frustrated pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "irritation": "Irritation animation, narrowed eyes with slight sneer, head tilting back slightly in annoyance, subtle impatient facial twitch, lips curling briefly then returning to starting irritated expression, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "annoyance": "Annoyance expression animation, subtle scowl appearing, one eyebrow raising impatiently, eyes glancing sideways, slight head tilt with irritated posture, expression returning to initial annoyed pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "anger": "Anger animation, brows sharply lowered, glaring eyes focused forward, tight lips pressing firmly, tense posture with slight forward lean, controlled breathing motion, expression returning to initial angry pose for seamless loop, 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "rage": "Rage emotion animation, intense glaring eyes, teeth bared aggressively, brows deeply furrowed, strong tense body posture with slight shaking motion, heavy breathing, expression returning smoothly to initial rage pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "disgust": "Disgust expression animation, wrinkled nose appearing gradually, upper lip raised, narrowed eyes reacting to something unpleasant, slight head recoil backward, expression returning smoothly to initial disgust pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "contempt": "Contempt animation, one-sided smirk forming slowly, raised lip corner, dismissive sideways gaze, subtle head tilt of superiority, expression returning to initial contempt pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "jealousy": "Jealousy emotion animation, suspicious narrowed eyes glancing sideways, tight mouth with tension, guarded posture, subtle uneasy breathing motion, expression returning to starting jealous pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "envy": "Envy animation, resentful expression forming slowly, forced polite smile, eyes watching someone else with lingering gaze, subtle tension in posture, expression returning smoothly to initial envy pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "distrust": "Distrust expression animation, skeptical eyes narrowing slightly, brows lowered cautiously, guarded facial expression, subtle backward head tilt, expression returning smoothly to initial distrust pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "suspicion": "Suspicion animation, narrowed evaluating eyes, head tilting slightly to one side, thoughtful suspicious gaze examining something, lips pressing slightly, expression returning to initial suspicious pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "confusion": "Confusion expression animation, brows raised unevenly, eyes unfocused briefly then blinking, mouth slightly open in puzzlement, subtle head tilt while thinking, expression returning to starting confused pose for loop closure, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "stress": "Stress emotion animation, tense facial muscles tightening, brows deeply furrowed, lips pressed together firmly, shoulders stiff with pressure, quick tense breathing motion, expression returning smoothly to initial stressed pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "exhaustion": "Exhaustion animation, drooping eyelids slowly closing halfway, slumped tired posture, slow heavy breathing motion, head slightly lowering as if fatigued, expression returning gently to initial exhausted pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.",
}

# ============================================================================
# 日志配置
# ============================================================================

def setup_logging(output_dir: Path) -> logging.Logger:
    """配置日志"""
    log_file = output_dir / "workflow.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(log_file, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

# ============================================================================
# API 客户端
# ============================================================================

class GeminiClient:
    """Google Gemini API 客户端 - 使用新的 google.genai 包"""
    
    def __init__(self, api_key: str):
        try:
            from google import genai
            from google.genai import types
            self.client = genai.Client(api_key=api_key)
            self.types = types
            # 图片生成模型
            self.image_model = 'gemini-2.0-flash-exp-image-generation'
        except ImportError:
            raise ImportError("请安装 google-genai: pip install google-genai")
    
    def _call_with_retry(self, func, max_retries=3, initial_delay=60):
        """带重试逻辑的 API 调用"""
        from google.genai.errors import ClientError
        
        for attempt in range(max_retries):
            try:
                return func()
            except ClientError as e:
                if '429' in str(e) or 'RESOURCE_EXHAUSTED' in str(e):
                    wait_time = initial_delay * (2 ** attempt)  # 指数退避
                    logging.info(f"  配额限制，等待 {wait_time} 秒后重试 (attempt {attempt + 1}/{max_retries})...")
                    time.sleep(wait_time)
                else:
                    raise
        raise ValueError("超过最大重试次数")
    
    def generate_image_with_reference(self, prompt: str, reference_image_path: str) -> bytes:
        """根据参考图片生成新图片"""
        # 读取参考图片
        with open(reference_image_path, 'rb') as f:
            image_data = f.read()
        
        def _generate():
            # 生成请求
            response = self.client.models.generate_content(
                model=self.image_model,
                contents=[
                    self.types.Part.from_bytes(data=image_data, mime_type='image/png'),
                    prompt
                ],
                config=self.types.GenerateContentConfig(
                    response_modalities=['IMAGE', 'TEXT']
                )
            )
            
            # 提取图片数据
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.inline_data and part.inline_data.data:
                        return part.inline_data.data
            
            raise ValueError("Gemini 未返回图片数据")
        
        return self._call_with_retry(_generate)
    
    def upscale_image(self, image_path: str, prompt: str) -> bytes:
        """提升图片分辨率"""
        with open(image_path, 'rb') as f:
            image_data = f.read()
        
        def _upscale():
            response = self.client.models.generate_content(
                model=self.image_model,
                contents=[
                    self.types.Part.from_bytes(data=image_data, mime_type='image/png'),
                    prompt
                ],
                config=self.types.GenerateContentConfig(
                    response_modalities=['IMAGE', 'TEXT']
                )
            )
            
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.inline_data and part.inline_data.data:
                        return part.inline_data.data
            
            raise ValueError("图片提升失败")
        
        return self._call_with_retry(_upscale)


class JimengClient:
    """即梦 (Jimeng) AI 视频生成客户端
    
    即梦是字节跳动旗下的 AI 视频生成工具，通过火山引擎 API 调用。
    API 文档: https://www.volcengine.com/docs/6561/1422058
    """
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        # 火山引擎即梦 API 基础 URL
        self.base_url = "https://jimeng.volcengine.com/api/v1"
    
    def generate_video(self, image_path: str, prompt: str, duration: int = 10) -> bytes:
        """从图片生成视频
        
        Args:
            image_path: 输入图片路径
            prompt: 视频生成提示词
            duration: 视频时长（秒）
        
        Returns:
            视频文件字节数据
        """
        import requests
        
        # 读取图片并转为 base64
        with open(image_path, 'rb') as f:
            image_base64 = base64.b64encode(f.read()).decode('utf-8')
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # 创建视频生成任务
        # 注意: 以下为即梦 API 的通用结构，实际参数请参考官方文档
        payload = {
            "model": "jimeng-video-1.0",  # 即梦视频生成模型
            "image": f"data:image/png;base64,{image_base64}",
            "prompt": prompt,
            "duration": duration,
            "fps": 24,
            "resolution": "1080p"
        }
        
        # 提交视频生成任务
        response = requests.post(
            f"{self.base_url}/video/generate",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise ValueError(f"即梦 API 错误: {response.text}")
        
        result = response.json()
        task_id = result.get("data", {}).get("task_id") or result.get("task_id")
        
        if not task_id:
            raise ValueError(f"未获取到任务ID: {result}")
        
        # 轮询等待任务完成
        max_wait = 300  # 最长等待 5 分钟
        waited = 0
        
        while waited < max_wait:
            status_response = requests.get(
                f"{self.base_url}/video/task/{task_id}",
                headers=headers
            )
            
            status_data = status_response.json()
            data = status_data.get("data", status_data)
            status = data.get("status", "").upper()
            
            if status in ["SUCCESS", "SUCCEEDED", "COMPLETED"]:
                video_url = data.get("video_url") or data.get("output", {}).get("video_url")
                if video_url:
                    video_response = requests.get(video_url)
                    return video_response.content
                raise ValueError(f"未获取到视频URL: {data}")
            elif status in ["FAILED", "ERROR"]:
                error_msg = data.get("error") or data.get("message") or "未知错误"
                raise ValueError(f"视频生成失败: {error_msg}")
            
            time.sleep(5)  # 每5秒检查一次
            waited += 5
        
        raise ValueError(f"视频生成超时（{max_wait}秒）")

# ============================================================================
# 图片处理工具
# ============================================================================

def detect_grid_lines(img_array, axis: int, num_lines: int = 4) -> List[int]:
    """
    使用边缘检测找到宫格分隔线的位置
    
    Args:
        img_array: numpy图片数组
        axis: 0表示检测水平线（返回y坐标），1表示检测垂直线（返回x坐标）
        num_lines: 期望检测到的分隔线数量（5x5宫格有4条内部分隔线）
    
    Returns:
        分隔线位置列表
    """
    import cv2
    import numpy as np
    
    # 转换为灰度图
    if len(img_array.shape) == 3:
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
    else:
        gray = img_array
    
    # 使用Canny边缘检测
    edges = cv2.Canny(gray, 50, 150)
    
    # 根据axis选择投影方向
    if axis == 0:  # 检测水平线 - 沿x轴投影
        projection = np.sum(edges, axis=1)
    else:  # 检测垂直线 - 沿y轴投影
        projection = np.sum(edges, axis=0)
    
    # 平滑投影曲线
    kernel_size = 5
    projection = np.convolve(projection, np.ones(kernel_size)/kernel_size, mode='same')
    
    # 找到峰值（分隔线位置）
    length = len(projection)
    cell_size = length // 5
    
    # 在每个期望的分隔位置附近寻找最高峰
    lines = []
    for i in range(1, 5):  # 4条内部分隔线
        expected_pos = i * cell_size
        search_start = max(0, expected_pos - cell_size // 4)
        search_end = min(length, expected_pos + cell_size // 4)
        
        region = projection[search_start:search_end]
        if len(region) > 0:
            peak_in_region = np.argmax(region)
            actual_pos = search_start + peak_in_region
            lines.append(actual_pos)
    
    return sorted(lines)


def remove_background(img: Image.Image) -> Image.Image:
    """
    使用 rembg 移除图片背景，生成透明背景的人物图片
    
    Args:
        img: PIL Image 对象
    
    Returns:
        带透明背景的 PIL Image 对象
    """
    try:
        from rembg import remove
        # rembg 接受 PIL Image 并返回带透明背景的 PIL Image
        result = remove(img)
        return result
    except ImportError:
        logging.warning("rembg 未安装，跳过背景移除。请运行: pip install rembg")
        return img
    except Exception as e:
        logging.warning(f"背景移除失败: {e}，返回原图")
        return img


def crop_grid_to_images_precise(grid_path: str, output_dir: Path, emotions: List[str], 
                                 character_name: str = "", padding: int = 5, 
                                 remove_bg: bool = True, logger=None) -> List[str]:
    """
    使用边缘检测精确裁剪5x5宫格图为25张独立图片，并使用人物识别抠图
    
    Args:
        grid_path: 宫格图路径
        output_dir: 输出目录
        emotions: 情绪名称列表（25个）
        character_name: 角色名称，用于文件命名前缀
        padding: 裁剪时向内收缩的像素数，避免包含分隔线
        remove_bg: 是否移除背景生成透明PNG
        logger: 日志记录器
    
    Returns:
        输出文件路径列表
    """
    import cv2
    import numpy as np
    
    # 读取图片
    img = Image.open(grid_path)
    # 确保图片有 alpha 通道
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    img_array = np.array(img)
    width, height = img.size
    
    if logger:
        logger.info(f"  图片尺寸: {width}x{height}")
    
    # 检测垂直分隔线（找x坐标）
    v_lines = detect_grid_lines(img_array, axis=1, num_lines=4)
    # 检测水平分隔线（找y坐标）
    h_lines = detect_grid_lines(img_array, axis=0, num_lines=4)
    
    if logger:
        logger.info(f"  检测到垂直线: {v_lines}")
        logger.info(f"  检测到水平线: {h_lines}")
    
    # 构建完整的边界列表（包括图片边缘）
    x_boundaries = [0] + v_lines + [width]
    y_boundaries = [0] + h_lines + [height]
    
    # 确保有6个边界点（5个单元格）
    if len(x_boundaries) != 6:
        if logger:
            logger.warning(f"  垂直边界数量不正确({len(x_boundaries)})，使用均匀分割")
        x_boundaries = [i * width // 5 for i in range(6)]
    
    if len(y_boundaries) != 6:
        if logger:
            logger.warning(f"  水平边界数量不正确({len(y_boundaries)})，使用均匀分割")
        y_boundaries = [i * height // 5 for i in range(6)]
    
    output_paths = []
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 预加载 rembg 模型（如果需要移除背景）
    if remove_bg:
        try:
            from rembg import remove, new_session
            # 使用 u2net_human_seg 模型，专门针对人物分割
            session = new_session("u2net_human_seg")
            if logger:
                logger.info("  使用 u2net_human_seg 模型进行人物抠图")
        except ImportError:
            if logger:
                logger.warning("  rembg 未安装，跳过背景移除")
            remove_bg = False
            session = None
        except Exception as e:
            if logger:
                logger.warning(f"  rembg 模型加载失败: {e}，跳过背景移除")
            remove_bg = False
            session = None
    
    for i, emotion in enumerate(emotions):
        row = i // 5
        col = i % 5
        
        # 获取单元格边界
        left = x_boundaries[col] + padding
        right = x_boundaries[col + 1] - padding
        top = y_boundaries[row] + padding
        bottom = y_boundaries[row + 1] - padding
        
        # 确保边界有效
        left = max(0, left)
        top = max(0, top)
        right = min(width, right)
        bottom = min(height, bottom)
        
        # 裁剪
        cell_img = img.crop((left, top, right, bottom))
        
        # 移除背景，生成透明人物图
        if remove_bg and session:
            try:
                from rembg import remove
                cell_img = remove(cell_img, session=session)
            except Exception as e:
                if logger:
                    logger.warning(f"  [{emotion}] 背景移除失败: {e}")
        
        # 保存 - 使用 角色名_情绪 格式命名
        if character_name:
            output_path = output_dir / f"{character_name}_{emotion}.png"
        else:
            output_path = output_dir / f"{emotion}.png"
        cell_img.save(output_path, "PNG")
        output_paths.append(str(output_path))
    
    return output_paths


def crop_grid_to_images(grid_path: str, output_dir: Path, emotions: List[str], character_name: str = "") -> List[str]:
    """将5x5宫格图裁剪为25张独立图片（简单均匀分割，已弃用）"""
    img = Image.open(grid_path)
    width, height = img.size
    
    cell_width = width // 5
    cell_height = height // 5
    
    output_paths = []
    
    for i, emotion in enumerate(emotions):
        row = i // 5
        col = i % 5
        
        left = col * cell_width
        top = row * cell_height
        right = left + cell_width
        bottom = top + cell_height
        
        cell_img = img.crop((left, top, right, bottom))
        
        # 保存裁剪后的图片 - 使用 角色名_情绪 格式命名
        if character_name:
            output_path = output_dir / f"{character_name}_{emotion}.png"
        else:
            output_path = output_dir / f"{emotion}.png"
        cell_img.save(output_path, "PNG")
        output_paths.append(str(output_path))
    
    return output_paths

# ============================================================================
# 工作流步骤
# ============================================================================

def step1_generate_grids(
    config: WorkflowConfig,
    gemini: GeminiClient,
    output_dir: Path,
    logger: logging.Logger
) -> Tuple[str, str]:
    """步骤1: 生成25宫格图"""
    logger.info("=" * 60)
    logger.info("步骤1: 生成情绪宫格图")
    logger.info("=" * 60)
    
    grids_dir = output_dir / "step1_grids"
    grids_dir.mkdir(exist_ok=True)
    
    name = config.character_name
    
    # 生成积极情绪宫格
    logger.info("正在生成积极情绪25宫格...")
    positive_data = gemini.generate_image_with_reference(
        PROMPT_1_POSITIVE_GRID,
        config.input_image
    )
    positive_path = grids_dir / f"{name}_positive_grid.png"
    with open(positive_path, 'wb') as f:
        f.write(positive_data)
    logger.info(f"✓ 积极情绪宫格已保存: {positive_path}")
    
    time.sleep(API_DELAY_GEMINI)
    
    # 生成消极情绪宫格
    logger.info("正在生成消极情绪25宫格...")
    negative_data = gemini.generate_image_with_reference(
        PROMPT_2_NEGATIVE_GRID,
        config.input_image
    )
    negative_path = grids_dir / f"{name}_negative_grid.png"
    with open(negative_path, 'wb') as f:
        f.write(negative_data)
    logger.info(f"✓ 消极情绪宫格已保存: {negative_path}")
    
    return str(positive_path), str(negative_path)


def step2_crop_grids(
    positive_grid: str,
    negative_grid: str,
    output_dir: Path,
    logger: logging.Logger,
    character_name: str = ""
) -> List[str]:
    """步骤2: 裁剪宫格为独立图片"""
    logger.info("=" * 60)
    logger.info("步骤2: 裁剪宫格图")
    logger.info("=" * 60)
    
    crops_dir = output_dir / "step2_crops"
    crops_dir.mkdir(exist_ok=True)
    
    all_crops = []
    
    # 裁剪积极情绪宫格 - 使用边缘检测精确裁剪
    logger.info("正在裁剪积极情绪宫格 (使用边缘检测)...")
    positive_crops = crop_grid_to_images_precise(positive_grid, crops_dir, POSITIVE_EMOTIONS, 
                                                  character_name=character_name, logger=logger)
    all_crops.extend(positive_crops)
    logger.info(f"✓ 已裁剪 {len(positive_crops)} 张积极情绪图片")
    
    # 裁剪消极情绪宫格 - 使用边缘检测精确裁剪
    logger.info("正在裁剪消极情绪宫格 (使用边缘检测)...")
    negative_crops = crop_grid_to_images_precise(negative_grid, crops_dir, NEGATIVE_EMOTIONS,
                                                  character_name=character_name, logger=logger)
    all_crops.extend(negative_crops)
    logger.info(f"✓ 已裁剪 {len(negative_crops)} 张消极情绪图片")
    
    return all_crops


def step3_upscale_to_4k(
    crop_images: List[str],
    config: WorkflowConfig,
    gemini: GeminiClient,
    output_dir: Path,
    logger: logging.Logger
) -> List[str]:
    """步骤3: 提升到4K分辨率"""
    logger.info("=" * 60)
    logger.info("步骤3: 4K超清提升")
    logger.info("=" * 60)
    
    upscale_dir = output_dir / "step3_4k"
    upscale_dir.mkdir(exist_ok=True)
    
    upscale_prompt = PROMPT_4_UPSCALE_TEMPLATE.format(prompt0=config.prompt0)
    upscaled_images = []
    
    total = len(crop_images)
    for i, crop_path in enumerate(crop_images, 1):
        emotion = Path(crop_path).stem
        logger.info(f"[{i}/{total}] 正在提升: {emotion}")
        
        try:
            upscaled_data = gemini.upscale_image(crop_path, upscale_prompt)
            output_path = upscale_dir / f"{emotion}_4k.png"
            with open(output_path, 'wb') as f:
                f.write(upscaled_data)
            upscaled_images.append(str(output_path))
            logger.info(f"  ✓ 完成: {output_path.name}")
        except Exception as e:
            logger.error(f"  ✗ 失败: {e}")
        
        time.sleep(API_DELAY_GEMINI)
    
    logger.info(f"✓ 共完成 {len(upscaled_images)}/{total} 张4K图片")
    return upscaled_images


def step4_generate_videos(
    upscaled_images: List[str],
    jimeng: JimengClient,
    output_dir: Path,
    logger: logging.Logger,
    character_name: str = ""
) -> List[str]:
    """步骤4: 生成情绪视频（使用即梦 API）"""
    logger.info("=" * 60)
    logger.info("步骤4: 生成情绪视频")
    logger.info("=" * 60)
    
    videos_dir = output_dir / "step4_videos"
    videos_dir.mkdir(exist_ok=True)
    
    video_paths = []
    total = len(upscaled_images)
    
    for i, image_path in enumerate(upscaled_images, 1):
        # 从文件名提取情绪名称 (去除 _4k 后缀和可能的角色名前缀)
        filename_stem = Path(image_path).stem.replace("_4k", "")
        
        # 如果有角色名前缀，提取纯情绪名称用于查找 VIDEO_PROMPTS
        if character_name and filename_stem.startswith(f"{character_name}_"):
            emotion = filename_stem[len(f"{character_name}_"):]
        else:
            emotion = filename_stem
        
        if emotion not in VIDEO_PROMPTS:
            logger.warning(f"[{i}/{total}] 跳过未知情绪: {emotion}")
            continue
        
        logger.info(f"[{i}/{total}] 正在生成视频: {emotion}")
        
        try:
            video_data = jimeng.generate_video(
                image_path,
                VIDEO_PROMPTS[emotion],
                duration=10
            )
            # 使用 角色名_情绪 格式命名视频
            if character_name:
                output_path = videos_dir / f"{character_name}_{emotion}.mp4"
            else:
                output_path = videos_dir / f"{emotion}.mp4"
            with open(output_path, 'wb') as f:
                f.write(video_data)
            video_paths.append(str(output_path))
            logger.info(f"  ✓ 完成: {output_path.name}")
        except Exception as e:
            logger.error(f"  ✗ 失败: {e}")
        
        time.sleep(API_DELAY_JIMENG)
    
    logger.info(f"✓ 共完成 {len(video_paths)}/{total} 个视频")
    return video_paths

# ============================================================================
# 主工作流
# ============================================================================

def run_workflow(config: WorkflowConfig):
    """运行完整工作流"""
    # 创建输出目录 - 使用角色名称建立子文件夹
    base_output_dir = Path(config.output_dir)
    output_dir = base_output_dir / config.character_name
    output_dir.mkdir(parents=True, exist_ok=True)
    
    character_name = config.character_name
    
    # 设置日志
    logger = setup_logging(output_dir)
    
    logger.info("=" * 60)
    logger.info("情绪角色图片与视频生成工作流")
    logger.info("=" * 60)
    logger.info(f"角色名称: {character_name}")
    logger.info(f"输入图片: {config.input_image}")
    logger.info(f"输出目录: {output_dir}")
    logger.info(f"跳过视频: {config.skip_video}")
    logger.info(f"起始步骤: {config.from_step}")
    
    # 保存配置
    config_path = output_dir / "config.json"
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(asdict(config), f, ensure_ascii=False, indent=2)
    
    # 加载 API Keys
    from dotenv import load_dotenv
    load_dotenv()
    
    gemini_key = os.getenv("GEMINI_API_KEY")
    jimeng_key = os.getenv("JIMENG_API_KEY")
    
    if not gemini_key:
        raise ValueError("请在 .env 文件中设置 GEMINI_API_KEY")
    
    # 初始化客户端
    gemini = GeminiClient(gemini_key)
    jimeng = JimengClient(jimeng_key) if jimeng_key and not config.skip_video else None
    
    # 确定需要运行的步骤
    if config.only_step:
        steps_to_run = [config.only_step]
    else:
        steps_to_run = list(range(config.from_step, 5))
        if config.skip_video and 4 in steps_to_run:
            steps_to_run.remove(4)
    
    # 执行步骤
    positive_grid = None
    negative_grid = None
    crop_images = []
    upscaled_images = []
    
    grids_dir = output_dir / "step1_grids"
    crops_dir = output_dir / "step2_crops"
    upscale_dir = output_dir / "step3_4k"
    
    # 步骤1: 生成宫格
    if 1 in steps_to_run:
        positive_grid, negative_grid = step1_generate_grids(
            config, gemini, output_dir, logger
        )
    else:
        # 尝试从已有文件加载 - 自动检测文件名
        positive_grid = None
        negative_grid = None
        
        # 查找所有图片文件
        grid_files = list(grids_dir.glob("*.png")) + list(grids_dir.glob("*.jpg"))
        logger.info(f"在 {grids_dir} 找到 {len(grid_files)} 个图片文件")
        
        for f in grid_files:
            fname = f.name.lower()
            logger.info(f"  检测文件: {f.name}")
            if 'positive' in fname or 'pos' in fname or '积极' in fname:
                positive_grid = str(f)
                logger.info(f"    → 识别为积极情绪宫格")
            elif 'negative' in fname or 'neg' in fname or '消极' in fname:
                negative_grid = str(f)
                logger.info(f"    → 识别为消极情绪宫格")
        
        # 如果自动检测失败，按顺序分配
        if not positive_grid or not negative_grid:
            if len(grid_files) >= 2:
                # 按文件名排序
                grid_files_sorted = sorted(grid_files, key=lambda x: x.name)
                if not positive_grid:
                    positive_grid = str(grid_files_sorted[0])
                if not negative_grid:
                    negative_grid = str(grid_files_sorted[1])
                logger.warning(f"无法通过文件名识别，按顺序分配")
                logger.info(f"  积极情绪: {Path(positive_grid).name}")
                logger.info(f"  消极情绪: {Path(negative_grid).name}")
            else:
                raise FileNotFoundError(f"在 {grids_dir} 中找不到足够的宫格图片（需要2张）")
    
    # 步骤2: 裁剪宫格
    if 2 in steps_to_run:
        crop_images = step2_crop_grids(
            positive_grid, negative_grid, output_dir, logger, character_name=character_name
        )
    else:
        # 从已有文件加载 - 使用 角色名_情绪 格式
        crop_images = [str(crops_dir / f"{character_name}_{e}.png") for e in ALL_EMOTIONS]
    
    # 步骤3: 4K提升
    if 3 in steps_to_run:
        upscaled_images = step3_upscale_to_4k(
            crop_images, config, gemini, output_dir, logger
        )
    else:
        # 从已有文件加载 - 使用 角色名_情绪_4k 格式
        upscaled_images = [str(upscale_dir / f"{character_name}_{e}_4k.png") for e in ALL_EMOTIONS]
    
    # 步骤4: 生成视频
    if 4 in steps_to_run:
        if not jimeng:
            logger.warning("未配置 JIMENG_API_KEY，跳过视频生成")
        else:
            step4_generate_videos(upscaled_images, jimeng, output_dir, logger, character_name=character_name)
    
    logger.info("=" * 60)
    logger.info("工作流完成！")
    logger.info("=" * 60)

# ============================================================================
# 命令行入口
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="情绪角色图片与视频生成工作流",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基本用法
  python workflow.py --name Akari --image input/neutral.png --prompt0 "描述文字..."
  
  # 从文件读取 prompt0
  python workflow.py --name Akari --image input/neutral.png --prompt0-file input/prompt0.txt
  
  # 跳过视频生成
  python workflow.py --name Akari --image input/neutral.png --prompt0 "..." --skip-video
  
  # 从步骤3开始（断点续跑）
  python workflow.py --name Akari --image input/neutral.png --prompt0 "..." --from-step 3
        """
    )
    
    parser.add_argument(
        "--name", "-n",
        required=True,
        help="角色名称，用于创建输出文件夹和文件命名（如: Akari）"
    )
    
    parser.add_argument(
        "--image", "-i",
        required=True,
        help="中立情绪人物图片路径"
    )
    
    parser.add_argument(
        "--prompt0", "-p",
        help="生成原始图片时使用的 Gemini 提示词"
    )
    
    parser.add_argument(
        "--prompt0-file", "-pf",
        help="从文件读取 prompt0（优先于 --prompt0）"
    )
    
    parser.add_argument(
        "--output", "-o",
        default="./output",
        help="输出目录路径（默认: ./output）"
    )
    
    parser.add_argument(
        "--skip-video",
        action="store_true",
        help="跳过视频生成（仅生成图片）"
    )
    
    parser.add_argument(
        "--from-step",
        type=int,
        default=1,
        choices=[1, 2, 3, 4],
        help="从指定步骤开始执行（1=宫格, 2=裁剪, 3=4K, 4=视频）"
    )
    
    parser.add_argument(
        "--only-step",
        type=int,
        choices=[1, 2, 3, 4],
        help="仅执行指定步骤"
    )
    
    args = parser.parse_args()
    
    # 获取 prompt0
    if args.prompt0_file:
        with open(args.prompt0_file, 'r', encoding='utf-8') as f:
            prompt0 = f.read().strip()
    elif args.prompt0:
        prompt0 = args.prompt0
    else:
        parser.error("必须提供 --prompt0 或 --prompt0-file 参数")
    
    # 验证输入图片
    if not os.path.exists(args.image):
        parser.error(f"输入图片不存在: {args.image}")
    
    # 创建配置
    config = WorkflowConfig(
        input_image=os.path.abspath(args.image),
        prompt0=prompt0,
        output_dir=os.path.abspath(args.output),
        character_name=args.name,
        skip_video=args.skip_video,
        from_step=args.from_step,
        only_step=args.only_step
    )
    
    # 运行工作流
    run_workflow(config)


if __name__ == "__main__":
    main()
