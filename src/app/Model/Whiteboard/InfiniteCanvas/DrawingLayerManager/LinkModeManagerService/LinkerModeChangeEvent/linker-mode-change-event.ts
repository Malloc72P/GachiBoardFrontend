import {LinkerMode} from '../LinkMode/linker-mode';

export class LinkerModeChangeEvent {
  private _currentLinkerMode:LinkerMode;

  constructor(currentLinkerMode) {
    this._currentLinkerMode = currentLinkerMode;
  }

  get currentLinkerMode() {
    return this._currentLinkerMode;
  }

  set currentLinkerMode(value) {
    this._currentLinkerMode = value;
  }
}
