import sqlite3

DB_PATH = r"D:\artverse\backend\instance\artverse.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Check existing columns in 'user' table (not 'users')
cur.execute("PRAGMA table_info(user)")
existing = {row[1] for row in cur.fetchall()}
print("Existing columns:", existing)

if "bio" not in existing:
    cur.execute("ALTER TABLE user ADD COLUMN bio TEXT DEFAULT ''")
    print("Added bio column")
else:
    print("bio already exists, skipping")

if "avatar_url" not in existing:
    cur.execute("ALTER TABLE user ADD COLUMN avatar_url TEXT DEFAULT ''")
    print("Added avatar_url column")
else:
    print("avatar_url already exists, skipping")

cur.execute("""
CREATE TABLE IF NOT EXISTS saved_artworks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    title      TEXT DEFAULT 'Saved Artwork',
    image_url  TEXT NOT NULL,
    prompt     TEXT DEFAULT '',
    style      TEXT DEFAULT '',
    source_tab TEXT DEFAULT 'gallery',
    saved_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
)
""")

conn.commit()
conn.close()
print("Migration complete!")