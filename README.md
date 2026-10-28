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


## Planejamento seguro de vídeo Kids

O primeiro planejador executável do pipeline está em `src/core/video-job.js`.

- `GET /api/video-jobs/kids/take-01` gera o plano do Take 01;
- `POST /api/video-jobs/plan` valida e gera um plano a partir de um manifesto;
- o planejamento não inicia GPU, não chama ferramentas externas e não publica arquivos;
- o limite do TB Lab Kids é de 120 segundos;
- refs reais de frames e música precisam ser vinculados antes da execução;
- a saída passa por QA e aprovação humana antes da entrega.

O planejador registra os agentes Kids no registry e mantém os adaptadores substituíveis. A execução pesada continua deliberadamente fora do núcleo até que exista um worker aprovado.
