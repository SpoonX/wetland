/**
 * Represents Array collections.
 */
export class ArrayCollection<T> extends Array {

  /**
   * Add items to the collection when not already in the collection.
   *
   * @param {...*} items
   *
   * @returns this Fluent interface
   */
  add(...items: Array<any>): ArrayCollection<T> {
    items.forEach(item => {
      if (!this.includes(item)) {
        this.push(item);
      }
    });

    return this;
  }

  /**
   * Loop over each item in the collection, without worrying about index changes.
   *
   * @param {Function} callback
   *
   * @returns {ArrayCollection}
   */
  each(callback: (target: any) => void): ArrayCollection<T> {
    let target;

    while (target = this.pop()) {
      callback(target);
    }

    return this;
  }

  /**
   * Remove items from the collection when part of the collection.
   *
   * @param {...*} items
   *
   * @returns this Fluent interface
   */
  remove(...items: Array<any>): ArrayCollection<T> {
    items.forEach(item => {
      let itemIndex = this.indexOf(item);

      if (itemIndex > -1) {
        // Triggers a splice in proxy. Performance win is pretty big.
        delete this[itemIndex];
      }
    });

    return this;
  }
}
