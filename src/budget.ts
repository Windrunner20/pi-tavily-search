export class TurnBudget {
  #remaining: number;
  #generation = 0;

  constructor(readonly limit: number, readonly perCallLimit: number) {
    this.#remaining = limit;
  }

  reset(): void {
    this.#remaining = this.limit;
    this.#generation += 1;
  }

  reserve(): { bytes: number; settle(actualBytes: number): void } {
    const bytes = Math.min(this.perCallLimit, this.#remaining);
    const generation = this.#generation;
    this.#remaining -= bytes;
    let settled = false;
    return {
      bytes,
      settle: (actualBytes: number) => {
        if (settled || generation !== this.#generation) return;
        settled = true;
        this.#remaining += Math.max(0, bytes - actualBytes);
      },
    };
  }

  get remaining(): number {
    return this.#remaining;
  }
}
