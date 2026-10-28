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


## Pesquisa GitHub — produção quase automática de vídeo

**Data da pesquisa:** 2026-10-28  
**Rota inicial:** \`TB_LAB_KIDS\`  
**Regra:** estes projetos são candidatos de capacidade; nenhum está aprovado ou conectado apenas por aparecer nesta lista.

### Shortlist técnica

| Capacidade | Projeto principal | Papel no T.O.N.Y. | Estado | Observação |
|---|---|---|---|---|
| Orquestração visual por workflows | [ComfyUI](https://github.com/Comfy-Org/ComfyUI) | \`comfyui_workflow_runner\` | AVALIADA | Grafo de nós, API local, workflows reutilizáveis e suporte a imagem, vídeo e áudio. É o melhor candidato a backbone de execução, não um agente de decisão. Licença GPL-3.0. |
| Geração de vídeo e imagem-para-vídeo | [Wan2.2](https://github.com/Wan-Video/Wan2.2) | \`wan_video_generation\` | AVALIADA | Modelo oficial com T2V/I2V, 720p/24fps no modelo 5B e foco em movimento e estética. Candidato principal para o primeiro benchmark do Kids. Licença Apache-2.0. |
| Edição e transformação generativa | [VACE](https://github.com/ali-vilab/VACE) | \`vace_video_editing\` | AVALIADA | Cobre referência-para-vídeo, vídeo-para-vídeo e edição mascarada; pode atender troca, animação, expansão e manutenção de referência. Licença Apache-2.0. |
| Transcrição, timestamps e falantes | [WhisperX](https://github.com/m-bain/whisperX) | \`whisperx_transcription\` | AVALIADA | Timestamps por palavra, diarização e VAD; base para legendas, cortes orientados por fala e sincronização. Licença BSD-2-Clause. |
| Corte automático | [Auto-Editor](https://github.com/WyattBlue/auto-editor) | \`auto_editor_cutting\` | AVALIADA | Remove silêncio e pode combinar áudio, movimento e velocidade; exporta sequência/clips e formatos de editores. Licença Unlicense. |
| Detecção de cenas | [PySceneDetect](https://github.com/Breakthrough/PySceneDetect) | \`scene_detection\` | AVALIADA | Detecta cortes/transições, gera lista de cenas e divide o vídeo via FFmpeg. Licença BSD-3-Clause. |
| Montagem e render determinístico | [Remotion](https://github.com/remotion-dev/remotion) | \`remotion_rendering\` | AVALIADA | React como fonte de verdade, composição programática, legendas e renderização em lote. Requer revisão da licença especial antes de uso comercial. |
| Codec, mux e exportação | [FFmpeg](https://github.com/FFmpeg/FFmpeg) | \`ffmpeg_media\` | AVALIADA | Camada operacional de transcodificação, concatenação, áudio e exportação; deve ficar atrás de um adaptador estável. Validar a licença conforme o build usado. |

### Camadas de edição assistida por agente

- [OpenChatCut](https://github.com/0xsline/OpenChatCut) é o candidato mais alinhado para uma estação de revisão: editor local, timeline multifaixa, MCP, agente e renderização Remotion. Estado: **EM TESTE**, por usar AGPL-3.0 e ainda estar em desenvolvimento ativo.
- [WeftCut](https://github.com/WeftCut/WeftCut) é uma alternativa promissora para o agente operar um NLE real via MCP. A licença é MIT, mas o próprio projeto informa que ainda está antes da versão 1.0. Estado: **EM TESTE**.
- [OpenCut](https://github.com/OpenCut-app/OpenCut) tem grande comunidade e licença MIT, porém a versão atual está sendo reescrita; API de editor, MCP e modo headless aparecem como próximos recursos. Não entra no primeiro piloto.

### Alternativas de geração que permanecem no radar

- [LTX-2](https://github.com/Lightricks/LTX-2): áudio e vídeo sincronizados, I2V, extensões e pipeline oficial; exige hardware/armazenamento relevantes e revisão de licença/modelos. Estado: **DESCOBERTA**.
- [HunyuanVideo-I2V](https://github.com/Tencent-Hunyuan/HunyuanVideo-I2V): alternativa oficial de image-to-video com LoRA, útil para benchmark de consistência; estado **DESCOBERTA** e licença ainda precisa ser confirmada para o uso pretendido.
- [CogVideo](https://github.com/zai-org/CogVideo): permanece como referência aberta, mas a atividade observada é menos recente que Wan2.2 e LTX-2. Estado: **DEPRECATED para o primeiro piloto**, sem apagar o registro histórico.

### Arquitetura de agentes e adaptadores

O primeiro fluxo do \`TB_LAB_KIDS\` deve ser:

\`ideia -> roteiro -> shot list -> DNA/segurança -> workflow ComfyUI -> geração Wan2.2/VACE -> transcrição WhisperX -> cortes Auto-Editor/PySceneDetect -> composição Remotion/FFmpeg -> QA -> revisão humana -> publicação\`

O T.O.N.Y. deve criar agentes por função, e não por ferramenta:

- \`kids_story_planner\`: transforma a ideia em roteiro, cenas, duração e objetivos de retenção;
- \`kids_visual_dna_guard\`: aplica personagem, paleta, estilo, continuidade e regras infantis;
- \`video_generation_router\`: escolhe Wan2.2, VACE ou outra capacidade aprovada conforme o tipo de take;
- \`clip_editor\`: escolhe cortes por silêncio, fala, cena e ritmo;
- \`shorts_packager\`: gera proporção, legendas, título, descrição e variantes;
- \`video_qa_gate\`: verifica duração, proporção, áudio, legenda, continuidade, falhas visuais e conteúdo inadequado.

Os adaptadores devem ser substituíveis. O T.O.N.Y. decide a rota e registra modelo, versão, parâmetros, workflow, artefatos e resultado; o TonnyBoll Studios executa a capacidade; o \`TB_LAB_KIDS\` fornece o DNA e recebe o episódio.

### Critérios do primeiro benchmark

Usar o mesmo episódio curto e medir:

1. consistência da Melanca entre takes;
2. tempo e custo por take aprovado;
3. qualidade do corte automático;
4. precisão das legendas por palavra;
5. taxa de retrabalho humano;
6. estabilidade do render vertical;
7. licença e possibilidade de uso nos braços Kids e Félix sem misturar contextos.

Até esse benchmark, os projetos ficam registrados como **AVALIADA** ou **EM TESTE**; nenhum deve ser marcado como **CONECTADA**.
