import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { KnowledgeLayer } from "../src/core/knowledge.js";
import { JsonStore } from "../src/core/store.js";
import { TonyCore } from "../src/core/tony.js";
import { DEFAULT_AGENTS } from "../src/core/registry.js";

const catalog = fileURLToPath(new URL("../knowledge/curated.json", import.meta.url));

test("QDT catalogue is unique, sourced and contains all durable milestones", async () => {
  const data = JSON.parse(await fs.readFile(catalog, "utf8"));
  const ids = data.entries.map(entry => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ["qdt-v2-architecture", "qdt-meta-transport", "qdt-calendar-legacy",
    "qdt-calendar-flow-snapshot", "qdt-owner-domain-invariants", "qdt-integrator-evidence-and-release",
    "signed-event-delivery-and-durable-claims", "legacy-aware-availability-snapshots"]) {
    const entry = data.entries.find(item => item.id === id);
    assert.ok(entry, id);
    assert.ok(entry.evidenceLevel);
    assert.ok(entry.sources.every(source => source.startsWith("https://github.com/Tonnyboll/API_QDT_BOT/")));
  }
});

test("activating QDT retrieves actual curated knowledge and plans existing specialists", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "tony-qdt-test-"));
  try {
    const knowledge = new KnowledgeLayer({publicFile: catalog, privateFile: path.join(dir, "missing.json")});
    const store = await new JsonStore(path.join(dir, "tony.json")).init();
    const core = await new TonyCore({store, knowledge}).initialize();
    for (const alias of ["QDT", "Quintal do Tuta", "API_QDT_BOT", "Bot de WhatsApp"]) {
      const result = await core.handleMessage({message: "TONY, iniciar projeto sobre " + alias + " para implementar integração e homologar agenda."});
      assert.equal(result.state, "EXECUTADO");
      const entries = result.project.knowledge.entries;
      assert.ok(entries.some(entry => entry.id === "qdt-calendar-flow-snapshot"), alias);
      assert.ok(entries.some(entry => entry.id === "qdt-owner-domain-invariants"), alias);
      assert.equal(result.mission.status, "PLANNED");
      const agents = result.mission.orchestration.agents.map(a => a.id);
      for (const id of ["architect-review", "api-reviewer", "security-auditor", "qa-specialist", "implementation-agent"]) {
        assert.ok(agents.includes(id), id);
        assert.ok(DEFAULT_AGENTS.some(a => a.id === id));
      }
    }
    assert.equal(knowledge.contextFor({query:"agenda QDT",project:"Félix"}).entries.some(e=>e.id.startsWith("qdt-")), false);
    assert.ok(knowledge.contextFor({query:"snapshot legado",domain:"engineering"}).entries.some(e=>e.id==="legacy-aware-availability-snapshots"));
    const other = await core.handleMessage({message:"TONY, iniciar projeto sobre xqdtx."});
    assert.notEqual(other.project.name,"QDT V2");
  } finally {
    await fs.rm(dir,{recursive:true,force:true});
  }
});
