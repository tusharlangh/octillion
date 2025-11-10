class HybridHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  compare(a, b) {
    return a.semanticScore - b.keywordScore;
  }

  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  leftChild(i) {
    return 2 * i + 1;
  }

  rightChild(i) {
    return 2 * i + 2;
  }

  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}
