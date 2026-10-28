import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { EMPTY_STATE, JsonStore } from "../src/core/store.js";
import { KnowledgeLayer } from "../src/core/knowledge.js";
import { TonyCore } from "../src/core/tony.js";
import { DEFAULT_AGENTS } from "../src/core/registry.js";
import { evaluateQuality } from "../src/core/quality-gate.js";

async function makeCore() {
  const directory = await mkdtemp(path.join(os.tmpdir(), "tony-test-"));
  const store = await new JsonStore(path.join(directory, "tony.json")).init();
  const core = await new TonyCore({ store }).initialize();
  return { core, store, cleanup: () => rm(directory, { recursive: true, force: true }) };
}

test("informal conversation is not persisted", async () => {
  const { core, store, cleanup } = await makeCore();
  try {
    const result = await core.handleMessage({ message: "O que você acha de política?" });
    assert.equal(result.mode, "informal");
    assert.equal(result.persisted, false);
    const state = store.snapshot();
    assert.equal(state.projects.length, 0);
    assert.equal(state.missions.length, 0);
    assert.equal(state.audit.length, 0);
  } finally {
    await cleanup();
  }
});

test("agent registry backfills new default agents in an existing store", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "tony-registry-"));
  try {
    const seed = { ...EMPTY_STATE, agents: [{ id: "architect-review", domain: "software_architecture" }] };
    const store = await new JsonStore(path.join(directory, "tony.json"), seed).init();
    const core = await new TonyCore({ store }).initialize();
    assert.ok(store.snapshot().agents.some((agent) => agent.id === "implementation-agent"));
    assert.equal(core.registry.list().length, DEFAULT_AGENTS.length);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("explicit activation consolidates context and creates the first mission", async () => {
  const { core, store, cleanup } = await makeCore();
  try {
    const result = await core.handleMessage({
      message: "TONY, vamos iniciar um projeto sobre a homologação da API do Félix.",
      history: [
        { role: "user", content: "Precisamos de uma revisão de segurança." },
        { role: "user", content: "Decidimos começar pelo contrato da API." }
      ]
    });
    assert.equal(result.state, "EXECUTADO");
    assert.equal(result.project.domain, "technology");
    assert.match(result.project.name, /homologação da API do Félix/i);
    assert.equal(result.mission.status, "PLANNED");
    assert.equal(result.project.context.decisions.length, 1);
    assert.equal(store.snapshot().projects.length, 1);
    assert.equal(store.snapshot().missions.length, 1);
  } finally {
    await cleanup();
  }
});

test("action inside active project becomes a planned mission", async () => {
  const { core, cleanup } = await makeCore();
  try {
    const activation = await core.handleMessage({ message: "TONY, criar projeto sobre o bot de WhatsApp." });
    const result = await core.handleMessage({
      message: "TONY, verifica por que o bot não está respondendo.",
      activeProjectId: activation.project.id
    });
    assert.equal(result.state, "PLANEJADO");
    assert.equal(result.mission.projectId, activation.project.id);
    assert.equal(result.mission.orchestration.type, "architectural-orchestration");
    assert.ok(result.mission.orchestration.agents.some((agent) => agent.id === "architect-review"));
  } finally {
    await cleanup();
  }
});

test("orchestrator derives impact and selects agents for an implementation", async () => {
  const { core, cleanup } = await makeCore();
  try {
    const result = await core.handleMessage({
      message: "TONY, iniciar projeto sobre ajuste da API do Félix com homologação e segurança."
    });
    const agentIds = result.mission.orchestration.agents.map((agent) => agent.id);
    assert.equal(result.mission.orchestration.state, "PLANEJADO");
    assert.deepEqual(result.mission.orchestration.impact.areas, [
      "API, contrato e integrações",
      "segurança, permissões e risco",
      "testes, validação e entrega"
    ]);
    assert.ok(agentIds.includes("architect-review"));
    assert.ok(agentIds.includes("api-reviewer"));
    assert.ok(agentIds.includes("security-auditor"));
    assert.ok(agentIds.includes("qa-specialist"));
    assert.ok(agentIds.includes("implementation-agent"));
    assert.equal(result.mission.orchestration.requiresConfirmation, false);
  } finally {
    await cleanup();
  }
});

test("project context takes priority when the inferred message domain is imprecise", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "tony-project-context-"));
  try {
    const store = await new JsonStore(path.join(directory, "tony.json")).init();
    const knowledge = await new KnowledgeLayer({
      publicFile: path.join(directory, "missing-public.json"),
      privateFile: path.join(directory, "private.json")
    }).init();
    await writeFile(path.join(directory, "private.json"), JSON.stringify({
      entries: [
        {
          id: "hunter-context",
          project: "TONY Hunter",
          domain: "research",
          tags: ["read-only", "risk"],
          summary: "Pesquisa somente leitura com evidências e cobertura de fontes.",
          sources: ["hunter/docs/ARCHITECTURE.md"]
        },
        {
          id: "hunter-evidence",
          project: "TONY Hunter",
          domain: "research",
          summary: "Cobertura de fontes e falhas registradas.",
          sources: ["hunter/tests/test_event_pipeline.py"]
        }
      ]
    }));
    await knowledge.init();
    const core = await new TonyCore({ store, knowledge }).initialize();
    const result = await core.handleMessage({ message: "TONY, iniciar projeto sobre ajuste no Hunter." });
    assert.equal(result.project.name, "TONY Hunter");
    assert.equal(result.project.knowledge.entries[0].id, "hunter-context");
    assert.equal(result.project.knowledge.state, "ANALISADO");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("quality gate does not validate a result without evidence", () => {
  const result = evaluateQuality({ findings: [], evidence: [] });
  assert.equal(result.status, "PENDING_EVIDENCE");
  assert.equal(result.label, "AGUARDANDO CONFIRMAÇÃO");
});

test("quality gate flags unresolved high risk findings", () => {
  const result = evaluateQuality({
    findings: [{ title: "Regression", severity: "high", resolved: false }],
    evidence: ["test-run-123"]
  });
  assert.equal(result.status, "NEEDS_ATTENTION");
  assert.equal(result.label, "FALHOU");
});

test("policy requires confirmation for write actions and records the request", async () => {
  const { core, store, cleanup } = await makeCore();
  try {
    const activation = await core.handleMessage({ message: "TONY, iniciar projeto sobre publicação do site." });
    const result = await core.requestTool({
      projectId: activation.project.id,
      tool: "github",
      action: "merge",
      parameters: { branch: "feature/test" }
    });
    assert.equal(result.state, "AGUARDANDO CONFIRMAÇÃO");
    assert.equal(result.request.execution, "NOT_EXECUTED");
    assert.equal(store.snapshot().audit.at(-1).type, "tool_request");
  } finally {
    await cleanup();
  }
});

test("explicit confirmation authorizes policy without pretending execution", async () => {
  const { core, cleanup } = await makeCore();
  try {
    const activation = await core.handleMessage({ message: "TONY, iniciar projeto sobre consulta de saúde." });
    const result = await core.requestTool({
      projectId: activation.project.id,
      tool: "calendar",
      action: "create",
      confirmed: true
    });
    assert.equal(result.state, "PLANEJADO");
    assert.equal(result.request.policy.status, "AUTHORIZED");
    assert.equal(result.request.execution, "NOT_EXECUTED");
  } finally {
    await cleanup();
  }
});

test("decisions are scoped to an active project", async () => {
  const { core, store, cleanup } = await makeCore();
  try {
    const activation = await core.handleMessage({ message: "TONY, iniciar projeto sobre arquitetura do Félix." });
    const result = await core.recordDecision({
      projectId: activation.project.id,
      title: "Contrato primeiro",
      decision: "Começar pelo contrato atual da API.",
      reason: "Reduzir divergência entre implementação e documentação.",
      evidence: ["conversation:activation"],
      impact: "Define a ordem da primeira missão."
    });
    assert.equal(result.state, "EXECUTADO");
    assert.equal(store.snapshot().decisions[0].projectId, activation.project.id);
  } finally {
    await cleanup();
  }
});

test("knowledge layer searches curated patterns without exposing raw source", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "tony-knowledge-"));
  try {
    await writeFile(path.join(directory, "public.json"), JSON.stringify({ entries: [
      { id: "gate", title: "Quality gate", domain: "quality", tags: ["evidence"], summary: "Require evidence before approval." }
    ] }));
    const knowledge = await new KnowledgeLayer({
      publicFile: path.join(directory, "public.json"),
      privateFile: path.join(directory, "missing-private.json")
    }).init();
    const result = knowledge.contextFor({ query: "evidence", domain: "quality" });
    assert.equal(result.entries[0].id, "gate");
    assert.equal(result.state, "ANALISADO");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
