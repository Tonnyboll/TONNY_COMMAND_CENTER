export function evaluateQuality({ findings = [], evidence = [], risk = "low" } = {}) {
  const unresolvedCritical = findings.filter((finding) =>
    ["critical", "high"].includes(String(finding.severity).toLowerCase()) && finding.resolved !== true
  );
  let status = "PASSED";
  let reason = "Há evidências suficientes e nenhum achado crítico não resolvido.";
  if (unresolvedCritical.length > 0) {
    status = "NEEDS_ATTENTION";
    reason = "Existem achados de alto risco que ainda não foram resolvidos.";
  } else if (evidence.length === 0) {
    status = "PENDING_EVIDENCE";
    reason = "O resultado não possui evidências registradas para validação.";
  }
  return {
    status,
    label: status === "PASSED" ? "VALIDADO" : status === "PENDING_EVIDENCE" ? "AGUARDANDO CONFIRMAÇÃO" : "FALHOU",
    risk,
    reason,
    findings,
    evidence
  };
}
