import {Scope} from './Scope';
import {EntityCtor, ProxyInterface} from './EntityInterface';
import {ArrayCollection} from './ArrayCollection';
import {Mapping} from './Mapping';
import {UnitOfWork} from './UnitOfWork';
import {IdentityMap} from './IdentityMap';

export class Populate {

  /**
   * @type {Scope}
   */
  private entityManager: Scope;

  /**
   * @type {UnitOfWork}
   */
  private unitOfWork: UnitOfWork;

  constructor(entityManager: Scope) {
    this.entityManager = entityManager;
    this.unitOfWork    = entityManager.getUnitOfWork();
  }

  /**
   * Find records for update based on provided data.
   *
   * @param {number|string} primaryKey
   * @param {EntityCtor}    Entity
   * @param {{}}            data
   *
   * @returns {Promise<{new()}>}
   */
  public findDataForUpdate(primaryKey: string | number, Entity: EntityCtor<{new ()}>, data: Object): Promise<any> {
    let repository = this.entityManager.getRepository(Entity);
    let mapping    = this.entityManager.getMapping(Entity);
    let options    = {populate: new ArrayCollection(), alias: mapping.getTableName()};
    let relations  = mapping.getRelations();

    Reflect.ownKeys(data).forEach(property => {
      if (!relations || !relations[property]) {
        return;
      }

      let relation  = relations[property];
      let reference = this.entityManager.resolveEntityReference(relation.targetEntity);
      let type      = relation.type;

      if (type === Mapping.RELATION_ONE_TO_MANY || type === Mapping.RELATION_MANY_TO_MANY) {
        return options.populate.add({[property]: property});
      }

      if (typeof data[property] !== 'object') {
        return;
      }

      if (!data[property][Mapping.forEntity(reference).getPrimaryKey()]) {
        return;
      }

      options.populate.add({[property]: property});
    });

    return repository.findOne(primaryKey, options);
  }

  /**
   * Assign data to base. Create new if not provided.
   *
   * @param {EntityCtor}  Entity
   * @param {{}}          data
   * @param {{}}          [base]
   *
   * @returns {ArrayCollection<T>|T}
   */
  public assign<T>(Entity: EntityCtor<T>, data: Object | Array<Object>, base?: T | ArrayCollection<T>): T | Array<T> {
    let mapping   = this.entityManager.getMapping(Entity);
    let relations = mapping.getRelations();

    // If no base was supplied, this is a new entity. Create and stage for persist.
    if (!base) {
      base = new Entity;

      this.entityManager.persist(base);
    }

    // Let's fill up our base, heh.
    Reflect.ownKeys(data).forEach(property => {
      // Not a relation? Simply assign.
      if (!relations || !relations[property]) {
        base[property] = data[property];

        return;
      }

      // Relation, let's figure out what kind of relation.
      let relation      = relations[property];
      let reference     = this.entityManager.resolveEntityReference(relation.targetEntity);
      let targetMapping = Mapping.forEntity(reference);
      let primaryKey    = targetMapping.getPrimaryKey();
      let type          = relation.type;

      // Not a collection.
      if (type !== Mapping.RELATION_ONE_TO_MANY && type !== Mapping.RELATION_MANY_TO_MANY) {

        // Unset relation.
        if (data[property] === null || data[property] === false) {
          delete base[property];

          return;
        }

        // Primary key value it is!
        if (typeof data[property] === 'string' || typeof data[property] === 'number') {
          return base[property] = this.entityManager.getReference(reference, data[property], false);
        }

        // No arrays allowed.
        if (Array.isArray(data[property])) {
          throw new Error('Relation is not a *ToMany relation, yet an array was supplied.');
        }

        // At this point we're expecting an object.
        if (typeof data[property] !== 'object' || data[property] === null) {
          throw new Error(
            `Invalid type for relation on '${mapping.getEntityName()}.${property}'. Got type '${typeof data[property]}'`
          );
        }

        // Figure out if we'll be updating a reference, creating a new record or updating existing.
        if (!data[property][primaryKey]) {
          // No PK value, create and link.
          base[property] = this.entityManager.attach(new reference, true);

          this.entityManager.persist(base[property]);
        } else if ((!(base[property] instanceof reference)) || data[property][primaryKey] !== base[property][primaryKey]) {
          // Non-matching PKs. We're using base to assign.
          base[property] = this.entityManager.getReference(reference, data[property][primaryKey]);

          base[property].activateProxying();
        }

        let targetRelations = targetMapping.getRelations();

        // Assign properties
        Reflect.ownKeys(data[property]).forEach(dataProperty => {
          if (targetRelations && targetRelations[dataProperty]) {
            return;
          }

          base[property][dataProperty] = data[property][dataProperty];
        });
      } else {
        let entityMap = {};

        if (base[property]) {
          // Create a map out of base data (id => entity)
          base[property].forEach(entity => {
            entityMap[entity[primaryKey]] = entity;
          });

          // Mark all current relations as divorced. Home wrecker...
          base[property].splice(0);
        } else {
          base[property] = new ArrayCollection;
        }

        let assignEntity = entity => {
          if (typeof entity === 'string' || typeof entity === 'number') {
            return base[property].push(this.entityManager.getReference(reference, entity, false));
          }

          // At this point, value has to be an object.
          if (typeof entity !== 'object' || entity === null) {
            throw new Error(
              `Invalid type for relation on '${mapping.getEntityName()}.${property}'. Got type '${typeof entity}'`
            );
          }

          // I sort of loved the titanic... Also, this is the thing we'll be setting the values from data on.
          let canvas;

          // Let's decide what we'll be drawing on
          if (!entity[primaryKey]) {
            // No PK, so new record + relation.
            canvas = this.entityManager.attach(new reference, true);

            this.entityManager.persist(canvas);
          } else if (entityMap[entity[primaryKey]]) {
            // Existing relation and record.
            canvas = entityMap[entity[primaryKey]];
          } else {
            // New relation, existing record.
            canvas = this.entityManager.getReference(reference, entity[primaryKey], true);

            canvas.activateProxying();
          }

          // Apply values
          let targetRelations = targetMapping.getRelations();

          // Assign properties
          Reflect.ownKeys(entity).forEach(dataProperty => {
            if (targetRelations[dataProperty]) {
              return;
            }

            canvas[dataProperty] = entity[dataProperty];
          });

          base[property].push(canvas);
        };

        if (!Array.isArray(data[property]) || (Array.isArray(data[property]) && !data[property].length)) {
          // Falsy value, nothing left to do here.
          if (!data[property] || (Array.isArray(data[property]) && !data[property].length)) {
            return;
          }

          return assignEntity(data[property]);
        }

        data[property].forEach(entity => {
          if (!entity) {
            throw new Error('Value for collection is falsy.');
          }

          assignEntity(entity);
        });
      }
    });

    return base;
  }
}
