# Runtime do job de vídeo Kids

Este documento descreve a primeira capacidade executável do T.O.N.Y. para o TB Lab Kids.

## O que já está pronto

- contrato de job `tony.job.v1`;
- planejador puro e token-aware em `src/core/video-job.js`;
- registry dos agentes de produção Kids;
- endpoint de planejamento do Take 01;
- validação do limite de 120 segundos;
- estado explícito de GPU e bloqueio de auto-start;
- QA e aprovação humana como portões obrigatórios.

## O que o planejador não faz

O planejador não baixa modelos, não abre ComfyUI, não chama Wan/VACE, não gera música, não grava no Drive e não publica nada. Ele gera um plano compacto para um worker autorizado.

## Contrato dos adaptadores

Cada adapter futuro deve expor:

1. `plan(input_ref)`;
2. `execute(plan_ref)`;
3. `validate(artifact_ref)`;
4. `materialize(manifest_ref)`.

A camada de agente escolhe a capacidade; o adapter executa a ferramenta. Nenhuma ferramenta específica pode virar o cérebro do T.O.N.Y.

## Primeira chamada

```http
GET /api/video-jobs/kids/take-01
```

A resposta é `PLANNED` quando o contrato está válido. O próximo passo é substituir os refs convencionais do Drive pelos IDs/caminhos reais dos dois frames aprovados e do arquivo de música.

## Estados

`PLANNED` não significa que o vídeo existe. Significa que o job foi validado e está pronto para vinculação de assets e revisão de recurso. A animação só pode entrar em `RUNNING` após o worker e a autorização do plano existirem.
