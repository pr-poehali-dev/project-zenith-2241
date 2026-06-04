import json
import os
import psycopg2

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
