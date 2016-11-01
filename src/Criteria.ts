import {Mapping} from './Mapping';
import * as knex from 'knex';

/**
 * Parse and apply criteria to statement.
 */
export class Criteria {

  /**
   * @type {string}
   */
  public static CLAUSE_HAVING: string = 'having';

  /**
   * @type {string}
   */
  public static CLAUSE_WHERE: string = 'where';

  /**
   * Available operators and the handlers.
   *
   * @type {{}}
   */
  private operators = {
    '<'                 : {operator: '<', value: value => value},
    'lt'                : {operator: '<', value: value => value},
    'lessThan'          : {operator: '<', value: value => value},
    '<='                : {operator: '<=', value: value => value},
    'lte'               : {operator: '<=', value: value => value},
    'lessThanOrEqual'   : {operator: '<=', value: value => value},
    '>'                 : {operator: '>', value: value => value},
    'gt'                : {operator: '>', value: value => value},
    'greaterThan'       : {operator: '>', value: value => value},
    '>='                : {operator: '>=', value: value => value},
    'greaterThanOrEqual': {operator: '>=', value: value => value},
    'gte'               : {operator: '>=', value: value => value},
    '!'                 : {operator: '!', value: value => value},
    'not'               : {operator: '!', value: value => value},
    'like'              : {operator: 'like', value: value => value},
    'contains'          : {operator: 'like', value: value => `%${value}%`},
    'startsWith'        : {operator: 'like', value: value => `${value}%`},
    'endsWith'          : {operator: 'like', value: value => `%${value}`}
  };

  /**
   * Maps operators to knex methods.
   *
   * @type {{}}
   */
  private operatorKnexMethod: {and: {[key: string]: string}, or: {[key: string]: string}} = {
    and: {[Criteria.CLAUSE_WHERE]: 'where', [Criteria.CLAUSE_HAVING]: 'having'},
    or : {[Criteria.CLAUSE_WHERE]: 'orWhere', [Criteria.CLAUSE_HAVING]: 'orHaving'}
  };

  /**
   * Mapping for the host entity.
   *
   * @type {Mapping}
   */
  private hostMapping: Mapping<any>;

  /**
   * Mappings for entities (joins).
   *
   * @type {{}}
   */
  private mappings: {[key: string]: Mapping<any>};

  /**
   * Statement to apply criteria to.
   *
   * {knex.QueryBuilder}
   */
  private statement: knex.QueryBuilder;

  /**
   * Criteria staged to apply.
   *
   * @type {Array}
   */
  private staged: Array<{method: string, criteria: Object}> = [];

  /**
   * Construct a new Criteria parser.
   * @constructor
   *
   * @param {knex.QueryBuilder} statement
   * @param {Mapping}           hostMapping
   * @param {{}}                [mappings]
   */
  public constructor(statement: knex.QueryBuilder, hostMapping: Mapping<any>, mappings?: {[key: string]: Mapping<any>}) {
    this.statement   = statement;
    this.mappings    = mappings || {};
    this.hostMapping = hostMapping;
  }

  /**
   * Stage criteria to be applied later.
   *
   * @param {{}}     criteria
   * @param {string} method
   *
   * @returns {Criteria}
   */
  public stage(criteria: Object, method: string = Criteria.CLAUSE_WHERE): Criteria {
    if (method !== Criteria.CLAUSE_WHERE && method !== Criteria.CLAUSE_HAVING) {
      throw new Error('Invalid criteria method supplied.');
    }

    this.staged.push({method, criteria});

    return this;
  }

  /**
   * Apply staged criteria.
   *
   * @returns {Criteria}
   */
  public applyStaged(): Criteria {
    this.staged.forEach(criteria => {
      this.apply(criteria.method, criteria.criteria);
    });

    this.staged = [];

    return this;
  }

  /**
   * Apply provided criteria to the statement.

   * @param {string}            [parentKnexMethodName]
   * @param {{}}                criteria
   * @param {knex.QueryBuilder} [statement]
   * @param {string}            [parentKey]
   *
   * @return Criteria
   */
  public apply(parentKnexMethodName: string, criteria: Object, statement?: knex.QueryBuilder, parentKey?: string): Criteria {
    statement = statement || this.statement;

    Object.keys(criteria).forEach(key => {
      let value = criteria[key];

      if (!(value === null || typeof value !== 'object') && value.constructor === Object) {
        return this.apply(parentKnexMethodName, value, statement, key);
      }

      if (this.operatorKnexMethod[key]) {
        return this.queryByMethod(statement, key, value, this.operatorKnexMethod[key]);
      }

      let operator = '=';

      if (this.operators[key]) {
        value    = this.operators[key].value(value);
        operator = this.operators[key].operator;
      }

      if (Array.isArray(value) && operator === '=') {
        operator = 'in';
      }

      key = this.mapToColumn(parentKey || key);

      return statement[parentKnexMethodName](key, operator, value);
    });

    return this;
  }

  /**
   * Map a property to a column name.
   *
   * @param {string} property
   *
   * @returns {string}
   */
  public mapToColumn(property: string): string {
    if (property.indexOf('.') > -1) {
      let parts = property.split('.');
      parts[1]  = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);

      return parts.join('.');
    }

    return this.hostMapping.getFieldName(property, property);
  }

  /**
   * Query a specific knex method.
   *
   * @param {knex.QueryBuilder} statement
   * @param {string}            key
   * @param {*}                 value
   * @param {string}            knexMethodName
   */
  private queryByMethod(statement: knex.QueryBuilder, key: string, value: any, knexMethodName: string): void {
    if (!Array.isArray(value)) {
      throw new Error(`${key} expect an array value`);
    }

    statement.where(subStatement => {
      value.forEach(item => this.apply(knexMethodName, item, subStatement, null));
    });
  }
}
