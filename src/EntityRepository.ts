import { Mapping } from './Mapping';
import { QueryBuilder } from './QueryBuilder';
import * as knex from 'knex';
import { Store } from './Store';
import { EntityCtor } from './EntityInterface';
import { EntityManager } from './EntityManager';
import { Scope } from './Scope';

export class EntityRepository<T> {

  /**
   * @type {EntityManager|Scope}
   */
  protected entityManager: EntityManager | Scope;

  /**
   * @type {{}}
   */
  protected entity: EntityCtor<T>;

  /**
   * @type {Mapping}
   */
  protected mapping: Mapping<T>;

  /**
   * Holds the query options.
   *
   * @type { string[] }
   */
  protected queryOptions: Array<string> = [ 'orderBy', 'limit', 'offset', 'groupBy', 'select' ];

  /**
   * Construct a new EntityRepository.
   *
   * @param {EntityManager|Scope} entityManager
   * @param {{}}                  entity
   */
  public constructor(entityManager: EntityManager | Scope, entity: EntityCtor<T>) {
    this.entityManager = entityManager;
    this.entity = entity;
    this.mapping = Mapping.forEntity(entity);
  }

  /**
   * Get mapping for the entity this repository is responsible for.
   *
   * @returns {Mapping}
   */
  public getMapping(): Mapping<T> {
    return this.mapping;
  }

  /**
   * Get a new query builder.
   *
   * @param {string}            [alias]
   * @param {knex.QueryBuilder} [statement]
   * @param {boolean}           [managed]
   *
   * @returns {QueryBuilder}
   */
  public getQueryBuilder(alias?: string, statement?: knex.QueryBuilder, managed: boolean = true): QueryBuilder<T> {
    const builderAlias = this.getAlias(alias);

    // Create a new QueryBuilder, pass in a scoped entity manager.
    return new QueryBuilder(this.getScope(), this.getStatement(builderAlias, statement), this.mapping, builderAlias, managed);
  }

  /**
   * Resolve to an alias. If none was supplied the table name is used.
   *
   * @param {string} [alias]
   */
  protected getAlias(alias?: string) {
    return alias || this.mapping.getTableName();
  }

  /**
   * Resolve to a statement. If none was supplied a new one is created.
   *
   * @param {string}            alias
   * @param {knex.QueryBuilder} [statement]
   *
   * @returns {knex.QueryBuilder}
   */
  protected getStatement(alias: string, statement?: knex.QueryBuilder) {
    if (statement) {
      return statement;
    }

    const connection = this.getConnection();

    return connection(`${this.mapping.getTableName()} as ${alias}`);
  }

  /**
   * Get a new query builder that will be applied on the derived table (query builder).
   *
   * e.g. `select count(*) from (select * from user) as user0;`
   *
   * @param {QueryBuilder} derivedFrom
   * @param {string}       [alias]
   *
   * @returns {QueryBuilder}
   */
  public getDerivedQueryBuilder(derivedFrom: QueryBuilder<T>, alias?: string): QueryBuilder<T> {
    return this.getQueryBuilder().from(derivedFrom, alias);
  }

  /**
   * Get a raw knex connection
   *
   * @param {string} [role] Defaults to slave
   *
   * @returns {knex}
   */
  public getConnection(role: string = Store.ROLE_SLAVE): knex {
    return this.entityManager.getStore(this.entity).getConnection(role);
  }

  /**
   * Build a QueryBuilder to find entities based on provided criteria.
   *
   * @param {{}}          [criteria]
   * @param {FindOptions} [options]
   *
   * @returns {QueryBuilder}
   */
  public prepareFindQuery(criteria?: {} | number | string, options: FindOptions = {}): QueryBuilder<T> {
    options.alias = options.alias || this.mapping.getTableName();
    const queryBuilder = this.getQueryBuilder(options.alias);

    if (!options.select) {
      queryBuilder.select(options.alias);
    }

    if (criteria) {
      queryBuilder.where(criteria);
    }

    // Calculate offset if paging is being used.
    if (options.page && options.limit) {
      options.offset = (options.page - 1) * options.limit;
    }

    // Apply limit, offset etc.
    this.applyOptions(queryBuilder, options);

    if (!options.populate) {
      return queryBuilder;
    }

    if (options.populate === true) {
      const relations = this.mapping.getRelations();

      if (typeof relations === 'object' && relations !== null) {
        options.populate = Reflect.ownKeys(relations);
      }
    } else if (typeof options.populate === 'string') {
      options.populate = [ options.populate ];
    }

    if (Array.isArray(options.populate) && options.populate.length) {
      options.populate.forEach(join => {
        let column = join as string;
        let alias = join as string;

        if (typeof join === 'object') {
          column = Object.keys(join)[0];
          alias = join[column];
        } else if (join.indexOf('.') > -1) {
          alias = join.split('.')[1];
        }

        const targetBuilder = queryBuilder.quickJoin(column, alias);

        if (!options.select) {
          targetBuilder.select(alias);
        }
      });
    } else if (options.populate && !Array.isArray(options.populate)) {
      Object.getOwnPropertyNames(options.populate).forEach(column => {
        const targetBuilder = queryBuilder.quickJoin(column, options.populate[column]);

        if (!options.select) {
          targetBuilder.select(options.populate[column]);
        }
      });
    }

    return queryBuilder;
  }

  /**
   * Find entities based on provided criteria.
   *
   * @param {{}}          [criteria]
   * @param {FindOptions} [options]
   *
   * @returns {Promise<Array>}
   */
  public find(criteria?: {} | number | string, options: FindOptions = {}): Promise<Array<T>> {
    return this.prepareFindQuery(criteria, options).getQuery().getResult();
  }

  /**
   * Find a single entity.
   *
   * @param {{}|number|string}  [criteria]
   * @param {FindOptions}       [options]
   *
   * @returns {Promise<Object>}
   */
  public findOne(criteria?: {} | number | string, options: FindOptions = {}): Promise<T> {
    options.alias = options.alias || this.mapping.getTableName();

    if (typeof criteria === 'number' || typeof criteria === 'string') {
      criteria = { [options.alias + '.' + this.mapping.getPrimaryKeyField()]: criteria };
    }

    options.limit = 1;

    return this.find(criteria, options).then(result => result ? result[0] : null);
  }

  /**
   * Apply options to queryBuilder
   *
   * @param {QueryBuilder<T>} queryBuilder
   * @param {FindOptions}     options
   *
   * @returns {QueryBuilder}
   */
  public applyOptions(queryBuilder: QueryBuilder<T>, options) {
    this.queryOptions.forEach(clause => {
      if (options[clause]) {
        queryBuilder[clause](options[clause]);
      }
    });

    return queryBuilder;
  }

  /**
   * Get a reference to the entity manager.
   *
   * @returns {EntityManager | Scope}
   */
  protected getEntityManager(): EntityManager | Scope {
    return this.entityManager;
  }

  /**
   * Get a scope. If this repository was constructed within a scope, you get said scope.
   *
   * @returns {Scope}
   */
  protected getScope(): Scope {
    if (this.entityManager instanceof Scope) {
      return this.entityManager;
    }

    return this.entityManager.createScope();
  }
}

export interface FindOptions {
  select?: Array<string>;
  orderBy?: any;
  groupBy?: any;
  alias?: string;
  page?: number;
  limit?: number;
  offset?: number;
  debug?: boolean;
  populate?: string | boolean | {} | Array<string | {}>;
}
