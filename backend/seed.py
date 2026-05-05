from app import app
from extensions import db
from models.artwork import Artwork
from models.user import User
from werkzeug.security import generate_password_hash
import requests
import time

# Famous artwork IDs from Met Museum
MET_ARTWORK_IDS = [
    436535, 437984, 438722, 436105, 459055,
    437853, 436524, 438814, 437329, 436121,
    438817, 436944, 437880, 459080, 436536,
    438018, 436532, 437645, 438728, 436530
]

def fetch_artwork(obj_id):
    try:
        url = f"https://collectionapi.metmuseum.org/public/collection/v1/objects/{obj_id}"
        res = requests.get(url, timeout=10)
        data = res.json()

        if not data.get('primaryImage'):
            return None

        return {
            "title": data.get("title", "Untitled")[:200],
            "artist_name": data.get("artistDisplayName", "Unknown Artist") or "Unknown Artist",
            "style": data.get("classification", "Oil Painting") or "Oil Painting",
            "description": data.get("medium", "")[:500] or "",
            "image_path": data.get("primaryImage"),
            "likes": 0,
        }
    except Exception as e:
        print(f"❌ Failed {obj_id}: {e}")
        return None

with app.app_context():
    # Create a seed user if not exists
    seed_user = User.query.filter_by(email="gallery@artverse.com").first()
    if not seed_user:
        seed_user = User(
            username="ArtVerse Gallery",
            email="gallery@artverse.com",
            password_hash=generate_password_hash("artverse123"),
            avatar="🎨",
            bio="Official ArtVerse curated gallery"
        )
        db.session.add(seed_user)
        db.session.commit()
        print(f"✅ Created seed user with id: {seed_user.id}")

    # Delete old broken artworks for this user
    Artwork.query.filter_by(user_id=seed_user.id).delete()
    db.session.commit()

    # Fetch and save artworks
    saved = 0
    for obj_id in MET_ARTWORK_IDS:
        print(f"Fetching artwork {obj_id}...")
        data = fetch_artwork(obj_id)
        if data:
            artwork = Artwork(
                title=data["title"],
                artist_name=data["artist_name"],
                style=data["style"],
                description=data["description"],
                image_path=data["image_path"],
                likes=data["likes"],
                user_id=seed_user.id
            )
            db.session.add(artwork)
            saved += 1
            print(f"✅ Saved: {data['title']} by {data['artist_name']}")
        time.sleep(0.3)  # be nice to the API

    db.session.commit()
    print(f"\n🎨 Done! Seeded {saved} artworks from Met Museum!")