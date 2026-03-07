#!/usr/bin/env python3
"""生成指定情绪的视频"""

import os
import sys
import time
import base64
import io
import requests
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# 火山方舟API配置
ARK_API_KEY = os.getenv("ARK_API_KEY")
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedance-1-5-pro-251215"

# 【重要】视频循环强调
VIDEO_LOOP_EMPHASIS = "【起始帧要求】视频起始帧必须完全呈现人物从膝盖到头顶（包括头发最高顶部）的所有身体部分，两侧肩膀和手臂必须完整呈现在画面内，不得有任何裁切。【全程一致性约束】视频所有帧（从第一帧到最后一帧）的人物大小必须完全一致不变，人物离镜头的距离必须完全一致不变，禁止任何缩放、推拉镜头或改变角色在画面中比例的效果，镜头固定不动，身体动作不能改变人物大小和离镜头距离，只有角色面部表情和肢体动作变化。【循环要求】视频必须形成完美循环：第一帧和最后一帧必须是完全相同的画面，动作在结尾时平滑过渡回起始状态。"

# 视频提示词 - 所有50个情绪
VIDEO_PROMPTS = {
    # === 积极情绪 (25个) ===
    "joy": "Joy emotion animation, genuine Duchenne smile animation, cheeks gradually lifting, eyes crinkling warmly, bright joyful eyes sparkling, lively upright posture with small happy bounce of shoulders, natural breathing motion, joyful facial muscles relaxing and returning to starting position, seamless 10-second loop, first and last frame identical for perfect looping, character centered, consistent body scale, smooth expression transition, 4K ultra-high definition, transparent background.",
    "contentment": "Contentment emotion animation, relaxed gentle smile slowly appearing, soft calm eyes blinking naturally, shoulders gently lowering in relaxation, slow breathing chest movement, peaceful posture with subtle head tilt, expression softly returning to neutral relaxed smile for loop closure, seamless 10-second loop animation, first and last frame identical, character size fixed, smooth motion, 4K ultra-HD, transparent background.",
    "amusement": "Amusement laughing expression animation, mouth opening into light laughter, eyes squinting with humor, shoulders bouncing slightly as if chuckling, playful head tilt, brief laugh motion then returning to smiling start pose, seamless 10-second loop, first and last frame identical, smooth continuous motion, character centered, 4K ultra-HD, transparent background.",
    "pride": "Pride expression animation, chin slowly lifting, confident upright posture, subtle confident smile forming, eyes steady and proud, chest slightly expanding, small nod of self-confidence, returning smoothly to initial pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "love": "Love emotion animation, soft affectionate eyes, warm gentle smile slowly growing, body leaning slightly forward with caring warmth, subtle head tilt, small heartwarming expression change, returning smoothly to initial loving pose for loop, seamless 10-second loop, first and last frame identical, 4K ultra-HD, transparent background.",
    "gratitude": "Gratitude expression animation, warm appreciative smile forming, hands gently touching chest in thankful gesture, eyes soft and sincere, slight bow of the head, gentle breathing motion, returning to initial thankful pose for seamless loop, 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "awe": "Awe expression animation, eyes widening slowly, mouth slightly open in wonder, head tilting upward as if seeing something magnificent, subtle inhaling motion of surprise, expression gradually relaxing back to initial wonder pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "inspiration": "Inspiration animation, bright focused eyes lighting up, subtle excited smile appearing, one hand raising as if explaining a brilliant idea, expressive gesture movement, thoughtful head tilt, returning smoothly to initial thoughtful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "serenity": "Serenity calm animation, peaceful facial expression, eyes gently closed then slowly half-opening, relaxed breathing motion, shoulders loose and calm, head slightly tilted in tranquility, returning to original serene pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "hope": "Hope emotion animation, eyes brightening and looking upward with optimism, soft hopeful smile slowly forming, chest rising with an uplifting breath, hands clasped together gently, expression radiating warmth and anticipation, returning smoothly to initial hopeful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "relief": "Relief emotion animation, shoulders slowly dropping after tension, eyes briefly closing in relaxation, soft relieved smile forming, gentle exhale motion, posture relaxing fully then returning to initial pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "trust": "Trust expression animation, calm open face, steady eye contact forward, relaxed open posture, gentle reassuring nod, soft smile, returning to original trusting pose for seamless loop, 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "admiration": "Admiration animation, attentive gaze looking slightly upward toward someone admirable, respectful slight smile, subtle nod of appreciation, calm posture, expression returning to starting admiring pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "compassion": "Compassion expression animation, empathetic eyes softening, gentle concerned expression, body leaning slightly forward as if offering support, subtle head tilt, calm breathing motion, returning smoothly to starting compassionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "elevation": "Elevation emotion animation, emotionally moved expression, eyes shining with warmth, hand touching heart slowly, gentle smile forming, slight upward head tilt, returning to initial heartfelt pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "enthusiasm": "Enthusiasm animation, energetic wide smile, lively expressive gestures with hands moving excitedly, animated posture with slight bounce, bright eyes sparkling, returning smoothly to initial excited pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "playfulness": "Playfulness emotion animation, mischievous smile with one eyebrow raised, eyes twinkling with fun, playful head tilt side to side, shoulders bouncing lightly as if giggling, tongue peeking out briefly, returning smoothly to initial playful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "curiosity": "Curiosity expression animation, eyebrows raising slowly, head tilting slightly forward, eyes focusing closely as if examining something interesting, subtle leaning motion, returning smoothly to starting curious pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "interest": "Interest animation, focused attentive gaze forward, lips slightly parted, engaged posture leaning forward slightly, subtle nod of understanding, returning to initial attentive pose, seamless 10-second loop, identical first and last frame, 4K ultra-HD, transparent background.",
    "anticipation": "Anticipation emotion animation, raised eyebrows with excited expectation, slight forward lean, bright eyes waiting eagerly, subtle body tension building then relaxing back to start pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "satisfaction": "Satisfaction animation, small pleased smile forming, relaxed confident posture, subtle nod of approval, calm breathing motion, expression returning smoothly to initial satisfied pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "affection": "Affection emotion animation, warm fond smile, soft loving eyes, gentle caring body language with slight forward lean, small tender gesture with hands, returning to initial affectionate pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "triumph": "Triumph animation, arms raising overhead in victory, confident victorious smile appearing, chest expanding proudly, celebratory gesture, returning smoothly to starting victorious pose for loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "calm_confidence": "Calm confidence animation, composed facial expression, steady confident gaze forward, upright balanced posture, subtle nod of assurance, gentle breathing motion, returning to initial confident pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "delight": "Delight animation, bright sparkling eyes, joyful smile widening, hands lifting slightly in happy excitement, playful bounce of posture, returning smoothly to starting delighted pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    
    # === 消极情绪 (25个) ===
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


def check_image_quality(image_path: str) -> dict:
    """检查图片质量，返回潜在问题"""
    img = Image.open(image_path)
    width, height = img.size
    
    issues = []
    
    # 检查是否有alpha通道
    if img.mode == 'RGBA':
        # 检查透明度分布
        alpha = img.split()[3]
        alpha_data = list(alpha.getdata())
        
        # 统计半透明像素（alpha在50-200之间）
        semi_transparent = sum(1 for a in alpha_data if 50 < a < 200)
        total_non_transparent = sum(1 for a in alpha_data if a > 50)
        
        if total_non_transparent > 0:
            semi_ratio = semi_transparent / total_non_transparent
            if semi_ratio > 0.1:  # 超过10%的可见像素是半透明的
                issues.append(f"半透明像素比例较高: {semi_ratio*100:.1f}%")
    
    # 检查图片尺寸
    if width < 400 or height < 400:
        issues.append(f"图片尺寸较小: {width}x{height}")
    
    return {
        "path": image_path,
        "size": (width, height),
        "mode": img.mode,
        "issues": issues
    }


def prepare_image_for_video(image_path: str, output_path: str = None) -> str:
    """
    准备用于视频生成的图片
    - 将透明背景转为白色背景（视频不支持透明）
    - 确保人物完整清晰
    """
    img = Image.open(image_path)
    
    if output_path is None:
        output_path = image_path.replace('.png', '_video_ready.png')
    
    # 如果有透明通道，转为白色背景
    if img.mode == 'RGBA':
        # 创建白色背景
        background = Image.new('RGB', img.size, (255, 255, 255))
        # 合成图片
        background.paste(img, mask=img.split()[3])
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    img.save(output_path, 'PNG')
    print(f"  已准备图片: {output_path}")
    return output_path


def upload_image_to_url(image_path: str, min_width: int = 512) -> str:
    """将本地图片转为base64 data URI"""
    img = Image.open(image_path)
    width, height = img.size
    
    if width < min_width:
        scale = min_width / width
        new_width = min_width
        new_height = int(height * scale)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"  图片已放大: {width}x{height} -> {new_width}x{new_height}")
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    image_data = buffer.getvalue()
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    return f"data:image/png;base64,{image_base64}"


