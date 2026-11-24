# Registro de projetos

Projetos e fontes canônicas verificadas do ecossistema T.O.N.Y.

| Projeto | Domínio | Fonte verificada | Papel / estado |
| --- | --- | --- | --- |
| TONNY_COMMAND_CENTER | Orquestração | `Tonnyboll/TONNY_COMMAND_CENTER` | Cérebro, memória persistente e coordenador de agents |
| Félix | Tecnologia | Catálogo curado local | Contexto arquitetural e de domínio indexado; adaptador de código pendente |
| TONY Hunter | Financeiro / mercado | Catálogo curado local | Contexto de pesquisa somente leitura indexado; adaptador de código pendente |
| QDT V2 (Quintal do Tuta / Bot de WhatsApp) | Tecnologia / operações | `Tonnyboll/API_QDT_BOT` | Fonte verificada; separação 4 portas em implementação, 8086 leitura DEV integrada no código; sonda e teste integrado pendentes |
| TonnyBoll Studios | Criativo — braço do TONNY_COMMAND_CENTER | `Tonnyboll/TonnyBoll_Studios` | API/plataforma criativa versionável; abriga TB Lab Kids e TB Lab Stories |

## Modelo de resolução

O usuário fornece a intenção ao cérebro. O T.O.N.Y. recupera contexto, seleciona agents e estrutura a missão. O TonnyBoll Studios recebe essa missão como plataforma criativa, e o laboratório ou projeto correspondente executa o trabalho de domínio.

Para o TB Lab Kids:

`TONNY_COMMAND_CENTER → agents → TonnyBoll_Studios → TB_LAB_KIDS → universo/personagem → episódio/clipe`

Exemplo de objetivo:

`“Criar um vídeo do Melanca buscando viralização”`

O objetivo deve ser convertido em um plano de conceito, roteiro, takes, prompts, validação e distribuição. Viralização é alvo de otimização e teste, não garantia de resultado.

Adicionar novas fontes, APIs e responsáveis somente após verificação. Contextos pessoal, familiar, saúde e financeiro devem permanecer separados e com acesso mínimo necessário.

## QDT V2 — recuperação VIGENTE (24/11/2026)

QDT V2: 8083 transporte Meta; 8084 LAB/sonda de arquitetura, dados, integridade e resiliência; 8085 cliente; 8086 proprietário. Uma fonte de verdade por ambiente, sem duplicar regras; LAB não é dependência operacional nem rota pública. 8086 reutiliza interface e read model do LAB, leitura DEV protegida, integrada ao supervisor no código; execução local ainda pendente. Cobertura integral da sonda NÃO comprovada. Ordem obrigatória: completar separação e sonda → testar quatro portas e invariantes, falhas/reconciliação → só após aceite, nova auditoria Codex 10 agentes mesmo SHA → corrigir, validar e consolidar lições. Meta 9,5 é objetivo. CI local-first; uv piloto, lock local ainda não versionado; não generalizar antes da homologação. OTP template pendente. Sem deploy/main QDT/VM.

