import {Wetland} from '../../src/Wetland';
import {Category} from '../resource/entity/shop/category';
import {Product} from '../resource/entity/shop/product';
import {Image} from '../resource/entity/shop/image';
import {Profile} from '../resource/entity/shop/Profile';
import {Tag} from '../resource/entity/shop/tag';
import {User} from '../resource/entity/shop/user';
import {Scope} from '../../src/Scope';

function getWetland(entities?) {
  let wetland = new Wetland({
    stores  : {
      'default': {
        client    : 'mysql',
        connection: {
          user    : 'root',
          database: 'wetland'
        }
      }
    }
  });

  if (entities) {
    wetland.registerEntities(entities);
  }

  return wetland;
}

function getEntityManager(entities?): Scope {
  let wetland = new Wetland({});

  if (entities) {
    wetland.registerEntities(entities);
  }

  return wetland.getManager();
}

describe('Migrator', () => {
  describe('.create()', () => {
    it('should create my tables', (done) => {
      done();
    });
  });
});
