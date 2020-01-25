export class PointerModeEvent {
  private _currentMode;
  constructor(mode){
    this._currentMode = mode;
  }

  get currentMode() {
    return this._currentMode;
  }

  set currentMode(value) {
    this._currentMode = value;
  }
}
