import {Wetland} from './Wetland';
import {SchemaBuilder} from './SchemaBuilder';

export class SchemaManager {
  /**
   * @type {Wetland}
   */
  private wetland: Wetland;

  /**
   * @type {SchemaBuilder}
   */
  private schemaBuilder: SchemaBuilder;

  /**
   * @param {Wetland} wetland
   */
  constructor(wetland: Wetland) {
    this.wetland       = wetland;
    this.schemaBuilder = new SchemaBuilder(wetland.getManager());
  }

  /**
   * Get the sql for schema.
   *
   * @param {{}}      [previous] Optional starting point to diff against.
   * @param {boolean} [revert]
   *
   * @returns {string}
   */
  public getSQL(previous: Object = {}, revert: boolean = false): string {
    return this.prepare(previous, revert).getSQL();
  }

  /**
   * Get the code for schema.
   *
   * @param {{}}      [previous] Optional starting point to diff against.
   * @param {boolean} [revert]
   *
   * @returns {string}
   */
  public getCode(previous: Object = {}, revert: boolean = false): string {
    return this.prepare(previous, revert).getCode();
  }

  /**
   * Create the schema (alias for `.apply({})`)
   *
   * @returns {Promise<any>}
   */
  public create(): Promise<any> {
    return this.apply({});
  }

  /**
   * Diff and execute.
   *
   * @param {{}}      [previous] Optional starting point to diff against.
   * @param {boolean} [revert]
   *
   * @returns {Promise<any>}
   */
  public apply(previous: Object = {}, revert: boolean = false): Promise<any> {
    return this.prepare(previous, revert).apply();
  }

  /**
   * Prepare (diff) instructions.
   *
   * @param {{}}      previous
   * @param {boolean} [revert]
   *
   * @returns {SchemaBuilder}
   */
  private prepare(previous: Object, revert: boolean = false) {
    let snapshot     = this.wetland.getSnapshotManager();
    let serializable = snapshot.getSerializable();
    let instructions;

    if (revert) {
      instructions = snapshot.diff(serializable, previous);
    } else {
      instructions = snapshot.diff(previous, serializable);
    }

    return this.schemaBuilder.process(instructions);
  }
}
