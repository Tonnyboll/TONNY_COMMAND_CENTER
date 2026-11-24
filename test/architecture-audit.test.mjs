import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_AGENTS } from "../src/core/registry.js";
import { MissionOrchestrator } from "../src/core/orchestrator.js";
import { IntentRouter } from "../src/core/router.js";
import { AUDIT_PROFILES } from "../src/core/architecture-audit.js";

test("architecture audit plans ten roles in read-only mode without pretending execution", () => {
  const result = new MissionOrchestrator({registry:{list:()=>DEFAULT_AGENTS}}).plan({objective:"Auditoria oficial de arquitetura QDT"});
  assert.equal(result.type,"architecture-audit");
  assert.equal(result.mode,"READ_ONLY");
  assert.equal(result.execution,"NOT_EXECUTED");
  assert.equal(result.agents.length,10);
  assert.equal(new Set(result.agents.map(a=>a.id)).size,10);
  assert.ok(result.agents.every(a=>a.registration==="REGISTERED" && a.execution==="NOT_EXECUTED"));
  assert.ok(result.agents.some(a=>a.id==="qa-specialist" && a.externalProfile==="backend-development__test-automator"));
  assert.ok(!result.agents.some(a=>a.id==="implementation-agent"));
  assert.equal(result.reportContract.requiredProfiles.length,AUDIT_PROFILES.length);
});

test("audit exposes missing profiles and respects explicit activation", () => {
  const result = new MissionOrchestrator({registry:{list:()=>[]}}).plan({objective:"Auditar arquitetura"});
  assert.ok(result.agents.every(a=>a.registration==="MISSING"));
  const router = new IntentRouter();
  assert.equal(router.route("Auditoria de arquitetura",{activeProject:{id:"q",domain:"technology"}}).type,"mission_request");
  assert.equal(router.route("Auditoria de arquitetura").type,"informal_conversation");
});
