/**
 * A raw query
 */
export class Raw {
  /**
   * @type {string}
   */
  private query: string;

  /**
   * @param {string} query
   */
  public constructor(query) {
    this.setQuery(query);
  }

  /**
   * @returns {string}
   */
  getQuery(): string {
    return this.query;
  }

  /**
   * @param {string} value
   */
  setQuery(value: string) {
    this.query = value;
  }
}
