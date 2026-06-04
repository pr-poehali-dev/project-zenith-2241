import json
import os
import psycopg2

STATUS_TEXT = {
    'new': 'Заявка принята',
    'in_progress': 'В работе',
    'done': 'Готова',
    'cancelled': 'Отменена',
}

def handler(event: dict, context) -> dict:
    """Публичное отслеживание статуса заявки по коду для клиентов Only Vespa"""
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

    body = json.loads(event.get('body') or '{}')
    code = (body.get('code') or '').strip().upper()

    if not code:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'code required'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute(
        "SELECT name, status, created_at FROM leads WHERE track_code = %s",
        (code,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'found': False})
        }

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'found': True,
            'name': row[0],
            'status': row[1] or 'new',
            'status_text': STATUS_TEXT.get(row[1] or 'new', 'Заявка принята'),
            'created_at': row[2].isoformat() if row[2] else None
        })
    }
