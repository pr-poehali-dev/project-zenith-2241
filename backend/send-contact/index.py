import json
import os
import secrets
import string
import urllib.request
import urllib.parse
import psycopg2

def gen_code():
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(6))

def send_to_bitrix(name, phone, fields):
    webhook = os.environ.get('BITRIX_WEBHOOK_URL', '').strip()
    if not webhook:
        return None
    if not webhook.endswith('/'):
        webhook += '/'
    url = webhook + 'crm.lead.add.json'

    comment_lines = [
        f"Услуга: {fields.get('service') or '—'}",
        f"Модель: {fields.get('model') or '—'}",
        f"Год выпуска: {fields.get('year') or '—'}",
        f"Запись: {fields.get('visit_date') or '—'} {fields.get('visit_time') or ''}".strip(),
        f"Примерная стоимость: {('от ' + str(fields.get('est_price')) + ' руб.') if fields.get('est_price') else '—'}",
        f"Примерный срок: {fields.get('est_days') or '—'}",
        f"Код заявки: {fields.get('track_code') or '—'}",
    ]
    if fields.get('photo_url'):
        comment_lines.append(f"Фото мопеда: {fields.get('photo_url')}")

    payload = {
        'fields': {
            'TITLE': f"Заявка с сайта Only Vespa — {fields.get('service') or 'Запись'}",
            'NAME': name,
            'PHONE': [{'VALUE': phone, 'VALUE_TYPE': 'WORK'}],
            'COMMENTS': "\n".join(comment_lines),
            'SOURCE_ID': 'WEB',
        }
    }

    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            return str(result.get('result')) if result.get('result') else None
    except Exception:
        return None

def handler(event: dict, context) -> dict:
    """Сохранение заявки с сайта Only Vespa в БД и отправка Лида в Битрикс24"""
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

    bitrix_id = send_to_bitrix(name, phone, {
        'service': service, 'model': model, 'year': year,
        'visit_date': visit_date, 'visit_time': visit_time,
        'est_price': est_price, 'est_days': est_days,
        'photo_url': photo_url, 'track_code': track_code,
    })

    cur.execute(
        """INSERT INTO leads
        (name, phone, message, track_code, service, model, year, photo_url,
         visit_date, visit_time, est_price, est_days, bitrix_id)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (name, phone, message or None, track_code, service, model, year, photo_url,
         visit_date, visit_time, est_price, est_days, bitrix_id)
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True, 'track_code': track_code, 'bitrix_id': bitrix_id})
    }
