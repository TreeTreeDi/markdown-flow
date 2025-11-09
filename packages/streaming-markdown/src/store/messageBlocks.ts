import type { MessageBlock } from '../types/message';

export class MessageBlockStore {
  private blocks = new Map<string, MessageBlock>();

  upsert(block: MessageBlock): void;
  upsert(blocks: MessageBlock[]): void;
  upsert(input: MessageBlock | MessageBlock[]): void {
    const list = Array.isArray(input) ? input : [input];
    for (const block of list) {
      this.blocks.set(block.id, block);
    }
  }

  selectById(id: string): MessageBlock | undefined {
    return this.blocks.get(id);
  }

  selectMany(ids: string[]): MessageBlock[] {
    return ids
      .map((id) => this.blocks.get(id))
      .filter((block): block is MessageBlock => Boolean(block));
  }

  remove(id: string): void;
  remove(ids: string[]): void;
  remove(input: string | string[]): void {
    const list = Array.isArray(input) ? input : [input];
    for (const blockId of list) {
      this.blocks.delete(blockId);
    }
  }

  clear(): void {
    this.blocks.clear();
  }

  selectAll(): MessageBlock[] {
    return Array.from(this.blocks.values());
  }

  toJSON(): Record<string, MessageBlock> {
    return Object.fromEntries(this.blocks.entries());
  }
}

export const messageBlockStore = new MessageBlockStore();
