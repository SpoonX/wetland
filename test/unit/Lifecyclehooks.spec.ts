import {assert} from 'chai';
import {Wetland} from '../../src/Wetland';
import {Entity} from '../../src/Entity';
import * as path from 'path';
import * as Bluebird from 'bluebird';
import * as rimraf from 'rimraf';
import { EntityCtor } from '../../src';

const tmpTestDir = path.join(__dirname, '../.tmp');
const dataDir    = `${tmpTestDir}/.data`;

class User extends Entity {
  id;

  username;

  password;

  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('username').field({type: 'string'});
    mapping.forProperty('password').field({type: 'string'});
  }

  beforeCreate() {
    this.password = Buffer.from(this.password).toString('base64'); // Do not do that in prod
  }

  beforeUpdate(values) {
    values.password = Buffer.from(values.password).toString('base64'); // Do not do that in prod
  }
}

function getWetland(name) {
  return new Wetland({
    entities     : [User],
    dataDirectory: `${tmpTestDir}/.data`,
    stores       : {
      defaultStore: {
        useNullAsDefault: true,
        client          : 'sqlite3',
        connection      : {
          filename: `${tmpTestDir}/lifecyclehooks-${name}.sqlite`
        }
      }
    }
  });
}

describe('Lifecyclehooks', () => {
  beforeEach(() => {
    const rmDir: any = Bluebird.promisify(rimraf);

    return rmDir(dataDir)
  });

  describe('.beforeCreate()', () => {
    it('should correctly base64 the password before create', () => {
      const wetland        = getWetland('before-create');
      const manager        = wetland.getManager();
      const UserRepository = manager.getRepository(User);

      const password   = 'Test';
      const username   = 'Test';
      const newUser    = new User;
      newUser.username = username;
      newUser.password = password;

      return wetland.getMigrator().devMigrations(false)
        .then(() => {
          return manager.persist(newUser)
            .flush();
        })
        .then(() => {
          return UserRepository.findOne({username});
        })
        .then((user: User) => {
          assert.notEqual(user.password, password);
          assert.equal(user.password, Buffer.from(password).toString('base64'));
        });
    })
  });

  describe('.beforeUpdate()', () => {
    it('should correctly base64 the password before update', () => {
      const wetland = getWetland('before-update');

      const manager        = wetland.getManager();
      const UserRepository = manager.getRepository(manager.getEntity('User') as EntityCtor<Entity>);

      const username        = 'John Doe.';
      const password        = '123456789';
      const updatedPassword = 'popopopop';
      const newUser         = new User;
      newUser.username      = username;
      newUser.password      = password;

      return wetland.getMigrator().devMigrations(false)
        .then(() => {
          return manager.persist(newUser).flush();
        })
        .then(() => {
          return UserRepository.findOne({username});
        })
        .then((user: User) => {
          user.password = updatedPassword;
          return manager.flush();
        })
        .then(() => {
          return UserRepository.findOne({username});
        })
        .then((user: User) => {
          assert.notEqual(user.password, updatedPassword);
          assert.equal(user.password, Buffer.from(updatedPassword).toString('base64'));
        });
    });
  });
});
