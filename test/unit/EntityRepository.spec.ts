import {Wetland} from '../../src/Wetland';
import {EntityRepository} from '../../src/EntityRepository';
import {Scope} from '../../src/Scope';
import {User} from '../resource/entity/postal/User';
import {Tracker} from '../resource/entity/postal/Tracker';
import {assert} from 'chai';
import * as path from 'path';

let tmpTestDir = path.join(__dirname, '../.tmp');

function wetland(): Wetland {
  return new Wetland({
    stores  : {
      defaultStore: {
        client          : 'sqlite3',
        useNullAsDefault: true,
        connection      : {
          filename: `${tmpTestDir}/entity-repository.sqlite`
        }
      }
    },
    entities: [User, Tracker]
  });
}

function getManager(): Scope {
  return wetland().getManager();
}

function getRepository(): EntityRepository<User> {
  return getManager().getRepository(User);
}

let trackers = [{
  id       : 1,
  observers: [],
  status   : 2
}];

describe('EntityRepository', () => {
  before(() => {
    return wetland().getSchemaManager().create();
  });

  describe('.constructor()', () => {
    it('should construct a new repository', () => {
      let repo = getRepository();

      assert.property(repo, 'entityManager');
      assert.property(repo, 'entity');
      assert.property(repo, 'mapping');
    });
  });

  describe('.getQueryBuilder()', () => {
    it('should return retrieve a queryBuilder', () => {
      let entityAlias = getRepository().getQueryBuilder();
      assert.propertyVal(entityAlias, 'alias', 'user');

      let fooAlias = getRepository().getQueryBuilder('foo');
      assert.propertyVal(fooAlias, 'alias', 'foo');
    });
  });

  describe('.find()', () => {
    it('should find all entities', () => {
      let newUser     = new User();
      let newObserver = new User();
      let newTracker  = new Tracker();

      newObserver.name = 'bar';

      newTracker.status = 2;
      newTracker.observers.add(newObserver);

      newUser.name = 'foo';
      newUser.trackers.add(newTracker);

      return getManager().persist(newUser).flush()
        .then(() => getRepository().find())
        .then(users => {
          assert.lengthOf(users, 2);
          assert.oneOf(users[0].name, ['foo', 'bar']);
          assert.oneOf(users[1].name, ['foo', 'bar']);
        });
    });

    it('should not find entities based on criteria', () => {
      return getRepository().find({name: 'foobar'})
        .then(users => assert.isNull(users));
    });

    it('should find entities based on criteria', () => {
      return getRepository().find({name: 'foo'})
        .then(users => {
          assert.propertyVal(users[0], 'name', 'foo');
          assert.oneOf(users[0].id, [1, 2]);
        });
    });

    it('should find entities with alias option', () => {
      return getRepository().find(null, {alias: 'foo'})
        .then(users => {
          assert.lengthOf(users, 2)
        });
    });

    it('should find entities with populateAll option', () => {
      return getRepository().find(null, {populate: true})
        .then(users => users.forEach(user => {
          assert.lengthOf(user.trackers, 1);
          assert.deepEqual(user.trackers, trackers);
        }));
    });

    it('should find entities with specific populate option', () => {
      return getRepository().find(null, {populate: 'trackers'})
        .then(users => users.forEach(user => {
          assert.lengthOf(user.trackers, 1);
          assert.deepEqual(user.trackers, trackers);
        }));
    });

    it('should find entities with deep populate option', () => {
      return getRepository().find(null, {populate: ['trackers', 'trackers.observers']})
        .then(users => {
          assert.typeOf(users[0].trackers[0].observers[0].id, 'number');
          assert.oneOf(users[0].trackers[0].observers[0].id, [1, 2]);
          assert.oneOf(users[0].trackers[0].observers[0].name, ['foo', 'bar']);
          assert.property(users[0].trackers[0].observers[0], 'trackers');
        });
    });
  });

  describe('.findOne()', () => {
    it('should find one entity', () => {
      return getRepository().findOne()
        .then(user => {
          assert.propertyVal(user, 'id', 1);
          assert.oneOf(user.name, ['foo', 'bar']);
        });
    });

    it('should find a entity with alias option', () => {
      return getRepository().findOne(null, {alias: 'foo'})
        .then(user => {
          assert.propertyVal(user, 'id', 1);
          assert.oneOf(user.name, ['foo', 'bar']);
        });
    });

    it('should find a entity with on primary key as criteria', () => {
      return getRepository().findOne(2)
        .then(user => {
          assert.propertyVal(user, 'id', 2);
          assert.oneOf(user.name, ['foo', 'bar']);
        });
    });

    it('should not find a entity with on primary key as criteria', () => {
      return getRepository().findOne(99)
        .then(user => assert.isNull(user));
    });

    it('should find a entity with string as criteria', () => {
      return getRepository().findOne('1')
        .then(user => {
          assert.propertyVal(user, 'id', 1);
          assert.oneOf(user.name, ['foo', 'bar']);
        });
    });

    it('should find a entity with an object as criteria', () => {
      return getRepository().findOne({name: 'foo'})
        .then(user => {
          assert.propertyVal(user, 'name', 'foo');
          assert.oneOf(user.id, [1, 2]);
        });
    });
  });

  describe('.applyOptions()', () => {
    it('should apply options', () => {
      let appliedOptions = getRepository().applyOptions(getRepository().getQueryBuilder(), {
        select: 'name'
      });

      assert.notDeepEqual(appliedOptions, getRepository().getQueryBuilder());
    });
  });
});
