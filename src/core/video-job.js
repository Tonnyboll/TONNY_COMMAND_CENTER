import crypto from "node:crypto";

export const KIDS_MAX_DURATION_SECONDS = 120;

export const KIDS_VIDEO_AGENT_IDS = [
  "context-guard",
  "kids-story-planner",
  "kids-visual-dna-guard",
  "take-planner",
  "motion-library-agent",
  "music-director-agent",
  "video-generation-router",
  "deterministic-editor",
  "video-qa-gate",
  "delivery-agent"
];

const DEFAULT_STAGES = [
  { order: 1, agent_id: "context-guard", adapter: "context.internal", mode: "deterministic" },
  { order: 2, agent_id: "kids-story-planner", adapter: "kids.story.manifest", mode: "llm_on_decision" },
  { order: 3, agent_id: "kids-visual-dna-guard", adapter: "kids.dna.manifest", mode: "deterministic_then_review" },
  { order: 4, agent_id: "take-planner", adapter: "kids.take.plan", mode: "deterministic_then_review" },
  { order: 5, agent_id: "video-generation-router", adapter: "video.router", mode: "plan_only" },
  { order: 6, agent_id: "motion-library-agent", adapter: "kids.motion.library", mode: "deterministic" },
  { order: 7, agent_id: "music-director-agent", adapter: "music.reference", mode: "reference_only" },
  { order: 8, agent_id: "deterministic-editor", adapter: "ffmpeg.mlt.editor", mode: "worker" },
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
    if (!isReference(value)) errors.push(`${label}[${index}] precisa ser uma referência drive://, github://, local:// ou https://.`);
  });
}

export function validateVideoJob(job = {}) {
  const errors = [];
  const warnings = [];
  const duration = Number(job.duration_limit_seconds);
  const dnaRefs = asArray(job.dna_refs || (job.dna_ref ? [job.dna_ref] : []));

  if (!job.job_id || typeof job.job_id !== "string") errors.push("job_id é obrigatório.");
  if (job.route !== "TB_LAB_KIDS") errors.push("A v1 deste planejador aceita somente route=TB_LAB_KIDS.");
  if (!job.brief_ref || !isReference(job.brief_ref)) errors.push("brief_ref precisa apontar para um manifesto ou documento versionado.");
  if (dnaRefs.length === 0) errors.push("É obrigatório informar pelo menos uma referência de DNA.");
  validateReferences(dnaRefs, "dna_refs", errors);
  if (asArray(job.asset_refs).length === 0) errors.push("É obrigatório informar os ativos aprovados do job.");
  validateReferences(job.asset_refs, "asset_refs", errors);
  if (!job.music_ref || !isReference(job.music_ref)) errors.push("music_ref precisa apontar para a música ou para um artefato de áudio versionado.");
  if (!Number.isFinite(duration) || duration <= 0) errors.push("duration_limit_seconds precisa ser maior que zero.");
  if (duration > KIDS_MAX_DURATION_SECONDS) errors.push(`O limite do TB_LAB_KIDS é ${KIDS_MAX_DURATION_SECONDS} segundos.`);
  if (!job.quality_profile) errors.push("quality_profile é obrigatório.");
  if (!job.resource_policy || typeof job.resource_policy !== "object") errors.push("resource_policy é obrigatório.");
  if (job.resource_policy?.auto_start === true) errors.push("O planejador não permite auto_start=true para processamento pesado.");
  if (job.approval?.human_required !== true) errors.push("approval.human_required precisa ser true.");
  if (asArray(job.takes).length === 0) errors.push("O job precisa conter pelo menos um take planejado.");
  if (job.resource_policy?.gpu === "none") warnings.push("Sem GPU: o job pode planejar e editar, mas a animação generativa ficará aguardando recurso.");
  if (job.music_ref.startsWith("drive://") && job.music_ref.endsWith("music-master.wav")) {
    warnings.push("O ref de música segue a convenção do Drive e precisa ser confirmado com o arquivo real antes da execução.");
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function planVideoJob(input = {}) {
  const job = {
    schema_version: "tony.job.v1",
    ...input,
    asset_refs: asArray(input.asset_refs),
    dna_refs: asArray(input.dna_refs || (input.dna_ref ? [input.dna_ref] : [])),
    stages: input.stages || DEFAULT_STAGES
  };
  const validation = validateVideoJob(job);
  const plan = {
    schema_version: "tony.job.plan.v1",
    job_id: job.job_id || null,
    route: job.route || null,
    status: validation.valid ? "PLANNED" : "BLOCKED",
    readiness: validation.valid ? "READY_FOR_ASSET_BINDING" : "BLOCKED_BY_INPUT",
    input_hash: inputHash(job),
    job,
    validation,
    execution: {
      mode: "plan_only",
      external_tools_started: false,
      heavy_gpu_started: false,
      human_approval_required: true
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
      ? "bind_real_asset_refs_then_review_resource_plan"
      : "fix_blockers_before_execution"
  };
  return plan;
}

export function buildKidsTake01Plan(overrides = {}) {
  const episodeRoot = "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/episodios/001-guarda-guarda-guarda";
  const driveRoot = "drive://TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/episodios/001-guarda-guarda-guarda";
  const job = {
    job_id: "kids-001-pilot-0001",
    route: "TB_LAB_KIDS",
    intent: "produzir_video_infantil",
    episode: "001-guarda-guarda-guarda",
    brief_ref: `${episodeRoot}/TAKE_01_APROVADO.md@main`,
    dna_refs: [
      "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/personagens/melanca/DNA_PERSONAGEM.md@main",
      "github://Tonnyboll/Tonnyboll_Studios/TB_LAB_KIDS/projetos/o-mundo-magico-de-melanca/personagens/melanca-friend-green/DNA_PERSONAGEM.md@main"
    ],
    asset_refs: [
      `${driveRoot}/takes/take-01/frame-01.png`,
      `${driveRoot}/takes/take-01/frame-02.png`
    ],
    music_ref: `${driveRoot}/audio/music-master.wav`,
    music_spec_ref: `${episodeRoot}/MUSICA_GUARDA_GUARDA.md@main`,
    duration_limit_seconds: 120,
    quality_profile: "kids_pilot_v1",
    resource_policy: {
      gpu: "local_then_cloud",
      max_minutes: 30,
      auto_start: false,
      heavy_processing_requires_confirmation: true
    },
    approval: { human_required: true },
    takes: [
      {
        take_id: "take-01",
        status: "READY_FOR_ASSET_BINDING",
        duration_seconds: 10,
        narrative_role: "abrir a brincadeira e provar que o trenzinho pode ganhar vida",
        cast: ["melanca", "melanca-friend-green"],
        primary_object: "trenzinho",
        frame_strategy: "frame-01 -> frame-02",
        action_chain: [
          "Melanca solta o trem",
          "o trem continua se movendo sozinho",
          "Melanca percebe",
          "Verdinho percebe",
          "os dois acompanham com surpresa e empolgação"
        ],
        camera: "locked horizontal 16:9 shot",
        final_motion_state: "o trenzinho chega ao estado do Frame 2 ainda com momentum ativo, preparando o próximo take",
        motion_policy: "reuse-approved-library",
        audio_policy: "music_added_in_deterministic_editing_stage"
      }
    ]
  };
  return planVideoJob({
    ...job,
    ...overrides,
    resource_policy: { ...job.resource_policy, ...(overrides.resource_policy || {}) },
    approval: { ...job.approval, ...(overrides.approval || {}) },
    takes: overrides.takes || job.takes
  });
}

export { DEFAULT_STAGES };
