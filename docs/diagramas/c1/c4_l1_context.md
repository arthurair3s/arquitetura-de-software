# Nível 1: Diagrama de Contexto de Sistema (System Context Diagram)

Apresenta a visão de alto nível do ecossistema Express Delivery e como ele se integra com usuários e sistemas externos.

```mermaid
graph TD
    %% Styling
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff;
    classDef system fill:#1168bd,stroke:#0e5aab,stroke-width:2px,color:#fff;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#fff;

    %% Elements
    cliente["Cliente<br>(Utiliza o sistema para visualizar cardápios, realizar pedidos e acompanhar entregas em tempo real via interface Web)"]:::person
    entregador["Entregador<br>(Utiliza a interface web dedicada para gerenciar disponibilidade, aceitar corridas, atualizar localização e controlar o status das entregas)"]:::person
    lojista["Lojista (Restaurante)<br>(Gerencia cardápios, produtos, recebe pedidos e acompanha insights competitivos da loja via painel web)"]:::person

    express_delivery["Sistema Express Delivery<br>(Permite que clientes peçam comida de restaurantes parceiros, que entregadores gerenciem suas corridas via painel próprio e fornece rastreamento logístico em tempo real com distribuição inteligente de motoristas)"]:::system

    osrm_server["Servidor de Roteamento (OSRM)<br>(Sistema Externo)<br>(Resolve caminhos geométricos, distâncias físicas e tempos de viagem ótimos com base nos mapas reais OpenStreetMap)"]:::ext
    stripe["Gateway de Pagamento (Stripe)<br>(Sistema Externo)<br>(Processa transações de cartão de crédito e PIX, gerencia cobranças e estornos de forma segura)"]:::ext
    mailtrap["Servidor de E-mail (Mailtrap)<br>(Sistema Externo)<br>(Dispara notificações eletrônicas de pedidos e status via API HTTP REST — sem dependência de portas SMTP bloqueadas em produção)"]:::ext

    %% Relationships
    cliente -->|"Visualiza cardápios, faz pedidos e acompanha entregas em tempo real (HTTPS/GraphQL)"| express_delivery
    entregador -->|"Gerencia disponibilidade, aceita corridas, atualiza localização e status (HTTPS/GraphQL via Painel Web)"| express_delivery
    lojista -->|"Gerencia estabelecimentos, cardápios e visualiza insights competitivos (HTTPS/GraphQL)"| express_delivery
    express_delivery -->|"Consulta rotas ideais e estimativas de trajeto (HTTP/JSON)"| osrm_server
    express_delivery -->|"Processa cobranças e pagamentos de pedidos (HTTPS/REST API)"| stripe
    express_delivery -->|"Dispara e-mails transacionais de notificação (HTTPS/REST API — Mailtrap HTTP API)"| mailtrap
```

---
[⬅️ Voltar para o README](../../../README.md)
