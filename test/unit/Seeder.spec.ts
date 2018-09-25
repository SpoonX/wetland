import { assert } from 'chai';
import { Scope } from '../../src/Scope';
import { Wetland } from '../../src/Wetland';
import * as path from 'path';
import * as Bluebird from 'bluebird';
import * as fs from 'fs';
import * as parse from 'csv-parse';
import { rmDataDir, tmpTestDir, getType, Pet, Post, User, fixturesDir } from '../resource/Seeder';

function getWetland (clean: boolean, bypassLifecyclehooks: boolean): Wetland {
  const fileName = `${clean ? 'clean' : 'safe'}-${getType(bypassLifecyclehooks)}.sqlite`;
  return new Wetland({
    dataDirectory: `${tmpTestDir}/.data`,
    stores       : {
      defaultStore: {
        client          : 'sqlite3',
        useNullAsDefault: true,
        connection      : {
          filename: `${tmpTestDir}/${fileName}`,
        },
      },
    },
    seed         : {
      fixturesDirectory   : path.join(fixturesDir, getType(bypassLifecyclehooks)), // Each filename is an entity
      bypassLifecyclehooks: bypassLifecyclehooks,
      clean               : clean,
    },
    entities     : [ User, Pet, Post ],
  });
}

function testUsers (manager: Scope, bypassLifecyclehooks: boolean): Promise<any> {
  let usersFromFile = require(path.join(fixturesDir, getType(bypassLifecyclehooks), 'User.json'));

  return manager.getRepository(User)
    .find(null, { populate: [ 'posts' ] })
    .then(users => {
      assert.lengthOf(users, usersFromFile.length);

      if (bypassLifecyclehooks) {
        users.forEach(user => {
          assert.lengthOf(user['posts'], 1);
        });
      }
    });
}

function testPosts (manager: Scope, bypassLifecyclehooks: boolean): Promise<any> {
  let postsFromFile = require(path.join(fixturesDir, getType(bypassLifecyclehooks), 'Post.json'));

  return manager.getRepository(Post)
    .find(null, { populate: [ 'author' ] })
    .then(posts => {
      assert.lengthOf(posts, postsFromFile.length);

      if (bypassLifecyclehooks) {
        posts.forEach(post => {
          assert.isDefined(post['author']);
        });
      }
    });
}

function testPets (manager: Scope, bypassLifecyclehooks: boolean): Promise<any> {
  const readFile: any = Bluebird.promisify(fs.readFile);

  return readFile(path.join(fixturesDir, getType(bypassLifecyclehooks), 'Pet.csv'))
    .then(data => {
      const parseP: any = Bluebird.promisify(parse);
      return parseP(data, { columns: true });
    })
    .then(petsFromFile => {
      return manager.getRepository(Pet)
        .find()
        .then(pets => {
          assert.lengthOf(pets, petsFromFile.length);
        });
    });
}

describe('Seeder', () => {
  beforeEach(() => rmDataDir());

  describe('CleanSeed', () => {
    describe('.seed(): no lifecyclehooks', () => {
      it('Should seed the database', () => {
        const clean                = true;
        const bypassLifecyclehooks = true;

        const wetland  = getWetland(clean, bypassLifecyclehooks);
        const migrator = wetland.getMigrator();
        const seeder   = wetland.getSeeder();
        const cleaner  = wetland.getCleaner();
        const manager  = wetland.getManager();

        return cleaner.clean()
          .then(() => migrator.devMigrations(false))
          .then(() => seeder.seed())
          .then(() => testUsers(manager, bypassLifecyclehooks))
          .then(() => testPosts(manager, bypassLifecyclehooks))
          .then(() => testPets(manager, bypassLifecyclehooks));
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
        const cleaner  = wetland.getCleaner();

        return cleaner.clean()
          .then(() => migrator.devMigrations(false))
          .then(() => seeder.seed())
          .then(() => testUsers(manager, bypassLifecyclehooks))
          .then(() => testPosts(manager, bypassLifecyclehooks))
          .then(() => testPets(manager, bypassLifecyclehooks));
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
          .then(() => testUsers(manager, bypassLifecyclehooks))
          .then(() => testPosts(manager, bypassLifecyclehooks))
          .then(() => testPets(manager, bypassLifecyclehooks));
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
          .then(() => testUsers(manager, bypassLifecyclehooks))
          .then(() => testPosts(manager, bypassLifecyclehooks))
          .then(() => testPets(manager, bypassLifecyclehooks));
      });
    });
  });
});
