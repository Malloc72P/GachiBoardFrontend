import {EditableShape} from "./whiteboard-item/editable-shape/editable-shape";

export class EditableRectangle extends EditableShape {

}

export class EditableCircle extends EditableShape {
  private _radius: number;


  get radius(): number {
    return this._radius;
  }

  set radius(value: number) {
    this._radius = value;
  }
}

export class EditableTriangle extends EditableShape {

}

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

export class EditableRaster extends EditableShape {
  private _imageBlob: string;

  get imageBlob(): string {
    return this._imageBlob;
  }

  set imageBlob(value: string) {
    this._imageBlob = value;
  }
}
