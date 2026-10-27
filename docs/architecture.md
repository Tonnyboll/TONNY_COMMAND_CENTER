# Arquitetura inicial

O MVP segue uma separação simples para crescer sem transformar o cérebro em um monólito:

```text
HTTP / painel
      ↓
TonyCore
  ├── IntentRouter       (informal x projeto ativado)
  ├── AgentRegistry       (capacidades disponíveis)
  ├── JsonStore           (estado persistente local)
  ├── KnowledgeLayer      (padrões curados e fontes privadas)
  ├── PolicyLayer         (permissões e ações de escrita)
  └── Quality Gate         (evidência e estado de validação)
```

## Fronteira de ativação

Mensagens informais não gravam projeto, missão, contexto ou auditoria. A expressão explícita de início de projeto cria um projeto, consolida o histórico fornecido e registra a primeira missão como `PLANEJADO`.

## Limites do MVP

- O roteamento é heurístico e não chama um modelo de IA.
- O armazenamento é local em JSON.
- Nenhum sistema externo é executado.
- A API não concede permissões de escrita fora do próprio estado local.
- Solicitações de ferramentas são auditadas, mas não executadas por esta versão.
- O conhecimento público é sanitizado; o catálogo detalhado de fontes privadas fica fora do Git.
- O painel apresenta o estado local real disponível nesta instância.

Esses limites são deliberados: primeiro estabelecemos o contrato observável e testável; integrações entram depois como ferramentas submetidas a uma camada de política.
