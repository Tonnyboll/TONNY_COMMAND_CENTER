const READ_ACTIONS = new Set(["read", "search", "inspect", "healthcheck"]);
const WRITE_ACTIONS = new Set(["create", "update", "delete", "send", "deploy", "merge"]);

export class PolicyLayer {
  evaluate({ tool, action, confirmed = false } = {}) {
    if (!tool || !action) {
      return { allowed: false, status: "INVALID", reason: "Tool and action are required." };
    }
    const normalizedAction = String(action).toLowerCase();
    if (READ_ACTIONS.has(normalizedAction)) {
      return { allowed: true, status: "PERMITTED", reason: "Read-only action within policy." };
    }
    if (WRITE_ACTIONS.has(normalizedAction)) {
      if (confirmed === true) {
        return { allowed: true, status: "AUTHORIZED", reason: "Write action explicitly confirmed by the user." };
      }
      return { allowed: false, status: "CONFIRMATION_REQUIRED", reason: "Write actions require explicit confirmation." };
    }
    return { allowed: false, status: "DENIED", reason: "Action is not registered in the policy layer." };
  }
}

export { READ_ACTIONS, WRITE_ACTIONS };
