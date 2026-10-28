# M-2026-10-27 — Varredura inicial do Git para a Knowledge Layer

- Objetivo: identificar projetos existentes, fontes de evidência e padrões que devem ser reutilizados pelo T.O.N.Y.
- Domínio e projeto: T.O.N.Y. Core / Knowledge Layer
- Estado: VALIDADO
- Fontes e permissões: conta GitHub conectada do usuário; somente leitura durante o inventário.
- Ações realizadas:
  - inventário dos repositórios acessíveis;
  - leitura de árvores de arquivos;
  - leitura de documentos, contratos, testes e arquivos de arquitetura selecionados;
  - criação de padrões curados compartilháveis;
  - criação de catálogo local sanitizado para fontes detalhadas;
  - integração da recuperação de conhecimento ao Core e ao endpoint `/api/knowledge`.
- Evidências:
  - `knowledge/curated.json` contém padrões sem código proprietário;
  - `data/knowledge/private-curated.json` contém o catálogo detalhado local e é ignorado pelo Git;
  - a API local retornou `state: ANALISADO` e recuperou uma entrada de contexto de Félix;
  - 9 testes automatizados passaram em `npm run check`.
- Resultado: o T.O.N.Y. já consegue consultar padrões curados e contexto privado local quando um projeto é ativado.
- Pendências: automatizar revarreduras incrementais e conectar cada projeto às suas ferramentas de execução.
