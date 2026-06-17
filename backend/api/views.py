"""
AI Student PRO — API views
"""
import logging

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .services import analyze_with_gemini, send_telegram_message

logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 МБ


@csrf_exempt
@require_POST
def analyze_lecture(request):
    """
    Конспектти талдайт жана жоопту Telegram чатына жөнөтөт.

    Кабыл алат (multipart/form-data):
        - text: лекциянын тексти (optional)
        - file: сүрөт файлы (optional)
        - chat_id: Telegram user ID (required)
    """
    try:
        text = request.POST.get("text", "").strip()
        chat_id = request.POST.get("chat_id", "").strip()
        image_file = request.FILES.get("file")

        # Валидация
        if not chat_id:
            return JsonResponse(
                {"error": "chat_id талап кылынат. Telegram Mini App ичинде ачыңыз."},
                status=400,
            )

        if not text and not image_file:
            return JsonResponse(
                {"error": "Текст же сүрөт жүктөңүз."},
                status=400,
            )

        if image_file:
            if image_file.content_type not in ALLOWED_IMAGE_TYPES:
                return JsonResponse(
                    {"error": "Сүрөт форматы: JPEG, PNG, WebP же GIF."},
                    status=400,
                )

            if image_file.size > MAX_IMAGE_SIZE:
                return JsonResponse(
                    {"error": "Сүрөттүн көлөмү 5 МБдан ашпашы керек."},
                    status=400,
                )

        # Gemini талдоо
        analysis = analyze_with_gemini(text, image_file)

        # Telegram чатына жөнөтүү
        send_telegram_message(chat_id, analysis)

        return JsonResponse(
            {
                "success": True,
                "message": "Успешно отправлено",
                "analysis": analysis,
            }
        )

    except ValueError as exc:
        return JsonResponse({"error": str(exc)}, status=400)

    except Exception as exc:
        logger.exception("analyze_lecture катасы")
        return JsonResponse(
            {"error": f"Талдоо учурунда ката: {str(exc)}"},
            status=500,
        )
