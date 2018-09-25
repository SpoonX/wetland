import { EntityRepository } from '../../../src/EntityRepository';

export class CustomRepository extends EntityRepository<any> {
  public foo() {
    return 'bar';
  }
}