def create_video_task(image_url: str, prompt: str, duration: int = 5) -> str:
    """创建视频生成任务"""
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {"url": image_url}}
        ],
        "duration": duration,
        "ratio": "adaptive",
        "resolution": "720p",
        "watermark": False
    }
    
    response = requests.post(
        f"{BASE_URL}/contents/generations/tasks",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    if response.status_code != 200:
        raise ValueError(f"API错误 ({response.status_code}): {response.text}")
    
    result = response.json()
    task_id = result.get("id")
    
    if not task_id:
        raise ValueError(f"未获取到任务ID: {result}")
    
    return task_id


def get_task_status(task_id: str) -> dict:
    """查询任务状态"""
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{BASE_URL}/contents/generations/tasks/{task_id}",
        headers=headers,
        timeout=30
    )
    
    if response.status_code != 200:
        raise ValueError(f"查询失败 ({response.status_code}): {response.text}")
    
    return response.json()


def generate_video(image_path: str, emotion: str, output_path: str, duration: int = 5) -> bool:
    """生成视频"""
    print(f"\n{'='*50}")
    print(f"开始生成 {emotion} 情绪视频...")
    print(f"输入图片: {image_path}")
    print(f"输出视频: {output_path}")
    print(f"{'='*50}")
    
    try:
        # 检查图片质量
        print("正在检查图片质量...")
        quality = check_image_quality(image_path)
        if quality["issues"]:
            print(f"  ⚠️ 发现问题: {', '.join(quality['issues'])}")
        else:
            print(f"  ✓ 图片质量良好 ({quality['size'][0]}x{quality['size'][1]}, {quality['mode']})")
        
        # 准备图片（处理透明背景等）
        print("正在准备图片...")
        prepared_path = prepare_image_for_video(image_path)
        
        # 上传图片
        print("正在上传图片...")
        image_url = upload_image_to_url(prepared_path)
        print(f"  图片大小: {len(image_url) / 1024:.1f} KB (base64)")
        
        # 组合提示词
        prompt = f"{VIDEO_PROMPTS[emotion]} {VIDEO_LOOP_EMPHASIS}"
        print(f"\n提示词: {prompt[:100]}...")
        
        # 创建任务
        print(f"\n正在创建视频生成任务...")
        task_id = create_video_task(image_url, prompt, duration)
        print(f"✓ 任务已创建: {task_id}")
        
        # 等待完成
        max_wait = 600
        waited = 0
        poll_interval = 10
        
        print("\n等待视频生成中...")
        while waited < max_wait:
            status_data = get_task_status(task_id)
            status = status_data.get("status", "unknown")
            
            print(f"\r  状态: {status}, 已等待 {waited}s...", end="", flush=True)
            
            if status == "succeeded":
                print(f"\n✓ 视频生成完成!")
                
                content = status_data.get("content", {})
                video_url = content.get("video_url")
                
                if video_url:
                    print(f"正在下载视频...")
                    video_response = requests.get(video_url, timeout=120)
                    
                    with open(output_path, 'wb') as f:
                        f.write(video_response.content)
                    
                    print(f"✓ 视频已保存: {output_path}")
                    print(f"  文件大小: {len(video_response.content) / 1024 / 1024:.2f} MB")
                    
                    # 清理临时文件
                    if prepared_path != image_path and os.path.exists(prepared_path):
                        os.remove(prepared_path)
                    
                    return True
                else:
                    print(f"❌ 未获取到视频URL: {status_data}")
                    return False
                    
            elif status == "failed":
                error = status_data.get("error", {})
                error_msg = error.get("message", "未知错误")
                print(f"\n❌ 视频生成失败: {error_msg}")
                return False
            
            time.sleep(poll_interval)
            waited += poll_interval
        
        print(f"\n❌ 视频生成超时（{max_wait}秒）")
        return False
        
    except Exception as e:
        print(f"\n❌ 异常: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    if not ARK_API_KEY:
        print("错误：未设置 ARK_API_KEY 环境变量")
        sys.exit(1)
    
    # 配置
    character_name = "Akari"
    # 剩余42个情绪（已完成：love, awe, admiration, affection, hope, playfulness, stress, worry）
    emotions = [
        # 积极情绪 (17个)
        "joy", "contentment", "amusement", "pride", "gratitude", "inspiration", "serenity",
        "relief", "trust", "compassion", "elevation", "enthusiasm", "curiosity", "interest",
        "anticipation", "satisfaction", "triumph", "calm_confidence", "delight",
        # 消极情绪 (23个)
        "sadness", "grief", "disappointment", "regret", "shame", "guilt", "embarrassment",
        "anxiety", "fear", "panic", "frustration", "irritation", "annoyance", "anger",
        "rage", "disgust", "contempt", "jealousy", "envy", "distrust", "suspicion", "confusion", "exhaustion"
    ]
    
    base_dir = Path(__file__).parent
    crops_dir = base_dir / "output" / character_name / "step2_crops"
    videos_dir = base_dir / "output" / character_name / "step4_videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"角色: {character_name}")
    print(f"情绪: {emotions}")
    print(f"输入目录: {crops_dir}")
    print(f"输出目录: {videos_dir}")
    
    results = []
    
    for emotion in emotions:
        image_path = crops_dir / f"{character_name}_{emotion}.png"
        
        if not image_path.exists():
            print(f"\n❌ 图片不存在: {image_path}")
            results.append((emotion, False))
            continue
        
        output_path = videos_dir / f"{character_name}_{emotion}.mp4"
        
        success = generate_video(str(image_path), emotion, str(output_path))
        results.append((emotion, success))
    
    # 总结
    print(f"\n{'='*50}")
    print("生成结果汇总:")
    print(f"{'='*50}")
    for emotion, success in results:
        status = "✓ 成功" if success else "❌ 失败"
        print(f"  {emotion}: {status}")


if __name__ == "__main__":
    main()
