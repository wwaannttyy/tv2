import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY,
        score INTEGER DEFAULT 0,
        energy INTEGER DEFAULT 1000,
        multitap_level INTEGER DEFAULT 1,
        energy_limit INTEGER DEFAULT 1000,
        tapbot_active BOOLEAN DEFAULT 0,
        full_tank_uses INTEGER DEFAULT 0,
        last_full_tank TEXT DEFAULT '2023-01-01T00:00:00'
    )
''')

conn.commit()
conn.close()

print("Database created and updated with the necessary columns.")
