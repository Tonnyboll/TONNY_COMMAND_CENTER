# T.O.N.Y. — Central pessoal de comando

Este espaço é a fonte de contexto persistente do projeto T.O.N.Y. Conversas informais permanecem fora dele. Quando o usuário iniciar um projeto, missão ou contexto formal, o histórico relevante é consolidado e passa a seguir o fluxo descrito em `AGENTS.md`.

## Estado inicial

- **Operacional nesta conversa:** triagem de pedidos, escolha de contexto, planejamento, análise e execução com as ferramentas disponíveis na sessão.
- **Ainda não conectado:** Félix, Hunter, bot, APIs, agenda, e demais sistemas. Seu estado não deve ser presumido.
- **Ainda não implementado:** memória externa, leitura automática de repositórios por adaptador e monitoramento proativo.

## Arquivos

- `AGENTS.md`: protocolo de operação da central.
- `projects/registry.md`: catálogo de projetos e suas fontes verificadas.
- `missions/README.md`: modelo de registro de missões.
- `decisions/README.md`: modelo de decisões duráveis.

## Próximo marco

Conectar adaptadores de fonte para ler os repositórios autorizados, executar as primeiras missões reais pelo protocolo e escolher a primeira integração com base em uma necessidade concreta.

## MVP executável

O primeiro núcleo funcional já está disponível na branch de feature:

- Core com ativação explícita de projeto;
- roteamento entre conversa informal e contexto ativo;
- registro de projetos, missões, decisões e auditoria;
- Knowledge Layer com padrões curados e catálogo privado local;
- Agent Registry inicial;
- orquestração arquitetural com análise de impacto, seleção de agents e fases de missão;
- camada de política para separar solicitação, autorização e execução;
- Quality Gate verificável;
- painel local em `http://localhost:3030`.

Esta versão não executa ferramentas externas. Ela registra solicitações e deixa o estado real explícito para que as integrações sejam adicionadas com segurança.
