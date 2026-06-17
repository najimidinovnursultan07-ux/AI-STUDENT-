# AI Student PRO — Django Backend

## Орнотуу

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

## API ачкычтарын киргизүү (`backend/.env`)

| Переменная | Где взять |
|------------|-----------|
| `BOT_TOKEN` | [@BotFather](https://t.me/BotFather) → `/newbot` |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

```env
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-1.5-flash
```

> **Маанилүү:** Колдонуучу ботко `/start` басышы керек, анда гана бот чатына жооп жөнөтө алат.

## Иштетүү

```bash
python manage.py migrate
python manage.py runserver
```

API: `POST http://localhost:8000/api/analyze/`

### Параметрлер (FormData)

| Поле | Тип | Обязательно |
|------|-----|-------------|
| `chat_id` | string | Да |
| `text` | string | Нет* |
| `file` | image | Нет* |

\* Хотя бы одно из `text` или `file`.

## Фронтенд

Корень проекта `.env.local`:

```env
NEXT_PUBLIC_DJANGO_API_URL=http://localhost:8000/api/analyze/
```

```bash
npm run dev
```
