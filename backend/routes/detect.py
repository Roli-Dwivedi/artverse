from flask import Blueprint, request, jsonify
import base64
import os
import json
from groq import Groq

detect_bp = Blueprint('detect', __name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

def analyze_image(image_file, prompt):
    image_data = image_file.read()
    base64_image = base64.b64encode(image_data).decode('utf-8')
    mime_type = image_file.content_type or 'image/jpeg'

    response = client.chat.completions.create(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:{mime_type};base64,{base64_image}",
                            "detail": "low"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        max_tokens=400
    )
    return response.choices[0].message.content.strip()


@detect_bp.route('/api/detect/style', methods=['POST'])
def detect_style():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        prompt = """Analyze this artwork and respond ONLY with a JSON object, no extra text, no markdown:
{"style":"the painting style (e.g. Impressionism, Oil Painting, Watercolor, Digital Art, Sketch)","mood":"the emotional mood (e.g. Melancholic, Joyful, Peaceful, Mysterious)","period":"estimated art period (e.g. Renaissance, Modern, Contemporary)","confidence":85,"description":"one sentence describing what makes this artwork unique"}"""

        raw = analyze_image(request.files['image'], prompt)

        # Strip markdown if present
        if '```' in raw:
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        return jsonify({'result': result, 'status': 'success'})

    except json.JSONDecodeError:
        return jsonify({'error': 'Could not parse AI response'}), 500
    except Exception as e:
        print("=== DETECT STYLE ERROR ===", str(e))
        return jsonify({'error': str(e)}), 500


@detect_bp.route('/api/detect/ai', methods=['POST'])
def detect_ai():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        prompt = """Analyze if this image was created by AI or a human artist. Respond ONLY with a JSON object, no extra text, no markdown:
{"isAI":true,"confidence":85,"signals":["signal 1","signal 2","signal 3"]}"""

        raw = analyze_image(request.files['image'], prompt)

        if '```' in raw:
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        raw = raw.strip()

        result = json.loads(raw)
        return jsonify({'result': result, 'status': 'success'})

    except json.JSONDecodeError:
        return jsonify({'error': 'Could not parse AI response'}), 500
    except Exception as e:
        print("=== AI DETECT ERROR ===", str(e))
        return jsonify({'error': str(e)}), 500