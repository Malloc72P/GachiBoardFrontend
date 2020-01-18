import {EditableShape} from '../../editable-shape/editable-shape';

export class EditableCard extends EditableShape {
  private _borderRadius: number;
  private _tagList: Array<any>;    // TODO : 일단 ANY 지만 TAG 형식 지정되면 바꾸기

  get borderRadius(): number {
    return this._borderRadius;
  }

  set borderRadius(value: number) {
    this._borderRadius = value;
  }

  get tagList(): Array<any> {
    return this._tagList;
  }

  set tagList(value: Array<any>) {
    this._tagList = value;
  }
}
