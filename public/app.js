const state = { activeProjectId: null, history: [] };
const $ = (selector) => document.querySelector(selector);

function addMessage(text, role = "system") {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  item.textContent = text;
  $("#messages").appendChild(item);
  $("#messages").scrollTop = $("#messages").scrollHeight;
}

function renderActivity(items = []) {
  const target = $("#activity");
  target.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nenhuma atividade persistente.";
    target.appendChild(empty);
    return;
  }
  for (const item of items) {
    const row = document.createElement("div");
    row.className = "activity-row";
    const type = document.createElement("strong");
    type.textContent = item.type;
    const timestamp = document.createElement("span");
    timestamp.textContent = new Date(item.timestamp).toLocaleString("pt-BR");
    row.append(type, timestamp);
    target.appendChild(row);
  }
}

function renderOrchestration(plan = null) {
  const target = $("#orchestration");
  const state = $("#orchestration-state");
  target.replaceChildren();
  if (!plan) {
    state.textContent = "aguardando";
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "Nenhuma missão arquitetada.";
    target.appendChild(empty);
    return;
  }
  state.textContent = plan.state || "PLANEJADO";
  const summary = document.createElement("p");
  summary.className = "muted";
  summary.textContent = `${plan.project || "Projeto"} · risco ${plan.impact?.risk || "não classificado"}`;
  target.appendChild(summary);
  for (const agent of plan.agents || []) {
    const row = document.createElement("div");
    row.className = "plan-row";
    const name = document.createElement("strong");
    name.textContent = agent.id;
    const reason = document.createElement("span");
    reason.textContent = agent.reason;
    row.append(name, reason);
    target.appendChild(row);
  }
  const areas = document.createElement("p");
  areas.className = "muted";
  areas.textContent = `Impacto: ${(plan.impact?.areas || []).join(" · ")}`;
  target.appendChild(areas);
}

async function refresh() {
  const [health, dashboard] = await Promise.all([
    fetch("/api/health").then((response) => response.json()),
    fetch("/api/dashboard").then((response) => response.json())
  ]);
  $("#health").textContent = health.status;
  $("#agents").textContent = dashboard.agents;
  $("#projects").textContent = dashboard.projects;
  $("#missions").textContent = dashboard.missions;
  $("#audit").textContent = dashboard.auditEvents;
  $("#knowledge").textContent = dashboard.knowledgeEntries;
  renderActivity(dashboard.recentActivity);
}

$("#command-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = $("#command");
  const message = input.value.trim();
  if (!message) return;
  input.value = "";
  addMessage(message, "user");
  state.history.push({ role: "user", content: message });
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, history: state.history, activeProjectId: state.activeProjectId })
  });
  const result = await response.json();
  if (result.project?.id) state.activeProjectId = result.project.id;
  addMessage(`${result.state}: ${result.message || "Solicitação analisada."}`);
  renderOrchestration(result.mission?.orchestration || result.project?.orchestration || null);
  await refresh();
});

refresh().catch((error) => addMessage(`FALHOU: ${error.message}`));
