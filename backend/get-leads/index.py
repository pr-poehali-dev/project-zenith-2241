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
    cur.execute(
        """SELECT id, name, phone, message, created_at, status, note, track_code,
                  service, model, year, photo_url, visit_date, visit_time,
                  est_price, est_days, bitrix_id, stage, problem, vin, mileage,
                  diagnosis, work_cost, parts_cost, prepayment, mechanic,
                  accept_date, ready_date, payment_status, photos
           FROM leads ORDER BY created_at DESC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    def to_list(v):
        if v is None:
            return []
        if isinstance(v, str):
            try:
                return json.loads(v)
            except Exception:
                return []
        return v

    leads = [
        {
            'id': r[0],
            'name': r[1],
            'phone': r[2],
            'message': r[3],
            'created_at': r[4].isoformat() if r[4] else None,
            'status': r[5] or 'new',
            'note': r[6],
            'track_code': r[7],
            'service': r[8],
            'model': r[9],
            'year': r[10],
            'photo_url': r[11],
            'visit_date': r[12],
            'visit_time': r[13],
            'est_price': r[14],
            'est_days': r[15],
            'bitrix_id': r[16],
            'stage': r[17] or 'new',
            'problem': r[18],
            'vin': r[19],
            'mileage': r[20],
            'diagnosis': r[21],
            'work_cost': r[22],
            'parts_cost': r[23],
            'prepayment': r[24],
            'mechanic': r[25],
            'accept_date': r[26],
            'ready_date': r[27],
            'payment_status': r[28],
            'photos': to_list(r[29]),
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'leads': leads})
    }