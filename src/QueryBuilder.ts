import * as knex from 'knex';
import {Query} from './Query';
import {Mapping} from './Mapping';
import {Criteria} from './Criteria';
import {Scope, Entity} from './Scope';
import {Hydrator} from './Hydrator';

export class QueryBuilder<T> {
  /**
   * @type {Query}
   */
  private query: Query;

  /**
   * @type {boolean}
   */
  private prepared: boolean = false;

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
   * @type {Array}
   */
  private selects: Array<any> = [];

  /**
   * @type {Array}
   */
  private orderBys: Array<{orderBy: string | Array<string> | Object, direction: string | null}> = [];

  /**
   * @type {Mapping}
   */
  private mapping: Mapping<T>;

  /**
   * @type {Criteria}
   */
  private criteria: Criteria;

  /**
   * @type {{}}
   */
  private mappings: {[key: string]: Mapping<Entity>};

  /**
   * @type {string[]}
   */
  private functions: Array<string> = ['sum', 'count', 'max', 'min', 'avg'];

  /**
   * @type {string[]}
   */
  private singleJoinTypes: Array<string> = [Mapping.RELATION_ONE_TO_ONE, Mapping.RELATION_MANY_TO_ONE];

  /**
   * @type {Hydrator}
   */
  private hydrator: Hydrator;

  /**
   * @type {{}}
   */
  private aliased: {} = {};

  /**
   * Construct a new QueryBuilder.
   *
   * @param {Scope}             entityManager
   * @param {knex.QueryBuilder} statement
   * @param {Mapping}           mapping
   * @param {string}            alias
   */
  public constructor(entityManager: Scope, statement: knex.QueryBuilder, mapping: Mapping<T>, alias: string) {
    this.alias         = alias;
    this.mappings      = {[alias]: mapping};
    this.statement     = statement;
    this.criteria      = new Criteria(this.statement, mapping, this.mappings);
    this.entityManager = entityManager;
    this.hydrator      = new Hydrator(entityManager);
    this.query         = new Query(statement, this.hydrator);

    this.hydrator.addRecipe(null, alias, this.mappings[alias]);
  }

  /**
   * Create an alias.
   *
   * @param {string} target
   *
   * @returns {string}
   */
  public createAlias(target: string): string {
    this.aliased[target] = this.aliased[target] || 0;

    return target + this.aliased[target]++;
  }

