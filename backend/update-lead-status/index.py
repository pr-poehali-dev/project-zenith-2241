import json
import os
import psycopg2

STAGES = [
    'new', 'review', 'director_approval', 'diagnostics', 'price_approval',
    'await_prepayment', 'in_work', 'parts_ordered', 'repair_done',
    'ready', 'delivered', 'rejected'
]

# Поля карточки: имя -> тип ('text' | 'int' | 'json')
CARD_FIELDS = {
    'model': 'text', 'year': 'int', 'vin': 'text', 'mileage': 'int',
    'service': 'text', 'problem': 'text', 'diagnosis': 'text',
    'work_cost': 'int', 'parts_cost': 'int', 'est_price': 'int',
    'prepayment': 'int', 'mechanic': 'text', 'accept_date': 'text',
    'ready_date': 'text', 'payment_status': 'text', 'photos': 'json',
    'name': 'text', 'phone': 'text', 'est_days': 'text',
    'visit_date': 'text', 'visit_time': 'text', 'photo_url': 'text',
}

def coerce(value, vtype):
    if value is None or value == '':
        return None
    if vtype == 'int':
        try:
            return int(value)
        except (ValueError, TypeError):
            return None
    if vtype == 'json':
        return json.dumps(value)
    return str(value)

def handler(event: dict, context) -> dict:
    """Обновление статуса/заметки/удаление заявки в админке Only Vespa"""
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
    password = body.get('password', '')
    action = body.get('action', 'status')
    lead_id = body.get('id')

    if password != os.environ['ADMIN_PASSWORD']:
        return {
            'statusCode': 401,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'unauthorized'})
        }

    if not lead_id:
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'invalid params'})
        }

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if action == 'status':
        new_status = body.get('status', '')
        if new_status not in ('new', 'in_progress', 'done', 'cancelled'):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'invalid status'})
            }
        cur.execute("UPDATE leads SET status = %s WHERE id = %s", (new_status, lead_id))
    elif action == 'stage':
        new_stage = body.get('stage', '')
        if new_stage not in STAGES:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'invalid stage'})
            }
        cur.execute("UPDATE leads SET stage = %s WHERE id = %s", (new_stage, lead_id))
    elif action == 'card':
        fields = body.get('fields') or {}
        updates = []
        values = []
        for key, vtype in CARD_FIELDS.items():
            if key in fields:
                updates.append(f"{key} = %s")
                values.append(coerce(fields[key], vtype))
        if not updates:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'no fields'})
            }
        values.append(lead_id)
        cur.execute(f"UPDATE leads SET {', '.join(updates)} WHERE id = %s", values)
    elif action == 'note':
        note = (body.get('note') or '').strip() or None
        cur.execute("UPDATE leads SET note = %s WHERE id = %s", (note, lead_id))
    elif action == 'delete':
        cur.execute("DELETE FROM leads WHERE id = %s", (lead_id,))
    else:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'unknown action'})
        }

    conn.commit()
    cur.close()
    conn.close()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }