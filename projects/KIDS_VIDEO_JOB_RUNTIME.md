# Engenheiro de Vídeo Kids — runtime de timeframes

Esta capacidade do T.O.N.Y. transforma roteiro e letra em um plano visual pronto para produção com Kling e montagem no DaVinci Resolve.

## Escopo

O agente não gera música, não chama geradores de áudio e não renderiza o vídeo final sozinho. Ele:

- interpreta o briefing como uma demonstração infantil, não como uma história longa;
- divide o episódio em no máximo 10 microcenas/timeframes;
- descreve ação, personagem, objeto, enquadramento e asset necessário;
- inspeciona o frame inicial e o frame final de cada take;
- cria o gancho de saída e a condição de entrada do próximo take;
- planeja repetições, cortes e transições;
- valida continuidade visual e cobertura do roteiro;
- exporta um manifesto de timeline para o DaVinci.

A trilha sonora é escolhida e gerada fora do T.O.N.Y. (por exemplo, Suno ou processo manual) e entra depois como asset externo da montagem.

## Registro de DNA visual

O DNA é um recurso de primeira classe do job, não um texto solto dentro do prompt. Cada personagem deve estar registrado em `dna_registry` com:

- `dna_ref`: documento canônico versionado;
- `reference_pack`: imagens aprovadas para identidade e estilo;
- `immutable_fields`: silhueta, rosto, proporções, cores, roupas e marcas que não podem variar;
- `variant_fields`: pose, expressão, olhar, câmera e interação que podem variar;
- `conditioning_plan`: métodos que o provider pode usar para preservar referência e estrutura.

O plano padrão usa IP-Adapter para referência visual e ControlNet para pose/composição quando o provider suportar. InstantID/PuLID ficam como adaptadores opcionais para identidades faciais humanas; LoRA só entra depois de um conjunto aprovado de imagens. Nenhum desses componentes substitui o DNA canônico ou a aprovação humana.

## Contrato de continuidade

Cada take deve informar:

- start_frame_ref: referência do frame ou estado inicial;
- end_frame_ref: referência do frame ou estado final;
- outgoing_hook: o que o final deixa preparado;
- incoming_match: como o take seguinte deve começar;
- action_chain: sequência visual observável;
- final_motion_state: movimento ou pose que deve ser preservado.

A regra central é:

final do Take N = gancho visual para o início do Take N+1.

O agente deve bloquear ou sinalizar a sequência quando os estados não casarem. O DaVinci receberá marcadores de entrada, saída e gancho para facilitar a montagem de um vídeo único.

## Contrato de timeframes

O planejador usa o contrato tony.video-job.v2 e retorna:

- video_plan.timeframes;
- video_plan.transition_plan;
- video_plan.davinci_timeline;
- visual_engineering.continuity;
- estados de asset e pendências;
- portões de QA e aprovação humana.

Cada timeframe deve ter, no mínimo:

- timeframe_id;
- start_seconds;
- end_seconds;
- action;
- characters;
- object;
- asset_status;
- transition_out.

O v1 aceita até 10 timeframes por bloco visual e duração máxima de 120 segundos.

## Fluxo

1. context-guard valida o escopo do episódio.
2. kids-story-planner converte o briefing em microações demonstráveis.
3. kids-visual-dna-guard valida personagens e cenário.
4. timeframe-engineer cria os blocos de tempo.
5. take-continuity-agent compara entradas, saídas e ganchos entre takes.
6. video-generation-router prepara os pedidos para Kling.
7. transition-engineer define cortes, match-cuts, wipes, zooms e repetições.
8. davinci-timeline-agent exporta marcadores e ordem de montagem.
9. video-qa-gate verifica duração, cobertura, continuidade e arquivos.
10. delivery-agent entrega o pacote para revisão humana.

## Saídas para o DaVinci

A primeira versão exporta uma timeline lógica com:

- nome da timeline;
- FPS e resolução;
- ordem dos clips;
- entradas e saídas;
- marcadores de timeframe;
- marcadores de handoff entre takes;
- transição sugerida;
- slot reservado para trilha externa;
- pendências de assets.

Formatos planejados: CSV de marcadores, EDL e XML conforme o adapter do DaVinci.

## Limites

PLANNED não significa que o vídeo existe. Significa que o plano visual foi validado. Geração via Kling, edição no DaVinci e aprovação humana continuam sendo etapas separadas.

A ausência de um asset ou de um frame de continuidade deve aparecer como pendência explícita; o agente não deve inventar que uma cena foi produzida.
