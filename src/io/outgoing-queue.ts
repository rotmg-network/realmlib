/** Small bounded FIFO used by PacketIO's serialized socket writer. */
export class OutgoingQueue<T> {
  private items: T[] = [];

  constructor(readonly maximumSize: number) {
    if (!Number.isInteger(maximumSize) || maximumSize < 1) {
      throw new RangeError('maximumSize must be a positive integer');
    }
  }

  get size(): number {
    return this.items.length;
  }

  get full(): boolean {
    return this.items.length >= this.maximumSize;
  }

  push(item: T): void {
    if (this.full) {
      throw new RangeError(`queue limit ${this.maximumSize} reached`);
    }
    this.items.push(item);
  }

  shift(): T | undefined {
    return this.items.shift();
  }

  clear(): number {
    const count = this.items.length;
    this.items = [];
    return count;
  }
}
