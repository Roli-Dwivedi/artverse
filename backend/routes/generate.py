from flask import Blueprint, request, jsonify, send_file
import requests
import os
import io

generate_bp = Blueprint('generate', __name__)

HF_API_KEY = os.getenv("HF_API_KEY")
MODEL_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"
@generate_bp.route('/api/generate', methods=['POST'])
def generate_art():
    try:
        data = request.get_json(force=True)
        prompt = data.get('prompt', '').strip()
        style = data.get('style', '')

        if not prompt:
            return jsonify({'error': 'Prompt cannot be empty'}), 400

        # Enhance prompt with style
        enhanced_prompt = f"{prompt}, {style} style, highly detailed, artistic, masterpiece" if style else f"{prompt}, highly detailed, artistic, masterpiece"

        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        payload = {
            "inputs": enhanced_prompt,
            "parameters": {
                "num_inference_steps": 30,
                "guidance_scale": 7.5,
                "width": 512,
                "height": 512,
            }
        }

        print(f"Generating: {enhanced_prompt}")
        response = requests.post(MODEL_URL, headers=headers, json=payload, timeout=120)

        if response.status_code == 503:
            return jsonify({
                'error': 'Model is loading, please wait 20 seconds and try again',
                'loading': True
            }), 503

        if response.status_code != 200:
            print("HF Error:", response.text)
            return jsonify({'error': f'Generation failed: {response.text}'}), 500

        # Convert image bytes to base64
        import base64
        image_base64 = base64.b64encode(response.content).decode('utf-8')

        return jsonify({
            'image': f"data:image/jpeg;base64,{image_base64}",
            'prompt': enhanced_prompt,
            'status': 'success'
        })

    except requests.exceptions.Timeout:
        return jsonify({'error': 'Generation timed out. Try a simpler prompt!'}), 500
    except Exception as e:
        print("=== GENERATE ERROR ===", str(e))
        return jsonify({'error': str(e)}), 500