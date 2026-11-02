import crypto from "node:crypto";

export const KIDS_MAX_DURATION_SECONDS = 120;
export const KIDS_MAX_TIMEFRAMES = 10;

export const KIDS_VIDEO_AGENT_IDS = [
  "context-guard",
  "kids-story-planner",
  "kids-visual-dna-guard",
  "timeframe-engineer",
  "take-continuity-agent",
  "video-generation-router",
  "transition-engineer",
  "davinci-timeline-agent",
  "video-qa-gate",
  "delivery-agent"
];

const DEFAULT_STAGES = [
  { order: 1, agent_id: "context-guard", adapter: "context.internal", mode: "deterministic" },
  { order: 2, agent_id: "kids-story-planner", adapter: "kids.microaction.brief", mode: "llm_on_decision" },
  { order: 3, agent_id: "kids-visual-dna-guard", adapter: "kids.dna.manifest", mode: "deterministic_then_review" },
  { order: 4, agent_id: "timeframe-engineer", adapter: "kids.timeframe.plan", mode: "deterministic_then_review" },
  { order: 5, agent_id: "take-continuity-agent", adapter: "kids.take.handoff", mode: "deterministic_then_review" },
  { order: 6, agent_id: "video-generation-router", adapter: "video.router.kling", mode: "plan_only" },
  { order: 7, agent_id: "transition-engineer", adapter: "davinci.transition.plan", mode: "deterministic_then_review" },
  { order: 8, agent_id: "davinci-timeline-agent", adapter: "davinci.timeline.manifest", mode: "export_only" },
  { order: 9, agent_id: "video-qa-gate", adapter: "video.qa", mode: "worker_then_review" },
  { order: 10, agent_id: "delivery-agent", adapter: "artifact.delivery", mode: "human_gated" }
];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        if (key !== "input_hash") result[key] = canonicalize(value[key]);
        return result;
      }, {});
  }
  return value;
}

function inputHash(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function isReference(value) {
  return typeof value === "string" && ["drive://", "github://", "local://", "http://", "https://"].some((prefix) => value.startsWith(prefix));
}

function validateReferences(values, label, errors) {
  asArray(values).forEach((value, index) => {
    if (!isReference(value)) {
      errors.push(label + "[" + index + "] precisa ser uma referência drive://, github://, local:// ou https://.");
    }
  });
}

export function validateTimeframes(timeframes = [], durationLimit = KIDS_MAX_DURATION_SECONDS) {
  const errors = [];
  const warnings = [];
  const normalized = asArray(timeframes);

  if (normalized.length === 0) {
    warnings.push("Nenhum timeframe foi vinculado; o job está pronto apenas para planejamento visual.");
    return { valid: true, errors, warnings };
  }

  if (normalized.length > KIDS_MAX_TIMEFRAMES) {
    errors.push("O v1 aceita no máximo " + KIDS_MAX_TIMEFRAMES + " timeframes por bloco visual.");
  }

  let previousEnd = 0;
  normalized.forEach((timeframe, index) => {
    const start = Number(timeframe.start_seconds);
    const end = Number(timeframe.end_seconds);

    if (!timeframe.timeframe_id) errors.push("timeframes[" + index + "].timeframe_id é obrigatório.");
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      errors.push("timeframes[" + index + "] precisa ter start_seconds/end_seconds válidos.");
      return;
    }
    if (start < 0 || end > durationLimit) {
      errors.push("timeframes[" + index + "] está fora do limite de " + durationLimit + " segundos.");
    }
    if (start < previousEnd) {
      warnings.push("timeframes[" + index + "] sobrepõe o bloco anterior; confirme o crossfade no DaVinci.");
    }
    if (!timeframe.action) warnings.push("timeframes[" + index + "] ainda não possui ação descrita.");
    if (!timeframe.asset_ref && timeframe.asset_status !== "NEEDS_KLING_TAKE") {
      warnings.push("timeframes[" + index + "] ainda não possui asset_ref ou status de asset.");
    }
    previousEnd = Math.max(previousEnd, end);
  });

  return { valid: errors.length === 0, errors, warnings };
}


export function validateTakeContinuity(takes = []) {
  const errors = [];
  const warnings = [];
  const normalized = asArray(takes);

  normalized.forEach((take, index) => {
    if (!take.start_frame_ref) {
      warnings.push("takes[" + index + "] não possui start_frame_ref para validar a entrada visual.");
    } else if (!isReference(take.start_frame_ref)) {
      errors.push("takes[" + index + "].start_frame_ref precisa ser uma referência válida.");
    }
    if (!take.end_frame_ref) {
      warnings.push("takes[" + index + "] não possui end_frame_ref para validar o gancho de saída.");
    } else if (!isReference(take.end_frame_ref)) {
      errors.push("takes[" + index + "].end_frame_ref precisa ser uma referência válida.");
    }
    if (!take.outgoing_hook) {
      warnings.push("takes[" + index + "] não descreve o gancho deixado para o próximo take.");
    }
    if (index > 0 && !take.incoming_match) {
      warnings.push("takes[" + index + "] não descreve como deve casar com o take anterior.");
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

export function validateVideoJob(job = {}) {
  const errors = [];
  const warnings = [];
  const duration = Number(job.duration_limit_seconds);
  const dnaRefs = asArray(job.dna_refs || (job.dna_ref ? [job.dna_ref] : []));
  const timeframeValidation = validateTimeframes(job.video_plan?.timeframes, duration || KIDS_MAX_DURATION_SECONDS);
  const continuityValidation = validateTakeContinuity(job.takes);

  if (!job.job_id || typeof job.job_id !== "string") errors.push("job_id é obrigatório.");
  if (job.route !== "TB_LAB_KIDS") errors.push("A v1 deste planejador aceita somente route=TB_LAB_KIDS.");
  if (!job.brief_ref || !isReference(job.brief_ref)) errors.push("brief_ref precisa apontar para um manifesto ou documento versionado.");
  if (dnaRefs.length === 0) errors.push("É obrigatório informar pelo menos uma referência de DNA.");
  validateReferences(dnaRefs, "dna_refs", errors);
  if (asArray(job.asset_refs).length === 0) errors.push("É obrigatório informar os ativos aprovados do job.");
  validateReferences(job.asset_refs, "asset_refs", errors);
  if (!Number.isFinite(duration) || duration <= 0) errors.push("duration_limit_seconds precisa ser maior que zero.");
  if (duration > KIDS_MAX_DURATION_SECONDS) errors.push("O limite do TB_LAB_KIDS é " + KIDS_MAX_DURATION_SECONDS + " segundos.");
  if (!job.quality_profile) errors.push("quality_profile é obrigatório.");
  if (!job.resource_policy || typeof job.resource_policy !== "object") errors.push("resource_policy é obrigatório.");
  if (job.resource_policy?.auto_start === true) errors.push("O planejador não permite auto_start=true para processamento pesado.");
  if (job.approval?.human_required !== true) errors.push("approval.human_required precisa ser true.");
  if (asArray(job.takes).length === 0) errors.push("O job precisa conter pelo menos um take planejado.");

  if (job.soundtrack_ref && !isReference(job.soundtrack_ref)) {
    errors.push("soundtrack_ref precisa ser uma referência externa válida.");
  }
  if (job.soundtrack_generation) {
    errors.push("soundtrack_generation não faz parte do Engenheiro de Vídeo; forneça apenas soundtrack_ref após a escolha externa.");
  }

  errors.push(...timeframeValidation.errors);
  warnings.push(...timeframeValidation.warnings);
  errors.push(...continuityValidation.errors);
  warnings.push(...continuityValidation.warnings);

  if (job.resource_policy?.gpu === "none") {
    warnings.push("Sem GPU: o job pode planejar, validar e exportar a timeline, mas a geração visual via Kling ficará aguardando recurso externo.");
  }
  if (job.soundtrack_ref) {
    warnings.push("A trilha é um asset externo e será usada somente na montagem do DaVinci.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function planVideoJob(input = {}) {
  const job = {
    schema_version: "tony.video-job.v2",
    ...input,
    asset_refs: asArray(input.asset_refs),
    dna_refs: asArray(input.dna_refs || (input.dna_ref ? [input.dna_ref] : [])),
    stages: input.stages || DEFAULT_STAGES,
    video_plan: input.video_plan
      ? {
          mode: input.video_plan.mode || "demonstration_microactions",
          max_timeframes: input.video_plan.max_timeframes || KIDS_MAX_TIMEFRAMES,
          timeframes: asArray(input.video_plan.timeframes),
          transition_plan: asArray(input.video_plan.transition_plan),
          davinci_timeline: input.video_plan.davinci_timeline || null
        }
      : null
  };
  const validation = validateVideoJob(job);
  const plan = {
    schema_version: "tony.video-job.plan.v2",
    job_id: job.job_id || null,
    route: job.route || null,
    status: validation.valid ? "PLANNED" : "BLOCKED",
    readiness: validation.valid ? "READY_FOR_VISUAL_ASSET_BINDING" : "BLOCKED_BY_INPUT",
    input_hash: inputHash(job),
    job,
    validation,
    execution: {
      mode: "plan_only",
      external_tools_started: false,
      heavy_gpu_started: false,
      human_approval_required: true
    },
    visual_engineering: {
      mode: "timeframe_first",
      max_timeframes: KIDS_MAX_TIMEFRAMES,
      generation_provider: "Kling",
      timeline_target: "DaVinci Resolve",
      soundtrack_owner: "external_human_selected_asset",
      accepted_soundtrack_providers: ["Suno", "manual"],
      continuity: {
        inspect_take_boundaries: true,
        handoff_required: true,
        hook_policy: "end_of_take_n_must_prepare_start_of_take_n_plus_1",
        boundary_fields: ["start_frame_ref", "end_frame_ref", "outgoing_hook", "incoming_match"]
      }
    },
    resource: {
      gpu: job.resource_policy?.gpu || null,
      max_minutes: job.resource_policy?.max_minutes ?? null,
      auto_start: false,
      heavy_processing_gate: "explicit_plan_confirmation"
    },
    stages: job.stages.map((stage) => ({
      ...stage,
      status: "PENDING",
      output_ref: null
    })),
    next_action: validation.valid
      ? "bind_visual_assets_then_export_davinci_timeline"
      : "fix_blockers_before_execution"
  };
  return plan;
}

const DEFAULT_GUARDA_TIMEFRAMES = [
  { timeframe_id: "tf-01", start_seconds: 0, end_seconds: 8, action: "chamada inicial: guardar junto", characters: ["melanca", "melanca-friend-green"], object: "caixa de brinquedos", asset_status: "NEEDS_KLING_TAKE", transition_out: "beat-cut" },
  { timeframe_id: "tf-02", start_seconds: 8, end_seconds: 20, action: "guardar o carrinho", characters: ["melanca"], object: "carrinho", asset_status: "NEEDS_KLING_TAKE", transition_out: "whip-pan" },
  { timeframe_id: "tf-03", start_seconds: 20, end_seconds: 32, action: "guardar a bola", characters: ["melanca-friend-green"], object: "bola", asset_status: "NEEDS_KLING_TAKE", transition_out: "object-match" },
  { timeframe_id: "tf-04", start_seconds: 32, end_seconds: 44, action: "guardar os blocos", characters: ["melanca", "melanca-friend-green"], object: "blocos", asset_status: "NEEDS_KLING_TAKE", transition_out: "clap-cut" },
  { timeframe_id: "tf-05", start_seconds: 44, end_seconds: 56, action: "guardar o boneco", characters: ["melanca"], object: "boneco", asset_status: "NEEDS_KLING_TAKE", transition_out: "push-in" },
  { timeframe_id: "tf-06", start_seconds: 56, end_seconds: 68, action: "guardar o livro", characters: ["melanca-friend-green"], object: "livro", asset_status: "NEEDS_KLING_TAKE", transition_out: "page-wipe" },
  { timeframe_id: "tf-07", start_seconds: 68, end_seconds: 80, action: "guardar o trenzinho", characters: ["melanca", "melanca-friend-green"], object: "trenzinho", asset_status: "PARTIAL_FROM_TAKE_01", transition_out: "match-cut" },
  { timeframe_id: "tf-08", start_seconds: 80, end_seconds: 94, action: "os dois guardam juntos", characters: ["melanca", "melanca-friend-green"], object: "caixa de brinquedos", asset_status: "NEEDS_KLING_TAKE", transition_out: "split-screen" },
  { timeframe_id: "tf-09", start_seconds: 94, end_seconds: 108, action: "repetição rápida das ações", characters: ["melanca", "melanca-friend-green"], object: "carrinho, bola e blocos", asset_status: "NEEDS_KLING_TAKE", transition_out: "rhythmic-montage" },
  { timeframe_id: "tf-10", start_seconds: 108, end_seconds: 120, action: "comemoração final e convite para repetir", characters: ["melanca", "melanca-friend-green"], object: "caixa organizada", asset_status: "NEEDS_KLING_TAKE", transition_out: "end-card" }
];

export function buildKidsTake01Plan(overrides = {}) {
  const episodeRoot = "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/episodios/001-guarda-guarda-guarda";
  const driveRoot = "drive://TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/episodios/001-guarda-guarda-guarda";
  const baseVideoPlan = {
    mode: "demonstration_microactions",
    continuity_policy: {
      inspect_start_and_end_frames: true,
      preserve_final_state_as_next_take_hook: true,
      reject_unmatched_handoffs: true
    },
    max_timeframes: KIDS_MAX_TIMEFRAMES,
    timeframes: DEFAULT_GUARDA_TIMEFRAMES,
    transition_plan: [
      "usar cortes em batidas macro, sem exigir lipsync quadro a quadro",
      "usar match-cuts por objeto para reforçar repetição",
      "usar montagem rítmica na repetição final",
      "preservar planos simples para facilitar geração via Kling"
    ],
    davinci_timeline: {
      timeline_name: "EP01_GUARDA_GUARDA_V1",
      fps: 24,
      resolution: "1280x720",
      import_formats: ["csv", "edl", "xml"],
      markers_required: true,
      soundtrack_slot: "external_suno_or_manual"
    }
  };
  const job = {
    job_id: "kids-001-video-engineer-0001",
    route: "TB_LAB_KIDS",
    intent: "planejar_video_infantil_interativo",
    episode: "001-guarda-guarda-guarda",
    brief_ref: episodeRoot + "/TAKE_01_APROVADO.md@main",
    dna_refs: [
      "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/personagens/melanca/DNA_PERSONAGEM.md@main",
      "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/personagens/melanca-friend-green/DNA_PERSONAGEM.md@main"
    ],
    asset_refs: [
      driveRoot + "/takes/take-01/frame-01.png",
      driveRoot + "/takes/take-01/frame-02.png"
    ],
    soundtrack_ref: null,
    duration_limit_seconds: 120,
    quality_profile: "kids_demonstration_v1",
    resource_policy: {
      gpu: "local_then_cloud",
      max_minutes: 30,
      auto_start: false,
      heavy_processing_requires_confirmation: true
    },
    approval: { human_required: true },
    video_plan: baseVideoPlan,
    takes: [
      {
        take_id: "take-01",
        status: "READY_FOR_ASSET_BINDING",
        duration_seconds: 10,
        visual_role: "provar a ação do trenzinho e servir como asset do timeframe 07",
        cast: ["melanca", "melanca-friend-green"],
        primary_object: "trenzinho",
        frame_strategy: "frame-01 -> frame-02",
        start_frame_ref: driveRoot + "/takes/take-01/frame-01.png",
        end_frame_ref: driveRoot + "/takes/take-01/frame-02.png",
        outgoing_hook: "o trenzinho termina em movimento e deixa a direção do próximo take visualmente aberta",
        incoming_match: "o próximo take deve começar preservando a posição, direção e energia do trenzinho",
        action_chain: [
          "Melanca solta o trem",
          "o trem continua se movendo sozinho",
          "Melanca percebe",
          "Verdinho percebe",
          "os dois acompanham com surpresa e empolgação"
        ],
        camera: "locked horizontal 16:9 shot",
        final_motion_state: "o trenzinho chega ao estado do Frame 2 ainda com momentum ativo",
        motion_policy: "reuse-approved-library"
      }
    ]
  };

  return planVideoJob({
    ...job,
    ...overrides,
    resource_policy: { ...job.resource_policy, ...(overrides.resource_policy || {}) },
    approval: { ...job.approval, ...(overrides.approval || {}) },
    video_plan: {
      ...baseVideoPlan,
      ...(overrides.video_plan || {}),
      timeframes: overrides.video_plan?.timeframes || baseVideoPlan.timeframes,
      transition_plan: overrides.video_plan?.transition_plan || baseVideoPlan.transition_plan,
      davinci_timeline: {
        ...baseVideoPlan.davinci_timeline,
        ...(overrides.video_plan?.davinci_timeline || {})
      }
    },
    takes: overrides.takes || job.takes
  });
}

export { DEFAULT_STAGES };
