const IMPLEMENTATION_PATTERN = /\b(ajuste|ajustar|alterar|alteração|alteracao|corrigir|correção|correcao|implementar|migrar|homologar|homologação|homologacao|evoluir|evolução|evolucao|refatorar|deploy|bug|regressão|regressao)\b/i;
const API_PATTERN = /\b(api|endpoint|contrato|schema|gateway|integração|integracao|http|rest|backend|webhook)\b/i;
const DOMAIN_PATTERN = /\b(domínio|dominio|regra|invariante|orçamento|orcamento|faturamento|logística|logistica|financeiro|fiscal|estado|transição|transicao)\b/i;
const SECURITY_PATTERN = /\b(segurança|seguranca|autorização|autorizacao|permissão|permissao|credencial|segredo|token|risco|pagamento|financeiro|read-only|somente leitura)\b/i;
const QUALITY_PATTERN = /\b(teste|testes|homolog\w*|valida\w*|regress\w*|ci|coverage|cobertura|release|produção|producao)\b/i;
const RESEARCH_PATTERN = /\b(pesquisa|research|fonte|fontes|mercado|notícia|noticia|dado atual|candle|hunter)\b/i;

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("pt-BR");
}

function knowledgeText(knowledgeContext = {}) {
  return (knowledgeContext.entries || [])
    .map((entry) => [entry.title, entry.summary, ...(entry.tags || []), entry.domain, entry.project, ...(entry.projects || [])].join(" "))
    .join(" ");
}

function hasAny(text, pattern, extraText = "") {
  return pattern.test(`${text} ${extraText}`);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function inferAffectedAreas(text, contextText) {
  const areas = [];
  if (hasAny(text, API_PATTERN, contextText)) areas.push("API, contrato e integrações");
  if (hasAny(text, DOMAIN_PATTERN, contextText)) areas.push("domínio, regras e invariantes");
  if (hasAny(text, SECURITY_PATTERN, contextText)) areas.push("segurança, permissões e risco");
  if (hasAny(text, QUALITY_PATTERN, contextText)) areas.push("testes, validação e entrega");
  if (hasAny(text, RESEARCH_PATTERN, contextText)) areas.push("fontes, evidências e cobertura de pesquisa");
  return areas.length > 0 ? areas : ["componente identificado no pedido"];
}

function inferRisk(text, contextText) {
  if (hasAny(text, SECURITY_PATTERN, contextText)) return "high";
  if (hasAny(text, API_PATTERN, contextText) || hasAny(text, RESEARCH_PATTERN, contextText)) return "medium";
  return "low";
}

function compactEntry(entry) {
  return {
    id: entry.id,
    title: entry.title || entry.id,
    summary: entry.summary,
    domain: entry.domain,
    evidenceLevel: entry.evidenceLevel,
    sources: entry.sources || []
  };
}

export class MissionOrchestrator {
  constructor({ registry }) {
    this.registry = registry;
  }

  plan({ objective, project, context = {}, knowledge = {}, activation = false } = {}) {
    const text = normalize(objective);
    const contextText = normalize([
      project?.name,
      project?.domain,
      ...(context.facts || []),
      ...(context.decisions || []),
      knowledgeText(knowledge)
    ].join(" "));
    const implementation = IMPLEMENTATION_PATTERN.test(text);
    const entries = (knowledge.entries || []).map(compactEntry);
    const available = this.registry.list();
    const selected = [];

    const add = (id, phase, reason, capability = null) => {
      const agent = available.find((item) => item.id === id);
      if (!agent || selected.some((item) => item.id === id)) return;
      selected.push({
        id: agent.id,
        role: agent.id,
        phase,
        reason,
        matchedCapability: capability,
        capabilities: agent.capabilities || []
      });
    };

    const addByCapability = (capability, phase, reason, preferredId) => {
      const preferred = available.find((item) => item.id === preferredId && item.capabilities?.includes(capability));
      const candidate = preferred || this.registry.findBestForCapabilities([capability])[0];
      if (candidate) add(candidate.id, phase, reason, capability);
    };

    addByCapability("architecture_review", "diagnóstico", "Define a arquitetura afetada, dependências e sequência de trabalho.", "architect-review");
    if (hasAny(text, API_PATTERN, contextText)) {
      addByCapability("api_contract_review", "revisão especializada", "Verifica contrato, integração, schemas e compatibilidade da API.", "api-reviewer");
    }
    if (hasAny(text, DOMAIN_PATTERN, contextText)) {
      addByCapability("architecture_review", "revisão especializada", "Preserva regras e invariantes do domínio identificado.", "architect-review");
    }
    if (hasAny(text, SECURITY_PATTERN, contextText)) {
      addByCapability("security_review", "revisão especializada", "Avalia permissões, exposição de dados e risco da alteração.", "security-auditor");
    }
    if (implementation || hasAny(text, QUALITY_PATTERN, contextText)) {
      addByCapability("test_review", "validação", "Define testes, regressões e evidências proporcionais ao impacto.", "qa-specialist");
    }
    if (implementation) {
      addByCapability("code_implementation", "implementação", "Aplica a mudança dentro do escopo aprovado e executa a validação local.", "implementation-agent");
    }
    if (hasAny(text, RESEARCH_PATTERN, contextText)) {
      addByCapability("source_evaluation", "evidência", "Avalia cobertura, atualidade e limites das fontes usadas pela mudança.", "research-agent");
    }

    const agentIds = selected.map((agent) => agent.id);
    const phases = [
      { order: 1, name: "Diagnóstico arquitetural", agents: unique(agentIds.filter((id) => id === "architect-review")), output: "Contexto, impacto e invariantes afetados." },
      { order: 2, name: "Revisão especializada", agents: unique(agentIds.filter((id) => id !== "architect-review" && id !== "implementation-agent" && id !== "qa-specialist")), output: "Riscos, contratos e dependências revisados." },
      { order: 3, name: "Implementação controlada", agents: unique(agentIds.filter((id) => id === "implementation-agent")), output: "Alteração aplicada dentro do escopo definido." },
      { order: 4, name: "Validação e evidências", agents: unique(agentIds.filter((id) => id === "qa-specialist")), output: "Testes e evidências para o quality gate." }
    ].filter((phase) => phase.agents.length > 0);

    const evidence = entries.flatMap((entry) => entry.sources).slice(0, 12);
    const blockers = text ? [] : ["A missão não possui objetivo."];
    const confidence = entries.length > 0 ? "high" : "medium";

    return {
      type: "architectural-orchestration",
      activation,
      objective,
      project: project?.name || null,
      domain: project?.domain || null,
      context: {
        facts: context.facts || [],
        decisions: context.decisions || [],
        openQuestions: context.openQuestions || [],
        knowledgeEntries: entries,
        sourceCount: knowledge.sourceCount || 0,
        confidence
      },
      impact: {
        areas: inferAffectedAreas(text, contextText),
        risk: inferRisk(text, contextText),
        evidence
      },
      agents: selected,
      phases,
      assumptions: [
        "O escopo será mantido no projeto identificado.",
        "Contratos e testes atuais são a fonte de verdade quando houver divergência histórica."
      ],
      blockers,
      requiresConfirmation: blockers.length > 0,
      state: blockers.length > 0 ? "AGUARDANDO CONFIRMAÇÃO" : "PLANEJADO"
    };
  }
}

export { inferAffectedAreas, inferRisk };
