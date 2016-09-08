import {Mapping} from './Mapping';
import {Scope} from './Scope';
import {EntityProxy} from './EntityProxy';
import {EntityHydrator} from './EntityHydrator';
import * as knex from 'knex';

export class Query {

  /**
   * @type {{}}}
   */
  private mappings: {[key: string]: Mapping};

  /**
   * @type {string}
   */
  private alias: string;

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}}
   */
  private statement: knex.QueryBuilder;

  /**
   * Construct a new Query.
   *
   * @param {knex.QueryBuilder} statement
   * @param {Scope}             entityManager
   */
  public constructor(statement: knex.QueryBuilder, entityManager: Scope) {
    this.statement     = statement;
    this.entityManager = entityManager;
  }

  /**
   * Get the statement (knex instance).
   *
   * @returns {knex.QueryBuilder}
   */
  public getStatement(): knex.QueryBuilder {
    return this.statement;
  }

  /**
   * Set mappings.
   *
   * @param {{}} mappings
   *
   * @returns {Query} Fluent interface
   */
  public setMappings(mappings: {[key: string]: Mapping}): Query {
    this.mappings = mappings;

    return this;
  }

  /**
   * Set the alias for the host.
   *
   * @param {string} alias
   *
   * @returns {Query}
   */
  public setAlias(alias: string): Query {
    this.alias = alias;

    return this;
  }

  /**
   * Execute the query.
   *
   * @returns {Promise<[]>}
   */
  public execute(): Promise<Array<Object>> {
    return this.statement.then();
  }

  /**
   * Get a single scalar result (for instance for count, sum or max).
   *
   * @returns {Promise<number>}
   */
  public getSingleScalarResult(): Promise<number> {
    return this.execute().then(result => {
      if (!result || typeof result[0] !== 'object') {
        return null;
      }

      return result[0][Object.keys(result[0])[0]];
    });
  }

  /**
   * Get the result for the query.
   *
   * @returns {Promise<{}[]>}
   */
  public getResult(): Promise<Array<Object>> {
    return this.execute().then(result => this.hydrateEntities(result, this.alias));
  }

  /**
   * Hydrate provided rows to entities.
   *
   * @param {{}[]}   rows
   * @param {string} alias
   *
   * @returns {{}[]}
   */
  private hydrateEntities(rows: Array<Object>, alias: string): Array<Object> {
    return rows.map(row => this.hydrateEntity(row, alias));
  }

  /**
   * Hydrate an entity.
   *
   * @param {{}}     row
   * @param {string} alias
   *
   * @returns {{}}
   */
  private hydrateEntity(row: Object, alias: string): Object {
    let EntityClass = this.entityManager.getEntity(this.mappings[alias].getEntityName());

    return EntityProxy.patch(EntityHydrator.fromSchema(row, EntityClass), this.entityManager.getUnitOfWork());
  }

  /**
   * Get the SQL query for current query.
   *
   * @returns {string}
   */
  public getSQL(): string {
    return this.statement.toString();
  }
}
