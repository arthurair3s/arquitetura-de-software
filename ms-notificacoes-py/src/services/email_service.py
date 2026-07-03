import smtplib
import urllib.request
import urllib.error
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import Config


class EmailService:
    _sandbox_id = None

    @classmethod
    def _obter_sandbox_id(cls, api_token: str, smtp_user: str) -> str:
        if cls._sandbox_id:
            return cls._sandbox_id
        
        headers = {
            "Authorization": f"Bearer {api_token}",
            "Accept": "application/json",
            "User-Agent": "ExpressDeliveryApp/1.0"
        }
        
        # 1. Get Accounts
        req = urllib.request.Request("https://mailtrap.io/api/accounts", headers=headers)
        with urllib.request.urlopen(req) as response:
            accounts = json.loads(response.read().decode())
            if not accounts:
                raise Exception("Nenhuma conta Mailtrap encontrada.")
            account_id = accounts[0]["id"]
            
        # 2. Get Inboxes
        inboxes_url = f"https://mailtrap.io/api/accounts/{account_id}/inboxes"
        req_inboxes = urllib.request.Request(inboxes_url, headers=headers)
        with urllib.request.urlopen(req_inboxes) as response_inboxes:
            inboxes = json.loads(response_inboxes.read().decode())
            for ib in inboxes:
                if ib.get('username') == smtp_user:
                    cls._sandbox_id = str(ib['id'])
                    return cls._sandbox_id
                    
        raise Exception(f"Inbox com username '{smtp_user}' não encontrado no Mailtrap.")

    @classmethod
    def enviar_email(cls, destinatario: str, assunto: str, corpo_html: str) -> bool:
        """
        Envia um e-mail HTML para o destinatário via API REST ou SMTP.
        """
        # Se possuir API Token, prefere o envio via API HTTP (evita bloqueios de porta SMTP)
        if Config.MAILTRAP_API_TOKEN:
            try:
                print(f"[Email Service] Enviando e-mail via API REST (HTTP) para {destinatario}...")
                
                # Se for sandbox, resolve o sandbox_id dinamicamente
                if "sandbox" in Config.SMTP_HOST.lower():
                    sb_id = cls._obter_sandbox_id(Config.MAILTRAP_API_TOKEN, Config.SMTP_USER)
                    url = f"https://sandbox.api.mailtrap.io/api/send/{sb_id}"
                else:
                    url = "https://send.api.mailtrap.io/api/send"

                headers = {
                    "Authorization": f"Bearer {Config.MAILTRAP_API_TOKEN}",
                    "Content-Type": "application/json",
                    "User-Agent": "ExpressDeliveryApp/1.0"
                }

                payload = {
                    "from": {"email": Config.DEFAULT_FROM_EMAIL, "name": "Express Delivery"},
                    "to": [{"email": destinatario}],
                    "subject": assunto,
                    "html": corpo_html
                }

                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers=headers,
                    method="POST"
                )

                with urllib.request.urlopen(req) as response:
                    res_body = response.read().decode()
                    print(f"[Email Service] E-mail enviado via API HTTP com sucesso: {res_body}")
                return True
            except urllib.error.HTTPError as e:
                body = e.read().decode() if e else ""
                print(f"[Email Service] ERRO HTTP ao enviar via API: {e.code} {e.reason} - {body}")
                return False
            except Exception as e:
                print(f"[Email Service] ERRO ao enviar e-mail via API para {destinatario}: {e}")
                return False

        # Fallback para o envio SMTP tradicional
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

            print(f"[Email Service] E-mail SMTP enviado com sucesso para {destinatario}!")
            return True
        except Exception as e:
            print(f"[Email Service] ERRO ao enviar e-mail SMTP para {destinatario}: {e}")
            return False
