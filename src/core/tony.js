import crypto from "node:crypto";
import { EmptyKnowledgeLayer } from "./knowledge.js";
import { MissionOrchestrator } from "./orchestrator.js";
import { AgentRegistry } from "./registry.js";
import { PolicyLayer } from "./policy.js";
import { IntentRouter } from "./router.js";
import { buildKidsTake01Plan, planVideoJob as planVideoJobContract } from "./video-job.js";

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

function now() {
  return new Date().toISOString();
}

export class TonyCore {
  constructor({ store, registry = new AgentRegistry(store), router = new IntentRouter(), policy = new PolicyLayer(), knowledge = new EmptyKnowledgeLayer(), orchestrator = null }) {
    this.store = store;
    this.registry = registry;
    this.router = router;
    this.policy = policy;
    this.knowledge = knowledge;
    this.orchestrator = orchestrator || new MissionOrchestrator({ registry: this.registry });
  }

  async initialize() {
    await this.knowledge.init();
    await this.registry.ensureDefaults();
    return this;
  }

  async handleMessage({ message, history = [], activeProjectId = null } = {}) {
    const state = this.store.snapshot();
    const activeProject = state.projects.find((project) => project.id === activeProjectId);
    const intent = this.router.route(message, {
      activeProject,
      knownProjects: this.knowledge.projects ? this.knowledge.projects() : []
    });

    if (intent.type === "empty") {
      return { state: "ANALISADO", mode: "informal", persisted: false, intent };
    }

    if (intent.type === "informal_conversation") {
      return {
        state: "ANALISADO",
        mode: "informal",
        persisted: false,
        intent,
        message: "Conversa informal. Nenhum projeto, missão ou memória persistente foi criado."
      };
    }

    if (intent.type === "activate_project") {
      return this.activateProject({ message, history, intent });
    }

    if (!activeProject) {
      return { state: "AGUARDANDO CONFIRMAÇÃO", mode: "informal", persisted: false, intent };
    }

    if (intent.type === "mission_request") {
      const mission = await this.createMission({
        projectId: activeProject.id,
        objective: message,
        sourceMessage: message,
        project: activeProject
      });
      return {
        state: "PLANEJADO",
        mode: "project",
        persisted: true,
        project: activeProject,
        mission,
        intent,
        message: "Missão arquitetada, agents selecionados e pronta para execução."
      };
    }

    return {
      state: "ANALISADO",
      mode: "project",
      persisted: true,
      project: activeProject,
      intent,
      message: "Mensagem recebida dentro do projeto ativo."
    };
  }

  async activateProject({ message, history = [], intent } = {}) {
    const timestamp = now();
    const project = {
      id: id("project"),
      name: intent.projectName,
      domain: intent.domain,
      status: "active",
      context: this.router.buildContextSnapshot(history, message),
      knowledge: this.knowledge.contextFor({
        query: `${intent.projectName} ${message}`,
        domain: intent.domain,
        project: intent.projectName
      }),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const orchestration = this.orchestrator.plan({
      objective: message,
      project,
      context: project.context,
      knowledge: project.knowledge,
      activation: true
    });
    project.orchestration = orchestration;
    const mission = {
      id: id("mission"),
      projectId: project.id,
      objective: message,
      status: "PLANNED",
      stateLabel: "PLANEJADO",
      source: "explicit project activation",
      orchestration,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.store.update((data) => {
      data.projects.push(project);
      data.missions.push(mission);
      data.audit.push({
        id: id("audit"),
        type: "project_activated",
        projectId: project.id,
        missionId: mission.id,
        message,
        timestamp
      });
    });
    return {
      state: "EXECUTADO",
      mode: "project",
      persisted: true,
      project,
      mission,
      intent,
      message: "Projeto ativado. O contexto inicial foi consolidado e a primeira missão foi registrada."
    };
  }

  async createMission({ projectId, objective, sourceMessage, project = null }) {
    const timestamp = now();
    const activeProject = project || this.store.snapshot().projects.find((item) => item.id === projectId);
    const knowledge = this.knowledge.contextFor({
      query: `${activeProject?.name || ""} ${objective}`,
      domain: activeProject?.domain,
      project: activeProject?.name
    });
    const orchestration = this.orchestrator.plan({
      objective,
      project: activeProject,
      context: activeProject?.context,
      knowledge
    });
    const mission = {
      id: id("mission"),
      projectId,
      objective,
      sourceMessage,
      orchestration,
      status: "PLANNED",
      stateLabel: "PLANEJADO",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.store.update((data) => {
      data.missions.push(mission);
      data.audit.push({ id: id("audit"), type: "mission_created", projectId, missionId: mission.id, orchestration, timestamp });
    });
    return mission;
  }

  async requestTool({ projectId, tool, action, parameters = {}, confirmed = false } = {}) {
    const project = this.store.snapshot().projects.find((item) => item.id === projectId);
    if (!project) return { state: "FALHOU", error: "Project not found." };
    const decision = this.policy.evaluate({ tool, action, confirmed });
    const timestamp = now();
    const request = {
      id: id("tool"),
      projectId,
      tool,
      action,
      parameters,
      policy: decision,
      execution: "NOT_EXECUTED",
      createdAt: timestamp
    };
    await this.store.update((data) => {
      data.audit.push({ id: id("audit"), type: "tool_request", projectId, request, timestamp });
    });
    return {
      state: decision.status === "CONFIRMATION_REQUIRED" ? "AGUARDANDO CONFIRMAÇÃO" : decision.allowed ? "PLANEJADO" : "FALHOU",
      request,
      message: decision.allowed
        ? "A política autorizou a solicitação, mas nenhuma ferramenta externa foi executada nesta versão."
        : decision.reason
    };
  }

  async recordDecision({ projectId, title, decision, reason = "", evidence = [], impact = "" } = {}) {
    const project = this.store.snapshot().projects.find((item) => item.id === projectId);
    if (!project) return { state: "FALHOU", error: "Project not found." };
    const timestamp = now();
    const record = {
      id: id("decision"),
      projectId,
      title,
      decision,
      reason,
      evidence,
      impact,
      status: "ACTIVE",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.store.update((data) => {
      data.decisions.push(record);
      data.audit.push({ id: id("audit"), type: "decision_recorded", projectId, decisionId: record.id, timestamp });
    });
    return { state: "EXECUTADO", decision: record, message: "Decisão registrada no contexto do projeto." };
  }


  async planVideoJob({ job = null, pilot = null } = {}) {
    const plan = pilot === "kids_take_01"
      ? buildKidsTake01Plan(job || {})
      : planVideoJobContract(job || {});
    const timestamp = now();
    await this.store.update((data) => {
      data.audit.push({
        id: id("audit"),
        type: "video_job_planned",
        jobId: plan.job_id,
        status: plan.status,
        inputHash: plan.input_hash,
        timestamp
      });
    });
    return { ...plan, planned_at: timestamp };
  }

  dashboard() {
    const data = this.store.snapshot();
    return {
      status: "online",
      agents: data.agents.length,
      projects: data.projects.length,
      missions: data.missions.length,
      decisions: data.decisions.length,
      auditEvents: data.audit.length,
      knowledgeEntries: this.knowledge.entries().length,
      knowledgeSources: this.knowledge.sources().length,
      activeProjects: data.projects.filter((project) => project.status === "active").length,
      recentActivity: data.audit.slice(-10).reverse()
    };
  }
}

export { id, now };
