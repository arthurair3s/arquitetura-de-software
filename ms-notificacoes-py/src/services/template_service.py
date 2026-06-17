import os


class TemplateService:
    """Carrega templates HTML e substitui variáveis no formato {{variavel}}."""

    TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), "..", "templates")

    @staticmethod
    def render(template_name: str, context: dict) -> str:
        """
        Lê o arquivo HTML do diretório de templates e substitui
        todos os placeholders {{chave}} pelos valores do contexto.

        Args:
            template_name: Nome do arquivo (ex: 'pagamento_aprovado.html')
            context: Dicionário com os valores a substituir

        Returns:
            String HTML com os placeholders substituídos.
        """
        template_path = os.path.join(TemplateService.TEMPLATES_DIR, template_name)

        if not os.path.exists(template_path):
            raise FileNotFoundError(f"[TemplateService] Template não encontrado: {template_path}")

        with open(template_path, "r", encoding="utf-8") as f:
            html = f.read()

        for key, value in context.items():
            html = html.replace(f"{{{{{key}}}}}", str(value))

        return html
