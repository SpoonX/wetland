import {Scope} from './Scope';
import {EntityCtor} from './EntityInterface';
import {ArrayCollection as Collection} from './ArrayCollection';
import {Mapping} from './Mapping';
import {UnitOfWork} from './UnitOfWork';

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
    let options    = {populate: new Collection(), alias: mapping.getTableName()};
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

      if (typeof data[property] !== 'object' || data[property] === null) {
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
   * Assign data based on a collection.
   *
   * @param {EntityCtor}      Entity
   * @param {{}}              data
   * @param {{}}              [base]
   * @param {boolean|number}  [recursive]
   *
   * @returns {Collection<T>}
   */
  private assignCollection<T>(Entity: EntityCtor<T>, data: Array<Object>, base?: Collection<T>, recursive: boolean | number = 1): Array<T> {
    base = base || new Collection;

    base.splice(0);

    data.forEach(rowData => {
      base.push(this.assign(Entity, rowData, null, recursive));
    });

    return base;
  }

  /**
   * Assign data to base. Create new if not provided.
   *
   * @param {EntityCtor}      Entity
   * @param {{}}              data
   * @param {{}}              [base]
   * @param {boolean|number}  [recursive]
   *
   * @returns {T}
   */
  public assign<T>(Entity: EntityCtor<T>, data: Object, base?: T | Collection<T>, recursive: boolean | number = 1): T {
    let mapping = this.entityManager.getMapping(Entity);
    let fields  = mapping.getFields();
    let primary = mapping.getPrimaryKey();

    // Ensure base.
    if (!(base instanceof Entity)) {
      if (typeof data === 'string' || typeof data === 'number') {
        // Convenience, allow the primary key value.
        return this.entityManager.getReference(Entity, data, false) as T;
      }

      if (data && data[primary]) {
        // Get the reference (from identity map or mocked)
        base = this.entityManager.getReference(Entity, data[primary]) as T;

        base['activateProxying']();
      } else {
        // Create a new instance and persist.
        base = new Entity();

        this.entityManager.persist(base);
      }
    }

    Reflect.ownKeys(data).forEach((property: string) => {
      let field = fields[property];

      // Only allow mapped fields to be assigned.
      if (!field) {
        return;
      }

      // Only relationships require special treatment. This isn't one, so just assign and move on.
      if (!field.relationship) {
        if (['date', 'dateTime', 'datetime', 'time'].indexOf(field.type) > -1 && !(data[property] instanceof Date)) {
          data[property] = new Date(data[property]);
        }
        const dehydrator = mapping.getDehydrationTransformationFunction(property)
        base[property] = dehydrator(data[property]);
        return;
      }

      if (!data[property]) {
        if (base[property]) {
          delete base[property];
        }

        return;
      }

      if (!recursive) {
        return;
      }

      if (Array.isArray(data[property]) && !data[property].length && (!base[property] || !base[property].length)) {
        return;
      }

      let level = recursive;

      if (typeof level === 'number') {
        level--;
      }

      let targetConstructor = this.entityManager.resolveEntityReference(field.relationship.targetEntity);

      if (Array.isArray(data[property])) {
        base[property] = this.assignCollection(targetConstructor, data[property], base[property], level);
      } else if (data[property]) {
        base[property] = this.assign(targetConstructor, data[property], base[property], level);
      }
    });

    return base;
  }
}
