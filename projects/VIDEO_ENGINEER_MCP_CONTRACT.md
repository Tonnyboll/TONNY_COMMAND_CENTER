# T.O.N.Y. Video Engineer — contrato MCP

## Propósito

O Video Engineer é o MCP de produção visual do T.O.N.Y. para o TB Lab Kids. Ele recebe a ideia do clipe, preserva o DNA do elenco, transforma a ideia em até 10 timeframes, prepara os pedidos de takes, confere os limites de cada take e entrega uma timeline lógica para montagem no DaVinci Resolve.

Ele não é um gerador de música e não deve iniciar processamento pesado automaticamente. Kling continua sendo o provider visual preferencial; Suno ou outro processo manual entrega a trilha como asset externo; DaVinci faz a montagem final.

## Recursos MCP

| Recurso | Fonte de verdade | Uso |
| --- | --- | --- |
| `clip_brief` | briefing/episódio no GitHub | intenção, público e duração |
| `character_dna` | `dna_registry` + DNA versionado | identidade imutável e variações permitidas |
| `reference_pack` | imagens aprovadas no Drive | âncoras visuais para geração |
| `take_registry` | manifesto do job | entradas, saídas e status de cada take |
| `transition_library` | plano do episódio | cortes, match-cuts, wipes e loops |
| `davinci_timeline` | manifesto exportado | clips, marcadores, transições e trilha externa |

## Ferramentas MCP

1. `plan_clip` — converte a ideia em briefing visual e critérios de sucesso.
2. `resolve_character_dna` — carrega o elenco permitido e monta o snapshot versionado do DNA.
3. `build_reference_pack` — seleciona referências aprovadas; não inventa uma identidade nova sem aprovação.
4. `create_timeframe_plan` — divide o clipe em no máximo 10 microações.
5. `generate_take_spec` — cria roteiro visual, prompt, prompt negativo, pose, câmera, objeto e gancho.
6. `register_kling_take` — registra o take produzido e seus assets.
7. `inspect_take_boundaries` — analisa o primeiro e o último frame e registra o estado visual.
8. `validate_take_handoff` — verifica se o final do Take N prepara o início do Take N+1.
9. `build_davinci_timeline` — organiza clips, marcadores, transições, loops e slot da trilha.
10. `run_visual_qa` — bloqueia DNA quebrado, handoff incompatível, asset ausente ou cena ilegível sem áudio.
11. `package_delivery` — entrega manifesto, prompts, checklist e pendências para aprovação humana.

## `tony.character-dna.v1`

O registro mínimo é:

```json
{
  "schema_version": "tony.character-dna.v1",
  "source_of_truth": "github://.../INDICE_PERSONAGENS.md@main",
  "characters": [
    {
      "character_id": "melanca",
      "dna_ref": "github://.../DNA_PERSONAGEM.md@main",
      "reference_pack": ["drive://approved/character-ref-01.png"],
      "immutable_fields": ["silhouette", "face", "body_proportions", "base_outfit"],
      "variant_fields": ["pose", "expression", "gaze", "camera", "prop_interaction"],
      "conditioning_plan": [
        { "method": "ip_adapter", "role": "identity_and_style_reference" },
        { "method": "controlnet", "role": "pose_or_composition_control" }
      ]
    }
  ]
}
```

Regras:

- prompt sozinho nunca é identidade;
- campo imutável não pode ser alterado para facilitar uma geração;
- nova referência só entra após aprovação humana;
- o snapshot do DNA recebe hash no plano do job;
- o provider recebe o DNA e o reference pack em cada take aplicável;
- se a validação falhar, o take volta para correção antes do Kling.

## Como incorporamos os projetos open source

| Projeto | O que aproveitamos | Papel no nosso mundo |
| --- | --- | --- |
| IP-Adapter | referência de imagem combinada com prompt; adapter leve | camada padrão de referência visual, quando o provider suportar |
| ComfyUI + ComfyUI_IPAdapter_plus | workflows em grafo e nós para IP-Adapter | worker opcional para preparar imagens/variantes; não é dependência obrigatória do MCP |
| ControlNet | controle estrutural por pose, borda, profundidade ou composição | protege posição, gesto e continuidade espacial |
| StoryDiffusion | atenção consistente em sequências longas de imagens/vídeo | referência experimental para lotes de frames; não é requisito do piloto |
| InstantID / PuLID | preservação de identidade facial em imagens | adaptadores opcionais para personagens humanos; não são a base da Melanca 3D |

A escolha é deliberadamente modular. O MCP guarda o DNA e emite um plano de condicionamento; ele não instala todos esses projetos em `C:\AGENTS_REA_APIS` nem torna o computador local dependente de GPU. Para o piloto, a geração segue no Kling e a montagem segue no DaVinci.

## Fluxo operacional

```text
ideia
  -> briefing visual
  -> snapshot de DNA + reference pack
  -> timeframes
  -> specs/prompts de takes
  -> Kling
  -> inspeção inicial/final
  -> validação de handoff
  -> timeline DaVinci
  -> trilha externa + edição
  -> QA e aprovação humana
```

## Portões humanos

- aprovar DNA e reference pack;
- aprovar o plano de timeframes;
- aprovar cada take antes de seguir quando houver mudança de identidade, cenário ou ação;
- aprovar a timeline antes do render/master;
- aprovar a trilha externa antes de incorporá-la no DaVinci.

## Fora do escopo

- gerar música ou áudio;
- prometer que um take existe sem asset registrado;
- substituir Kling, DaVinci ou a aprovação do Tonny;
- usar referência de terceiros para copiar personagem, estilo ou marca.
