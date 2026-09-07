# C4 — Nível 3: Componentes

O C4 pede **um diagrama de componentes por contêiner**, e não um diagrama por
assunto. Cada arquivo aqui abre um contêiner do [Nível 2](../c2/c4_l2_container.md)
e mostra as peças internas dele.

| Contêiner | Stack | Diagrama |
| :--- | :--- | :--- |
| Backend Core | Node.js · TypeScript · GraphQL | [api-node.md](api-node.md) |
| MS Entregadores | .NET 10 · gRPC · EF Core | [ms-entregadores.md](ms-entregadores.md) |
| MS Roteamento | .NET 10 · gRPC | [ms-roteamento.md](ms-roteamento.md) |
| MS Recomendação | Python · FastAPI · gRPC | [ms-recomendacao.md](ms-recomendacao.md) |
| MS Notificações | Python · pika | [ms-notificacoes.md](ms-notificacoes.md) |

O **Frontend Web** não tem C3 próprio: é uma SPA de componentes React sem camadas
internas que justifiquem um diagrama — a estrutura está em `frontend-web/src/components`.

## Convenção de cores

| Cor | Tipo |
| :--- | :--- |
| Azul claro | Componente (agrupamento de código dentro do contêiner) |
| Amarelo | Porta — interface que o domínio define e a infraestrutura implementa |
| Cinza | Contêiner ou sistema externo àquele que está sendo aberto |

Portas aparecem em amarelo de propósito: são elas que sustentam a inversão de
dependência. A seta que **entra** numa porta vem da aplicação; a que **sai** dela,
tracejada, é a infraestrutura declarando que a implementa.

---
[⬅️ Nível 2: Contêineres](../c2/c4_l2_container.md) · [README](../../../README.md)
