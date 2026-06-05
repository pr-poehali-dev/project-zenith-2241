import json
import os
import secrets
import string
import psycopg2

def gen_code():
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(6))

def handler(event: dict, context) -> dict:
    """Сохранение заявки на ремонт Vespa с сайта в базу данных"""
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
    name = (body.get('name') or '').strip()
    phone = (body.get('phone') or '').strip()
    message = (body.get('message') or '').strip()
    service = (body.get('service') or '').strip() or None
    model = (body.get('model') or '').strip() or None
    photo_url = (body.get('photo_url') or '').strip() or None
    visit_date = (body.get('visit_date') or '').strip() or None
    visit_time = (body.get('visit_time') or '').strip() or None
    est_days = (body.get('est_days') or '').strip() or None
    problem = (body.get('problem') or '').strip() or None

    photos = body.get('photos')
    if not isinstance(photos, list):
        photos = []
    photos = [str(p) for p in photos if p]
    if not photo_url and photos:
        photo_url = photos[0]

    year = body.get('year')
    try:
        year = int(year) if year else None
    except (ValueError, TypeError):
        year = None

    est_price = body.get('est_price')
    try:
        est_price = int(est_price) if est_price else None
    except (ValueError, TypeError):
        est_price = None

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
        """INSERT INTO leads
        (name, phone, message, track_code, service, model, year, photo_url,
         visit_date, visit_time, est_price, est_days, problem, photos, accept_date)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (name, phone, message or None, track_code, service, model, year, photo_url,
         visit_date, visit_time, est_price, est_days, problem,
         json.dumps(photos), visit_date)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'track_code': track_code})
    }