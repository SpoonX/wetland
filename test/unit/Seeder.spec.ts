import {assert} from 'chai';
import {Scope} from '../../src/Scope';
import {Wetland} from '../../src/Wetland';
import * as path from 'path';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as parse  from 'csv-parse';

const tmpTestDir  = path.join(__dirname, '../.tmp');
const dataDir     = `${tmpTestDir}/.data`;
const fixturesDir = path.join(__dirname, '../resource/fixtures/');

class User {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('username').field({type: 'string'});
    mapping.forProperty('password').field({type: 'string'});
    mapping.forProperty('posts').oneToMany({targetEntity: Post, mappedBy: 'author'});
  }
}

class Post {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('title').field({type: 'string'});
    mapping.forProperty('content').field({type: 'text'});
    mapping.forProperty('author').manyToOne({targetEntity: User, inversedBy: 'posts'});
  }
}

class Pet {
  static setMapping(mapping) {
    mapping.forProperty('id').increments().primary();
    mapping.forProperty('name').field({type: 'string'});
  }
}

const getType = (bypassLifecyclehooks: boolean) => bypassLifecyclehooks ? 'nolifecycle' : 'lifecycle';

const getWetland = (clean: boolean, bypassLifecyclehooks: boolean) => {
  const fileName = `${clean ? 'clean' : 'safe'}-${getType(bypassLifecyclehooks)}.sqlite`;
  return new Wetland({
    dataDirectory: `${tmpTestDir}/.data`,
    stores       : {
      defaultStore: {
        client          : 'sqlite3',
        useNullAsDefault: true,
        connection      : {
          filename: `${tmpTestDir}/${fileName}`
        }
      }
    },
    seed         : {
      fixturesDirectory   : path.join(fixturesDir, getType(bypassLifecyclehooks)), // Each filename is an entity
      bypassLifecyclehooks: bypassLifecyclehooks,
      clean               : clean
    },
    entities     : [User, Pet, Post]
  });
};

const testUsers = (manager: Scope, clean: boolean, bypassLifecyclehooks: boolean) => {
  let usersFromFile = require(path.join(fixturesDir, getType(bypassLifecyclehooks), 'User.json'));

  return manager.getRepository(User)
    .find(null, {populate: ['posts']})
    .then(users => {
      assert.lengthOf(users, usersFromFile.length);

      if (bypassLifecyclehooks) {
        users.forEach(user => {
          assert.lengthOf(user['posts'], 1);
        });
      }
    });
};

const testPosts = (manager: Scope, clean: boolean, bypassLifecyclehooks: boolean) => {
  let postsFromFile = require(path.join(fixturesDir, getType(bypassLifecyclehooks), 'Post.json'));

  return manager.getRepository(Post)
    .find(null, {populate: ['author']})
    .then(posts => {
      assert.lengthOf(posts, postsFromFile.length);

      if (bypassLifecyclehooks) {
        posts.forEach(post => {
          assert.isDefined(post['author']);
        });
      }
    });
};

const testPets = (manager: Scope, clean: boolean, bypassLifecyclehooks: boolean) => {
  const readFile: any = Bluebird.promisify(fs.readFile);

  return readFile(path.join(fixturesDir, getType(bypassLifecyclehooks), 'Pet.csv'))
    .then(data => {
      const parseP: any = Bluebird.promisify(parse);
      return parseP(data, {columns: true});
    })
    .then(petsFromFile => {
      return manager.getRepository(Pet)
        .find()
        .then(pets => {
          assert.lengthOf(pets, petsFromFile.length);
        });
    });
};

describe('Seeder', () => {
  beforeEach(() => {
    const rmDir: any = Bluebird.promisify(rimraf);

    return rmDir(dataDir)
  });

  describe('CleanSeed', () => {
    describe('.seed(): no lifecyclehooks', () => {
      it('Should seed the database', () => {
        const clean                = true;
        const bypassLifecyclehooks = true;

        const wetland  = getWetland(clean, bypassLifecyclehooks);
        const migrator = wetland.getMigrator();
        const seeder   = wetland.getSeeder();
        const manager  = wetland.getManager();

        return seeder.clean()
          .then(() => migrator.devMigrations(false))
          .then(() => seeder.seed())
          .then(() => testUsers(manager, clean, bypassLifecyclehooks))
          .then(() => testPosts(manager, clean, bypassLifecyclehooks))
          .then(() => testPets(manager, clean, bypassLifecyclehooks));
      });
    });

    describe('.clean() : lifecyclehooks', () => {
      it('Should seed the database', () => {
        const clean                = true;
        const bypassLifecyclehooks = false;

        const wetland  = getWetland(clean, bypassLifecyclehooks);
        const migrator = wetland.getMigrator();
        const seeder   = wetland.getSeeder();
        const manager  = wetland.getManager();

        return seeder.clean()
          .then(() => migrator.devMigrations(false))
          .then(() => seeder.seed())
          .then(() => testUsers(manager, clean, bypassLifecyclehooks))
          .then(() => testPosts(manager, clean, bypassLifecyclehooks))
          .then(() => testPets(manager, clean, bypassLifecyclehooks));
      });
    });
  });

  describe('SafeSeed', () => {
    describe('.seed(): no lifecyclehooks', () => {
      it('Should safely seed the database', () => {
        const clean                = false;
        const bypassLifecyclehooks = true;

        const wetland  = getWetland(clean, bypassLifecyclehooks);
        const migrator = wetland.getMigrator();
        const seeder   = wetland.getSeeder();
        const manager  = wetland.getManager();

        return migrator.devMigrations(false)
          .then(() => seeder.seed())
          .then(() => seeder.seed()) // Called a second time on purpose
          .then(() => testUsers(manager, clean, bypassLifecyclehooks))
          .then(() => testPosts(manager, clean, bypassLifecyclehooks))
          .then(() => testPets(manager, clean, bypassLifecyclehooks));
      });
    });

    describe('.seed(): lifecyclehooks', () => {
      it('Should safely seed', () => {
        const clean                = false;
        const bypassLifecyclehooks = false;

        const wetland  = getWetland(clean, bypassLifecyclehooks);
        const migrator = wetland.getMigrator();
        const seeder   = wetland.getSeeder();
        const manager  = wetland.getManager();

        return migrator.devMigrations(false)
          .then(() => seeder.seed())
          .then(() => seeder.seed()) // Called a second time on purpose
          .then(() => testUsers(manager, clean, bypassLifecyclehooks))
          .then(() => testPosts(manager, clean, bypassLifecyclehooks))
          .then(() => testPets(manager, clean, bypassLifecyclehooks));
      });
    });
  });
});
