# M-2026-10-27-architectural-orchestration — Transformar o TONY em orquestrador arquitetural

- Objetivo: fazer o TONY recuperar contexto, calcular impacto, selecionar agents e montar fases de missão antes da execução.
- Domínio e projeto: T.O.N.Y. / orquestração de software.
- Estado: VALIDADO
- Fontes e permissões: código local da central, `KnowledgeLayer`, `AgentRegistry`, testes existentes e catálogo curado.
- Ações realizadas: criado `MissionOrchestrator`; adicionados planos de impacto, agents, fases, evidências, premissas e bloqueios; integrado o plano às ativações e missões; atualizado painel e documentação.
- Evidências: `npm run check` com 11 testes aprovados.
- Resultado: ativações e alterações em projetos passam a retornar uma missão arquitetada, com seleção de agents proporcional ao contexto identificado.
- Pendências: conectar adaptadores de leitura dos repositórios e execução real de ferramentas externas.
