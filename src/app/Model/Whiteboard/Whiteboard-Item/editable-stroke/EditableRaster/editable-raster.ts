import {EditableShape} from '../../editable-shape/editable-shape';

export class EditableRaster extends EditableShape {
  private _imageBlob: string;

  get imageBlob(): string {
    return this._imageBlob;
  }

  set imageBlob(value: string) {
    this._imageBlob = value;
  }
}
