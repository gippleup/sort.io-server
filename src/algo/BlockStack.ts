type BlockStackProps = {
  limit: number, initialBlockState: number[]
}

class BlockStack {
  limit: number;
  stack: number[];
  constructor(option: BlockStackProps) {
    this.limit = option.limit;
    this.stack = option.initialBlockState;
  }

  get isEmpty() {
    if (!this.stack.length) {
      return true;
    } else {
      return false;
    }
  }
  
  get isFull() {
    if (this.limit <= this.stack.length) {
      return true;
    } else {
      return false;
    }
  }

  undock() {
    return this.stack.pop();
  }
  dock(block: number) {
    if (this.stack.length < this.limit) {
      this.stack.push(block);
    }
    return this.stack;
  }
}

export default BlockStack