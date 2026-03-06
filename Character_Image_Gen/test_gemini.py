#!/usr/bin/env python3
"""测试 Gemini 图片生成功能 - 使用新的 google.genai 包"""

import os
import warnings
warnings.filterwarnings("ignore")

from dotenv import load_dotenv
load_dotenv()

from google import genai
from google.genai import types

# 使用新的 genai 客户端
client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

print("正在测试 Gemini 图片生成...")

# 读取参考图片
image_path = 'input/Chracter_Neutral/Akari_Neutral.png'
print(f"读取参考图片: {image_path}")

with open(image_path, 'rb') as f:
    image_data = f.read()

print(f"图片大小: {len(image_data)} bytes")

# 简单测试 - 生成2x2网格
prompt = '''Generate a 2x2 grid showing 4 different emotions (joy, sadness, anger, surprise) 
of the same character from the reference image. 
Keep character identity perfectly consistent across all images.
Each cell should show chest-up view.
Transparent background, no text labels.'''

print("正在生成图片...")

try:
    # 使用新API生成图片 - 尝试不同的模型
    # 可选模型: gemini-2.0-flash-exp-image-generation, gemini-2.5-flash-image
    model_name = 'gemini-2.5-flash-image'
    print(f"使用模型: {model_name}")
    
    response = client.models.generate_content(
        model=model_name,
        contents=[
            types.Part.from_bytes(data=image_data, mime_type='image/png'),
            prompt
        ],
        config=types.GenerateContentConfig(
            response_modalities=['IMAGE', 'TEXT']
        )
    )
    
    print(f"Response candidates: {len(response.candidates) if response.candidates else 0}")
    
    # 查找图片数据
    for i, part in enumerate(response.candidates[0].content.parts):
        print(f"Part {i}: {type(part)}")
        if part.inline_data:
            print(f"  - Has inline_data, mime_type: {part.inline_data.mime_type}")
            print(f"  - Data size: {len(part.inline_data.data)} bytes")
            # 保存测试图片
            os.makedirs('output', exist_ok=True)
            with open('output/test_grid.png', 'wb') as f:
                f.write(part.inline_data.data)
            print("测试图片已保存到 output/test_grid.png")
        elif part.text:
            print(f"  - Text: {part.text[:200]}...")

except Exception as e:
    print(f"错误: {type(e).__name__}: {e}")
    import traceback
    traceback.print_exc()
