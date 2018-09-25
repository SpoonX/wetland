import { CustomRepository } from '../repository/CustomRepository';

export class WithCustomRepository {
  public static setMapping(mapping) {
    mapping.entity({ repository: CustomRepository });
  }
}
