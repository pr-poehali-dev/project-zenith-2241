import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Получение списка заявок для админки Only Vespa"""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    body = json.loads(event.get('body') or '{}')
    password = body.get('password', '')
    if password != os.environ['ADMIN_PASSWORD']:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'unauthorized'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    cur.execute("SELECT id, name, phone, message, created_at, status, note FROM leads ORDER BY created_at DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    leads = [
        {
            'id': r[0],
            'name': r[1],
            'phone': r[2],
            'message': r[3],
            'created_at': r[4].isoformat() if r[4] else None,
            'status': r[5] or 'new',
            'note': r[6]
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'leads': leads})
    }