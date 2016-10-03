import * as knex from 'knex';
import {Hydrator} from './Hydrator';

export class Query {
  /**
   * Log all queries when true.
   *
   * @type {boolean}
   */
  private debug: Boolean = false;

  /**
   * @type {Hydrator}
   */
  private hydrator: Hydrator;

  /**
   * @type {{}}
   */
  private statement: knex.QueryBuilder;

  /**
   * Construct a new Query.
   *
   * @param {knex.QueryBuilder} statement
   * @param {Hydrator}          hydrator
   */
  public constructor(statement: knex.QueryBuilder, hydrator: Hydrator) {
    this.statement = statement;
    this.hydrator  = hydrator;
  }

  /**
   * Enable debugging for this query.
   *
   * @returns {Query}
   */
  public enableDebugging(): Query {
    this.debug = true;

    return this;
  }

  /**
   * Execute the query.
   *
   * @returns {Promise<[]>}
   */
  public execute(): Promise<Array<Object>> {
    // @todo Change this to a module-wide debug mode that sets up listeners. https://github.com/SpoonX/wetland/issues/35
    if (this.debug) {
      console.log(this.getSQL());
    }

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
    return this.execute().then(result => this.hydrator.hydrateAll(result));
  }

  /**
   * Get the SQL query for current query.
   *
   * @returns {string}
   */
  public getSQL(): string {
    return this.statement.toString();
  }

  /**
   * Get the statement for this query.
   *
   * @returns {knex.QueryBuilder}
   */
  public getStatement(): knex.QueryBuilder {
    return this.statement;
  }
}
