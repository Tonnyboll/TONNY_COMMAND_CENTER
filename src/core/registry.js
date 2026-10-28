const DEFAULT_AGENTS = [
  {
    id: "architect-review",
    domain: "software_architecture",
    capabilities: ["architecture_review", "dependency_analysis", "scalability_review"],
    tools: ["filesystem", "code_analysis"],
    costLevel: "medium",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "security-auditor",
    domain: "security",
    capabilities: ["security_review", "threat_analysis", "dependency_risk"],
    tools: ["filesystem", "code_analysis"],
    costLevel: "medium",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "qa-specialist",
    domain: "testing",
    capabilities: ["test_review", "coverage_analysis", "regression_analysis"],
    tools: ["filesystem", "test_runner"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "medium"
  },
  {
    id: "api-reviewer",
    domain: "technology",
    capabilities: ["api_contract_review", "integration_review", "schema_analysis"],
    tools: ["filesystem", "api_client"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "research-agent",
    domain: "research",
    capabilities: ["web_research", "source_evaluation", "open_source_review"],
    tools: ["search"],
    costLevel: "medium",
    parallelizable: true,
    confidenceRequired: "medium"
  },
  {
    id: "implementation-agent",
    domain: "technology",
    capabilities: ["code_implementation", "test_execution", "documentation_update"],
    tools: ["filesystem", "code_analysis", "test_runner"],
    costLevel: "medium",
    parallelizable: false,
    confidenceRequired: "high"
  },
  {
    id: "context-guard",
    domain: "kids_video",
    capabilities: ["project_context_guard", "route_validation", "asset_scope_validation"],
    tools: ["manifest_store", "policy"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "kids-story-planner",
    domain: "kids_video",
    capabilities: ["kids_story_planning", "take_planning", "duration_budgeting"],
    tools: ["manifest_store"],
    costLevel: "medium",
    parallelizable: false,
    confidenceRequired: "medium"
  },
  {
    id: "kids-visual-dna-guard",
    domain: "kids_video",
    capabilities: ["visual_dna_validation", "character_continuity", "kids_safety_review"],
    tools: ["manifest_store", "quality_gate"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "take-planner",
    domain: "kids_video",
    capabilities: ["take_planning", "frame_pair_planning", "continuity_planning"],
    tools: ["manifest_store"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "motion-library-agent",
    domain: "kids_video",
    capabilities: ["motion_library_sequencing", "motion_reuse", "macro_music_context"],
    tools: ["manifest_store"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "medium"
  },
  {
    id: "music-director-agent",
    domain: "kids_video",
    capabilities: ["music_reference", "lyrics_context", "audio_policy"],
    tools: ["manifest_store", "audio_worker"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "medium"
  },
  {
    id: "video-generation-router",
    domain: "kids_video",
    capabilities: ["video_generation_routing", "gpu_policy", "worker_selection"],
    tools: ["resource_policy", "worker_registry"],
    costLevel: "medium",
    parallelizable: false,
    confidenceRequired: "high"
  },
  {
    id: "deterministic-editor",
    domain: "kids_video",
    capabilities: ["deterministic_video_editing", "audio_mixing", "media_materialization"],
    tools: ["ffmpeg", "mlt", "worker"],
    costLevel: "low",
    parallelizable: false,
    confidenceRequired: "high"
  },
  {
    id: "video-qa-gate",
    domain: "kids_video",
    capabilities: ["video_quality_assurance", "technical_media_validation", "visual_continuity_review"],
    tools: ["ffprobe", "quality_gate", "frame_sampler"],
    costLevel: "low",
    parallelizable: true,
    confidenceRequired: "high"
  },
  {
    id: "delivery-agent",
    domain: "kids_video",
    capabilities: ["artifact_delivery", "manifest_registration", "drive_package"],
    tools: ["drive", "manifest_store"],
    costLevel: "low",
    parallelizable: false,
    confidenceRequired: "high"
  }
];

export class AgentRegistry {
  constructor(store) {
    this.store = store;
  }

  async ensureDefaults() {
    const state = this.store.snapshot();
    const existingIds = new Set(state.agents.map((agent) => agent.id));
    const missing = DEFAULT_AGENTS.filter((agent) => !existingIds.has(agent.id));
    if (missing.length === 0) return state.agents;
    await this.store.update((data) => {
      data.agents.push(...missing.map((agent) => ({ ...agent })));
      return data.agents;
    });
    return this.store.snapshot().agents;
  }

  async register(agent) {
    if (!agent?.id || !agent?.domain) throw new Error("Agent id and domain are required");
    return this.store.update((data) => {
      const index = data.agents.findIndex((item) => item.id === agent.id);
      if (index >= 0) data.agents[index] = { ...data.agents[index], ...agent };
      else data.agents.push({ ...agent });
      return data.agents.find((item) => item.id === agent.id);
    });
  }

  list() {
    return this.store.snapshot().agents;
  }

  findForCapabilities(capabilities = [], domain) {
    const required = new Set(capabilities);
    return this.list()
      .filter((agent) => !domain || agent.domain === domain)
      .map((agent) => ({
        agent,
        score: [...required].filter((capability) => agent.capabilities?.includes(capability)).length
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .map((item) => item.agent);
  }

  findBestForCapabilities(capabilities = []) {
    const required = new Set(capabilities);
    return this.list()
      .map((agent) => ({
        agent,
        score: [...required].filter((capability) => agent.capabilities?.includes(capability)).length
      }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score || left.agent.id.localeCompare(right.agent.id))
      .map((item) => item.agent);
  }
}

export { DEFAULT_AGENTS };
