import {QueryBuilder} from '../../src/QueryBuilder';
import {Query} from '../../src/Query';
import {Wetland} from '../../src/Wetland';
import {queries} from '../resource/queries';
import {Todo} from '../resource/entity/todo/Todo';
import {List} from '../resource/entity/todo/List';
import {assert} from 'chai';

let wetland = new Wetland({
  stores  : {
    defaultStore: {
      client    : 'mysql',
      connection: {
        user    : 'root',
        host    : '127.0.0.1',
        database: 'wetland_test'
      }
    }
  },
  entities: [Todo, List]
});

describe('QueryBuilder', () => {
  describe('createAlias', () => {
    it('should create an alias', () => {
      let alias = wetland.getManager().getRepository(Todo).getQueryBuilder().createAlias('t');

      assert.strictEqual(alias, 't0', 'It did not created an alias.');
    });
  });

  describe('join', () => {

  });

  describe('leftJoin', () => {

  });

  describe('rightJoin', () => {

  });

  describe('innerJoin', () => {

  });

  describe('leftOuterJoin', () => {

  });

  describe('rightOuterJoin', () => {

  });

  describe('outerJoin', () => {

  });

  describe('fullOuterJoin', () => {

  });

  describe('crossJoin', () => {

  });

  describe('getQuery', () => {
    it('should return a Query instance', () => {
      let getQuery = wetland.getManager().getRepository(Todo).getQueryBuilder().getQuery();

      assert.instanceOf(getQuery, Query, 'It did not return a Query instance.');
    });
  });

  describe('select', () => {
    it('should create a query without having to specify the columns', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').getQuery().getSQL();

      assert.strictEqual(query, queries.selectAll, 'It did not create expected select query.');
    });

    it('should create a query by passing one string as argument', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('task').getQuery().getSQL();

      assert.strictEqual(query, queries.selectOne, 'It did not create expected select query.');
    });

    // @todo: repeating ids
    it('should create a query by passing one array of strings as argument', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select(['t.task', 't.done']).getQuery().getSQL();

      assert.strictEqual(query, queries.selectArray, 'It did not create expected select query.');
    });

    it('should create a `sum()` query', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select({sum: 'id'}).getQuery().getSQL();

      assert.strictEqual(query, queries.selectSum, 'It did not create expected select query.');
    });
  });

  describe('prepare', () => {

  });

  describe('insert', () => {
    // @todo: wrong order
    it('should create an insert query', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.insert({task: 'Bake cake', done: true}).getQuery().getSQL();

      assert.strictEqual(query, queries.insert, 'It did not create expected insert query.')
    });
  });

  describe('update', () => {
    it('should created an update query', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.update({done: true}).where({id: 1}).getQuery().getSQL();

      assert.strictEqual(query, queries.update, 'It did not create expected update query.');
    });
  });

  describe('limit', () => {
    it('should create a query containing a limit clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('task').limit(69).getQuery().getSQL();

      assert.strictEqual(query, queries.limit, 'It did not create expect query with a limit clause.');
    });
  });

  describe('offset', () => {
    it('should create a query that contains an offset following the limit clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('done').limit(5).offset(15).getQuery().getSQL();

      assert.strictEqual(query, queries.offset, 'It did not create expected query with a limit and an offset clauses.');
    });
  });

  describe('orderBy', () => {
    it('should create a query that sorts by a property (asc)', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').orderBy('task').getQuery().getSQL();

      assert.strictEqual(query, queries.orderByAsc, 'It did not create expected ascending orderBy query.');
    });

    it('should create a query that sorts by a property (desc)', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').orderBy('done', 'desc').getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDesc, 'It did not create expected descending orderBy query.');
    });

    // @todo: not ordering by
    it('should create a query by passing the conditionals as an object', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').orderBy({task: 'desc'}).getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDescObj, 'It did not create expected query using object as the argument.');
    });

    // @todo: not ordering by
    it('should create a query by passing the conditionals as an array of objects', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').orderBy(['task', {done: 'desc'}]).getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDescArr, 'It did not create expected query using array as the argument.');
    });
  });

  describe('remove', () => {
    it('should create a delete query.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.remove().where({id: 1}).getQuery().getSQL();

      assert.strictEqual(query, queries.deleteById, 'It did not create expected remove query.');
    });

  });

  describe('where', () => {
    it('should create a select query with a `where` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').where({done: true}).getQuery().getSQL();

      assert.strictEqual(query, queries.where, 'It did not create expected query with a where clause.');
    });

    it('should create a select query with a `where in` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').where({task: ['Pet cat', 'Pet cat again']}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereIn, 'It did not create expected query with a where in clause.');
    });

    it('should create a select query with a `where and` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t').where({task: 'Rob bank', done: false}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereAnd, 'It did not create expected query with a where clause');
    });

    it('should create a select query with a `where` clause and an operator.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');

      let query = queryBuilder.select('t.task').where({id: {lte: 13}}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereLTE, 'It did not create expected query with a where <= clause.');
    });
  });
});
