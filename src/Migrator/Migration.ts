import {Scope} from '../Scope';
import {Store} from '../Store';
import {Run} from './Run';
import * as Knex from 'knex';
import * as Bluebird from 'bluebird';

export class Migration {

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}[]}
   */
  private builders: Array<{store: string, schemaBuilder: Knex.SchemaBuilder, knex: Knex}> = [];

  /**
   * @type {Function}
   */
  private migration: Function;

  /**
   * @type {Run}
   */
  private migrationRun: Run;

  /**
   * Holds whether or not this Migration is a promise.
   *
   * @type {boolean}
   */
  private promise: boolean = false;

  /**
   * Construct a new Migration.
   *
   * @param {Function} migration
   * @param {Run}      run
   */
  public constructor(migration: Function, run: Run) {
    this.migration     = migration;
    this.entityManager = run.getEntityManager();
    this.migrationRun  = run;

    this.prepare();
  }

  /**
   * Prepare the migration by running it.
   */
  private prepare(): void {
    let prepared = this.migration(this);

    if (prepared && 'then' in prepared) {
      this.promise = true;
    }
  }

  /**
   * Get a schemabuilder to work with.
   *
   * @param {string} store
   *
   * @returns {Knex.SchemaBuilder}
   */
  public getSchemaBuilder(store?: string): Knex.SchemaBuilder {
    return this.getBuilder(store).schema;
  }

  /**
   * Get a (reusable) transaction for `storeName`
   *
   * @param {string} storeName
   *
   * @returns {Bluebird<Knex.Transaction>}
   */
  public getTransaction(storeName?: string): Bluebird<Knex.Transaction> {
    return this.migrationRun.getTransaction(storeName);
  }

  /**
   * Get a builder. This includes the knex instance.
   *
   * @param {string} store
   *
   * @returns {{schema: Knex.SchemaBuilder, knex: Knex}}
   */
  public getBuilder(store?: string): {schema: Knex.SchemaBuilder, knex: Knex} {
    let connection    = this.getConnection(store);
    let schemaBuilder = connection.schema;

    this.builders.push({store, schemaBuilder, knex: connection});

    return {schema: schemaBuilder, knex: connection};
  }

  /**
   * Get the SQL for current builders.
   *
   * @returns {string}
   */
  public getSQL(): string {
    if (this.promise) {
      throw new Error("It's not possible to get SQL for a promise based migration.");
    }

    return this.builders.map(builder => builder.schemaBuilder.toString()).join('\n');
  }

  /**
   * Run the migration.
   *
   * @returns {Bluebird<any>}
   */
  public run(): Bluebird<any> {
    return Bluebird.each(this.builders, builder => {
      return this.getTransaction(builder.store).then(transaction => {
        return builder.schemaBuilder['transacting'](transaction).then();
      });
    });
  }

  /**
   * Get connection for store.
   *
   * @param {string} store
   *
   * @returns {knex}
   */
  private getConnection(store?: string): Knex {
    return this.entityManager.getStore(store).getConnection(Store.ROLE_MASTER);
  }
}
