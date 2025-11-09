export class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  compare(a, b) {
    return a.semanticScore - b.semanticScore;
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

  heapifyUp(i) {
    while (i > 0 && this.compare(this.heap[this.parent(i)], this.heap[i]) > 0) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  heapifyDown(i) {
    let min = i;
    const left = this.leftChild(i);
    const right = this.rightChild(i);

    if (
      left < this.heap.length &&
      this.compare(this.heap[left], this.heap[min]) < 0
    ) {
      min = left;
    }

    if (
      right < this.heap.length &&
      this.compare(this.heap[right], this.heap[min]) < 0
    ) {
      min = right;
    }

    if (min !== i) {
      this.swap(i, min);
      this.heapifyDown(min);
    }
  }

  push(item) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
    } else if (
      this.heap.length > 0 &&
      item.semanticScore > this.heap[0].semanticScore
    ) {
      this.heap[0] = item;
      this.heapifyDown(0);
    }
  }

  peek() {
    return this.heap[0];
  }

  toArray() {
    const result = [...this.heap];
    return result.sort((a, b) => b.semanticScore - a.semanticScore);
  }

  size() {
    return this.heap.length;
  }
}