- Fonte canônica: [CONTEXTO_QDT.md](https://github.com/Tonnyboll/API_QDT_BOT/blob/635b80825a584326cb3065643cdcd7cd3b03a400/CONTEXTO_QDT.md), [handoff](https://github.com/Tonnyboll/API_QDT_BOT/blob/635b80825a584326cb3065643cdcd7cd3b03a400/docs/QDT_V2_HANDOFF_SONDA_2026-11-24.md) e [contrato de aceite](https://github.com/Tonnyboll/API_QDT_BOT/blob/635b80825a584326cb3065643cdcd7cd3b03a400/docs/QDT_V2_LAB_INTEGRIDADE_RESILIENCIA_2026-11-24.md). Branch exclusiva de trabalho: `feature/qdt-v2-admin-painel`; verificar HEAD antes de executar.
- [Decisão](../decisions/D-2026-11-24-QDT-sonda.md) e [missão](../missions/M-2026-11-24-QDT-sonda-integridade.md). Histórico abaixo não substitui o checkpoint vigente.

## QDT V2 — checkpoint anterior (histórico; superado acima)

**Marco de engenharia delegado pelo proprietário:** [checkpoint c654aa2](https://github.com/Tonnyboll/API_QDT_BOT/blob/c654aa24b0d0b0a74d57f27f451d282d10352af2/CONTEXTO_QDT.md), [modelo e gate](https://github.com/Tonnyboll/API_QDT_BOT/blob/c654aa24b0d0b0a74d57f27f451d282d10352af2/docs/QDT_V2_EVOLUCAO_95_2026-11-23.md). Direção monólito modular e banco único aprovada para desenvolvimento. Migration explícita e núcleo transacional versionados (hold multi-dia, pagamento, caixa, outbox, expiração e confirmação verificada), sem migração operacional. Oito testes novos, CI bloqueado sem evidência de execução. Autenticação externa, API/UI, worker, alteração/cancelamento, financeiro integral e homologação ainda pendentes. Sem solicitação de aceite fragmentado. As referências abaixo preservam o checkpoint da auditoria.

- Frente oficial exclusiva: `feature/qdt-v2-admin-painel`. Fonte: [CONTEXTO_QDT.md em f459048](https://github.com/Tonnyboll/API_QDT_BOT/blob/f4590484719b1c4f182d9da6716afdae7c375b05/CONTEXTO_QDT.md). Verificar HEAD antes de atuar. A referência antiga abaixo é histórica.
- TESTES REAIS QDT: receptor 8083, LAB privado 8084, portal cliente 8085 (mesma aplicação cliente), supervisor qdt.ps1. SAC real comprovado. Reserva, alteração, cancelamento, pagamento e financeiro ainda precisam integração persistida. Prazo: 20 s homologação, 5 min futura produção; domínio implementado, worker/rotas/banco pendentes.
- Auditoria estática: 10/10 pareceres recebidos após correção dos modelos; média simples 4,75 atual e 8,40 potencial. Mesmo SHA entre rodadas ainda a confirmar; sem testes ou validação operacional. Modelo físico e arquitetura ainda sujeitos à decisão do proprietário. Arquitetura em avaliação, monólito modular + SQLite único por ambiente como direção preliminar. Aceite somente integrado, sem dados fictícios. Não modificar main/VM/banco QDT durante auditoria.
- [Decisão e estado da auditoria](../decisions/D-2026-11-23-QDT-audit.md). Executor externo do Command Center ainda não conectado.

## QDT V2 — checkpoint histórico (19/11/2026; superado acima)

- Alias: QDT, Quintal do Tuta, API_QDT_BOT e Bot de WhatsApp no contexto QDT. Esta identificação substitui o estado anterior de fonte operacional pendente; não atribuir outros bots ao QDT por inferência.
- Main é referência integrada; frente operacional `feature/qdt-v2-fase0-integracoes`; checkpoint inspecionado em [0ddc5ed](https://github.com/Tonnyboll/API_QDT_BOT/blob/0ddc5ed75de40ce86c7acf9bd86503ab270e9fcd/docs/QDT_V2_ESTADO_ATUAL_HANDOFF_2026-11-18.md). Consultar o HEAD atual autorizado antes de execução; conteúdo indexado não é consulta ao Git em tempo real.
- Sequência: Command Center/AGENTS.md → registry → knowledge/curated.json → [handoff vigente](https://github.com/Tonnyboll/API_QDT_BOT/blob/feature/qdt-v2-fase0-integracoes/docs/QDT_V2_ESTADO_ATUAL_HANDOFF_2026-11-18.md) → escopo/README/contratos/testes do projeto.
- O catálogo identifica o projeto e recupera conhecimento no runtime; integração automática de ferramentas externas do Command Center ainda não existe. Nunca copiar credenciais, IDs de clientes, payloads, contatos ou dados operacionais brutos.
- Registro durável: [D-2026-11-19-QDT](../decisions/D-2026-11-19-QDT.md); missão de sincronização: [M-2026-11-19-QDT](../missions/M-2026-11-19-QDT.md). Capacidades: [catálogo](capabilities.md).

## Regra transversal de entrega (24/11/2026)

Aplicar [CI local-first](../decisions/D-2026-11-24-CI-local-first.md) em todos os projetos tecnológicos enquanto o GitHub Actions estiver bloqueado. Versionamento normal, testes locais comprovados, gates preservados e nenhum gasto adicional sem autorização. QDT: `git pull` + `.\qdt.ps1 -Testar`. Retomada do CI hospedado somente após regularização e autorização.
