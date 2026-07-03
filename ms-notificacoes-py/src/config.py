import os

try:
    # pyrefly: ignore [missing-import]
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # Em produção (Docker), as variáveis já vêm do ambiente

class Config:
    RABBIT_HOST = os.getenv("RABBIT_HOST", "localhost")
    RABBIT_PORT = int(os.getenv("RABBIT_PORT", "5672"))
    RABBIT_USER = os.getenv("RABBIT_USER", "admin")
    RABBIT_PASS = os.getenv("RABBIT_PASS", "admin123")
    RABBIT_URL = os.getenv("RABBIT_URL")

    SMTP_HOST = os.getenv("SMTP_HOST", "sandbox.smtp.mailtrap.io")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "2525"))
    SMTP_USER = os.getenv("SMTP_USER", "")
    SMTP_PASS = os.getenv("SMTP_PASS", "")
    MAILTRAP_API_TOKEN = os.getenv("MAILTRAP_API_TOKEN", "")
    
    DEFAULT_FROM_EMAIL = "no-reply@expressdelivery.com"
