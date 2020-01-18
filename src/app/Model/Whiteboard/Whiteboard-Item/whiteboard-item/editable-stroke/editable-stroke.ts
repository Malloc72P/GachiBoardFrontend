export abstract class EditableStroke extends WhiteboardItem {
  private _segments: Array<paper.Point>;
  private _strokeWidth: number;
  private _strokeColor: number;

  get segments(): Array<paper.Point> {
    return this._segments;
  }

  set segments(value: Array<paper.Point>) {
    this._segments = value;
  }

  get strokeWidth(): number {
    return this._strokeWidth;
  }

  set strokeWidth(value: number) {
    this._strokeWidth = value;
  }

  get strokeColor(): number {
    return this._strokeColor;
  }

  set strokeColor(value: number) {
    this._strokeColor = value;
  }
}
