#!/usr/bin/env python3
"""生成角色说话视频"""

import os
import sys
import time
import base64
import requests
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# 火山方舟API配置
ARK_API_KEY = os.getenv("ARK_API_KEY")
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedance-1-5-pro-251215"

CHARACTER_NAME = "Akari"
INPUT_IMAGE = Path("/Users/markshi/HelloSoul/Character_Image_Gen/input/Chracter_Neutral/Akari_Speaking.png")
OUTPUT_DIR = Path("/Users/markshi/HelloSoul/Character_Image_Gen/output/Akari/step4_videos")

# 说话视频提示词
SPEAKING_PROMPT = """【起始帧要求】视频起始帧必须完全呈现人物从胸部到头顶（包括头发最高顶部）的所有身体部分，两侧肩膀必须完整呈现在画面内，不得有任何裁切。
【全程一致性约束】视频所有帧（从第一帧到最后一帧）的人物大小必须完全一致不变，人物离镜头的距离必须完全一致不变，禁止任何缩放、推拉镜头或改变角色在画面中比例的效果，镜头固定不动。
【循环要求】视频必须形成完美循环：第一帧和最后一帧必须是完全相同的画面，动作在结尾时平滑过渡回起始状态。
【说话动画要求】角色正在说话，嘴巴自然地开合运动模拟说话节奏，嘴型变化自然流畅，眼睛自然眨眼并保持与观众视线交流，面部表情生动但不夸张，头部有轻微自然的点头和摆动配合说话节奏，手部有轻微的配合说话的小动作，整体呈现自然流畅的说话状态。
Speaking animation, natural lip sync mouth opening and closing movements simulating speech rhythm, smooth natural mouth shape changes, natural blinking while maintaining eye contact with viewer, lively but not exaggerated facial expressions, slight natural head nodding and swaying matching speech rhythm, subtle hand gestures accompanying speech, overall presenting natural fluent speaking state, seamless 10-second loop animation, first and last frame identical, 4K ultra-HD, white or transparent background."""

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

def generate_speaking_video(image_path: Path, output_path: Path):
    """生成说话视频"""
    print(f"\n{'='*60}")
    print(f"生成说话视频: {output_path.name}")
    print(f"{'='*60}")
    
    # 读取图片
    with open(image_path, 'rb') as f:
        img_data = f.read()
    img_base64 = base64.b64encode(img_data).decode('utf-8')
    
    # 创建任务
    print(f"创建任务...")
    task_id = create_video_task(img_base64, SPEAKING_PROMPT)
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
    print(f"Akari 说话视频生成")
    print(f"输入图片: {INPUT_IMAGE}")
    print(f"输出目录: {OUTPUT_DIR}")
    
    if not ARK_API_KEY:
        print("错误：未设置 ARK_API_KEY 环境变量")
        sys.exit(1)
    
    if not INPUT_IMAGE.exists():
        print(f"错误：输入图片不存在: {INPUT_IMAGE}")
        sys.exit(1)
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    output_path = OUTPUT_DIR / f"{CHARACTER_NAME}_speaking.mp4"
    
    success = generate_speaking_video(INPUT_IMAGE, output_path)
    
    print(f"\n{'='*60}")
    print(f"生成结果: {'✓ 成功' if success else '✗ 失败'}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
