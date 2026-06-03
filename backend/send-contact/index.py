import json
import os
import requests

def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта Only Vespa в Telegram"""
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

    text = (
        f"🛵 *Новая заявка с сайта Only Vespa*\n\n"
        f"👤 *Имя:* {name}\n"
        f"📞 *Телефон:* {phone}\n"
        f"💬 *Сообщение:* {message or '—'}"
    )

    token = os.environ['TELEGRAM_BOT_TOKEN']
    chat_id = os.environ['TELEGRAM_CHAT_ID']

    resp = requests.post(
        f'https://api.telegram.org/bot{token}/sendMessage',
        json={'chat_id': chat_id, 'text': text, 'parse_mode': 'Markdown'},
        timeout=10
    )
    resp.raise_for_status()

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'ok': True})
    }
