#!/usr/bin/env python3
"""生成Akari_Basket的情绪视频"""

import os
import sys
import time
import base64
import requests
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# 火山方舟API配置
ARK_API_KEY = os.getenv("ARK_API_KEY")
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedance-1-5-pro-251215"

CHARACTER_NAME = "Akari_Basket"
INPUT_IMAGE = Path("/Users/markshi/HelloSoul/Character_Image_Gen/input/Chracter_Neutral/Akari_Neutral_Basket.png")
OUTPUT_DIR = Path("/Users/markshi/HelloSoul/Character_Image_Gen/output/Akari_Basket/step4_videos")

# 视频循环强调
VIDEO_LOOP_EMPHASIS = "【起始帧要求】视频起始帧必须完全呈现人物从膝盖到头顶（包括头发最高顶部）的所有身体部分，两侧肩膀和手臂必须完整呈现在画面内，不得有任何裁切。【全程一致性约束】视频所有帧（从第一帧到最后一帧）的人物大小必须完全一致不变，人物离镜头的距离必须完全一致不变，禁止任何缩放、推拉镜头或改变角色在画面中比例的效果，镜头固定不动，身体动作不能改变人物大小和离镜头距离，只有角色面部表情和肢体动作变化。【循环要求】视频必须形成完美循环：第一帧和最后一帧必须是完全相同的画面，动作在结尾时平滑过渡回起始状态。"

# 情绪视频提示词 - 5个积极 + 5个消极
VIDEO_PROMPTS = {
    # 积极情绪 (5个)
    "contentment": "Contentment emotion animation, relaxed gentle smile slowly appearing, soft calm eyes blinking naturally, shoulders gently lowering in relaxation, slow breathing chest movement, peaceful posture with subtle head tilt, expression softly returning to neutral relaxed smile for loop closure, seamless 10-second loop animation, first and last frame identical, character size fixed, smooth motion, 4K ultra-HD, transparent background.",
    "amusement": "Amusement laughing expression animation, mouth opening into light laughter, eyes squinting with humor, shoulders bouncing slightly as if chuckling, playful head tilt, brief laugh motion then returning to smiling start pose, seamless 10-second loop, first and last frame identical, smooth continuous motion, character centered, 4K ultra-HD, transparent background.",
    "pride": "Pride expression animation, chin slowly lifting, confident upright posture, subtle confident smile forming, eyes steady and proud, chest slightly expanding, small nod of self-confidence, returning smoothly to initial pose for perfect loop, seamless 10-second animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "love": "Love emotion animation, soft affectionate eyes, warm gentle smile slowly growing, body leaning slightly forward with caring warmth, subtle head tilt, small heartwarming expression change, returning smoothly to initial loving pose for loop, seamless 10-second loop, first and last frame identical, 4K ultra-HD, transparent background.",
    "gratitude": "Gratitude expression animation, warm appreciative smile forming, hands gently touching chest in thankful gesture, eyes soft and sincere, slight bow of the head, gentle breathing motion, returning to initial thankful pose for seamless loop, 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    
    # 消极情绪 (5个)
    "grief": "Grief emotion animation, intense sorrow expression, eyebrows raised in the middle, mouth trembling slightly, moist eyes blinking slowly as if holding tears, shoulders subtly shaking with deep emotional pain, expression slowly settling back to the initial grieving pose for loop closure, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "disappointment": "Disappointment expression animation, slight frown appearing, gaze lowering slowly, small disappointed head shake, shoulders dropping subtly, lips pressing briefly before relaxing back to initial disappointed pose, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, transparent background.",
    "regret": "Regret emotion animation, sad reflective expression, eyes looking downward thoughtfully, lips tightening slightly with tension, subtle slow head tilt as if reflecting on a mistake, gentle sigh motion, expression returning to the original regretful pose, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "shame": "Shame expression animation, head slowly lowering, eyes avoiding eye contact and glancing downward, tense mouth with lips pressed together, shoulders curling inward slightly, shy embarrassed breathing motion, returning smoothly to initial shame pose for loop, seamless 10-second loop animation, identical first and last frame, 4K ultra-HD, transparent background.",
    "guilt": "Guilt emotion animation, conflicted facial expression, brows drawn together tightly, lips pressed and trembling slightly, eyes glancing downward and sideways uneasily, subtle tense posture, expression gradually returning to the initial guilty pose for seamless loop, 10-second animation loop, identical first and last frame, 4K ultra-HD, transparent background.",
}

