import {EditableShape} from '../../editable-shape/editable-shape';

export class EditableCircle extends EditableShape {
  private _radius: number;


  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }
}
