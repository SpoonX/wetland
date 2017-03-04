import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {Schema} from '../resource/Schema';

const beforeCreateError = new Error('BeforeCreate failed.');
const afterCreateError  = new Error('AfterCreate failed.');
const beforeUpdateError = new Error('BeforeUpdate failed.');
const beforeRemoveError = new Error('BeforeRemove failed.');
const afterUpdateError  = new Error('AfterUpdate failed.');
const afterRemoveError  = new Error('AfterRemove failed.');

class BeforeCreate {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  beforeCreate(): Promise<any> {
    return Promise.reject(beforeCreateError);
  }
}
class AfterCreate {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  afterCreate(): Promise<any> {
    return Promise.reject(afterCreateError);
  }
}
class BeforeUpdate {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  beforeUpdate(): Promise<any> {
    return Promise.reject(beforeUpdateError);
  }
}
class BeforeRemove {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  beforeRemove(): Promise<any> {
    return Promise.reject(beforeRemoveError);
  }
}
class AfterUpdate {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  afterUpdate(): Promise<any> {
    return Promise.reject(afterUpdateError);
  }
}
class AfterRemove {
  public name: string;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.field('name', {
      type: 'string'
    });
  }

  afterRemove(): Promise<any> {
    return Promise.reject(afterRemoveError);
  }
}

function getWetland(Entity) {
  return new Wetland({
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
    entities: [Entity]
  });
}

describe('LifecycleCallbacks', () => {

  beforeEach(done => {
    Schema.resetDatabase(done);
  });

  describe('.beforeCreate(reject)', () => {
    it('Should fail correctly', done => {
      const wetland = getWetland(BeforeCreate);

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let scope = wetland.getManager();

          let entity  = new BeforeCreate;
          entity.name = 'Peter';

          scope
            .persist(entity)
            .flush()
            .then(() => {
              done(new Error('Entity should not be created'));
            })
            .catch(error => {
              assert.equal(error, beforeCreateError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

  describe('.afterCreate(reject)', () => {
    it('Should fail correctly', done => {
      const wetland = getWetland(AfterCreate);

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let scope = wetland.getManager();

          let entity  = new AfterCreate;
          entity.name = 'Peter';

          scope
            .persist(entity)
            .flush()
            .then(() => {
              done(new Error('It should\t fail.'));
            })
            .catch(error => {
              assert.equal(error, afterCreateError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

  describe('.beforeUpdate(reject)', () => {
    it('Should fail correctly', done => {
      const wetland   = getWetland(BeforeUpdate);
      const scope     = wetland.getManager();
      const populator = wetland.getPopulator(scope);

      const EntityCtor: any = scope.getEntities()['BeforeUpdate'].entity;
      const changes         = {name: ''};

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let entity  = new BeforeUpdate();
          entity.name = 'Peter';
          return scope.persist(entity).flush()
        })
        .then(() => {
          return populator.findDataForUpdate(1, EntityCtor, changes)
        })
        .then(base => {
          populator.assign(EntityCtor, changes, base, 1);
          scope
            .flush()
            .then(() => {
              done(new Error('Entity should not be updated.'))
            })
            .catch(error => {
              assert.equal(error, beforeUpdateError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

  describe('.afterUpdate(reject)', () => {
    it('Should fail correctly', done => {
      const wetland   = getWetland(AfterUpdate);
      const scope     = wetland.getManager();
      const populator = wetland.getPopulator(scope);

      const EntityCtor: any = scope.getEntities()['AfterUpdate'].entity;
      const changes         = {name: ''};

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let entity  = new AfterUpdate();
          entity.name = 'Peter';
          return scope.persist(entity).flush()
        })
        .then(() => {
          return populator.findDataForUpdate(1, EntityCtor, changes)
        })
        .then(base => {
          populator.assign(EntityCtor, changes, base, 1);
          scope
            .flush()
            .then(() => {
              done(new Error('It should\'nt return correctly.'));
            })
            .catch(error => {
              assert.equal(error, afterUpdateError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

  describe('.beforeRemove(reject)', () => {
    it('Should fail correctly', done => {
      const wetland = getWetland(BeforeRemove);
      const scope   = wetland.getManager();

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let entity  = new BeforeRemove;
          entity.name = 'Peter';
          return scope
            .persist(entity)
            .flush();
        })
        .then(() => {
          return scope
            .getRepository(BeforeRemove)
            .findOne({id: 1})
        })
        .then(base => {
          scope
            .remove(base)
            .flush()
            .then(() => {
              done(new Error('Entity should not be updated.'))
            })
            .catch(error => {
              assert.equal(error, beforeRemoveError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

  describe('.afterRemove(reject)', () => {
    it('Should fail correctly', done => {
      const wetland = getWetland(AfterRemove);
      const scope   = wetland.getManager();

      wetland.getSchemaManager()
        .create()
        .then(() => {
          let entity  = new AfterRemove;
          entity.name = 'Peter';
          return scope.persist(entity).flush()
        })
        .then(() => {
          return scope
            .getRepository(AfterRemove)
            .findOne({id: 1})
        })
        .then(base => {
          scope
            .remove(base)
            .flush()
            .then(() => {
              done(new Error('Entity should not be updated.'))
            })
            .catch(error => {
              assert.equal(error, afterRemoveError);
              done();
            });
        })
        .catch(error => {
          done(error);
        });
    });
  });

});
