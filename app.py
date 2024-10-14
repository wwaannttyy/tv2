from flask import Flask, request, jsonify, render_template
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('database.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    user_id = request.args.get('user_id')
    return render_template('index.html', user_id=user_id)

@app.route('/boosts')
def boosts():
    user_id = request.args.get('user_id')
    return render_template('boosts.html', user_id=user_id)

@app.route('/api/get_score')
def get_score():
    user_id = request.args.get('user_id')
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE user_id = ?', (user_id,)).fetchone()
    conn.close()

    if user is None:
        return jsonify({'error': 'User not found'}), 404

    user_data = {
        'user_id': user['user_id'],
        'score': user['score'],
        'energy': user['energy'],
        'multitap_level': user['multitap_level'],
        'energy_limit': user['energy_limit'],
        'full_tank_uses': user['full_tank_uses'],
        'last_full_tank': user['last_full_tank'],
        'tapbot_active': user['tapbot_active']
    }

    return jsonify(user_data)

@app.route('/update', methods=['POST'])
def update():
    data = request.json
    user_id = data['user_id']
    score = data['score']
    energy = data['energy']
    multitap_level = data['multitap_level']
    energy_limit = data['energy_limit']
    full_tank_uses = data['full_tank_uses']
    last_full_tank = data['last_full_tank']
    tapbot_active = data['tapbot_active']

    conn = get_db_connection()
    conn.execute('''
        UPDATE users
        SET score = ?, energy = ?, multitap_level = ?, energy_limit = ?, full_tank_uses = ?, last_full_tank = ?, tapbot_active = ?
        WHERE user_id = ?
    ''', (score, energy, multitap_level, energy_limit, full_tank_uses, last_full_tank, tapbot_active, user_id))
    conn.commit()
    conn.close()

    return jsonify({'status': 'success'})

@app.route('/create_user', methods=['POST'])
def create_user():
    user_id = request.json['user_id']
    
    conn = get_db_connection()
    conn.execute('''
        INSERT INTO users (user_id, score, energy, multitap_level, energy_limit, full_tank_uses, last_full_tank, tapbot_active)
        VALUES (?, 0, 1000, 1, 1000, 0, '2023-01-01T00:00:00', 0)
    ''', (user_id,))
    conn.commit()
    conn.close()

    return jsonify({'status': 'user created'})

if __name__ == '__main__':
    app.run(debug=True)
