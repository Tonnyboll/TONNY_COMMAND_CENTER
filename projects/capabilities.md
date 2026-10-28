# Registro de capacidades e agentes — T.O.N.Y.

## Objetivo

Registrar capacidades que podem ser descobertas, avaliadas e conectadas ao T.O.N.Y. para uso em diferentes projetos e braços.

O vídeo de referência do Lab Kids inicia uma missão de descoberta. Ele não determina quais ferramentas serão adotadas.

## Modelo

- **Ferramenta:** produto, biblioteca, modelo, serviço ou repositório externo.
- **Capacidade:** o que a ferramenta permite fazer, independentemente do fornecedor.
- **Agente:** unidade de raciocínio e execução do T.O.N.Y. que usa uma ou mais capacidades.
- **Adaptador:** integração técnica entre o agente e a ferramenta ou API.
- **Rota:** projeto ou braço onde a capacidade pode ser aplicada.

Uma ferramenta não vira automaticamente um agente. Primeiro o T.O.N.Y. avalia a capacidade e só depois decide se deve criar ou conectar um agente.

## Estados

- **DESCOBERTA:** apareceu em uma referência, pedido ou pesquisa.
- **AVALIADA:** foi comparada com alternativas e possui evidências.
- **APROVADA:** atende ao caso de uso e às regras do ecossistema.
- **CONECTADA:** possui adaptador ou fluxo operacional verificado.
- **EM TESTE:** está sendo validada com um projeto real.
- **REJEITADA:** não atende aos requisitos ou apresenta risco/custo incompatível.
- **DEPRECATED:** deixou de ser recomendada, preservando o histórico.

## Fluxo de incorporação

1. Extrair o problema e a capacidade desejada da referência.
2. Procurar alternativas atuais, especialmente no GitHub quando a capacidade puder ser aberta ou auto-hospedada.
3. Comparar manutenção, releases, desempenho, qualidade, licença, requisitos de hardware, privacidade, custo e facilidade de integração.
4. Testar a alternativa com uma amostra representativa do projeto.
5. Registrar evidências, limitações e resultado.
6. Aprovar a capacidade, não apenas a ferramenta.
7. Criar ou atualizar o agente e seu adaptador no T.O.N.Y.
8. Definir rotas permitidas por projeto ou braço.
9. Integrar no repositório correspondente somente depois de validação.

## Capacidades sugeridas pelo Reel

A referência sugere investigar estas capacidades:

- geração de ideias e roteiros infantis;
- pesquisa de formatos e ganchos;
- geração de storyboard e prompts;
- geração de imagem;
- geração de imagem para vídeo;
- animação de personagens;
- edição e composição vertical;
- narração, música e efeitos;
- preparação para Shorts/Reels;
- análise de retenção e desempenho.

Essas capacidades devem ser avaliadas separadamente. Uma única ferramenta não precisa cobrir todo o pipeline.

## Roteamento entre projetos

Uma capacidade aprovada pode possuir mais de uma rota:

- `TB_LAB_KIDS` — personagens, clipes e universos infantis;
- `Félix` — desenvolvimento e tecnologia, quando aplicável;
- outros braços ou projetos, somente após avaliação específica.

O agente deve receber o contexto do projeto antes de usar a capacidade. Um agente de vídeo não pode carregar automaticamente o DNA de Melanca para uma missão do Félix, nem transportar regras de um projeto para outro.

## Caso de uso exemplo

Intenção:

> “Criar um vídeo do Melanca buscando viralização.”

O T.O.N.Y. deve:

1. identificar a capacidade necessária;
2. consultar alternativas atuais;
3. escolher agentes de conceito, narrativa, direção visual, continuidade e distribuição;
4. consultar o DNA do Melanca no TB Lab Kids;
5. encaminhar a execução ao TonnyBoll Studios;
6. testar o resultado com critérios visuais e de retenção;
7. registrar o que foi aprovado, rejeitado e ainda pendente.

Viralização é um objetivo de otimização e experimentação. Não é garantia de alcance, monetização ou aceitação da plataforma.

## Requisitos mínimos para aprovação

Uma capacidade só deve ser aprovada quando houver evidência suficiente de que:

- resolve o problema definido;
- mantém qualidade aceitável no contexto real;
- possui licença compatível com o uso pretendido;
- pode ser mantida ou substituída sem aprisionar o projeto;
- não viola identidade, direitos ou regras de segurança;
- tem custo e requisitos operacionais conhecidos;
- permite registrar versões, parâmetros e resultados;
- pode ser roteada para mais de um projeto sem misturar contextos.

## Estado inicial

O catálogo começa com capacidades em **DESCOBERTA**. Nenhuma ferramenta citada no Reel deve ser considerada aprovada ou conectada apenas por ter sido mencionada no vídeo.
