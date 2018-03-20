export class ValueObject {
  private constructor(private value: any) {

  }

  static fromValue(value: any): ValueObject {
    return new this(value)
  }

  toValue(): any {
    return this.value
  }

  equals(anotherValueObject: ValueObject): any {
    return anotherValueObject.value === this.value
  }
}
