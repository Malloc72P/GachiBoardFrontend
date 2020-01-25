export class ZoomEvent {
  private _action;

  constructor(action) {
    this.action = action;
  }

  get action() {
    return this._action;
  }

  set action(value) {
    this._action = value;
  }
}
