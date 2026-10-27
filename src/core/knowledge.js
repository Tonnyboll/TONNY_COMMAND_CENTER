import fs from "node:fs/promises";
import path from "node:path";

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("pt-BR");
}

function tokens(value) {
  return normalize(value).split(/[^\p{L}\p{N}]+/u).filter((token) => token.length > 2);
}

export class KnowledgeLayer {
  constructor({ publicFile, privateFile }) {
    this.publicFile = publicFile;
    this.privateFile = privateFile;
    this.data = { version: 1, entries: [] };
    this.privateData = { version: 1, sources: [], entries: [] };
  }

  async init() {
    this.data = await this.#readJson(this.publicFile, this.data);
    this.privateData = await this.#readJson(this.privateFile, this.privateData);
    return this;
  }

  async #readJson(filePath, fallback) {
    try {
      return JSON.parse(await fs.readFile(filePath, "utf8"));
    } catch (error) {
      if (error.code === "ENOENT") return fallback;
      throw error;
    }
  }

  entries() {
    return [...(this.data.entries || []), ...(this.privateData.entries || [])];
  }

  sources() {
    return this.privateData.sources || [];
  }

  projects() {
    const names = this.entries().flatMap((entry) => [
      entry.project,
      ...(entry.projects || [])
    ]);
    return [...new Set(names.filter(Boolean))];
  }

  search(query = "", { domain, project } = {}) {
    const queryTokens = tokens(query);
    return this.entries()
      .filter((entry) => {
        const requested = normalize(project);
        const names = [entry.project, ...(entry.projects || [])]
          .filter(Boolean)
          .map(normalize);
        const projectMatch = !project || names.length === 0 || names.some((name) => name === requested || name.includes(requested) || requested.includes(name));
        if (!projectMatch) return false;
        // Quando o projeto é identificado, sua evidência tem prioridade sobre
        // o domínio inferido a partir de uma frase curta.
        if (project && names.length > 0) return true;
        return !domain || entry.domain === domain || entry.domains?.includes(domain);
      })
      .map((entry) => {
        const haystack = tokens([entry.title, entry.summary, ...(entry.tags || []), ...(entry.sources || [])].join(" "));
        const score = queryTokens.filter((token) => haystack.includes(token)).length;
        return { entry, score };
      })
      .filter((item) => queryTokens.length === 0 || item.score > 0)
      .sort((left, right) => right.score - left.score || String(left.entry.title || left.entry.id || "").localeCompare(String(right.entry.title || right.entry.id || "")))
      .map((item) => item.entry);
  }

  contextFor({ query = "", domain, project } = {}) {
    return {
      query,
      domain,
      project,
      entries: this.search(query, { domain, project }).slice(0, 8),
      sourceCount: this.sources().length,
      state: "ANALISADO"
    };
  }
}

export class EmptyKnowledgeLayer {
  async init() { return this; }
  entries() { return []; }
  sources() { return []; }
  projects() { return []; }
  search() { return []; }
  contextFor({ query = "", domain, project } = {}) {
    return { query, domain, project, entries: [], sourceCount: 0, state: "ANALISADO" };
  }
}

export { tokens };
