import sqlite3

DB_PATH = r"D:\artverse\backend\instance\artverse.db"

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cur.fetchall()
print("Tables found:", tables)

conn.close()