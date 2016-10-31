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
  describe('.createAlias()', () => {
    it('should create an alias', () => {
      let alias = wetland.getManager().getRepository(Todo).getQueryBuilder().createAlias('t');

      assert.strictEqual(alias, 't0');
    });
  });

  describe('.join()', () => {
    it('should create a select query with a join clause by specifying the type of join manually', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('task').join('innerJoin', 'list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.join);
    });
  });

  describe('.leftJoin()', () => {
    it('should create a query with a left join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').leftJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.leftJoin);
    });
  });

  describe('.rightJoin()', () => {
    it('should create a query with a right join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').rightJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.rightJoin);
    });
  });

  describe('.innerJoin()', () => {
    it('should create a query with a inner join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').innerJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.innerJoin);
    });
  });

  describe('.leftOuterJoin()', () => {
    it('should create a query with a left outer join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').leftOuterJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.leftOuterJoin);
    });
  });

  describe('.rightOuterJoin()', () => {
    it('should create a query with a right outer join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').rightOuterJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.rightOuterJoin);
    });
  });

  describe('.outerJoin()', () => {
    it('should create a query with a outer join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').outerJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.outerJoin);
    });
  });

  describe('.fullOuterJoin()', () => {
    it('should create a query with a full outer join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').fullOuterJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.fullOuterJoin);
    });
  });

  describe('.crossJoin()', () => {
    it('should create a query with a cross join clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').crossJoin('list', 'l').getQuery().getSQL();

      assert.strictEqual(query, queries.crossJoin);
    });
  });

  describe('.getQuery()', () => {
    it('should return a Query instance', () => {
      let getQuery = wetland.getManager().getRepository(Todo).getQueryBuilder().getQuery();
      assert.instanceOf(getQuery, Query);
    });
  });

  describe('.select()', () => {
    it('should create a query without having to specify the columns', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').getQuery().getSQL();

      assert.strictEqual(query, queries.selectAll);
    });

    it('should create a query by passing one string as argument', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('task').getQuery().getSQL();

      assert.strictEqual(query, queries.selectOne);
    });

    it('should create a query by passing one array of strings as argument', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select(['t.task', 't.done']).getQuery().getSQL();

      assert.strictEqual(query, queries.selectArray);
    });

    it('should create a `sum()` query', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select({sum: 'id'}).getQuery().getSQL();

      assert.strictEqual(query, queries.selectSum);
    });
  });

  describe('.insert()', () => {
    it('should create an insert query', () => {
      let toInsert     = {'task': 'Bake cake', 'done': true};
      let keys         = ['task', 'done'];
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder();
      let query        = queryBuilder.insert(toInsert).getQuery().getSQL();

      keys.forEach(key => {
        assert.include(query, key);
      });
    });
  });

  describe('.update()', () => {
    it('should created an update query', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder();
      let query        = queryBuilder.update({'done': true}).where({'id': 1}).getQuery().getSQL();

      assert.strictEqual(query, queries.update);
    });
  });

  describe('.limit()', () => {
    it('should create a query containing a limit clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').limit(69).getQuery().getSQL();

      assert.strictEqual(query, queries.limit);
    });
  });

  describe('.offset()', () => {
    it('should create a query that contains an offset following the limit clause', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t.done').limit(5).offset(15).getQuery().getSQL();

      assert.strictEqual(query, queries.offset);
    });
  });

  describe('.groupBy()', () => {
    it('should create a query that groups by given property as a string', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t.task').groupBy('t.list').getQuery().getSQL();

      assert.strictEqual(query, queries.groupByOne);
    });

    it('should create a query that groups by given property as an array', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t.task').groupBy(['t.list']).getQuery().getSQL();

      assert.strictEqual(query, queries.groupByOne);
    });

    it('should create a query that groups by multiple properties', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').groupBy(['t.list', 't.done']).getQuery().getSQL();

      assert.strictEqual(query, queries.groupByMultiple);
    });
  });

  describe('.orderBy()', () => {
    it('should create a query that sorts by a property (asc)', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').orderBy('t.task').getQuery().getSQL();

      assert.strictEqual(query, queries.orderByAsc);
    });

    it('should create a query that sorts by a property (desc)', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').orderBy('t.done', 'desc').getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDesc);
    });

    it('should create a query by passing the conditionals as an object', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').orderBy({'t.task': 'desc'}).getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDescObj);
    });

    it('should create a query by passing the conditionals as an array of objects', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').orderBy(['t.task', {'t.done': 'desc'}]).getQuery().getSQL();

      assert.strictEqual(query, queries.orderByDescArr);
    });
  });

  describe('.remove()', () => {
    it('should create a delete query.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder();
      let query        = queryBuilder.remove().where({'id': 1}).getQuery().getSQL();

      assert.strictEqual(query, queries.deleteById);
    });
  });

  describe('.where()', () => {
    it('should create a select query with a `where` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').where({'t.done': true}).getQuery().getSQL();

      assert.strictEqual(query, queries.where);
    });

    it('should create a select query with a `where in` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').where({'t.task': ['Pet cat', 'Pet cat again']}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereIn);
    });

    it('should create a select query with a `where and` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t').where({'t.task': 'Rob bank', 't.done': false}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereAnd);
    });

    it('should create a select query with a `where` clause and an operator.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select('t.task').where({'t.id': {lte: 13}}).getQuery().getSQL();

      assert.strictEqual(query, queries.whereLTE);
    });
  });

  describe('.having()', () => {
    it('should create a select query with a `having` clause.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select({count: 't.task', alias: 'tasks'}).having({'tasks': {lte: 13}}).getQuery().getSQL();

      assert.strictEqual(query, queries.having);
    });

    it('should create a select query with `where`, `groupBy` and `having` clauses.', () => {
      let queryBuilder = wetland.getManager().getRepository(Todo).getQueryBuilder('t');
      let query        = queryBuilder.select({count: 't.task', alias: 'tasks'}).where({'t.id': {gte: 10}}).groupBy('t.done').having({'tasks': {lte: 4}}).getQuery().getSQL();

      assert.strictEqual(query, queries.havingGroupBy);
    });
  });
});