def create_video_task(image_base64: str, prompt: str, max_retries: int = 3) -> str:
    """创建视频生成任务"""
    url = f"{BASE_URL}/contents/generations/tasks"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {ARK_API_KEY}",
    }
    
    payload = {
        "model": MODEL,
        "content": [
            {
                "type": "image_url",
                "image_url": {"url": f"data:image/png;base64,{image_base64}"}
            },
            {
                "type": "text",
                "text": prompt
            }
        ]
    }
    
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=180)
            resp.raise_for_status()
            data = resp.json()
            return data["id"]
        except requests.exceptions.Timeout as e:
            print(f"  超时 (尝试 {attempt + 1}/{max_retries})")
            if attempt == max_retries - 1:
                raise
            time.sleep(5)
        except requests.exceptions.ConnectionError as e:
            print(f"  连接错误 (尝试 {attempt + 1}/{max_retries}): {e}")
            if attempt == max_retries - 1:
                raise
            time.sleep(5)

def get_task_status(task_id: str) -> dict:
    """获取任务状态"""
    url = f"{BASE_URL}/contents/generations/tasks/{task_id}"
    headers = {"Authorization": f"Bearer {ARK_API_KEY}"}
    
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()

def generate_video(image_path: Path, emotion: str, output_path: Path):
    """生成单个视频"""
    print(f"\n{'='*60}")
    print(f"生成视频: {emotion}")
    print(f"{'='*60}")
    
    # 读取图片
    with open(image_path, 'rb') as f:
        img_data = f.read()
    img_base64 = base64.b64encode(img_data).decode('utf-8')
    
    # 构建提示词
    prompt = f"{VIDEO_LOOP_EMPHASIS} {VIDEO_PROMPTS[emotion]}"
    
    # 创建任务
    print(f"创建任务...")
    task_id = create_video_task(img_base64, prompt)
    print(f"任务ID: {task_id}")
    
    # 轮询状态
    start_time = time.time()
    while True:
        status = get_task_status(task_id)
        state = status.get("status", "unknown")
        
        elapsed = time.time() - start_time
        print(f"  状态: {state} ({elapsed:.0f}s)")
        
        if state == "succeeded":
            # 下载视频
            content = status.get("content", {})
            video_url = content.get("video_url")
            if video_url:
                print(f"  下载视频...")
                video_resp = requests.get(video_url, timeout=120)
                video_resp.raise_for_status()
                
                output_path.parent.mkdir(parents=True, exist_ok=True)
                with open(output_path, 'wb') as f:
                    f.write(video_resp.content)
                
                size_mb = len(video_resp.content) / (1024 * 1024)
                print(f"  ✓ 保存: {output_path.name} ({size_mb:.2f} MB)")
                return True
            else:
                print(f"  ✗ 无视频URL")
                return False
                
        elif state == "failed":
            error = status.get("error", {})
            print(f"  ✗ 失败: {error}")
            return False
            
        elif state in ["pending", "running", "queued"]:
            time.sleep(5)
            
        else:
            print(f"  ? 未知状态: {state}")
            time.sleep(5)
            
        if elapsed > 300:
            print(f"  ✗ 超时")
            return False

def main():
    print(f"Akari_Basket 情绪视频生成")
    print(f"输入图片: {INPUT_IMAGE}")
    print(f"输出目录: {OUTPUT_DIR}")
    
    if not ARK_API_KEY:
        print("错误：未设置 ARK_API_KEY 环境变量")
        sys.exit(1)
    
    if not INPUT_IMAGE.exists():
        print(f"错误：输入图片不存在: {INPUT_IMAGE}")
        sys.exit(1)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # 要生成的情绪列表 - 5个积极 + 5个消极
    emotions = ["contentment", "amusement", "pride", "love", "gratitude", "grief", "disappointment", "regret", "shame", "guilt"]
    
    results = {}
    for emotion in emotions:
        output_path = OUTPUT_DIR / f"{CHARACTER_NAME}_{emotion}.mp4"
        
        if output_path.exists():
            print(f"\n跳过 {emotion} (已存在)")
            results[emotion] = "跳过"
            continue
        
        try:
            success = generate_video(INPUT_IMAGE, emotion, output_path)
            results[emotion] = "✓ 成功" if success else "✗ 失败"
        except Exception as e:
            print(f"  ✗ 错误: {e}")
            results[emotion] = f"✗ 错误: {str(e)[:50]}"
    
    # 结果汇总
    print(f"\n{'='*60}")
    print("生成结果汇总:")
    for emotion, result in results.items():
        print(f"  {emotion}: {result}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
