import {Mapping} from './Mapping';

export interface EntityInterface {
  /**
   * Optional mapping (not required when using decorators).
   *
   * @param mapping
   */
  setMapping?(mapping: Mapping<any>): void;
}

export interface ProxyInterface extends EntityInterface {
  isEntityProxy?: boolean;

  activateProxying?(): ProxyInterface;

  deactivateProxying?(): ProxyInterface;

  getTarget?(): EntityInterface;

  isProxyingActive?(): boolean;
}

export type EntityCtor<T> = new (...args: any[]) => T;
