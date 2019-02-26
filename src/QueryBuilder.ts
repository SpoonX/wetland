import * as knex from 'knex';
import { Query } from './Query';
import { JoinColumn, Mapping, Relationship } from './Mapping';
import { Entity, Scope } from './Scope';
import { Catalogue, Hydrator } from './Hydrator';
import { Having } from './Criteria/Having';
import { Where } from './Criteria/Where';
import { On } from './Criteria/On';

export class QueryBuilder<T> {
  /**
   * @type {{}}
   */
  public mappings: { [key: string]: Mapping<Entity> };
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
   * @type {{}]
   */
  private appliedPrimaryKeys: { [key: string]: string } = {};
  /**
   * @type {Array}
   */
  private groupBys: Array<{ groupBy: string | Array<string> }> = [];
  /**
   * @type {QueryBuilder}
   */
  private derivedFrom: { derived: QueryBuilder<T>, alias: string };
  /**
   * @type {Array}
   */
  private orderBys: Array<{ orderBy: string | Array<string> | Object, direction: string | null }> = [];
  /**
   * @type {Where}
   */
  private whereCriteria: Where;
  /**
   * @type {On}
   */
  private onCriteria;
  /**
   * @type {Having}
   */
  private havingCriteria: Having;
  /**
   * @type {string[]}
   */
  private functions: Array<string> = [ 'sum', 'count', 'max', 'min', 'avg', 'distinct' ];

  /**
   * @type {string[]}
   */
  private singleJoinTypes: Array<string> = [ Mapping.RELATION_ONE_TO_ONE, Mapping.RELATION_MANY_TO_ONE ];

  /**
   * @type {Hydrator}
   */
  private readonly hydrator: Hydrator;

  /**
   * Will the entities that pass through this hydrator be managed by the unit of work?
   *
   * @type { boolean }
   */
  private readonly managed: boolean = true;

  /**
   * @type {{}}
   */
  private aliased: {} = {};

  private children: Array<QueryBuilder<{ new() }>> = [];

  private queryBuilders: { [key: string]: QueryBuilder<{ new() }> } = {};


