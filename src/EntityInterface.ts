import {Mapping} from './Mapping';
import {Scope} from './Scope';

export interface EntityInterface {
  /**
   * Optional mapping (not required when using decorators).
   *
   * @param mapping
   */
  setMapping?(mapping: Mapping<any>): void;

  beforeCreate?(entityManager: Scope): Promise<any> | void;

  afterCreate?(entityManager: Scope): Promise<any> | void;

  beforeUpdate?(values: Object, entityManager: Scope): Promise<any> | void;

  afterUpdate?(entityManager: Scope): Promise<any> | void;

  beforeRemove?(entityManager: Scope): Promise<any> | void;

  afterRemove?(entityManager: Scope): Promise<any> | void;
}

export interface ProxyInterface extends EntityInterface {
  isEntityProxy?: boolean;

  activateProxying?(): ProxyInterface;

  deactivateProxying?(): ProxyInterface;

  getTarget?(): EntityInterface;

  isProxyingActive?(): boolean;
}

export type EntityCtor<T> = new (...args: any[]) => T;
