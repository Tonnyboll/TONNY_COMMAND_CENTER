# D-2026-10-27-agent-orchestration — O TONY orquestra agents a partir de contexto

- Data: 2026-10-27
- Projeto / domínio: T.O.N.Y. / arquitetura e execução agentic
- Decisão: o TONY deve atuar como arquiteto e orquestrador. O pedido do usuário ativa a leitura do contexto persistido, a análise de impacto e a seleção dos agents necessários; perguntas ficam restritas a ambiguidades bloqueadoras.
- Motivo: preservar a intenção de que cada projeto/API mantenha seu próprio contexto e que esse conhecimento seja reutilizado em alterações futuras.
- Evidência: `src/core/orchestrator.js`, `src/core/tony.js`, `test/tony.test.mjs` e `docs/architecture.md`.
- Impacto: missões passam a registrar agents, fases, áreas afetadas, risco, evidências, premissas e bloqueios antes de qualquer execução externa.
- Estado: ATIVA
- Substituída por:
