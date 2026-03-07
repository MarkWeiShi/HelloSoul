#!/usr/bin/env python3
"""测试火山方舟视频生成 - 用joy和sadness图片生成视频

使用火山方舟 Seedance 模型 (doubao-seedance-1-5-pro-251215) 进行图生视频

需要配置:
  ARK_API_KEY - 从 https://console.volcengine.com/ark/region:ark+cn-beijing/apikey 获取
"""

import os
import sys
import time
import base64
import requests
import io
from pathlib import Path
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

# 火山方舟API配置
ARK_API_KEY = os.getenv("ARK_API_KEY")
BASE_URL = "https://ark.cn-beijing.volces.com/api/v3"
MODEL = "doubao-seedance-1-5-pro-251215"  # Seedance 1.5 Pro 图生视频模型

# 【重要】视频循环强调
VIDEO_LOOP_EMPHASIS = "【起始帧要求】视频起始帧必须完全呈现人物从膝盖到头顶（包括头发最高顶部）的所有身体部分，两侧肩膀和手臂必须完整呈现在画面内，不得有任何裁切。【全程一致性约束】视频所有帧（从第一帧到最后一帧）的人物大小必须完全一致不变，人物离镜头的距离必须完全一致不变，禁止任何缩放、推拉镜头或改变角色在画面中比例的效果，镜头固定不动，身体动作不能改变人物大小和离镜头距离，只有角色面部表情和肢体动作变化。【循环要求】视频必须形成完美循环：第一帧和最后一帧必须是完全相同的画面，动作在结尾时平滑过渡回起始状态。"

# 视频生成提示词模板
VIDEO_PROMPT_TEMPLATE = """动漫风格角色，展现{emotion}的情绪表达，表情自然微动，眨眼，符合情绪的身体语言，轻微的头部转动。保持角色一致性和画面质量。""" + VIDEO_LOOP_EMPHASIS


def upload_image_to_url(image_path: str, min_width: int = 512) -> str:
    """将本地图片转为base64 data URI
    
    会自动放大小于min_width的图片以满足API要求（Seedance要求宽度>=300px）
    
    注意: 火山方舟API需要图片URL，这里使用data URI方案
    正式使用时建议上传到TOS或其他对象存储获取公网URL
    """
    # 打开图片并检查尺寸
    img = Image.open(image_path)
    width, height = img.size
    
    # 如果宽度小于min_width，等比例放大
    if width < min_width:
        scale = min_width / width
        new_width = min_width
        new_height = int(height * scale)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"  图片已放大: {width}x{height} -> {new_width}x{new_height}")
    
    # 转为PNG格式的字节数据
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    image_data = buffer.getvalue()
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    return f"data:image/png;base64,{image_base64}"


def create_video_task(image_url: str, prompt: str, duration: int = 5) -> str:
    """创建视频生成任务，返回任务ID"""
    headers = {
        "Authorization": f"Bearer {ARK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "content": [
            {
                "type": "text",
                "text": prompt
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url
                }
            }
        ],
        "duration": duration,
        "ratio": "adaptive",  # 自适应宽高比
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
    print(f"视频时长: {duration}秒")
    print(f"{'='*50}")
    
    try:
        # 准备图片URL
        print("正在准备图片...")
        image_url = upload_image_to_url(image_path)
        print(f"  图片大小: {len(image_url) / 1024:.1f} KB (base64)")
        
        # 创建视频生成任务
        prompt = VIDEO_PROMPT_TEMPLATE.format(emotion=emotion)
        print(f"\n正在创建视频生成任务...")
        print(f"  提示词: {prompt}")
        
        task_id = create_video_task(image_url, prompt, duration)
        print(f"✓ 任务已创建: {task_id}")
        
        # 轮询等待任务完成
        max_wait = 600  # 10分钟（视频生成可能较慢）
        waited = 0
        poll_interval = 10  # 每10秒检查一次
        
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
        print("❌ 未设置 ARK_API_KEY")
        print("\n请在 .env 文件中添加:")
        print("  ARK_API_KEY=your_api_key_here")
        print("\n获取API Key:")
        print("  https://console.volcengine.com/ark/region:ark+cn-beijing/apikey")
        sys.exit(1)
    
    print(f"火山方舟API密钥: {ARK_API_KEY[:10]}...{ARK_API_KEY[-5:]}")
    print(f"模型: {MODEL}")
    
    # 输入输出路径
    crops_dir = Path("output/step2_crops")
    videos_dir = Path("output/test_videos")
    videos_dir.mkdir(exist_ok=True)
    
    # 测试图片 - 生成5秒视频 (Seedance 1.5 pro 支持4-12秒)
    test_images = [
        ("admiration.png", "admiration", "钦佩、敬仰、赞赏"),
    ]
    
    results = []
    
    for filename, emotion_en, emotion_cn in test_images:
        image_path = crops_dir / filename
        output_path = videos_dir / f"{emotion_en}_5s.mp4"
        
        if not image_path.exists():
            print(f"❌ 图片不存在: {image_path}")
            results.append((emotion_en, False))
            continue
        
        success = generate_video(str(image_path), emotion_cn, str(output_path), duration=5)
        results.append((emotion_en, success))
    
    # 汇总结果
    print("\n" + "="*50)
    print("测试结果汇总:")
    print("="*50)
    for emotion, success in results:
        status = "✓ 成功" if success else "❌ 失败"
        print(f"  {emotion}: {status}")


if __name__ == "__main__":
    main()
