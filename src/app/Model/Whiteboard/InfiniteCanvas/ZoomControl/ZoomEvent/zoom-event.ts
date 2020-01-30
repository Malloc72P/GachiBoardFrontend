export class ZoomEvent {
  private _action;
  private _zoomFactor;

  constructor(action, zoomFactor) {
    this.action = action;
    this.zoomFactor = zoomFactor;
  }

  get action() {
    return this._action;
  }

  set action(value) {
    this._action = value;
  }

  get zoomFactor() {
    return this._zoomFactor;
  }

  set zoomFactor(value) {
    this._zoomFactor = value;
  }
}
