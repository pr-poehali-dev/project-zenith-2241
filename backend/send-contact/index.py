import json
import os
import secrets
import string
import psycopg2

def gen_code():
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(6))

def handler(event: dict, context) -> dict:
    """Сохранение заявки с сайта Only Vespa в базу данных"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body', '{}'))
    name = body.get('name', '').strip()
    phone = body.get('phone', '').strip()
    message = body.get('message', '').strip()

    if not name or not phone:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'name and phone are required'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    track_code = gen_code()
    for _ in range(5):
        cur.execute("SELECT 1 FROM leads WHERE track_code = %s", (track_code,))
        if cur.fetchone() is None:
            break
        track_code = gen_code()

    cur.execute(
        "INSERT INTO leads (name, phone, message, track_code) VALUES (%s, %s, %s, %s)",
        (name, phone, message or None, track_code)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'track_code': track_code})
    }