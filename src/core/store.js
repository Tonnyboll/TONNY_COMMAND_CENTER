import fs from "node:fs/promises";
import path from "node:path";

const EMPTY_STATE = {
  version: 1,
  projects: [],
  agents: [],
  missions: [],
  decisions: [],
  audit: []
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export class JsonStore {
  constructor(filePath, seed = EMPTY_STATE) {
    this.filePath = filePath;
    this.seed = clone(seed);
    this.data = null;
  }

  async init() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      this.data = { ...clone(EMPTY_STATE), ...JSON.parse(raw) };
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      this.data = clone(this.seed);
      await this.save();
    }
    return this;
  }

  snapshot() {
    if (!this.data) throw new Error("Store has not been initialized");
    return clone(this.data);
  }

  async save() {
    const temporaryPath = `${this.filePath}.tmp`;
    const serialized = `${JSON.stringify(this.data, null, 2)}\n`;
    await fs.writeFile(temporaryPath, serialized, "utf8");
    try {
      await fs.rename(temporaryPath, this.filePath);
    } catch (error) {
      // Alguns ambientes Windows controlados bloqueiam rename mesmo no mesmo diretório.
      // Mantemos a escrita funcional e removemos o temporário nesse caso.
      if (!['EPERM', 'EEXIST', 'EXDEV'].includes(error.code)) throw error;
      await fs.writeFile(this.filePath, serialized, "utf8");
      await fs.rm(temporaryPath, { force: true });
    }
  }

  async update(mutator) {
    if (!this.data) throw new Error("Store has not been initialized");
    const result = await mutator(this.data);
    await this.save();
    return result;
  }
}

export { EMPTY_STATE };
