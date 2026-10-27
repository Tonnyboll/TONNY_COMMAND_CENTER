const ACTIVATION_PATTERN = /\b(iniciar|começar|comecar|criar|abrir|ativar)\b[\s\S]{0,80}\b(projeto|missão|missao|contexto)\b/i;
const ACTION_PATTERN = /\b(verifica|verificar|analisa|analisar|investiga|investigar|implementa|implementar|corrige|corrigir|revisa|revisar|planeja|planejar|executa|executar|olha)\b/i;

function cleanName(value) {
  return value
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function inferDomain(message) {
  const text = message.toLowerCase();
  if (/\b(api|código|codigo|software|github|bot|desenvolv|arquitetura)\b/.test(text)) return "technology";
  if (/\b(mercado|cripto|trading|hunter|investimento|risco)\b/.test(text)) return "finance";
  if (/\b(viagem|hotel|voo|turismo)\b/.test(text)) return "travel";
  if (/\b(estudo|curso|aprender|escola)\b/.test(text)) return "studies";
  if (/\b(casa|família|filho|filhos)\b/.test(text)) return "family";
  return "general";
}

function inferProjectName(message) {
  const match = message.match(/\b(?:sobre|de|para)\s+(.+)$/i);
  if (match) return cleanName(match[1]) || "Novo projeto";
  return "Novo projeto";
}

function messageText(item) {
  return typeof item === "string" ? item : item?.content;
}

export class IntentRouter {
  route(message, { activeProject } = {}) {
    const text = String(message ?? "").trim();
    if (!text) return { type: "empty", domain: "general" };
    if (ACTIVATION_PATTERN.test(text)) {
      return {
        type: "activate_project",
        domain: inferDomain(text),
        projectName: inferProjectName(text)
      };
    }
    if (activeProject && ACTION_PATTERN.test(text)) {
      return { type: "mission_request", domain: activeProject.domain, projectId: activeProject.id };
    }
    if (activeProject) return { type: "project_message", domain: activeProject.domain, projectId: activeProject.id };
    return { type: "informal_conversation", domain: inferDomain(text) };
  }

  buildContextSnapshot(history = [], activationMessage = "") {
    const entries = history.map(messageText).filter((item) => typeof item === "string" && item.trim());
    const allText = [...entries, activationMessage].join("\n");
    const lines = allText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const decisions = lines.filter((line) => /\b(decidimos|decisão|decisao|vamos usar|foi definido)\b/i.test(line));
    const openQuestions = lines.filter((line) => /\?|pendente|aguardando|precisamos definir/i.test(line));
    const facts = lines
      .filter((line) => !decisions.includes(line) && !openQuestions.includes(line))
      .slice(-12);
    return {
      capturedAt: new Date().toISOString(),
      source: "conversation supplied by the user",
      facts,
      decisions,
      openQuestions,
      summary: `Contexto inicial consolidado a partir de ${lines.length} registro(s) da conversa. Revisão humana recomendada antes de decisões críticas.`
    };
  }
}

export { inferDomain, inferProjectName };
