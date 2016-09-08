import * as knex from 'knex';
import {Query} from './Query';
import {Mapping} from './Mapping';
import {Criteria} from './Criteria';
import {Scope} from './Scope';

export class QueryBuilder {

  /**
   * @type {Query}
   */
  private query: Query;

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
   * @type {Mapping}
   */
  private mapping: Mapping;

  /**
   * @type {Criteria}
   */
  private criteria: Criteria;

  /**
   * @type {{}}
   */
  private mappings: {[key: string]: Mapping};

  /**
   * @type {string[]}
   */
  private functions: Array<string> = ['sum', 'count', 'max', 'min', 'avg'];

  /**
   * Construct a new QueryBuilder.
   *
   * @param {Scope}   entityManager
   * @param {Query}   query
   * @param {Mapping} mapping
   * @param {string}  alias
   */
  public constructor(entityManager: Scope, query: Query, mapping: Mapping, alias: string) {
    this.query         = query;
    this.alias         = alias;
    this.mappings      = {[alias]: mapping};
    this.statement     = query.getStatement();
    this.criteria      = new Criteria(this.statement, mapping, this.mappings);
    this.entityManager = entityManager;

    query.setMappings(this.mappings).setAlias(alias);
  }

  /**
   * Get the Query.
   *
   * @returns {Query}
   */
  public getQuery(): Query {
    return this.query;
  }

  /**
   * Columns to select. Chainable, and allows an array of arguments typed below.
   *
   *  .select('f');           // select f.*
   *  .select('f.name')       // select f.name
   *  .select({sum: 'field'}) // select sum(field)
   *
   * @param {string[]|string|{}} alias
   *
   * @returns {QueryBuilder}
   */
  public select(alias: Array<string> | string | {[key: string]: string}): QueryBuilder {
    if (Array.isArray(alias)) {
      alias.forEach(value => {
        this.select(value);
      });

      return this;
    }

    if (typeof alias === 'string') {
      if (alias.indexOf('.') > -1) {
        this.statement.select(this.criteria.mapToColumn(alias));
      } else {
        this.statement.select(this.mappings[alias].getColumns(alias));
      }
    } else if (typeof alias === 'object') {
      Object.getOwnPropertyNames(alias).forEach(selectFunction => {
        if (this.functions.indexOf(selectFunction) === -1) {
          throw new Error(`Unknown function "${selectFunction}" specified.`);
        }

        this.statement[selectFunction](this.criteria.mapToColumn(alias[selectFunction]));
      });
    } else {
      throw new Error('Unexpected value for .select()');
    }

    return this;
  }

  /**
   * Signal an insert.
   *
   * @param {{}}     values
   * @param {string} [returning]
   *
   * @returns {QueryBuilder}
   */
  public insert(values, returning?: string): QueryBuilder {
    this.statement.insert(this.mapToColumns(values), returning);

    return this;
  }

  /**
   * Signal an update.
   *
   * @param {{}}     values
   * @param {string} [returning]
   *
   * @returns {QueryBuilder}
   */
  public update(values, returning?: any): QueryBuilder {
    this.statement.update(this.mapToColumns(values), returning);

    return this;
  }

  /**
   * Set the limit.
   *
   * @param {number} limit
   *
   * @returns {QueryBuilder}
   */
  public limit(limit): QueryBuilder {
    this.statement.limit(limit);

    return this;
  }

  /**
   * Set the offset.
   *
   * @param {number} offset
   *
   * @returns {QueryBuilder}
   */
  public offset(offset): QueryBuilder {
    this.statement.offset(offset);

    return this;
  }

  /**
   * Set the order by.
   *
   *  .orderBy('name')
   *  .orderBy('name', 'desc')
   *  .orderBy({name: 'desc'})
   *  .orderBy(['name', {age: 'asc'}])
   *
   * @param {string|string[]|{}} orderBy
   * @param {string}             [direction]
   *
   * @returns {QueryBuilder}
   */
  public orderBy(orderBy: string | Array<string> | Object, direction?): QueryBuilder {
    if (typeof orderBy === 'string') {
      this.statement.orderBy(this.criteria.mapToColumn(orderBy), direction);
    } else if (Array.isArray(orderBy)) {
      orderBy.forEach(order => this.orderBy(order));
    } else if (typeof orderBy === 'object') {
      let property = Object.keys(orderBy)[0];

      this.orderBy(property, orderBy[property]);
    }

    return this;
  }

  /**
   * Signal a delete.
   *
   * @returns {QueryBuilder}
   */
  public remove(): QueryBuilder {
    this.statement.del();

    return this;
  }

  /**
   * Sets the where clause.
   *
   *  .where({name: 'Wesley'})
   *  .where({name: ['Wesley', 'Roberto']}
   *  .where({name: 'Wesley', company: 'SpoonX', age: {gt: '25'}})
   *
   * @param {{}} criteria
   *
   * @returns {QueryBuilder}
   */
  public where(criteria: Object): QueryBuilder {
    if (Object.getOwnPropertyNames(criteria).length === 0) {
      return this;
    }

    this.criteria.apply(criteria);

    return this;
  }

  /**
   * Map provided values to columns.
   *
   * @param {{}[]} values
   *
   * @returns {{}[]|{}}
   */
  private mapToColumns(values: Array<Object> | Object): Array<Object> | Object {
    let mappedValues;

    if (Array.isArray(values)) {
      mappedValues = [];

      values.forEach(value => {
        mappedValues.push(this.mapToColumns(value));
      });

      return mappedValues;
    }

    mappedValues = {};

    Object.getOwnPropertyNames(values).forEach(property => {
      let fieldName = this.criteria.mapToColumn(property);

      if (!fieldName) {
        throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
      }

      mappedValues[fieldName] = values[property];
    });

    return mappedValues;
  }
}
