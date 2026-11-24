# D-2026-11-24 — CI local-first durante bloqueio de faturamento

- Data: 24/11/2026.
- Projeto / domínio: política transversal de engenharia do TONNY_COMMAND_CENTER.
- Estado: ATIVA (contingência; somente o usuário autoriza a retomada de gastos).
- Decisão: usar GitHub para versionamento e validação local equivalente à suíte automatizada enquanto GitHub Actions hospedado estiver indisponível. Sem gastos adicionais e sem diminuição dos gates de qualidade.
- Motivo: usuário optou por não regularizar o cartão agora e continuar o desenvolvimento.
- Evidência: execução QDT [45389158783](https://github.com/Tonnyboll/API_QDT_BOT/actions/runs/45389158783), commit e6e5cb6: runner-probe, unit e browser falharam antes da execução. Operador confirmou anotação de faturamento/limite e orçamento adicional Actions bloqueado. Não inferir dívida ou causa específica entre cobrança e franquia esgotada.
- Impacto: todos os projetos tecnológicos; QDT usa `git pull` + `.\qdt.ps1 -Testar`. Demais projetos usam suas suítes oficiais. Registrar SHA, comandos, ambiente, resultados e evidências de segurança/integração. Sem executor local, solicitar execução ao operador; sem evidência, não marcar como validado. Não contornar proteções de branch, nem promover produção sem gate e autorização.
- Retomada: após regularização informada pelo usuário, revalidar runner-probe e suíte; otimizar frequência de CI em marcos/PRs/main. Não aumentar orçamento ou alterar workflows de outros repositórios sem autorização.
- Escopo deste registro: protocolo e conhecimento recuperável; não altera faturamento, triggers, configurações GitHub ou código dos projetos.
