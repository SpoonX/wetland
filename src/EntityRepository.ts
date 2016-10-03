import {Mapping} from './Mapping';
import {QueryBuilder} from './QueryBuilder';
import * as knex from 'knex';
import {Scope} from './Scope';
import {Store} from './Store';
import {EntityCtor} from './EntityInterface';

export class EntityRepository<T> {

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}}
   */
  private entity: EntityCtor<T>;

  /**
   * @type {Mapping}
   */
  private mapping: Mapping<T>;

  /**
   * Construct a new EntityRepository.
   *
   * @param {Scope} entityManager
   * @param {{}}    entity
   */
  public constructor(entityManager: Scope, entity: EntityCtor<T>) {
    this.entityManager = entityManager;
    this.entity        = entity;
    this.mapping       = Mapping.forEntity(entity);
  }

  /**
   * Get a new query builder.
   *
   * @param {string}            [alias]
   * @param {knex.QueryBuilder} [statement]
   *
   * @returns {QueryBuilder}
   */
  public getQueryBuilder(alias?: string, statement?: knex.QueryBuilder): QueryBuilder<T> {
    alias = alias || this.mapping.getTableName();

    if (!statement) {
      let connection = this.entityManager.getStore(this.entity).getConnection(Store.ROLE_SLAVE);

      statement = connection(`${Mapping.forEntity(this.entity).getTableName()} as ${alias}`);
    }

    return new QueryBuilder(this.entityManager, statement, this.mapping, alias);
  }

  /**
   * Find entities based on provided criteria.
   *
   * @param {{}}          criteria
   * @param {FindOptions} [options]
   *
   * @returns {Promise<Array>}
   */
  public find(criteria: Object|null, options: FindOptions = {}): Promise<Array<T>> {
    options.alias    = options.alias || this.mapping.getTableName();
    let queryBuilder = this.getQueryBuilder(options.alias).select(options.alias);

    if (criteria) {
      queryBuilder.where(criteria);
    }

    if (options.debug) {
      queryBuilder.debug();
    }

    if (options.orderBy) {
      queryBuilder.orderBy(options.orderBy);
    }

    if (options.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options.offset) {
      queryBuilder.offset(options.offset);
    }

    if (options.join && Array.isArray(options.join)) {
      options.join.forEach(join => {
        let column = join as string;
        let alias  = join as string;

        if (typeof join === 'object') {
          column = Object.keys(join)[0];
          alias  = join[column];
        } else if (join.indexOf('.') > -1) {
          alias  = join.split('.')[1];
        }

        queryBuilder.leftJoin(column, alias).select(alias);
      });
    }

    if (options.join && !Array.isArray(options.join)) {
      Object.getOwnPropertyNames(options.join).forEach(column => {
        queryBuilder.leftJoin(column, options.join[column]).select(options.join[column]);
      });
    }

    return queryBuilder.getQuery().getResult();
  }

  /**
   * Find a single entity.
   *
   * @param {{}|number|string}  criteria
   * @param {FindOptions}       [options]
   *
   * @returns {Promise<Object>}
   */
  public findOne(criteria: {} | number | string = {}, options: FindOptions = {}): Promise<T> {
    options.alias = options.alias || this.mapping.getTableName();

    if (typeof criteria === 'number' || typeof criteria === 'string') {
      criteria = {[options.alias + '.' + this.mapping.getPrimaryKeyField()]: criteria}
    }

    options.limit = 1;

    return this.find(criteria, options).then(result => result[0]);
  }
}

export interface FindOptions {
  orderBy?: any,
  alias?: string,
  limit?: number,
  offset?: number,
  debug?: boolean,
  join?: {} | Array<string|{}>
}
