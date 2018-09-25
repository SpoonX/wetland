import { Wetland } from './Wetland';
import { EntityCtor } from './EntityInterface';
import { UnitOfWork } from './UnitOfWork';
import { Mapping } from './Mapping';
import { ArrayCollection } from './ArrayCollection';
import { Homefront } from 'homefront';
import * as fs from 'fs';
import * as parse from 'csv-parse';
import * as path from 'path';
import * as Bluebird from 'bluebird';

export class Seeder {

  config: Homefront = new Homefront();

  wetland: Wetland;

  constructor(wetland: Wetland) {
    this.wetland = wetland;
    this.config  = this.config.merge(wetland.getConfig().fetch('seed'));
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
        let [ entityName, extension ] = file.split('.'); // Very naive **might** need better

        if (extension === 'json') {
          let features = JSON.parse(data);

          return this.seedFeatures(entityName, features, clean, bypassLifecyclehooks);
        }

        if (extension === 'csv') {
          const parseP: any = Bluebird.promisify(parse);

          return parseP(data, { columns: true })
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
      return Promise.reject(new Error('Seed configuration is not complete.'));
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
