import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKidsTake01Plan,
  planVideoJob,
  validateVideoJob
} from "../src/core/video-job.js";

test("Take 01 is planned without starting external tools or GPU", () => {
  const plan = buildKidsTake01Plan();
  assert.equal(plan.status, "PLANNED");
  assert.equal(plan.readiness, "READY_FOR_ASSET_BINDING");
  assert.equal(plan.job.duration_limit_seconds, 120);
  assert.equal(plan.job.takes[0].take_id, "take-01");
  assert.equal(plan.execution.external_tools_started, false);
  assert.equal(plan.execution.heavy_gpu_started, false);
  assert.equal(plan.stages.length, 10);
  assert.equal(plan.validation.valid, true);
});

test("Kids duration limit blocks a job above two minutes", () => {
  const plan = buildKidsTake01Plan({ duration_limit_seconds: 121 });
  assert.equal(plan.status, "BLOCKED");
  assert.ok(plan.validation.errors.some((error) => error.includes("120 segundos")));
  assert.equal(plan.execution.heavy_gpu_started, false);
});

test("planning accepts a no-GPU mode but warns that animation must wait", () => {
  const plan = buildKidsTake01Plan({
    resource_policy: { gpu: "none" }
  });
  assert.equal(plan.status, "PLANNED");
  assert.ok(plan.validation.warnings.some((warning) => warning.includes("Sem GPU")));
  assert.equal(plan.resource.auto_start, false);
});

test("invalid references and missing human approval are blocked", () => {
  const result = planVideoJob({
    job_id: "invalid-job",
    route: "TB_LAB_KIDS",
    brief_ref: "not-a-ref",
    dna_refs: ["github://dna"],
    asset_refs: ["drive://frame.png"],
    music_ref: "drive://music.wav",
    duration_limit_seconds: 10,
    quality_profile: "kids_pilot_v1",
    resource_policy: { gpu: "local_then_cloud", auto_start: false },
    approval: { human_required: false },
    takes: [{ take_id: "take-01" }]
  });
  assert.equal(result.status, "BLOCKED");
  assert.ok(result.validation.errors.some((error) => error.includes("brief_ref")));
  assert.ok(result.validation.errors.some((error) => error.includes("human_required")));
});

test("validation remains pure and does not mutate the input job", () => {
  const job = {
    job_id: "pure-job",
    route: "TB_LAB_KIDS",
    brief_ref: "github://brief",
    dna_refs: ["github://dna"],
    asset_refs: ["drive://frame.png"],
    music_ref: "drive://music.wav",
    duration_limit_seconds: 10,
    quality_profile: "kids_pilot_v1",
    resource_policy: { gpu: "local_then_cloud", auto_start: false },
    approval: { human_required: true },
    takes: [{ take_id: "take-01" }]
  };
  const before = JSON.stringify(job);
  assert.equal(validateVideoJob(job).valid, true);
  assert.equal(JSON.stringify(job), before);
});
