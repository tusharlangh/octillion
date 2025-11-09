/**
 * MinHeap implementation for efficient top-K selection
 * Maintains the K smallest items (by score) in a heap
 * Used for finding top-K results without sorting all items
 */
export class MinHeap {
  constructor(maxSize) {
    this.heap = [];
    this.maxSize = maxSize;
  }

  /**
   * Compare function - compares semantic scores
   * We use min-heap to maintain top-K highest scores:
   * - Root contains the minimum score of our top-K
   * - When we find a score higher than root, we replace root
   * - Standard min-heap comparison (a - b) keeps smallest at root
   */
  compare(a, b) {
    return a.semanticScore - b.semanticScore;
  }

  /**
   * Get parent index
   */
  parent(i) {
    return Math.floor((i - 1) / 2);
  }

  /**
   * Get left child index
   */
  leftChild(i) {
    return 2 * i + 1;
  }

  /**
   * Get right child index
   */
  rightChild(i) {
    return 2 * i + 2;
  }

  /**
   * Swap two elements in the heap
   */
  swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  /**
   * Heapify up - maintain heap property when adding
   */
  heapifyUp(i) {
    while (i > 0 && this.compare(this.heap[this.parent(i)], this.heap[i]) > 0) {
      this.swap(i, this.parent(i));
      i = this.parent(i);
    }
  }

  /**
   * Heapify down - maintain heap property when removing
   */
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

  /**
   * Push an item into the heap
   * If heap is full and new item has higher score than min, replace min
   */
  push(item) {
    if (this.heap.length < this.maxSize) {
      this.heap.push(item);
      this.heapifyUp(this.heap.length - 1);
    } else if (
      this.heap.length > 0 &&
      item.semanticScore > this.heap[0].semanticScore
    ) {
      // Replace the minimum (root) with new item if it's better
      this.heap[0] = item;
      this.heapifyDown(0);
    }
  }

  /**
   * Get the minimum item (root)
   */
  peek() {
    return this.heap[0];
  }

  /**
   * Convert heap to sorted array (descending by score)
   */
  toArray() {
    const result = [...this.heap];
    return result.sort((a, b) => b.semanticScore - a.semanticScore);
  }

  /**
   * Get current size
   */
  size() {
    return this.heap.length;
  }
}
