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
  protected entityManager: Scope;

  /**
   * @type {{}}
   */
  protected entity: EntityCtor<T>;

  /**
   * @type {Mapping}
   */
  protected mapping: Mapping<T>;

  protected queryOptions: Array<string> = ['orderBy', 'limit', 'offset', 'groupBy', 'select'];

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

      statement = connection(`${this.mapping.getTableName()} as ${alias}`);
    }

    return new QueryBuilder(this.entityManager, statement, this.mapping, alias);
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
    options.alias    = options.alias || this.mapping.getTableName();
    let queryBuilder = this.getQueryBuilder(options.alias);

    if (!options.select) {
      queryBuilder.select(options.alias);
    }

    if (criteria) {
      queryBuilder.where(criteria);
    }

    // Apply limit, offset etc.
    this.applyOptions(queryBuilder, options);

    if (!options.populate) {
      return queryBuilder.getQuery().getResult();
    }

    if (options.populate === true) {
      options.populate = Reflect.ownKeys(this.mapping.getRelations());
    } else if (typeof options.populate === 'string') {
      options.populate = [options.populate];
    }

    if (Array.isArray(options.populate) && options.populate.length) {
      options.populate.forEach(join => {
        let column = join as string;
        let alias  = join as string;

        if (typeof join === 'object') {
          column = Object.keys(join)[0];
          alias  = join[column];
        } else if (join.indexOf('.') > -1) {
          alias = join.split('.')[1];
        }

        let targetBuilder = queryBuilder.quickJoin(column, alias);

        if (!options.select) {
          targetBuilder.select(alias);
        }
      });
    } else if (options.populate && !Array.isArray(options.populate)) {
      Object.getOwnPropertyNames(options.populate).forEach(column => {
        let targetBuilder = queryBuilder.quickJoin(column, options.populate[column]);

        if (!options.select) {
          targetBuilder.select(options.populate[column]);
        }
      });
    }

    return queryBuilder.getQuery().getResult();
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
      criteria = {[options.alias + '.' + this.mapping.getPrimaryKeyField()]: criteria}
    }

    options.limit = 1;

    return this.find(criteria, options).then(result => result ? result[0] : result);
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
}

export interface FindOptions {
  select?: Array<string>,
  orderBy?: any,
  groupBy?: any,
  alias?: string,
  limit?: number,
  offset?: number,
  debug?: boolean,
  populate?: boolean | {} | Array<string|{}>
}
