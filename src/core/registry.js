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
  }
];

export class AgentRegistry {
  constructor(store) {
    this.store = store;
  }

  async ensureDefaults() {
    const state = this.store.snapshot();
    if (state.agents.length > 0) return state.agents;
    await this.store.update((data) => {
      data.agents.push(...DEFAULT_AGENTS.map((agent) => ({ ...agent })));
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
}

export { DEFAULT_AGENTS };