  /**
   * Perform a join.
   *
   * @param {string} joinMethod
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public join(joinMethod: string, column: string, targetAlias: string): this {
    column                     = column.indexOf('.') > -1 ? column : `${this.alias}.${column}`;
    let [alias, property]      = column.split('.');
    let owningMapping          = this.mappings[alias];
    let join                   = owningMapping.getField(property).relationship;
    this.mappings[targetAlias] = Mapping.forEntity(this.entityManager.resolveEntityReference(join.targetEntity));
    let targetMapping          = this.mappings[targetAlias];
    let joinType               = this.singleJoinTypes.indexOf(join.type) > -1 ? 'single' : 'collection';
    let joinColumn             = owningMapping.getJoinColumn(property);
    let owning                 = alias;
    let other                  = targetAlias;

    this.hydrator.addRecipe(alias, targetAlias, targetMapping, joinType, property);

    if (join.type === Mapping.RELATION_MANY_TO_MANY) {
      let joinTable;

      if (join.inversedBy) {
        joinTable = owningMapping.getJoinTable(property, this.entityManager);
      } else {
        joinTable = targetMapping.getJoinTable(join.mappedBy, this.entityManager);
      }

      let joinTableAlias = this.createAlias(joinTable.name);

      // Join from owning to join-table.
      this.statement[joinMethod](`${joinTable.name} as ${joinTableAlias}`, statement => {
        joinTable.joinColumns.forEach(joinColumn => {
          statement.on(`${owning}.${joinColumn.referencedColumnName}`, '=', `${joinTableAlias}.${joinColumn.name}`);
        });
      });

      // Join from join-table to other.
      this.statement[joinMethod](`${targetMapping.getTableName()} as ${other}`, statement => {
        joinTable.inverseJoinColumns.forEach(inverseJoinColumn => {
          statement.on(`${joinTableAlias}.${inverseJoinColumn.name}`, '=', `${other}.${inverseJoinColumn.referencedColumnName}`);
        });
      });

      return this;
    }

    if (join.mappedBy) {
      joinColumn = targetMapping.getJoinColumn(join.mappedBy);
      owning     = other;
      other      = alias;
    }

    this.statement[joinMethod](
      `${targetMapping.getTableName()} as ${targetAlias}`,
      `${owning}.${joinColumn.name}`,
      `${other}.${joinColumn.referencedColumnName}`
    );

    return this;
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public leftJoin(column: string, targetAlias: string): this {
    return this.join('leftJoin', column, targetAlias);
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public innerJoin(column: string, targetAlias: string): this {
    return this.join('innerJoin', column, targetAlias);
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public leftOuterJoin(column: string, targetAlias: string): this {
    return this.join('leftOuterJoin', column, targetAlias);
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public rightJoin(column: string, targetAlias: string): this {
    return this.join('rightJoin', column, targetAlias);
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public rightOuterJoin(column: string, targetAlias: string): this {
    return this.join('rightOuterJoin', column, targetAlias);
  }


  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public outerJoin(column: string, targetAlias: string): this {
    return this.join('outerJoin', column, targetAlias);
  }

  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public fullOuterJoin(column: string, targetAlias: string): this {
    return this.join('fullOuterJoin', column, targetAlias);
  }

  /**
   * Perform a join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public crossJoin(column: string, targetAlias: string): this {
    return this.join('crossJoin', column, targetAlias);
  }

  /**
   * Get the Query.
   *
   * @returns {Query}
   */
  public getQuery(): Query {
    this.prepare();

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
  public select(alias: Array<string> | string | {[key: string]: string}): this {
    this.selects.push(alias);

    this.prepared = false;

    return this;
  }

  /**
   * Make sure all changes have been applied to the query.
   *
   * @returns {QueryBuilder}
   */
  public prepare(): this {
    if (this.prepared) {
      return this;
    }

    this.criteria.applyStaged();
    this.applySelects();
    this.applyOrderBys();

    this.prepared = true;

    return this;
  }

  /**
   * Apply the staged selects to the query.
   *
   * @returns {QueryBuilder}
   */
  private applySelects(): this {
    this.selects.forEach(select => this.applySelect(select));

    this.selects = [];

    return this;
  }

  /**
   * Apply a select to the query.
   *
   * @param {[]} propertyAlias
   *
   * @returns {QueryBuilder}
   */
  private applySelect(propertyAlias: Array<any> | string): this {
    if (Array.isArray(propertyAlias)) {
      propertyAlias.forEach(value => this.applySelect(value));

      return this;
    }

    if (typeof propertyAlias === 'string') {
      return this.applyRegularSelect(propertyAlias);
    }

    if (typeof propertyAlias !== 'object') {
      throw new Error(`Unexpected value "${propertyAlias}" of type "${typeof propertyAlias}" for .select()`);
    }

    // Support select functions. Don't add to hydrator, as they aren't part of the entities.
    Object.getOwnPropertyNames(propertyAlias).forEach(selectFunction => {
      if (this.functions.indexOf(selectFunction) === -1) {
        throw new Error(`Unknown function "${selectFunction}" specified.`);
      }

      this.statement[selectFunction](this.criteria.mapToColumn(propertyAlias[selectFunction]));
    });

    return this;
  }

  /**
   * Apply a regular select (no functions).
   *
   * @param {string} propertyAlias
   *
   * @returns {QueryBuilder}
   */
  private applyRegularSelect(propertyAlias): this {
    let alias = this.alias;

    // Set default propertyAlias for context-entity properties.
    if (propertyAlias.indexOf('.') === -1 && !this.mappings[propertyAlias]) {
      propertyAlias = `${alias}.${propertyAlias}`;
    }

    let aliasRecipe    = this.hydrator.getRecipe(alias);
    let selectAliases  = [];
    let hydrateColumns = {};

    if (propertyAlias.indexOf('.') > -1) {
      let parts              = propertyAlias.split('.');
      let property           = parts[1];
      let column             = this.criteria.mapToColumn(propertyAlias);
      hydrateColumns[column] = property;
      alias                  = parts[0];

      let primaryKeyAlias = `${aliasRecipe.primaryKey.alias} as ${aliasRecipe.primaryKey.alias}`;

      if (selectAliases.indexOf(primaryKeyAlias) === -1) {
        selectAliases.push(primaryKeyAlias);
      }

      selectAliases.push(`${column} as ${column}`);
    } else {
      let fields = this.mappings[propertyAlias].getFields();
      alias      = propertyAlias;

      Object.getOwnPropertyNames(fields).forEach(field => {
        if (!fields[field].relationship) {
          let fieldAlias             = (propertyAlias ? propertyAlias + '.' : '') + fields[field].name;
          hydrateColumns[fieldAlias] = field;

          selectAliases.push(`${fieldAlias} as ${fieldAlias}`);
        }
      });
    }

    this.statement.select(selectAliases);
    this.hydrator.getRecipe(alias).hydrate = true;
    this.hydrator.addColumns(alias, hydrateColumns);

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
  public insert(values, returning?: string): this {
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
  public update(values, returning?: any): this {
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
  public limit(limit): this {
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
  public offset(offset): this {
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
  public orderBy(orderBy: string | Array<string> | Object, direction?): this {
    this.orderBys.push({orderBy, direction});

    return this;
  }

  /**
   * Apply order by to the query.
   *
   * @param {string|string[]|{}} orderBy
   * @param {string}             [direction]
   *
   * @returns {QueryBuilder}
   */
  private applyOrderBy(orderBy: string | Array<string> | Object, direction?): this {
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
   * Apply order-by statements to the query.
   *
   * @returns {QueryBuilder}
   */
  private applyOrderBys(): this {
    this.orderBys.forEach(orderBy => this.applyOrderBy(orderBy.orderBy, orderBy.direction));

    this.orderBys = [];

    return this;
  }

  /**
   * Signal a delete.
   *
   * @returns {QueryBuilder}
   */
  public remove(): this {
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
  public where(criteria: Object): this {
    if (Object.getOwnPropertyNames(criteria).length === 0) {
      return this;
    }

    this.criteria.stage(criteria);

    this.prepared = false;

    return this;
  }

  /**
   * Enable debugging for the query.
   *
   * @returns {QueryBuilder}
   */
  debug(): this {
    this.query.enableDebugging();

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
      let value = values[property];
      let fieldName;

      if (property.indexOf('.') > -1) {
        let parts = property.split('.');

        if (this.mappings[parts[0]].isRelation(parts[1]) && typeof value === 'object') {
          return;
        }

        parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);

        fieldName = parts.join('.');
      } else {
        if (this.mappings[this.alias].isRelation(property) && typeof value === 'object') {
          return;
        }

        fieldName = this.mappings[this.alias].getFieldName(property, property);
      }

      if (!fieldName) {
        throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
      }

      mappedValues[fieldName] = value;
    });

    return mappedValues;
  }
}
