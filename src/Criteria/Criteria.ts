import {Mapping} from '../Mapping';
import {QueryBuilder} from 'knex';

/**
 * Parse and apply criteria to statement.
 */
export class Criteria {

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
    '!'                 : {operator: '<>', value: value => value},
    'not'               : {operator: '<>', value: value => value},
    'between'           : {operator: 'between', value: value => value},
    'notBetween'        : {operator: 'not between', value: value => value},
    'in'                : {operator: 'in', value: value => value},
    'notIn'             : {operator: 'not in', value: value => value},
    'is'                : {operator: 'is', value: value => value},
    'isNot'             : {operator: 'is not', value: value => value},
    'like'              : {operator: 'like', value: value => value},
    'notLike'           : {operator: 'not like', value: value => value},
    'contains'          : {operator: 'like', value: value => `%${value}%`},
    'notContains'       : {operator: 'not like', value: value => `%${value}%`},
    'startsWith'        : {operator: 'like', value: value => `${value}%`},
    'notStartsWith'     : {operator: 'not like', value: value => `${value}%`},
    'endsWith'          : {operator: 'like', value: value => `%${value}`},
    'notEndsWith'       : {operator: 'not like', value: value => `%${value}`}
  };

  /**
   * Maps operators to knex methods.
   *
   * @type {{}}
   */
  protected conditions: {and: string, or: string} = {and: 'where', or: 'orWhere'};

  /**
   * @type {string}
   */
  protected defaultCondition: string = 'and';

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
   * {QueryBuilder}
   */
  private statement: QueryBuilder;

  /**
   * Criteria staged to apply.
   *
   * @type {Array}
   */
  private staged: Array<{criteria: Object, condition?: string, statement?: QueryBuilder}> = [];

  /**
   * Construct a new Criteria parser.
   * @constructor
   *
   * @param {QueryBuilder} statement
   * @param {Mapping}           hostMapping
   * @param {{}}                [mappings]
   */
  public constructor(statement: QueryBuilder, hostMapping: Mapping<any>, mappings?: {[key: string]: Mapping<any>}) {
    this.statement   = statement;
    this.mappings    = mappings || {};
    this.hostMapping = hostMapping;
  }

  /**
   * Stage criteria to be applied later.
   *
   * @param {{}}           criteria
   * @param {string}       condition
   * @param {QueryBuilder} statement
   *
   * @returns {Criteria}
   */
  public stage(criteria: Object, condition = this.defaultCondition, statement?: QueryBuilder): Criteria {
    this.staged.push({criteria, condition, statement});

    return this;
  }

  /**
   * Apply staged criteria.
   *
   * @returns {Criteria}
   */
  public applyStaged(): Criteria {
    this.staged.forEach(criteria => this.apply(criteria.criteria, criteria.condition, criteria.statement));

    this.staged = [];

    return this;
  }

  /**
   * Apply criteria to statement.
   *
   * @param {{}}           criteria     Criteria object.
   * @param {string}       [condition]  'and' or 'or'. Defaults to 'this.defaultCondition' ('or').
   * @param {QueryBuilder} [statement]  Knex query builder.
   * @param {string}       [property]   Property name (for nested criteria, used internally).
   *
   * @returns {void}
   */
  public apply(criteria: Object, condition: string = this.defaultCondition, statement?: QueryBuilder, property?: string) {
    statement = statement || this.statement;

    Reflect.ownKeys(criteria).forEach((key: string) => {
      let value    = criteria[key];
      let operator = '=';

      if (this.conditions[key]) {
        // Create a grouped condition
        return this.applyNestedCondition(statement, key, value, condition);
      }

      // If value is a pojo, deep-process criteria for property.
      if (!(value === null || typeof value !== 'object') && value.constructor === Object) {
        return this.apply(value, condition, statement, key);
      }

      // Apply operator logic
      if (this.operators[key]) {
        value    = this.operators[key].value(value);
        operator = this.operators[key].operator;
      } else {
        property = key;
      }

      // Apply convenience checks (in, not in, is, is not).
      operator = this.applyConvenience(value, operator);

      statement[this.conditions[condition || this.defaultCondition]](this.mapToColumn(property), operator, value);
    });
  }

  /**
   * Apply nested conditions ((foo and bar) or (bat and baz)).
   *
   * @param {QueryBuilder}  statement
   * @param {string}        condition
   * @param {*}             value
   * @param {string}        wrapCondition
   *
   * @returns {void}
   */
  protected applyNestedCondition(statement: QueryBuilder, condition: string, value: any, wrapCondition: string): void {
    statement[this.conditions[wrapCondition || condition]]((subStatement: QueryBuilder) => {
      value.forEach((criteria: Object) => {
        this.apply(criteria, condition, subStatement);
      });
    });
  }

  /**
   * Translates null finds to 'is null', and arrays to 'in' (same for is not null and not in).
   *
   * @param {*}       value
   * @param {string}  operator
   *
   * @returns {string} Potentially mutated operator
   */
  protected applyConvenience(value: any, operator: string): string {
    if (value === null) {
      if (operator === '=') {
        operator = this.operators.is.operator;
      } else if (operator === '<>') {
        operator = this.operators.isNot.operator;
      }
    }

    if (Array.isArray(value)) {
      if (operator === '=') {
        operator = this.operators.in.operator;
      } else if (operator === '<>') {
        operator = this.operators.notIn.operator;
      }
    }

    return operator;
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
}
