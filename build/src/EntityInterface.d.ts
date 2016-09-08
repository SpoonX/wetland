import { Mapping } from './Mapping';
export interface EntityInterface {
    /**
     * Optional mapping (not required when using decorators).
     *
     * @param mapping
     */
    setMapping?(mapping: Mapping): void;
}
