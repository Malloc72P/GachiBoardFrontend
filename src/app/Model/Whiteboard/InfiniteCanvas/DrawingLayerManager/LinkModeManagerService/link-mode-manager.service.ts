import {EventEmitter, Injectable} from '@angular/core';
import {LinkerMode} from './LinkMode/linker-mode';
import {LinkerModeChangeEvent} from './LinkerModeChangeEvent/linker-mode-change-event';
import {LinkerColorEnum, LinkerModeEnum, LinkerStrokeWidthLevelEnum} from './LinkMode/linker-mode-enum.enum';

@Injectable({
  providedIn: 'root'
})
export class LinkModeManagerService {
  private _currentLinkerMode:LinkerMode;
  private _linkerModeEventEmitter:EventEmitter<any>;


  constructor() {
    this._currentLinkerMode = new LinkerMode(LinkerModeEnum.SIMPLE_lINE_lINK);
  }

  public initLinkModeManagerService(linkerModeEventEmitter){
    this._linkerModeEventEmitter = linkerModeEventEmitter;
    this.changeLinkerMode(
      LinkerModeEnum.SIMPLE_DASHED_ARROW_lINK,
      LinkerColorEnum.BLACK,
      LinkerStrokeWidthLevelEnum.LEVEL_1,
      LinkerColorEnum.BLACK);
  }
  public setDefaultLineLinkerMode(){
    this.changeLinkerMode(
      LinkerModeEnum.SIMPLE_lINE_lINK,
      LinkerColorEnum.BLACK,
      LinkerStrokeWidthLevelEnum.LEVEL_1,
      LinkerColorEnum.BLACK);
  }
  public setDefaultDashedLineLinkerMode(){
    this.changeLinkerMode(
      LinkerModeEnum.SIMPLE_DASHED_lINE_lINK,
      LinkerColorEnum.BLACK,
      LinkerStrokeWidthLevelEnum.LEVEL_1,
      LinkerColorEnum.BLACK);
  }
  public setDefaultArrowLinkerMode(){
    this.changeLinkerMode(
      LinkerModeEnum.SIMPLE_ARROW_LINK,
      LinkerColorEnum.BLACK,
      LinkerStrokeWidthLevelEnum.LEVEL_1,
      LinkerColorEnum.BLACK);
  }
  public setDefaultDasshedArrowLinkerMode(){
    this.changeLinkerMode(
      LinkerModeEnum.SIMPLE_DASHED_ARROW_lINK,
      LinkerColorEnum.BLACK,
      LinkerStrokeWidthLevelEnum.LEVEL_1,
      LinkerColorEnum.BLACK);
  }

  public changeLinkerMode(mode, strokeColor?, strokeWidth?, fillColor?){
    this._currentLinkerMode.mode = mode;
    strokeColor   = (strokeColor) ? (strokeColor) : (LinkerColorEnum.BLACK);
    strokeWidth   = (strokeWidth) ? (strokeWidth) : (LinkerStrokeWidthLevelEnum.LEVEL_1);
    fillColor     = (fillColor)   ? (fillColor)   : (LinkerColorEnum.BLACK);

    this._currentLinkerMode.strokeColor = strokeColor;
    this._currentLinkerMode.strokeWidth = strokeWidth;
    this._currentLinkerMode.fillColor = fillColor;

    console.log("LinkModeManagerService >> changeLinkerMode >> currentLinkerMode : ",(LinkerModeEnum[this._currentLinkerMode.mode]));
    this._linkerModeEventEmitter.emit(new LinkerModeChangeEvent(this._currentLinkerMode));
  }


  get currentLinkerMode(): LinkerMode {
    return this._currentLinkerMode;
  }

  set currentLinkerMode(value: LinkerMode) {
    this._currentLinkerMode = value;
  }

  get linkerModeEventEmitter(): EventEmitter<any> {
    return this._linkerModeEventEmitter;
  }

  set linkerModeEventEmitter(value: EventEmitter<any>) {
    this._linkerModeEventEmitter = value;
  }
}
