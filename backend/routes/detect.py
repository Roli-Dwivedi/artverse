from flask import Blueprint, request, jsonify
import base64
import os
import json
from groq import Groq

detect_bp = Blueprint('detect', __name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

@detect_bp.route('/api/detect/style', methods=['POST'])
def detect_style():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        image_file = request.files['image']
        image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        mime_type = image_file.content_type or 'image/jpeg'

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """Analyze this artwork and respond ONLY with a JSON object, no extra text:
{
  "style": "the painting style (e.g. Impressionism, Oil Painting, Watercolor, Digital Art, Sketch, Charcoal, Acrylic, Abstract, Surrealism, Street Art, Renaissance, Baroque)",
  "mood": "the emotional mood (e.g. Melancholic, Joyful, Ethereal, Peaceful, Mysterious, Bold, Dreamy, Tense)",
  "period": "estimated art period (e.g. Renaissance 14th-17th Century, Modern 1900s, Contemporary, 19th Century, Ancient)",
  "confidence": a number between 70 and 99,
  "description": "one sentence describing what makes this artwork unique"
}"""
                        }
                    ]
                }
            ],
            max_tokens=300
        )

        raw = response.choices[0].message.content.strip()

        # Clean up response in case model adds extra text
        if '```' in raw:
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]
        
        result = json.loads(raw)
        return jsonify({'result': result, 'status': 'success'})

    except json.JSONDecodeError:
        return jsonify({'error': 'Could not parse AI response'}), 500
    except Exception as e:
        print("=== DETECT ERROR ===", str(e))
        return jsonify({'error': str(e)}), 500


@detect_bp.route('/api/detect/ai', methods=['POST'])
def detect_ai():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image uploaded'}), 400

        image_file = request.files['image']
        image_data = image_file.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        mime_type = image_file.content_type or 'image/jpeg'

        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_image}"
                            }
                        },
                        {
                            "type": "text",
                            "text": """Analyze if this image was created by AI or a human artist. Respond ONLY with JSON:
{
  "isAI": true or false,
  "confidence": a number between 70 and 99,
  "signals": ["signal 1", "signal 2", "signal 3"]
}
For signals: if AI, mention things like perfect symmetry, uniform textures, unnatural patterns.
If human, mention things like natural brush strokes, organic imperfections, hand-made textures."""
                        }
                    ]
                }
            ],
            max_tokens=200
        )

        raw = response.choices[0].message.content.strip()

        if '```' in raw:
            raw = raw.split('```')[1]
            if raw.startswith('json'):
                raw = raw[4:]

        result = json.loads(raw)
        return jsonify({'result': result, 'status': 'success'})

    except json.JSONDecodeError:
        return jsonify({'error': 'Could not parse AI response'}), 500
    except Exception as e:
        print("=== AI DETECT ERROR ===", str(e))
        return jsonify({'error': str(e)}), 500