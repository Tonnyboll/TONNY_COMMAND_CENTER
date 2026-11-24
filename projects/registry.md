# Registro de projetos

Projetos e fontes canônicas verificadas do ecossistema T.O.N.Y.

| Projeto | Domínio | Fonte verificada | Papel / estado |
| --- | --- | --- | --- |
| TONNY_COMMAND_CENTER | Orquestração | `Tonnyboll/TONNY_COMMAND_CENTER` | Cérebro, memória persistente e coordenador de agents |
| Félix | Tecnologia | Catálogo curado local | Contexto arquitetural e de domínio indexado; adaptador de código pendente |
| TONY Hunter | Financeiro / mercado | Catálogo curado local | Contexto de pesquisa somente leitura indexado; adaptador de código pendente |
| QDT V2 (Quintal do Tuta / Bot de WhatsApp) | Tecnologia / operações | `Tonnyboll/API_QDT_BOT` | Fonte verificada; V2 Python/FastAPI, SAC real comprovado e portal compartilhado em leitura; negócio persistido pendente, arquitetura em auditoria |
| TonnyBoll Studios | Criativo — braço do TONNY_COMMAND_CENTER | `Tonnyboll/TonnyBoll_Studios` | API/plataforma criativa versionável; abriga TB Lab Kids e TB Lab Stories |

## Modelo de resolução

O usuário fornece a intenção ao cérebro. O T.O.N.Y. recupera contexto, seleciona agents e estrutura a missão. O TonnyBoll Studios recebe essa missão como plataforma criativa, e o laboratório ou projeto correspondente executa o trabalho de domínio.

Para o TB Lab Kids:

`TONNY_COMMAND_CENTER → agents → TonnyBoll_Studios → TB_LAB_KIDS → universo/personagem → episódio/clipe`

Exemplo de objetivo:

`“Criar um vídeo do Melanca buscando viralização”`

O objetivo deve ser convertido em um plano de conceito, roteiro, takes, prompts, validação e distribuição. Viralização é alvo de otimização e teste, não garantia de resultado.

Adicionar novas fontes, APIs e responsáveis somente após verificação. Contextos pessoal, familiar, saúde e financeiro devem permanecer separados e com acesso mínimo necessário.

## QDT V2 — recuperação VIGENTE (23/11/2026)

- Frente oficial exclusiva: `feature/qdt-v2-admin-painel`. Fonte: [CONTEXTO_QDT.md em f459048](https://github.com/Tonnyboll/API_QDT_BOT/blob/f4590484719b1c4f182d9da6716afdae7c375b05/CONTEXTO_QDT.md). Verificar HEAD antes de atuar. A referência antiga abaixo é histórica.
- TESTES REAIS QDT: receptor 8083, LAB privado 8084, portal cliente 8085 (mesma aplicação cliente), supervisor qdt.ps1. SAC real comprovado. Reserva, alteração, cancelamento, pagamento e financeiro ainda precisam integração persistida. Prazo: 20 s homologação, 5 min futura produção; domínio implementado, worker/rotas/banco pendentes.
- Auditoria estática 6/10, notas indicativas 5,1 atual e 8,4 potencial. Quatro perfis falharam por modelo incompatível; operador corrigiu configuração, reexecução sem evidência ainda. Arquitetura em avaliação, monólito modular + SQLite único por ambiente como direção preliminar. Aceite somente integrado, sem dados fictícios. Não modificar main/VM/banco QDT durante auditoria.
- [Decisão e estado da auditoria](../decisions/D-2026-11-23-QDT-audit.md). Executor externo do Command Center ainda não conectado.

## QDT V2 — checkpoint histórico (19/11/2026; superado acima)

- Alias: QDT, Quintal do Tuta, API_QDT_BOT e Bot de WhatsApp no contexto QDT. Esta identificação substitui o estado anterior de fonte operacional pendente; não atribuir outros bots ao QDT por inferência.
- Main é referência integrada; frente operacional `feature/qdt-v2-fase0-integracoes`; checkpoint inspecionado em [0ddc5ed](https://github.com/Tonnyboll/API_QDT_BOT/blob/0ddc5ed75de40ce86c7acf9bd86503ab270e9fcd/docs/QDT_V2_ESTADO_ATUAL_HANDOFF_2026-11-18.md). Consultar o HEAD atual autorizado antes de execução; conteúdo indexado não é consulta ao Git em tempo real.
- Sequência: Command Center/AGENTS.md → registry → knowledge/curated.json → [handoff vigente](https://github.com/Tonnyboll/API_QDT_BOT/blob/feature/qdt-v2-fase0-integracoes/docs/QDT_V2_ESTADO_ATUAL_HANDOFF_2026-11-18.md) → escopo/README/contratos/testes do projeto.
- O catálogo identifica o projeto e recupera conhecimento no runtime; integração automática de ferramentas externas do Command Center ainda não existe. Nunca copiar credenciais, IDs de clientes, payloads, contatos ou dados operacionais brutos.
- Registro durável: [D-2026-11-19-QDT](../decisions/D-2026-11-19-QDT.md); missão de sincronização: [M-2026-11-19-QDT](../missions/M-2026-11-19-QDT.md). Capacidades: [catálogo](capabilities.md).
