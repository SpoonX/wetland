import { Criteria } from './Criteria';

export class Having extends Criteria {
  protected conditions: {and: string, or: string} = { and: 'having', or: 'orHaving' };
}
