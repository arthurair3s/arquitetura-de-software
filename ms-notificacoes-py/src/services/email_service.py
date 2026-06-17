import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


class EmailService:
    @staticmethod
    def enviar_email(destinatario: str, assunto: str, corpo_html: str) -> bool:
        """
        Envia um e-mail HTML para o destinatário via SMTP.
        Se as credenciais SMTP não estiverem configuradas, exibe o assunto no console (mock).

        Args:
            destinatario: Endereço de e-mail do destinatário
            assunto: Linha de assunto do e-mail
            corpo_html: Conteúdo HTML do e-mail
        """
        if not Config.SMTP_USER or not Config.SMTP_PASS:
            print("----------------------------------------------------------------------")
            print("[MOCK SMTP] Simulando envio de e-mail HTML:")
            print(f"  Remetente:   {Config.DEFAULT_FROM_EMAIL}")
            print(f"  Destinatário: {destinatario}")
            print(f"  Assunto:     {assunto}")
            print("  (Corpo HTML omitido no mock — configure SMTP_USER e SMTP_PASS para envio real)")
            print("----------------------------------------------------------------------")
            return True

        try:
            print(f"[Email Service] Enviando e-mail real via SMTP para {destinatario}...")

            mensagem = MIMEMultipart("alternative")
            mensagem["From"] = Config.DEFAULT_FROM_EMAIL
            mensagem["To"] = destinatario
            mensagem["Subject"] = assunto

            # Parte HTML — clientes de e-mail modernos renderizam esta versão
            mensagem.attach(MIMEText(corpo_html, "html", "utf-8"))

            with smtplib.SMTP(Config.SMTP_HOST, Config.SMTP_PORT) as server:
                server.starttls()
                server.login(Config.SMTP_USER, Config.SMTP_PASS)
                server.sendmail(Config.DEFAULT_FROM_EMAIL, destinatario, mensagem.as_string())

            print(f"[Email Service] E-mail enviado com sucesso para {destinatario}!")
            return True
        except Exception as e:
            print(f"[Email Service] ERRO ao enviar e-mail para {destinatario}: {e}")
            return False
