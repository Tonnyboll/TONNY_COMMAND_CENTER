import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { JsonStore } from "../src/core/store.js";
import { TonyCore } from "../src/core/tony.js";
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
  } finally {
    await cleanup();
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
