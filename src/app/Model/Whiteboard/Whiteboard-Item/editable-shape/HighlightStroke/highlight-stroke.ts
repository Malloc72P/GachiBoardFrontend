import {EditableStroke} from '../../editable-stroke/editable-stroke';

export class HighlightStroke extends EditableStroke {
  private _opacity: number;

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }
}
