# C4 — Nível 1: Contexto do Sistema

Quem usa o Express Delivery e com quais sistemas de terceiros ele conversa.
O sistema aparece como uma caixa só: nada do que existe dentro dele importa
neste nível.

> **Escopo:** o sistema inteiro · **Público:** qualquer pessoa, técnica ou não

```mermaid
graph TB
    classDef person fill:#08427b,stroke:#052e56,stroke-width:2px,color:#fff;
    classDef system fill:#1168bd,stroke:#0e5aab,stroke-width:2px,color:#fff;
    classDef ext fill:#999999,stroke:#777777,stroke-width:2px,color:#fff;
    classDef legenda fill:#fff,stroke:#bbb,stroke-width:1px,color:#333;

    cliente["<b>Cliente</b><br><i>[Pessoa]</i><br>Pede comida e acompanha a entrega"]:::person
    lojista["<b>Lojista</b><br><i>[Pessoa]</i><br>Gerencia cardápio e recebe pedidos"]:::person
    entregador["<b>Entregador</b><br><i>[Pessoa]</i><br>Aceita corridas e reporta posição"]:::person

    sistema["<b>Express Delivery</b><br><i>[Sistema de Software]</i><br>Plataforma de pedidos e roteamento<br>logístico em tempo real"]:::system

    osrm["<b>OSRM</b><br><i>[Sistema Externo]</i><br>Motor de rotas sobre OpenStreetMap"]:::ext
    stripe["<b>Stripe</b><br><i>[Sistema Externo]</i><br>Processamento de pagamentos"]:::ext
    mailtrap["<b>Mailtrap</b><br><i>[Sistema Externo]</i><br>Entrega de e-mail transacional"]:::ext

    cliente -->|"Faz pedidos e rastreia<br>[HTTPS/GraphQL]"| sistema
    lojista -->|"Gerencia loja e vê insights<br>[HTTPS/GraphQL]"| sistema
    entregador -->|"Aceita corridas e envia GPS<br>[HTTPS/GraphQL]"| sistema

    sistema -->|"Consulta rotas e tempos<br>[HTTP/JSON]"| osrm
    sistema -->|"Cobra pedidos<br>[HTTPS/REST]"| stripe
    sistema -->|"Envia e-mails<br>[HTTPS/REST ou SMTP]"| mailtrap

    subgraph legenda ["Legenda"]
        direction LR
        l1["Pessoa"]:::person
        l2["Sistema em escopo"]:::system
        l3["Sistema externo"]:::ext
    end
```

## Fronteira do sistema

O OSRM roda como contêiner próprio no `compose.yml`, mas aparece aqui como
sistema externo por ser um motor de terceiros que o projeto apenas consome — a
decisão de auto-hospedá-lo é de infraestrutura, e aparece no [Nível 2](../c2/c4_l2_container.md).

---
[⬅️ README](../../../README.md) · [Nível 2: Contêineres ➡️](../c2/c4_l2_container.md)
