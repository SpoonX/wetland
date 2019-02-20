import { Criteria } from './Criteria';

export class On extends Criteria {
  protected conditions: { and: string, or: string } = { and: 'on', or: 'orOn' };
}
