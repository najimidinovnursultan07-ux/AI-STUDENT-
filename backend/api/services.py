"""
AI Student PRO — Telegram жана Gemini утилиталары
"""
import io
import logging

import google.generativeai as genai
import requests
from django.conf import settings
from PIL import Image

logger = logging.getLogger(__name__)

# Системный промпт для анализа конспектов
SYSTEM_PROMPT = (
    'Ты — продвинутый AI-помощник для студентов под названием "AI Student PRO". '
    "Анализируй лекции, делай тезисы, выделяй даты/формулы, пиши кратко и структурировано. "
    "Разбей информацию на ключевые блоки, используй списки и жирный шрифт для важных терминов. "
    'Если контент не является конспектом лекции, вежливо скажи: '
    '"Пожалуйста, загрузите четкое фото конспекта или вставьте текст лекции."'
)

TELEGRAM_MAX_MESSAGE_LENGTH = 4096


def send_telegram_message(chat_id: str, message_text: str) -> None:
    """
    Жоопту Telegram Bot API аркылуу колдонуучунун чатына жөнөтөт.

    Args:
        chat_id: Telegram user/chat ID (фронтендден келет)
        message_text: AI талдоосунун тексти
    """
    if not settings.BOT_TOKEN:
        raise ValueError("BOT_TOKEN орнотулган эмес. backend/.env файлын текшериңиз.")

    url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"

    # Telegram 4096 символ чегин эске алуу
    chunks = [
        message_text[i : i + TELEGRAM_MAX_MESSAGE_LENGTH]
        for i in range(0, len(message_text), TELEGRAM_MAX_MESSAGE_LENGTH)
    ]

    for chunk in chunks:
        response = requests.post(
            url,
            json={
                "chat_id": chat_id,
                "text": chunk,
            },
            timeout=30,
        )
        response.raise_for_status()

        result = response.json()
        if not result.get("ok"):
            raise RuntimeError(f"Telegram API ката: {result.get('description', 'белгисиз')}")


def analyze_with_gemini(text: str, image_file) -> str:
    """
    Gemini API аркылуу текст жана/же сүрөттү талдайт.

    Args:
        text: Лекциянын тексти
        image_file: Django UploadedFile (сүрөт)

    Returns:
        AI талдоосунун тексти
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError(
            "GEMINI_API_KEY орнотулган эмес. backend/.env файлын текшериңиз."
        )

    genai.configure(api_key=settings.GEMINI_API_KEY)

    model = genai.GenerativeModel(
        model_name=settings.GEMINI_MODEL,
        system_instruction=SYSTEM_PROMPT,
    )

    parts = []

    if text:
        parts.append(f"Проанализируй следующий конспект лекции:\n\n{text}")

    if image_file:
        try:
            image_bytes = image_file.read()
            image = Image.open(io.BytesIO(image_bytes))

            if not text:
                parts.append(
                    "Проанализируй конспект лекции на этом изображении."
                )

            parts.append(image)
        except Exception as exc:
            logger.error("Сүрөттү окуу катасы: %s", exc)
            raise ValueError("Сүрөттү окууга мүмкүн болгон жок.") from exc

    if not parts:
        raise ValueError("Талдоо үчүн текст же сүрөт керек.")

    response = model.generate_content(parts)

    if not response.text:
        raise RuntimeError("Gemini бош жооп кайтарды.")

    return response.text
