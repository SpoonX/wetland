import {Mapping} from './Mapping';
import {QueryBuilder} from './QueryBuilder';
import * as knex from 'knex';
import {Scope} from './Scope';

export class EntityRepository {

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {{}}
   */
  private entity: Object;

  /**
   * @type {Mapping}
   */
  private mapping: Mapping;

  /**
   * Construct a new EntityRepository.
   *
   * @param {Scope} entityManager
   * @param {{}}    entity
   */
  public constructor(entityManager: Scope, entity: Object) {
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
  public getQueryBuilder(alias?: string, statement?: knex.QueryBuilder): QueryBuilder {
    alias     = alias || this.mapping.getEntityName();
    let query = this.entityManager.createQuery(this.entity, alias, statement);

    return new QueryBuilder(this.entityManager, query, this.mapping, alias);
  }

  /**
   * Find entities based on provided criteria.
   *
   * @param criteria  {{}}
   * @param {*}       [orderBy]
   * @param {number}  [limit]
   * @param {number}  [offset]
   *
   * @returns {Promise<Array>}
   */
  public find(criteria = {}, orderBy?: any, limit?: number, offset?: number): Promise<Array<Object>> {
    let queryBuilder = this.getQueryBuilder().where(criteria);

    if (orderBy) {
      queryBuilder.orderBy(orderBy);
    }

    if (limit) {
      queryBuilder.limit(limit);
    }

    if (offset) {
      queryBuilder.offset(offset);
    }

    return queryBuilder.getQuery().getResult();
  }

  /**
   * Find a single entity.
   *
   * @param {{}|number|string}  criteria
   * @param {number}            [orderBy]
   * @param {number}            [offset]
   *
   * @returns {Promise<Object>}
   */
  public findOne(criteria: {} | number | string = {}, orderBy?: any, offset?: number): Promise<Object> {
    if (typeof criteria === 'number' || typeof criteria === 'string') {
      criteria = {[this.mapping.getPrimaryKeyField()]: criteria}
    }

    return this.find(criteria, orderBy, 1, offset).then(result => result[0]);
  }
}
