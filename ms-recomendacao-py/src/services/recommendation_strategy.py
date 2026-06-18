# pyrefly: ignore [missing-import]
import math
from abc import ABC, abstractmethod
from typing import List, Dict, Any
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from models import RestauranteReplica, ProdutoReplica, VendaProdutoAnalise



def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula a distância entre duas coordenadas usando a fórmula de Haversine em km."""
    R = 6371.0  # Raio médio da Terra em km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


DIAS_SEMANA = {
    0: "Segundas-feiras",
    1: "Terças-feiras",
    2: "Quartas-feiras",
    3: "Quintas-feiras",
    4: "Sextas-feiras",
    5: "Sábados",
    6: "Domingos"
}


class InsightStrategy(ABC):
    @abstractmethod
    def gerar_insights(self, db: Session, restaurante_id: int) -> Dict[str, Any]:
        """Gera recomendações de negócio analíticas para o lojista."""
        pass


class GratuitoInsightStrategy(InsightStrategy):
    """Estratégia para o Plano Gratuito: Acesso negado com mensagem de upgrade."""
    def gerar_insights(self, db: Session, restaurante_id: int) -> Dict[str, Any]:
        return {
            "status": "ACESS_DENIED",
            "plano": "GRATUITO",
            "mensagem": (
                "Acesso restrito. O painel de inteligência competitiva e sugestão inteligente "
                "de precificação é uma funcionalidade exclusiva do plano PREMIUM. "
                "Assine o plano PREMIUM para liberar o acesso aos insights locais e concorrência."
            ),
            "simulacao_gateway": "Faça um POST /assinaturas com {'restaurante_id': X, 'plano': 'PREMIUM'} para assinar."
        }


class PremiumInsightStrategy(InsightStrategy):
    """Estratégia para o Plano Premium: Analisa concorrência geográfica, preços e padrões de vendas."""
    def gerar_insights(self, db: Session, restaurante_id: int) -> Dict[str, Any]:
        # Buscar o restaurante atual
        restaurante = db.query(RestauranteReplica).filter(RestauranteReplica.id == restaurante_id).first()
        if not restaurante:
            return {"status": "ERROR", "mensagem": "Restaurante não encontrado na réplica."}

        # 1. Encontrar todos os concorrentes em um raio de até 5km
        todos_restaurantes = db.query(RestauranteReplica).filter(RestauranteReplica.id != restaurante_id).all()
        concorrentes_proximos = []
        for r in todos_restaurantes:
            # pyrefly: ignore [bad-argument-type]
            dist = calculate_distance(restaurante.latitude, restaurante.longitude, r.latitude, r.longitude)
            if dist <= 5.0:
                concorrentes_proximos.append(r)

        # 2. Obter todos os produtos do restaurante atual
        produtos_atuais = db.query(ProdutoReplica).filter(ProdutoReplica.restaurante_id == restaurante_id).all()
        
        insights = []

        # Para cada produto do restaurante, analisar concorrência e vendas
        for produto in produtos_atuais:
            # Encontrar produtos concorrentes da mesma categoria
            concorrentes_ids = [c.id for c in concorrentes_proximos]
            if not concorrentes_ids:
                produtos_concorrentes = []
            else:
                produtos_concorrentes = db.query(ProdutoReplica).filter(
                    ProdutoReplica.categoria_id == produto.categoria_id,
                    ProdutoReplica.restaurante_id.in_(concorrentes_ids)
                ).all()

            if not produtos_concorrentes:
                # Insight padrão se não houver concorrentes diretos próximos
                insights.append({
                    "produto_id": produto.id,
                    "produto_nome": produto.nome,
                    "preco_atual": produto.preco,
                    "tipo_sugestao": "PROMOÇÃO_LOCAL",
                    "sugestao": (
                        f"Seu produto '{produto.nome}' não possui concorrentes diretos próximos (< 5km). "
                        "Aproveite para criar um combo promocional (ex: com bebida inclusa) às Sextas-feiras às 20h "
                        "para aumentar o ticket médio aproveitando a baixa concorrência local."
                    )
                })
                continue

            # Analisar histórico de vendas para encontrar o produto concorrente mais vendido e seu horário de pico
            # Busca todas as vendas do restaurante atual e dos concorrentes para este tipo de produto/categoria
            restaurantes_para_buscar = [restaurante_id] + [p.restaurante_id for p in produtos_concorrentes]
            vendas = db.query(VendaProdutoAnalise).filter(
                VendaProdutoAnalise.restaurante_id.in_(restaurantes_para_buscar)
            ).all()

            # Agrupar vendas por restaurante -> dia_semana -> hora
            # Estrutura: {restaurante_id: {(dia, hora): total_vendido}}
            tabela_vendas = {}
            for v in vendas:
                r_id = v.restaurante_id
                dia = v.data_criacao.weekday()  # 0-6
                hora = v.data_criacao.hour
                chave = (dia, hora)
                
                if r_id not in tabela_vendas:
                    tabela_vendas[r_id] = {}
                tabela_vendas[r_id][chave] = tabela_vendas[r_id].get(chave, 0) + v.quantidade

            # Encontrar se algum concorrente vende muito mais em algum horário com menor preço
            insight_gerado = False
            for prod_concorrente in produtos_concorrentes:
                c_id = prod_concorrente.restaurante_id
                c_nome = next((c.nome for c in concorrentes_proximos if c.id == c_id), "Concorrente")

                # Se o preço do concorrente for menor que o nosso e houver histórico de vendas estruturado
                if prod_concorrente.preco < produto.preco and c_id in tabela_vendas:
                    # Procurar o dia/hora de maior venda do concorrente
                    for (dia, hora), qtd_concorrente in tabela_vendas[c_id].items():
                        # Obter vendas do nosso restaurante nesse mesmo dia/hora
                        qtd_atual = tabela_vendas.get(restaurante_id, {}).get((dia, hora), 0)
                        
                        # Se o concorrente vende muito mais (ex: vende mais que 1.5x as nossas vendas ou mais que 3 unidades no mock)
                        if qtd_concorrente > (qtd_atual * 1.5) or (qtd_atual == 0 and qtd_concorrente >= 2):
                            nome_dia = DIAS_SEMANA.get(dia, "Quartas-feiras")
                            # pyrefly: ignore [bad-argument-type]
                            preco_sugerido = float(prod_concorrente.preco) - 0.10  # Sugere cobrir por 10 centavos
                            
                            insights.append({
                                "produto_id": produto.id,
                                "produto_nome": produto.nome,
                                "preco_atual": produto.preco,
                                "tipo_sugestao": "BAIXAR_PRECO_COMPETITIVO",
                                "sugestao": (
                                    f"Sugerimos reduzir temporariamente o preço de '{produto.nome}' "
                                    f"(atualmente R$ {produto.preco:.2f}) para R$ {preco_sugerido:.2f} nas "
                                    f"{nome_dia} às {hora:02d}h. O concorrente próximo '{c_nome}' "
                                    f"está vendendo muito mais (volume de {qtd_concorrente} itens neste período) "
                                    f"cobrando R$ {prod_concorrente.preco:.2f}."
                                )
                            })
                            insight_gerado = True
                            break # Encontramos uma recomendação forte para este produto, passamos para o próximo
                if insight_gerado:
                    break

            if not insight_gerado:
                # Insight padrão caso tenha concorrência mas nenhum vendendo agressivamente mais barato
                insights.append({
                    "produto_id": produto.id,
                    "produto_nome": produto.nome,
                    "preco_atual": produto.preco,
                    "tipo_sugestao": "MANTER_PRECO_PROMO",
                    "sugestao": (
                        f"Seu preço para '{produto.nome}' está competitivo em relação aos concorrentes próximos. "
                        "Sugerimos manter a faixa atual e oferecer frete grátis aos domingos às 19h "
                        "para capturar novos clientes na região."
                    )
                })

        return {
            "status": "SUCCESS",
            "plano": "PREMIUM",
            "restaurante": restaurante.nome,
            "concorrentes_analisados": len(concorrentes_proximos),
            "insights": insights
        }
