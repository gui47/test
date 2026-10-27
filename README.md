# Processador Distribuído de Transações de Apostas

Um processador distribuído de transações financeiras desenvolvido com **NestJS, TypeScript, PostgreSQL, TypeORM e AWS SQS**.

O projeto tem como objetivo processar operações financeiras de carteiras digitais, priorizando consistência dos saldos, segurança das transações, idempotência e publicação confiável de eventos.

## Visão Geral

O Processador Distribuído de Transações de Apostas disponibiliza uma API para gerenciamento de operações financeiras em um ambiente de apostas.

A aplicação foi desenvolvida para garantir que as operações sejam executadas de maneira segura, evitando inconsistências nos saldos e o processamento duplicado de transações.

## Tecnologias Utilizadas

- **Runtime:** Bun
- **Linguagem:** TypeScript
- **Framework:** NestJS
- **Banco de dados:** PostgreSQL
- **ORM:** TypeORM
- **Mensageria:** AWS SQS
- **Ambiente AWS local:** LocalStack
- **Precisão financeira:** decimal.js
- **Validação:** class-validator
- **Testes:** Bun Test
- **Containerização:** Docker

## Arquitetura

A aplicação utiliza uma arquitetura modular, separando as regras de negócio, os serviços da aplicação e os componentes de infraestrutura.

Principais componentes:

- **Módulo de Carteiras:** gerencia as operações financeiras e os saldos das carteiras.
- **Camada de Domínio:** concentra as entidades financeiras, regras de negócio e o objeto de valor Money.
- **Camada de Repositórios:** responsável pela persistência e pelo bloqueio de carteiras durante operações.
- **Ledger:** registra o histórico das transações financeiras.
- **Event Inbox:** armazena identificadores de eventos processados para evitar duplicidade.
- **Transactional Outbox:** registra eventos na mesma transação de banco de dados da operação financeira.
- **Processador Outbox:** identifica eventos pendentes e os publica no AWS SQS.
- **AWS SQS:** realiza o recebimento e a entrega assíncrona dos eventos.

## Consistência Financeira

A consistência financeira é um dos principais requisitos do projeto.

Foram implementados mecanismos para proteger a integridade das operações:

- Utilização de `decimal.js` para evitar erros de precisão em cálculos financeiros.
- Transações PostgreSQL para garantir operações atômicas.
- Bloqueio pessimista de carteiras utilizando `SELECT FOR UPDATE`.
- Restrições no banco de dados para proteger a integridade dos dados.
- Idempotência por meio de identificadores únicos de eventos.
- Registro das operações financeiras no Ledger.
- Padrão Transactional Outbox para persistir eventos junto às alterações financeiras.

## Operações Disponíveis

| Operação | Descrição |
|---|---|
| BET | Debita o valor da aposta da carteira. |
| WIN | Credita o valor de uma vitória na carteira. |
| LOSS | Registra uma perda sem realizar um novo débito no saldo. |
| REFUND | Realiza o estorno de uma aposta processada. |
| ROLLBACK | Reverte uma operação anterior compatível. |

## Endpoints da API

URL base: `http://localhost:3000/api`

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/health/live` | Verifica a disponibilidade da aplicação. |
| GET | `/wallets/:walletId/balance` | Consulta o saldo da carteira. |
| POST | `/wallets/:walletId/bets` | Processa uma aposta. |
| POST | `/wallets/:walletId/wins` | Processa uma vitória. |
| POST | `/wallets/:walletId/losses` | Registra uma perda. |
| POST | `/wallets/:walletId/refunds` | Processa um estorno. |
| POST | `/wallets/:walletId/rollbacks` | Processa uma reversão. |

### Exemplo de Requisição

`POST /api/wallets/:walletId/bets`

```json
{
  "amount": "5.00",
  "referenceId": "bet-123",
  "eventId": "event-123"
}
```

Exemplo de resposta:

```json
{
  "walletId": "wallet-uuid",
  "balance": {
    "amount": "95.00",
    "currency": "BRL"
  },
  "transactionType": "BET",
  "referenceId": "bet-123",
  "eventId": "event-123",
  "status": "PROCESSED"
}
```

## Processamento de Eventos

A aplicação utiliza o padrão **Transactional Outbox** para realizar a publicação confiável de eventos financeiros.

O fluxo de processamento funciona da seguinte maneira:

1. A API recebe uma operação financeira.
2. A aplicação valida os dados recebidos.
3. Uma transação no banco de dados bloqueia e atualiza a carteira.
4. A operação financeira é registrada no Ledger.
5. O evento é armazenado no Outbox dentro da mesma transação.
6. O processador Outbox identifica os eventos pendentes.
7. Os eventos são publicados no AWS SQS.
8. Após a publicação, os eventos são marcados como `PROCESSED`.

As falhas de publicação são registradas e possuem novas tentativas automáticas, com limite de cinco tentativas. Após atingir esse limite, o evento é marcado como `FAILED`.

## Como Executar o Projeto

### Pré-requisitos

- Bun instalado.
- Docker instalado e em execução.
- PostgreSQL.
- LocalStack.

### Instalação

Clone o repositório:

```bash
git clone <url-do-repositorio>
cd distributed-wagering-processor
```

Instale as dependências:

```bash
bun install
```

### Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=wagering
DB_PASSWORD=wagering_dev_password
DB_DATABASE=wagering_db

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
SQS_ENDPOINT=http://localhost:4566
SQS_QUEUE_URL=http://sqs.us-east-1.localhost.localstack.cloud:4566/000000000000/wagering-events
```

Configure o PostgreSQL e o LocalStack com o banco de dados e a fila SQS correspondentes.

### Executar as Migrations

```bash
bun run migration:run
```

### Iniciar a Aplicação

Modo de desenvolvimento:

```bash
bun run start:dev
```

A API estará disponível em:

`http://localhost:3000/api`

Verificação de disponibilidade:

`GET http://localhost:3000/api/health/live`

## Testes e Validação

Executar os testes automatizados:

```bash
bun test
```

Verificar os tipos TypeScript:

```bash
bun run typecheck
```

Compilar a aplicação:

```bash
bun run build
```

## Limitações Conhecidas

- Autenticação e autorização ainda não foram implementadas.
- Um consumidor de mensagens SQS ainda não foi implementado.
- A configuração de Dead Letter Queue (DLQ) não está incluída.
- A cobertura de testes automatizados de concorrência e integração pode ser ampliada.

Esses pontos estão identificados como oportunidades de evolução do projeto.

## Princípios de Desenvolvimento

O projeto prioriza:

- Consistência dos dados financeiros.
- Operações atômicas no banco de dados.
- Processamento idempotente de eventos.
- Publicação confiável de eventos assíncronos.
- Separação de responsabilidades.
- Código organizado, testável e de fácil manutenção.

---

**Processador Distribuído de Transações de Apostas**

Projeto desenvolvido como desafio técnico para a Jungle Gaming.