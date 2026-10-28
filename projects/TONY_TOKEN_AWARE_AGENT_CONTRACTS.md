# Contratos token-aware dos agentes — T.O.N.Y.

**Versão:** 1.0  
**Escopo:** cérebro T.O.N.Y. → Tonnyboll Studios → módulos de projeto

## Decisão de arquitetura

O T.O.N.Y. decide, preserva contexto e valida. O Tonnyboll Studios executa capacidades por adaptadores. O módulo de destino fornece DNA, regras e ativos aprovados. Nenhum aplicativo externo vira o cérebro inteiro: cada projeto é conectado pela capacidade que realmente precisa.

Este contrato existe para reduzir custo de tokens, evitar mistura de universos e permitir trocar ferramentas sem reescrever os agentes.

## Modo token-aware

- O LLM recebe referências, metadados, thumbnails e resumos; não recebe o vídeo bruto a cada etapa.
- DNA, regras, prompts aprovados, parâmetros e resultados vivem em manifests versionados; o job carrega apenas `ref` e `hash`.
- Tarefas determinísticas ficam fora do LLM: concatenação, codec, mux, detecção de cena, waveform, timestamps, normalização e render.
- O agente é chamado por decisão, exceção ou validação ambígua; não existe um agente por frame.
- Cada etapa retorna JSON curto e artefatos referenciados. O próximo agente não repete o histórico inteiro.
- O cache é válido quando `input_hash`, versão do agente, versão do adaptador e parâmetros não mudaram.
- GPU é tratada como recurso separado de tokens. Se não houver recurso local, o job fica `WAITING_GPU`; não improvisa nem trava o computador.

## Envelope de entrada

```json
{
  "schema_version": "tony.job.v1",
  "job_id": "kids-001-pilot-0001",
  "route": "TB_LAB_KIDS",
  "intent": "produzir_video_infantil",
  "brief_ref": "drive://.../brief.json",
  "asset_refs": ["drive://.../melanca-approved.png", "drive://.../verdinho-approved.png"],
  "dna_ref": "github://.../TB_LAB_KIDS/.../DNA_PERSONAGEM.md@sha",
  "music_ref": "drive://.../music-master.wav",
  "duration_limit_seconds": 120,
  "quality_profile": "kids_pilot_v1",
  "resource_policy": {"gpu": "local_then_cloud", "max_minutes": 30},
  "approval": {"human_required": true}
}
```

Regras mínimas: `route` é obrigatório; `duration_limit_seconds` não passa de 120 no Kids; `asset_refs` e `dna_ref` apontam para versões aprovadas; arquivos grandes nunca são embutidos no prompt.

## Envelope de saída

```json
{
  "status": "NEEDS_REVIEW",
  "job_id": "kids-001-pilot-0001",
  "artifacts": [{"kind": "video_preview", "ref": "drive://.../preview.mp4", "sha256": "..."}],
  "manifest_ref": "github://.../runs/kids-001-pilot-0001.json",
  "validation": {"duration": "pass", "audio": "pass", "visual_dna": "review"},
  "next_action": "human_approval"
}
```

Status permitidos: `PLANNED`, `RUNNING`, `WAITING_GPU`, `NEEDS_REVIEW`, `APPROVED`, `BLOCKED`, `DELIVERED`.

## Agentes por função

| Agente | Decide ou verifica | Não faz |
|---|---|---|
| `context_guard` | rota, projeto, permissões e contexto ativo | importar DNA de outro projeto |
| `kids_story_planner` | ideia, roteiro, duração, cenas e ganchos | gerar frames |
| `kids_visual_dna_guard` | personagem, cenário, paleta, proporção e continuidade | alterar DNA aprovado sem revisão |
| `take_planner` | takes curtos, estados A/B e reaproveitamento | renderizar animação |
| `motion_library_agent` | movimentos aprovados e combinações não repetitivas | exigir sincronismo beat-a-beat |
| `music_director_agent` | música, letra, BPM, stems e licença | mixar manualmente sem adaptador |
| `video_generation_router` | modelo/workflow adequado e política de GPU | decidir identidade criativa sozinho |
| `deterministic_editor` | cortes, montagem, áudio, legendas e export | escolher roteiro |
| `video_qa_gate` | duração, áudio, frames, continuidade, falhas e regras | substituir aprovação humana |
| `delivery_agent` | pacote final, manifest e destino Drive/Git | apagar histórico |

## Adaptadores

Todo adaptador implementa quatro operações lógicas:

1. `plan(input_ref)` — informa capacidade, custo estimado, requisitos e plano; não consome GPU pesada.
2. `execute(plan_ref)` — roda a ferramenta/modelo e grava logs e artefatos.
3. `validate(artifact_ref)` — devolve métricas objetivas e evidências.
4. `materialize(manifest_ref)` — gera o arquivo final no formato pedido.

Os primeiros candidatos são: ComfyUI para workflows, Wan2.2/VACE para vídeo, ACE-Step 1.5 para música, WhisperX para timestamps, PySceneDetect/Auto-Editor para análise e FFmpeg/MLT para montagem determinística. Eles permanecem atrás de adaptadores; o estado de cada capacidade continua no catálogo.

## Rota do piloto Kids

`brief -> context_guard -> kids_story_planner -> kids_visual_dna_guard -> take_planner -> video_generation_router -> music_director_agent -> motion_library_agent -> deterministic_editor -> video_qa_gate -> human_approval -> delivery_agent`

Perfil do primeiro teste:

- vídeo final com música, com duração máxima de 2 minutos;
- Melanca e Verdinho como foco, usando ativos aprovados;
- takes simples e reutilizáveis, com movimentos recombinados;
- sincronismo macro por partes da música, sem exigir alinhamento exato de cada batida;
- brinquedos e mudanças de fundo entram como ações pontuais, não como complexidade obrigatória;
- QA automático antes da pessoa assistir e aprovar;
- processamento pesado somente após o plano passar pelo `resource_policy`.

## Portabilidade entre projetos

Um agente pode ser reutilizado por `TB_LAB_KIDS`, Félix ou outro braço, mas o job sempre troca `route`, `dna_ref`, `asset_refs` e regras. Adaptadores não podem ler memória global sem uma referência explícita do job.

## Não faz parte da v1

- treinar ou refazer o DNA dos personagens;
- copiar um editor inteiro para dentro do T.O.N.Y.;
- exigir DaVinci ou qualquer aplicativo proprietário;
- gerar o episódio completo antes de validar os takes;
- iniciar GPU em segundo plano sem orçamento e sem confirmação do plano;
- prometer resolução de estúdio/Hollywood como requisito do piloto.

## Critério de aceite

O contrato está sendo usado corretamente quando o T.O.N.Y. consegue explicar, usando apenas manifests e referências: qual projeto recebeu o job, qual DNA foi aplicado, quais agentes foram chamados, qual ferramenta executou cada etapa, quanto foi gasto em tokens/GPU, quais validações passaram e qual decisão ainda depende do humano.