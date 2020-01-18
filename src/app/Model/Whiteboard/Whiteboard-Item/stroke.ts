import {EditableStroke} from "./whiteboard-item/editable-stroke/editable-stroke";

export class SimpleStroke extends EditableStroke {

}

export class HighlightStroke extends EditableStroke {
  private _opacity: number;

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }
}
