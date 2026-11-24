# D-2026-11-23 — Gate de arquitetura e especialistas

Fonte: [CONTEXTO_QDT.md](https://github.com/Tonnyboll/API_QDT_BOT/blob/f4590484719b1c4f182d9da6716afdae7c375b05/CONTEXTO_QDT.md), branch feature/qdt-v2-admin-painel, commit f4590484719b1c4f182d9da6716afdae7c375b05; [prazo](https://github.com/Tonnyboll/API_QDT_BOT/blob/f4590484719b1c4f182d9da6716afdae7c375b05/docs/QDT_V2_PAGAMENTO_PRAZO_2026-11-23.md). Relatório e instalação dos agentes apresentados pelo operador; auditoria estática, sem execução funcional ou verificação VM. Command Center base cdccc9c22890f053f691ad6d826263eb4bb3f6da.

| Perfil | Atual | Potencial | Estado |
|---|---:|---:|---|
| architect-review | 5,5 | 8,5 | entregue |
| performance-engineer | 5,0 | 8,0 | entregue |
| code-reviewer | 5,0 | 8,5 | entregue |
| context-manager | 5,0 | 8,5 | entregue |
| devops-troubleshooter | 5,0 | 8,5 | entregue |
| observability-engineer | 5,0 | 8,5 | entregue |
| backend-architect | — | — | gpt-5.5 incompatível |
| database-architect | — | — | gpt-5.5 incompatível |
| security-auditor | — | — | gpt-5.5 incompatível |
| test-automator | — | — | gpt-5.4-mini incompatível |

Média simples indicativa 5,1/8,4, cobertura 6/10. Quatro configurações corrigidas para herdar modelo, execução complementar não comprovada. Preservar seis pareceres somente se mesmo snapshot. Meta 9,5 não é nota alcançada.

Direção preliminar: monólito modular, SQLite único por ambiente, domínio transacional compartilhado; segurança e modelo físico ainda em avaliação. Preservar UX e superfícies 8083/8084/8085; eliminar estado fictício e duplicidades só após cobertura persistida. Testar concorrência, idempotência, Google/Meta reconciliação, backup/restauração, autorização, privacidade, readiness e trilha sanitizada. Não desligar legado sem inventário/corte. VM enxuta sem Codex, agentes ou LAB, com logs operacionais.

Aceite QDT integral: reservar, alterar, cancelar, expirar em 20 s homologação (300 s futura produção), pagamento manual, proprietário/financeiro, Google e WhatsApp. Política pura de prazo implementada, não ligada a worker/banco/rotas. Não promover main, implantar VM, migrar ou desenvolver a jornada antes de consolidar auditoria e decidir modelo. Não repetir discussão de regras funcionais já aprovadas.

Padrão geral: equipe mínima por capacidade; dez perfis no gate de arquitetura, mesmo commit, somente leitura. Relatório com evidência arquivo/linha, riscos, recomendações, impacto, esforço, benefícios, notas, média dos pareceres válidos e cobertura. Falha não tem nota; repetir faltantes, não aprovar incompleto. Registro no Command Center não equivale a execução externa. Codex local é executor do operador; adaptador central ainda pendente. Sincronizar contexto a cada marco.
