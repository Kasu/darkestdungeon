import {serializable} from 'serializr';

export class Vector {
  @serializable x: number = 0;
  @serializable y: number = 0;

  get id () {
    return this.x + '_' + this.y;
  }

  constructor (x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add (other: Vector) {
    return new Vector(
      this.x + other.x,
      this.y + other.y
    );
  }

  distance (other: Vector) {
    const a = other.x - this.x;
    const b = other.y - this.y;
    return Math.sqrt(a * a + b * b);
  }
}
