import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {Criteria} from '../../src/Criteria/Criteria';
import {Mapping} from '../../src/Mapping';
import {Delivery} from '../resource/entity/postal/Delivery';
import {Address} from '../resource/entity/postal/Address';
import {Order} from '../resource/entity/postal/Order';
import {Tracker} from '../resource/entity/postal/Tracker';
import {User} from '../resource/entity/postal/User';
import {queries} from '../resource/queries';

function getMappings() {
  return {
    a: Mapping.forEntity(Address),
    d: Mapping.forEntity(Delivery),
    o: Mapping.forEntity(Order),
    t: Mapping.forEntity(Tracker),
    u: Mapping.forEntity(User)
  };
}

function getStatement(wetland, table, alias) {
  return wetland.getStore().getConnection()(`${table} as ${alias}`);
}

let wetland = new Wetland({
  entityPath: __dirname + '/../resource/entity/postal',
  stores    : {
    defaultStore: {
      client    : 'mysql',
      connection: {
        user    : 'root',
        host    : '127.0.0.1',
        database: 'wetland_test'
      }
    }
  }
});

describe('Criteria', () => {
  describe('.apply()', () => {
    it('should compose a simple where query', () => {
      let withAlias     = getStatement(wetland, 'delivery', 'd');
      let criteriaAlias = new Criteria(withAlias, Mapping.forEntity(Delivery), getMappings());
      let withoutAlias  = getStatement(wetland, 'delivery', 'd');
      let criteria      = new Criteria(withoutAlias, Mapping.forEntity(Delivery), getMappings());

      criteria.apply({id: 6});
      criteriaAlias.apply({'d.id': 6});

      assert.strictEqual(withAlias.toString(), queries.criteria.withAlias);
      assert.strictEqual(withoutAlias.toString(), queries.criteria.withoutAlias);
    });

    it('should compose a simple where query with custom column names', () => {
      let withAlias     = getStatement(wetland, 'address', 'a');
      let criteriaAlias = new Criteria(withAlias, Mapping.forEntity(Address), getMappings());
      let withoutAlias  = getStatement(wetland, 'address', 'a');
      let criteria      = new Criteria(withoutAlias, Mapping.forEntity(Address), getMappings());

      criteria.apply({houseNumber: 6});
      criteriaAlias.apply({'a.houseNumber': 6});

      assert.strictEqual(withAlias.toString(), queries.criteria.customColumnWithAlias);
      assert.strictEqual(withoutAlias.toString(), queries.criteria.customColumnWithoutAlias);
    });

    it('should compose a simple where query with multiple criteria', () => {
      let statement = getStatement(wetland, 'address', 'a');
      let criteria  = new Criteria(statement, Mapping.forEntity(Address), getMappings());

      criteria.apply({
        street     : {contains: 'straat'},
        houseNumber: {gt: 2},
        id         : {between: [1, 200]},
        country    : {not: 'Imagination land'}
      });

      assert.strictEqual(statement.toString(), queries.criteria.multipleOperators);
    });

    it('should use correct operator for is null', () => {
      let statement = getStatement(wetland, 'address', 'a');
      let criteria  = new Criteria(statement, Mapping.forEntity(Address), getMappings());

      criteria.apply({street: null});

      assert.strictEqual(statement.toString(), queries.criteria.defaultsIsNull);
    });

    it('should use correct operator for is not null', () => {
      let statement = getStatement(wetland, 'address', 'a');
      let criteria  = new Criteria(statement, Mapping.forEntity(Address), getMappings());

      criteria.apply({street: {not: null}});

      assert.strictEqual(statement.toString(), queries.criteria.defaultsIsNotNull);
    });

    it('should use correct operator for in', () => {
      let statement = getStatement(wetland, 'address', 'a');
      let criteria  = new Criteria(statement, Mapping.forEntity(Address), getMappings());

      criteria.apply({houseNumber: [1, 2, 3, 7]});

      assert.strictEqual(statement.toString(), queries.criteria.defaultsIn);
    });

    it('should use correct operator for not in', () => {
      let statement = getStatement(wetland, 'address', 'a');
      let criteria  = new Criteria(statement, Mapping.forEntity(Address), getMappings());

      criteria.apply({houseNumber: {not: [1, 2, 3, 7]}});

      assert.strictEqual(statement.toString(), queries.criteria.defaultsNotIn);
    });

    it('should create queries when supplying nested criteria ("and", or "or" method), the sensible edition', () => {
      let statement = getStatement(wetland, 'delivery', 'd');
      let criteria  = new Criteria(statement, Mapping.forEntity(Delivery), getMappings());

      criteria.apply({
        id         : 1337,
        'a.country': 'Netherlands',
        'a.street' : {endsWith: 'street'},
        or         : [
          {'t.status': 1},
          {
            and: [
              {'t.status': 2},
              {'u.name': 'Frank'}
            ]
          },
        ]
      });

      assert.strictEqual(statement.toString(), queries.criteria.sensible);
    });

    it('should create queries when supplying nested criteria ("and", or "or" method), the mental edition', () => {
      let statement = getStatement(wetland, 'delivery', 'd');
      let criteria  = new Criteria(statement, Mapping.forEntity(Delivery), getMappings());

      criteria.apply({
        id         : 1337,
        'a.country': 'Netherlands',
        'a.street' : {endsWith: 'street'},
        or         : [
          {id: {between: [1, 100]}},
          {'a.houseNumber': {gt: 12}},
          {
            and: [
              {id: {between: [100, 500]}},
              {role: {not: ['guest', 'spectator']}},
              {
                or: [
                  {role: 'no idea'},
                  {
                    and: [
                      {id: {notBetween: [6, 9]}},
                      {'t.status': 2},
                      {'u.name': 'Frank'},
                      {
                        or: [
                          {id: {not: [5, 6, 7, 8]}},
                          {role: {gt: 666}}
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      assert.strictEqual(statement.toString(), queries.criteria.mental);
    });
  });
});
