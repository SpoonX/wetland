import {Wetland} from './Wetland';
import {Scope} from './Scope';
import {SchemaBuilder} from './SchemaBuilder';

export class Migrator {

  /**
   * @type {Wetland}
   */
  private wetland: Wetland;

  /**
   * @type {Scope}
   */
  private manager: Scope;

  /**
   * @type {SchemaBuilder}
   */
  private schemaBuilder: SchemaBuilder;

  /**
   *
   * @param {Wetland} wetland
   */
  public constructor(wetland: Wetland) {
    this.wetland = wetland;
    this.manager = wetland.getManager();
  }

  /**
   * Create your database schema.
   *
   * @returns {SchemaBuilder}
   */
  public create(): SchemaBuilder {
    if (!this.schemaBuilder) {
      this.schemaBuilder = new SchemaBuilder(this.manager);
    }

    return this.schemaBuilder.create();
  }
}