  /**
   * Construct a new QueryBuilder.
   *
   * @param {Scope}             entityManager
   * @param {knex.QueryBuilder} statement
   * @param {Mapping}           mapping
   * @param {string}            alias
   * @param {boolean}           managed
   */
  public constructor(entityManager: Scope, statement: knex.QueryBuilder, mapping: Mapping<T>, alias: string, managed: boolean = true) {
    this.alias = alias;
    this.mappings = { [alias]: mapping };
    this.statement = statement;
    this.managed = managed;
    this.whereCriteria = new Where(this.statement, mapping, this.mappings, alias);
    this.havingCriteria = new Having(this.statement, mapping, this.mappings, alias);
    this.onCriteria = new On(this.statement, mapping, this.mappings, alias);
    this.entityManager = entityManager;
    this.hydrator = new Hydrator(entityManager, managed);
    this.query = new Query(statement, this.hydrator, this.children);

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
  public makeJoin(joinMethod: string, column: string, targetAlias: string): this {
    const { owningMapping, join, property, alias } = this.getRelationship(column);
    const TargetReference = this.entityManager.resolveEntityReference(join.targetEntity);
    this.mappings[targetAlias] = this.mappings[targetAlias] || Mapping.forEntity(TargetReference);
    const targetMapping = this.mappings[targetAlias];
    const joinType = this.singleJoinTypes.indexOf(join.type) > -1 ? 'single' : 'collection';
    let joinColumn = owningMapping.getJoinColumn(property);
    let owning = alias;
    let inversed = targetAlias;

    this.hydrator.addRecipe(alias, targetAlias, targetMapping, joinType, property);

    if (join.type === Mapping.RELATION_MANY_TO_MANY) {
      let joinTable;
      let joinColumns;
      let inverseJoinColumns;

      if (join.inversedBy) {
        joinTable = owningMapping.getJoinTable(property);
        joinColumns = joinTable.joinColumns;
        inverseJoinColumns = joinTable.inverseJoinColumns;
      } else {
        joinTable = targetMapping.getJoinTable(join.mappedBy);
        joinColumns = joinTable.inverseJoinColumns;
        inverseJoinColumns = joinTable.joinColumns;
      }

      const joinTableAlias = this.createAlias(joinTable.name);

      // Join from owning to makeJoin-table.
      const onCriteriaOwning = {};

      joinColumns.forEach((joinColumn: JoinColumn) => {
        onCriteriaOwning[`${owning}.${joinColumn.referencedColumnName}`] = `${joinTableAlias}.${joinColumn.name}`;
      });

      this.join(joinMethod, joinTable.name, joinTableAlias, onCriteriaOwning);

      // Join from makeJoin-table to inversed.
      const onCriteriaInversed = {};

      inverseJoinColumns.forEach((inverseJoinColumn: JoinColumn) => {
        onCriteriaInversed[`${joinTableAlias}.${inverseJoinColumn.name}`] = `${inversed}.${inverseJoinColumn.referencedColumnName}`;
      });

      this.join(joinMethod, targetMapping.getTableName(), inversed, onCriteriaInversed);

      return this;
    }

    if (join.mappedBy) {
      joinColumn = targetMapping.getJoinColumn(join.mappedBy);
      owning = inversed;
      inversed = alias;
    }

    const onCriteria = { [`${owning}.${joinColumn.name}`]: `${inversed}.${joinColumn.referencedColumnName}` };

    this.join(joinMethod, targetMapping.getTableName(), targetAlias, onCriteria);

    return this;
  }

  /**
   * Perform a custom join (bring-your-own on criteria!)
   *
   * @param {string} joinMethod
   * @param {string} table
   * @param {string} alias
   * @param {{}}     on
   *
   * @returns {QueryBuilder}
   */
  public join(joinMethod: string, table: string, alias: string, on: Object): this {
    this.statement[joinMethod](`${table} as ${alias}`, statement => {
      this.onCriteria.stage(on, undefined, statement);
    });

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
    return this.makeJoin('leftJoin', column, targetAlias);
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
    return this.makeJoin('innerJoin', column, targetAlias);
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
    return this.makeJoin('leftOuterJoin', column, targetAlias);
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
    return this.makeJoin('rightJoin', column, targetAlias);
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
    return this.makeJoin('rightOuterJoin', column, targetAlias);
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
    return this.makeJoin('outerJoin', column, targetAlias);
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
    return this.makeJoin('fullOuterJoin', column, targetAlias);
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
    return this.makeJoin('crossJoin', column, targetAlias);
  }

  /**
   * Get a child querybuilder.
   *
   * @param {string} alias
   *
   * @returns {QueryBuilder}
   */
  public getChild(alias: string): QueryBuilder<{ new() }> {
    return this.queryBuilders[alias];
  }

  /**
   * Add a child to query.
   *
   * @param {QueryBuilder} child
   *
   * @returns {QueryBuilder}
   */
  public addChild(child: QueryBuilder<{ new() }>): this {
    this.children.push(child);

    return this;
  }

  /**
   * Figure out if given target is a collection. If so, populate. Otherwise, left join.
   *
   * @param {string} column
   * @param {string} targetAlias
   *
   * @returns {QueryBuilder}
   */
  public quickJoin(column: string, targetAlias?: string): QueryBuilder<{ new() }> {
    const { join, alias, property } = this.getRelationship(column);
    const parentQueryBuilder = this.getChild(alias) || this;
    targetAlias = targetAlias || parentQueryBuilder.createAlias(property);

    if (join.type !== Mapping.RELATION_MANY_TO_MANY && join.type !== Mapping.RELATION_ONE_TO_MANY) {
      return parentQueryBuilder.leftJoin(column, targetAlias);
    }

    // Collections need to be fetched individually.
    const childQueryBuilder = parentQueryBuilder.populate(column, null, targetAlias);
    this.queryBuilders[targetAlias] = childQueryBuilder;

    return childQueryBuilder;
  }

  /**
   * Populate a collection. This will return a new Querybuilder, allowing you to filter, join etc within it.
   *
   * @param {string}        column
   * @param {QueryBuilder}  [queryBuilder]
   * @param {string}        [targetAlias]
   *
   * @returns {QueryBuilder<{new()}>}
   */
  public populate(column: string, queryBuilder?: QueryBuilder<{ new() }>, targetAlias?: string): QueryBuilder<{ new() }> {
    const { owningMapping, join, property, alias } = this.getRelationship(column);

    if (join.type !== Mapping.RELATION_MANY_TO_MANY && join.type !== Mapping.RELATION_ONE_TO_MANY) {
      throw new Error(`It's not possible to populate relations with type '${join.type}', target must be a collection.`);
    }

    const parentQueryBuilder = this.getChild(alias) || this;
    const TargetReference = this.entityManager.resolveEntityReference(join.targetEntity);
    targetAlias = targetAlias || parentQueryBuilder.createAlias(property);
    parentQueryBuilder.mappings[targetAlias] = parentQueryBuilder.mappings[targetAlias] || Mapping.forEntity(TargetReference);

    // Make sure we have a queryBuilder
    if (!(queryBuilder instanceof QueryBuilder)) {
      queryBuilder = this.entityManager.getRepository(TargetReference).getQueryBuilder(targetAlias);
    }

    const targetMapping = queryBuilder.getHostMapping();
    this.queryBuilders[targetAlias] = queryBuilder;
    let parentColumn;

    parentQueryBuilder.addChild(queryBuilder);

    if (join.type === Mapping.RELATION_ONE_TO_MANY) {
      parentColumn = `${targetAlias}.${targetMapping.getJoinColumn(join.mappedBy).name}`;
    } else {
      // Make queryBuilder join with joinTable and figure out column...
      let joinTable;
      let joinColumn;
      let joinTableAlias;

      if (join.inversedBy) {
        joinTable = owningMapping.getJoinTable(property);
        joinColumn = joinTable.inverseJoinColumns[0];
        parentColumn = joinTable.joinColumns[0].name;
      } else {
        joinTable = targetMapping.getJoinTable(join.mappedBy);
        joinColumn = joinTable.joinColumns[0];
        parentColumn = joinTable.inverseJoinColumns[0].name;
      }

      joinTableAlias = queryBuilder.createAlias(joinTable.name);
      parentColumn = `${joinTableAlias}.${parentColumn}`;

      // Join from target to joinTable (treating target as owning side).
      queryBuilder.join('innerJoin', joinTable.name, joinTableAlias, {
        [`${targetAlias}.${joinColumn.referencedColumnName}`]: `${joinTableAlias}.${joinColumn.name}`,
      });
    }

    const hydrator = parentQueryBuilder.getHydrator();

    hydrator.getRecipe().hydrate = true;

    // No catalogue yet, ensure we at least fetch PK.
    if (!hydrator.hasCatalogue(alias)) {
      this.applyPrimaryKeySelect(alias);
    }

    return queryBuilder.setParent(property, parentColumn, hydrator.enableCatalogue(alias));
  }

  /**
   * Set the owner of this querybuilder.
   *
   * @param {string}    property
   * @param {string}    column
   * @param {Catalogue} catalogue
   *
   * @returns {QueryBuilder}
   */
  public setParent(property: string, column: string, catalogue: Catalogue): this {
    this.statement.select(`${column} as ${column}`);

    this.query.setParent({ column, primaries: catalogue.primaries });

    this.hydrator.getRecipe().parent = { entities: catalogue.entities, column, property };

    return this;
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
  public select(alias: Array<string> | string | { [key: string]: string }): this {
    this.selects.push(...arguments);

    this.prepared = false;

    return this;
  }

  /**
   * Get the alias of the parent.
   *
   * @returns {string}
   */
  public getAlias(): string {
    return this.alias;
  }

  /**
   * Get the statement being built.
   *
   * @returns {knex.QueryBuilder}
   */
  public getStatement(): knex.QueryBuilder {
    return this.statement;
  }

  /**
   * Get the mapping of the top-most Entity.
   *
   * @returns {Mapping<Entity>}
   */
  public getHostMapping(): Mapping<Entity> {
    return this.mappings[this.alias];
  }

  /**
   * Get the hydrator of the query builder.
   *
   * @returns {Hydrator}
   */
  public getHydrator(): Hydrator {
    return this.hydrator;
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

    this.whereCriteria.applyStaged();
    this.havingCriteria.applyStaged();
    this.onCriteria.applyStaged();
    this.applyFrom();
    this.applySelects();
    this.applyOrderBys();
    this.applyGroupBys();

    this.prepared = true;

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
    this.setCriteriaHostAlias();

    // Returning has no effect on sqlite as it's not supported.
    if (this.statement['client'].config.client === 'sqlite3' || this.statement['client'].config.client === 'sqlite') {
      this.statement.insert(this.mapToColumns(values));
    } else {
      this.statement.insert(this.mapToColumns(values), returning);
    }

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
    this.setCriteriaHostAlias();

    this.statement.from(this.mappings[this.alias].getTableName());

    // Returning has no effect on sqlite as it's not supported.
    if (this.statement['client'].config.client === 'sqlite3' || this.statement['client'].config.client === 'sqlite') {
      this.statement.update(this.mapToColumns(values));
    } else {
      this.statement.update(this.mapToColumns(values), returning);
    }

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
   * Set the group by.
   *
   * .groupBy('name')
   * .groupBy(['name'])
   * .groupBy(['name', 'age'])
   *
   * @param {string|string[]} groupBy
   *
   * @returns {QueryBuilder}
   */
  public groupBy(groupBy: string | Array<string>): this {
    this.groupBys.push({ groupBy });

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
    this.orderBys.push({ orderBy, direction });

    return this;
  }

  /**
   * Signal a delete.
   *
   * @returns {QueryBuilder}
   */
  public remove(): this {
    this.setCriteriaHostAlias();

    this.statement.from(this.mappings[this.alias].getTableName());
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
    if (!Object.getOwnPropertyNames(criteria).length) {
      return this;
    }

    this.whereCriteria.stage(criteria);

    this.prepared = false;

    return this;
  }

  /**
   * Select `.from()` a derived table (QueryBuilder).
   *
   *  .from(queryBuilder, 'foo');
   *
   * @param {QueryBuilder} derived
   * @param {string}       [alias] alias
   *
   * @returns {QueryBuilder}
   */
  public from(derived: QueryBuilder<T>, alias?: string): this {
    if (!alias) {
      alias = this.createAlias(derived.getHostMapping().getTableName());
    }

    this.derivedFrom = { alias, derived };
    this.prepared = false;

    return this;
  }

  /**
   * Sets the having clause.
   *
   * .having({})
   *
   * @param {{}} criteria
   *
   * @returns {QueryBuilder}
   */
  public having(criteria: Object): this {
    if (!Object.getOwnPropertyNames(criteria).length) {
      return this;
    }

    this.havingCriteria.stage(criteria);

    this.prepared = false;

    return this;
  }

  /**
   * Get the relationship details for a column.
   *
   * @param {string} column
   *
   * @returns {{}}
   */
  private getRelationship(column: string): { owningMapping: Mapping<Entity>, join: Relationship, property: string, alias: string } {
    column = column.indexOf('.') > -1 ? column : `${this.alias}.${column}`;
    const [ alias, property ] = column.split('.');
    const parent = this.getChild(alias) || this;
    const owningMapping = parent.mappings[alias];
    let field;

    // Ensure existing mapping
    if (!owningMapping) {
      throw new Error(`Cannot find the reference mapping for '${alias}', are you sure you registered it first?`);
    }

    if (property) {
      field = owningMapping.getField(property, true);
    }

    if (!field || !field.relationship) {
      throw new Error(
        `Invalid relation supplied for join. Property '${property}' not found on entity, or relation not defined.
        Are you registering the joins in the wrong order?`,
      );
    }

    return { owningMapping, join: field.relationship, property, alias };
  }

  /**
   * Apply the provided derived values.
   *
   * @returns {QueryBuilder}
   */
  private applyFrom(): this {
    if (this.derivedFrom) {
      const { derived, alias } = this.derivedFrom;

      this.statement.from(this.statement['client'].raw(`(${derived.getQuery().getSQL()}) as ${alias}`));

      this.derivedFrom = null;
    }

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
    const select = Object.getOwnPropertyNames(propertyAlias);
    const functionName = select[0] === 'alias' ? select[1] : select[0];
    const alias = propertyAlias[select[0] === 'alias' ? select[0] : select[1]];
    const fieldName = this.whereCriteria.mapToColumn(propertyAlias[functionName]);

    if (this.functions.indexOf(functionName) === -1) {
      throw new Error(`Unknown function "${select[0]}" specified.`);
    }

    select.length > 1
      ? this.statement[functionName](`${fieldName} as ${alias}`)
      : this.statement[functionName](fieldName);

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

    const selectAliases = [];
    const hydrateColumns = {};

    if (propertyAlias.indexOf('.') > -1) {
      const parts = propertyAlias.split('.');
      const property = parts[1];
      const column = this.whereCriteria.mapToColumn(propertyAlias);
      hydrateColumns[column] = property;
      alias = parts[0];

      this.applyPrimaryKeySelect(alias);

      selectAliases.push(`${column} as ${column}`);
    } else {
      const mapping = this.mappings[propertyAlias];
      const fields = mapping.getFields();
      let currentEntitysPrimaryKey = mapping.getPrimaryKeyField();
      alias = propertyAlias;

      Object.getOwnPropertyNames(fields).forEach(field => {
        if (!fields[field].relationship && field !== currentEntitysPrimaryKey) {
          const fieldName = fields[field].name || (fields[field].primary ? 'id' : null);

          if (!fieldName) {
            throw new Error(
              `Trying to query for field without a name for '${mapping.getEntityName()}.${field}'.`,
            );
          }

          const fieldAlias = (propertyAlias ? propertyAlias + '.' : '') + fieldName;
          hydrateColumns[fieldAlias] = field;

          selectAliases.push(`${fieldAlias} as ${fieldAlias}`);
        }
        else if(field === currentEntitysPrimaryKey) {
          this.applyPrimaryKeySelect(alias);
        }
      }, this);
    }

    this.statement.select(selectAliases);
    this.hydrator.getRecipe(alias).hydrate = true;
    this.hydrator.addColumns(alias, hydrateColumns);

    return this;
  }

  /**
   * Ensure the existence of a primary key in the select of the query.
   *
   * @param {string} alias
   *
   * @returns {QueryBuilder}
   */
  private applyPrimaryKeySelect(alias: string): this {
    if (!this.managed) {
      return this;
    }

    if (!this.appliedPrimaryKeys[alias]) {
      const aliasRecipe = this.hydrator.getRecipe(alias);
      this.appliedPrimaryKeys[alias] = `${aliasRecipe.primaryKey.alias} as ${aliasRecipe.primaryKey.alias}`;

      this.statement.select(this.appliedPrimaryKeys[alias]);
    }

    return this;
  }

  /**
   * Apply group by to the query.
   *
   * @param {string|string[]} groupBy
   *
   * @returns {QueryBuilder}
   */
  private applyGroupBy(groupBy: string | Array<string>): this {
    const properties = [];

    if (typeof groupBy === 'string') {
      properties.push(this.whereCriteria.mapToColumn(groupBy));
    } else if (Array.isArray(groupBy)) {
      groupBy.forEach(group => properties.push(this.whereCriteria.mapToColumn(group)));
    }

    this.statement.groupBy(properties);

    return this;
  }

  /**
   * Apply group-by statements to the query.
   *
   * @returns {QueryBuilder}
   */
  private applyGroupBys(): this {
    this.groupBys.forEach(groupBy => this.applyGroupBy(groupBy.groupBy));

    this.groupBys = [];

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
      this.statement.orderBy(this.whereCriteria.mapToColumn(orderBy), direction);
    } else if (Array.isArray(orderBy)) {
      orderBy.forEach(order => this.applyOrderBy(order));
    } else if (typeof orderBy === 'object') {
      const property = Object.keys(orderBy)[0];

      this.applyOrderBy(property, orderBy[property]);
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
   * Set the host alias on the criteria parsers.
   *
   * @param {string} [hostAlias]
   */
  private setCriteriaHostAlias(hostAlias: string = null): this {
    this.whereCriteria.setHostAlias(hostAlias);
    this.onCriteria.setHostAlias(hostAlias);
    this.havingCriteria.setHostAlias(hostAlias);

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
      let fieldName, type;

      if (property.indexOf('.') > -1) {
        const parts = property.split('.');

        if (this.mappings[parts[0]].isRelation(parts[1]) && typeof value === 'object') {
          return;
        }

        parts[1] = this.mappings[parts[0]].getFieldName(parts[1], parts[1]);
        type = this.mappings[parts[0]].getType(parts[1]);
        fieldName = parts.join('.');
      } else {
        if (this.mappings[this.alias].isRelation(property) && typeof value === 'object') {
          return;
        }

        fieldName = this.mappings[this.alias].getFieldName(property, property);
        type = this.mappings[this.alias].getType(property);
      }

      if (!fieldName) {
        throw new Error(`No field name found in mapping for ${this.mappings[this.alias].getEntityName()}::${property}.`);
      }

      if (type === 'json') {
        value = JSON.stringify(value);
      }

      mappedValues[fieldName] = value;
    });

    return mappedValues;
  }
}
