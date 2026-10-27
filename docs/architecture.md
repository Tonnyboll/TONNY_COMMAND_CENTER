# Arquitetura inicial

O MVP segue uma separação simples para crescer sem transformar o cérebro em um monólito:

```text
HTTP / painel
      ↓
TonyCore
  ├── IntentRouter       (informal x projeto ativado)
  ├── MissionOrchestrator (contexto, impacto, agents e fases)
  ├── AgentRegistry       (capacidades disponíveis)
  ├── JsonStore           (estado persistente local)
  ├── KnowledgeLayer      (padrões curados e fontes privadas)
  ├── PolicyLayer         (permissões e ações de escrita)
  └── Quality Gate         (evidência e estado de validação)
```

## Orquestração arquitetural

Quando um projeto ou uma missão é ativado, o TONY monta um plano a partir do pedido, do contexto persistido e do conhecimento curado. O plano registra:

- áreas afetadas e nível de risco;
- evidências e fontes recuperadas;
- agents escolhidos por capacidade e motivo, com possibilidade de substituir ou adicionar perfis no registro;
- fases de diagnóstico, revisão, implementação e validação;
- premissas e bloqueios reais.

O `MissionOrchestrator` não executa uma mudança por inferência. Ele prepara a missão e deixa a política, as ferramentas e o quality gate controlarem as ações seguintes. A seleção de agents é específica ao impacto identificado: arquitetura é a entrada padrão; API, segurança, pesquisa, implementação e QA entram quando o contexto exige.

## Fronteira de ativação

Mensagens informais não gravam projeto, missão, contexto ou auditoria. A expressão explícita de início de projeto cria um projeto, consolida o histórico fornecido e registra a primeira missão como `PLANEJADO`.

## Limites atuais

- O roteamento e a seleção inicial de agents são heurísticos e não chamam um modelo de IA.
- O armazenamento é local em JSON.
- Nenhum sistema externo é executado.
- A API não concede permissões de escrita fora do próprio estado local.
- Solicitações de ferramentas são auditadas, mas não executadas por esta versão.
- A leitura automática do código de um repositório ainda precisa ser conectada por um adaptador de fonte; o orquestrador usa o contexto curado e o histórico fornecido.
- O conhecimento público é sanitizado; o catálogo detalhado de fontes privadas fica fora do Git.
- O painel apresenta o estado local real disponível nesta instância.

Esses limites são deliberados: primeiro estabelecemos o contrato observável e testável; integrações entram depois como ferramentas submetidas a uma camada de política.
