// Mapping of canonical roles to installed profiles; registration is not execution.
export const AUDIT_PROFILES = [
  {
    "id": "architect-review",
    "externalProfile": "comprehensive-review__architect-review",
    "domain": "software_architecture",
    "capability": "architecture_review",
    "role": "Arquitetura"
  },
  {
    "id": "database-architect",
    "externalProfile": "database-design__database-architect",
    "domain": "engineering",
    "capability": "database_review",
    "role": "Dados"
  },
  {
    "id": "backend-architect",
    "externalProfile": "backend-development__backend-architect",
    "domain": "technology",
    "capability": "backend_review",
    "role": "Backend"
  },
  {
    "id": "security-auditor",
    "externalProfile": "security-scanning__security-auditor",
    "domain": "security",
    "capability": "security_review",
    "role": "Segurança"
  },
  {
    "id": "qa-specialist",
    "externalProfile": "backend-development__test-automator",
    "domain": "testing",
    "capability": "test_review",
    "role": "Testes"
  },
  {
    "id": "performance-engineer",
    "externalProfile": "application-performance__performance-engineer",
    "domain": "engineering",
    "capability": "performance_review",
    "role": "Performance"
  },
  {
    "id": "code-reviewer",
    "externalProfile": "comprehensive-review__code-reviewer",
    "domain": "engineering",
    "capability": "code_review",
    "role": "Código"
  },
  {
    "id": "context-manager",
    "externalProfile": "context-management__context-manager",
    "domain": "engineering",
    "capability": "context_review",
    "role": "Contexto"
  },
  {
    "id": "devops-troubleshooter",
    "externalProfile": "incident-response__devops-troubleshooter",
    "domain": "engineering",
    "capability": "deployment_review",
    "role": "DevOps"
  },
  {
    "id": "observability-engineer",
    "externalProfile": "observability-monitoring__observability-engineer",
    "domain": "engineering",
    "capability": "observability_review",
    "role": "Observabilidade"
  }
];

export function isArchitectureAudit(objective) {
  const text = String(objective ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return /\b(auditoria|auditar|audite)\b/.test(text) && /\b(arquitetura|arquitetural|multidisciplinar|dez|10)\b/.test(text);
}

export function planArchitectureAudit({objective,project,context,knowledge,available,activation}) {
  const agents = AUDIT_PROFILES.map(profile => ({
    ...profile, phase:"auditoria somente leitura", reason:profile.role,
    matchedCapability:profile.capability,
    capabilities:available.find(a=>a.id===profile.id)?.capabilities || [],
    registration:available.some(a=>a.id===profile.id)?"REGISTERED":"MISSING",
    execution:"NOT_EXECUTED"
  }));
  const entries = knowledge.entries || [];
  return {
    type:"architecture-audit", objective, activation, project:project?.name || null, domain:project?.domain || null,
    mode:"READ_ONLY", state:"PLANEJADO", execution:"NOT_EXECUTED", executor:"EXTERNAL_RUNNER_REQUIRED",
    context:{...context,knowledgeEntries:entries,sourceCount:knowledge.sourceCount||0},
    impact:{risk:"high",areas:AUDIT_PROFILES.map(p=>p.role),evidence:entries.flatMap(e=>e.sources||[]).slice(0,12)},
    agents, phases:[{order:1,name:"Auditoria especializada",agents:agents.map(a=>a.id),output:"Pareceres com evidência"}],
    blockers:["Executor externo não conectado; registro não comprova execução."],requiresConfirmation:false,
    reportContract:{
      requiredProfiles:AUDIT_PROFILES.map(p=>p.externalProfile),scoreRange:[0,10],
      aggregate:"Média simples dos pareceres válidos; informar cobertura; não aprovar gate incompleto.",
      evidenceRequired:["snapshot commit","arquivo/linha","risco","impacto","esforço","nota atual","nota potencial"],
      prohibitions:["Alterar código, banco, Git ou integrações","Inventar execução ou nota","Instalar agentes na VM de negócio"]
    }
  };
}
