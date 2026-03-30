from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from groq import Groq
import os

chat_bp = Blueprint('chat', __name__)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MUSE_SYSTEM_PROMPT = """You are Muse, a warm and knowledgeable AI art assistant 
on ArtVerse — a platform dedicated to art and creativity.

You specialize in:
- Art history and famous artists (Da Vinci, Monet, Picasso, Frida Kahlo, etc.)
- Painting styles and movements (Impressionism, Cubism, Surrealism, Baroque, etc.)
- Art techniques (oil painting, watercolor, sketching, digital art, etc.)
- Color theory and composition
- Helping users understand and appreciate artworks
- Giving creative advice and inspiration

Keep responses warm, inspiring and encouraging. You love art deeply.
Keep responses concise — 2 to 4 paragraphs max unless more detail is needed.
Never discuss topics unrelated to art and creativity."""

@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    try:
        
        data = request.get_json(force=True)
        user_message = data.get('message', '').strip()
        conversation_history = data.get('history', [])

        if not user_message:
            return jsonify({'error': 'Message cannot be empty'}), 400

        # Build messages list from history + new message
        messages = [{"role": "system", "content": MUSE_SYSTEM_PROMPT}]

        for msg in conversation_history[-10:]:  # last 10 messages for context
            if msg.get('role') in ['user', 'assistant']:
                messages.append({
                    'role': msg['role'],
                    'content': msg['content']
                })

        messages.append({'role': 'user', 'content': user_message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.7
        )

        reply = response.choices[0].message.content

        return jsonify({
            'reply': reply,
            'status': 'success'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500