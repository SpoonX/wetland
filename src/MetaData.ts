import { Homefront } from 'homefront';
import { ProxyInterface, EntityInterface, EntityCtor } from './EntityInterface';

export class MetaData {
  /**
   * Static weakmap of objects their metadata.
   *
   * @type {WeakMap<Object, Homefront>}
   */
  private static metaMap: WeakMap<Object, Homefront> = new WeakMap<Object, Homefront>();

  /**
   * Get metadata for provided target (uses constructor).
   *
   * @param {function|{}} target
   *
   * @returns {Homefront}
   */
  static forTarget(target: Function | Object): Homefront {
    return MetaData.ensure(MetaData.getConstructor(target));
  }

  /**
   * Ensure metadata for provided target.
   *
   * @param {*} target
   *
   * @returns {Homefront}
   */
  static ensure(target: any): Homefront {
    if (!MetaData.metaMap.has(target)) {
      MetaData.metaMap.set(target, new Homefront());
    }

    return MetaData.metaMap.get(target);
  }

  /**
   * Clear the MetaData for provided targets.
   *
   * @param {*} targets
   */
  static clear(...targets: any[]): void {
    targets.forEach(target => MetaData.metaMap.delete(MetaData.getConstructor(target)));
  }

  /**
   * Get metadata for provided target (accepts instance).
   *
   * @param {ProxyInterface} instance
   *
   * @returns {Homefront}
   */
  static forInstance(instance: ProxyInterface): Homefront {
    if (typeof instance !== 'object') {
      throw new Error("Can't get metadata, provided instance isn't of type Object.");
    }

    return MetaData.ensure(instance.isEntityProxy ? instance.getTarget() : instance);
  }

  /**
   * Get the constructor for provided target.
   *
   * @param {function|{}} target
   *
   * @returns {Function}
   */
  public static getConstructor(target: ProxyInterface): Function {
    return (typeof target === 'function' ? target : target.constructor) as Function;
  }
}
