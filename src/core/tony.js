import crypto from "node:crypto";
import { AgentRegistry } from "./registry.js";
import { IntentRouter } from "./router.js";

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

function now() {
  return new Date().toISOString();
}

export class TonyCore {
  constructor({ store, registry = new AgentRegistry(store), router = new IntentRouter() }) {
    this.store = store;
    this.registry = registry;
    this.router = router;
  }

  async initialize() {
    await this.registry.ensureDefaults();
    return this;
  }

  async handleMessage({ message, history = [], activeProjectId = null } = {}) {
    const state = this.store.snapshot();
    const activeProject = state.projects.find((project) => project.id === activeProjectId);
    const intent = this.router.route(message, { activeProject });

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
        sourceMessage: message
      });
      return {
        state: "PLANEJADO",
        mode: "project",
        persisted: true,
        project: activeProject,
        mission,
        intent,
        message: "Missão registrada e pronta para execução."
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
      createdAt: timestamp,
      updatedAt: timestamp
    };
    const mission = {
      id: id("mission"),
      projectId: project.id,
      objective: message,
      status: "PLANNED",
      stateLabel: "PLANEJADO",
      source: "explicit project activation",
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

  async createMission({ projectId, objective, sourceMessage }) {
    const timestamp = now();
    const mission = {
      id: id("mission"),
      projectId,
      objective,
      sourceMessage,
      status: "PLANNED",
      stateLabel: "PLANEJADO",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await this.store.update((data) => {
      data.missions.push(mission);
      data.audit.push({ id: id("audit"), type: "mission_created", projectId, missionId: mission.id, timestamp });
    });
    return mission;
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
      activeProjects: data.projects.filter((project) => project.status === "active").length,
      recentActivity: data.audit.slice(-10).reverse()
    };
  }
}

export { id, now };
