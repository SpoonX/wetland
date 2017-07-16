import {Wetland} from './Wetland';
import {Store} from './Store';
import {Homefront} from 'homefront';
import {EntityCtor} from "./EntityInterface";
import {ArrayCollection} from "./ArrayCollection";
import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as parse  from "csv-parse";
import * as path from "path";
import * as Bluebird from 'bluebird';
import {Mapping} from "./Mapping";  
import {UnitOfWork} from "./UnitOfWork";

export class Seeder {

  config: Homefront = new Homefront();

  wetland: Wetland;

  constructor(wetland: Wetland) {
    this.wetland = wetland;
    this.config  = this.config.merge(wetland.getConfig().fetch('seed'));
  }

  /**
   * Clean the data directory.
   *
   * @return {Promise<any>}
   */
  private cleanDirectory(): Promise<any> {
    const rmDir: any = Bluebird.promisify(rimraf);

    return rmDir(this.wetland.getConfig().fetch('dataDirectory'));
  }

  /**
   * Reset database.
   *
   * @param store
   * @return {Promise<any>}
   */
  private resetDatabase(store: Store): Promise<any> {
    const knex     = require('knex')(store);
    const database = store.getConnections()[Store.ROLE_MASTER].database;

    return knex.raw(`DROP DATABASE IF EXISTS ${database};`)
      .then(() => this.cleanDirectory())
      .then(() => knex.raw(`CREATE DATABASE ${database};`));
  }

  /**
   * Reset the embedded database.
   *
   * @param store
   * @return {Promise<any>}
   */
  private resetEmbeddedDatabase(store: Store): Promise<any> {
    let filename = store.getConnections()[Store.ROLE_MASTER].filename;

    if (!fs.existsSync(filename)) {
      return this.cleanDirectory();
    }

    const rm: any = Bluebird.promisify(fs.unlink);
    return rm(filename)
      .then(this.cleanDirectory());
  }

  /**
   * Clean the database and the wetland's data directory.
   *
   * @return {Promise<any>}
   */
  public clean(): Promise<any> {
    const store = this.wetland.getStore();

    if (store.getClient() === 'sqlite3') {
      return this.resetEmbeddedDatabase(store);
    }

    return this.resetDatabase(store);
  }

  /**
   * Bulk features insertion.
   *
   * @param {string} entityName
   * @param {Array<Object>} features
   * @param {boolean} bypassLifecyclehooks
   * @return {Promise<any>}
   */
  private cleanlyInsertFeatures(entityName: string, features: Array<Object>, bypassLifecyclehooks: boolean): Promise<any> {
    const manager    = this.wetland.getManager();
    const unitOfWork = manager.getUnitOfWork();
    const populator  = this.wetland.getPopulator(manager);
    const Entity     = manager.getEntity(entityName) as EntityCtor<Function>;
    const entities   = new ArrayCollection();

    features.forEach(feature => {
      let entity = populator.assign(Entity, feature);

      unitOfWork.setEntityState(entity, UnitOfWork.STATE_NEW);

      entities.push(entity);
    });

    return manager.persist(...entities).flush(false, bypassLifecyclehooks);
  }

  /**
   * Safe (no duplicate) features insertion going through the lifecylehooks.
   *
   * @param {string} entityName
   * @param {Array<Object>} features
   * @param {boolean} bypassLifecyclehooks
   * @return {Promise<any>}
   */
  private safelyInsertFeatures(entityName: string, features: Array<Object>, bypassLifecyclehooks: boolean): Promise<any> {
    const manager          = this.wetland.getManager();
    const unitOfWork       = manager.getUnitOfWork();
    const populator        = this.wetland.getPopulator(manager);
    const Entity           = manager.getEntity(entityName) as EntityCtor<Function>;
    const correctFields    = Mapping.forEntity(Entity).getFieldNames();
    const entityRepository = manager.getRepository(Entity);

    const queries = [];

    features.forEach(feature => {

      let target = {};

      Reflect.ownKeys(feature).forEach((field: string) => {
        if (correctFields.includes(field)) {
          target[field] = feature[field];
        }
      });

      queries.push(entityRepository.findOne(target).then(response => {
        if (!response) {
          let populated = populator.assign(Entity, feature);

          unitOfWork.setEntityState(populated, UnitOfWork.STATE_NEW);

          return Promise.resolve(populated);
        }

        return Promise.resolve(null);
      }));
    });

    return Promise.all(queries).then((entities) => {
      entities = entities.filter(e => e != null);

      if (!entities.length) {
        return Promise.resolve();
      }

      return manager.persist(...entities).flush(false, bypassLifecyclehooks);
    });
  }

  /**
   * Seed features according to options.
   *
   * @param {string} entityName
   * @param {Array<Object>} features
   * @param {boolean} clean
   * @param {boolean} bypassLifecyclehooks
   * @return {Promise<any>}
   */
  private seedFeatures(entityName: string, features: Array<Object>, clean: boolean, bypassLifecyclehooks: boolean): Promise<any> {
    if (clean) {
      return this.cleanlyInsertFeatures(entityName, features, bypassLifecyclehooks);
    }

    return this.safelyInsertFeatures(entityName, features, bypassLifecyclehooks);
  }

  /**
   * Seed from file.
   *
   * @param {string} src
   * @param {string} file
   * @param {boolean} clean
   * @param {boolean} bypassLifecyclehooks
   * @return {Promise<any>}
   */
  private seedFile(src: string, file: string, clean: boolean, bypassLifecyclehooks: boolean): Promise<any> {
    const readFile: any = Bluebird.promisify(fs.readFile);

    return readFile(path.join(src, file), 'utf8')
      .then(data => {
        let [entityName, extension] = file.split('.'); // Very naive **might** need better

        if (extension === 'json') {
          let features = JSON.parse(data);

          return this.seedFeatures(entityName, features, clean, bypassLifecyclehooks);
        }

        if (extension === 'csv') {
          const parseP: any = Bluebird.promisify(parse);

          return parseP(data, {columns: true})
            .then(features => this.seedFeatures(entityName, features, clean, bypassLifecyclehooks));
        }

        return Promise.resolve();
      });
  }

  /**
   * Seed files contained in the fixtures directory.
   *
   * @return {Promise}
   */
  public seed(): Promise<any> {
    if (!this.config) {
      return Promise.reject(new Error('Seed configuration is not valid.'));
    }

    const fixturesDirectory = this.config.fetch('fixturesDirectory');

    if (!fixturesDirectory) {
      return Promise.reject(new Error('Seed configuration is not complete.'))
    }

    const bypassLifecyclehooks = this.config.fetchOrPut('bypassLifecyclehooks', false);
    const clean                = this.config.fetchOrPut('clean', false);

    const readDir: any = Bluebird.promisify(fs.readdir);

    return readDir(fixturesDirectory)
      .then(files => {
        const readers = [];

        files.forEach(file => {
          readers.push(this.seedFile(fixturesDirectory, file, clean, bypassLifecyclehooks));
        });

        return Promise.all(readers);
      });
  }
}
