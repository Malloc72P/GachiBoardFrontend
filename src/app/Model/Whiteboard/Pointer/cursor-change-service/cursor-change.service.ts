import { Injectable } from '@angular/core';
import CursorSetting from './cursors.json';
import {PointerMode} from "../pointer-mode-enum-service/pointer-mode-enum.service";
import {PointerModeManagerService} from "../pointer-mode-manager-service/pointer-mode-manager.service";
import {HandlerDirection} from "../../Whiteboard-Item/ItemAdjustor/ItemHandler/handler-direction.enum";

@Injectable({
  providedIn: 'root'
})
export class CursorChangeService {
  private htmlCanvasElement: HTMLCanvasElement;
  private htmlTempCanvasElement: HTMLCanvasElement;

  constructor() { }

  initializeCursorChangeService() {
    this.htmlCanvasElement = document.getElementById("cv1") as HTMLCanvasElement;
    this.htmlTempCanvasElement = document.getElementById("tempCv") as HTMLCanvasElement;
  }

  private changeTo(mode: PointerMode) {
    switch (mode) {
      case PointerMode.POINTER:
        this.changeCursorShape(CursorSetting.normal_pointer);
        break;
      case PointerMode.MOVE:
        this.changeCursorShape(CursorSetting.canvas_mover);
        break;
      case PointerMode.DRAW:
        this.changeCursorShape(CursorSetting.brush);
        break;
      case PointerMode.HIGHLIGHTER:
        this.changeCursorShape(CursorSetting.highlighter);
        break;
      case PointerMode.SHAPE:
        this.changeCursorShape(CursorSetting.shape);
        break;
      case PointerMode.LINK:
        this.changeCursorShape(CursorSetting.link);
        break;
      case PointerMode.ERASER:
        this.changeCursorShape(CursorSetting.eraser);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.changeCursorShape(CursorSetting.lasso);
        break;
      default:
        break;
    }
  }

  public syncCurrentPointerMode(currentMode: PointerMode) {
    this.changeTo(currentMode);
  }

  public changeResize(direction: HandlerDirection) {
    switch (direction) {
      case HandlerDirection.TOP_LEFT:
      case HandlerDirection.BOTTOM_RIGHT:
        this.changeCursorShape("nwse-resize");
        break;
      case HandlerDirection.TOP_CENTER:
      case HandlerDirection.BOTTOM_CENTER:
        this.changeCursorShape("ns-resize");
        break;
      case HandlerDirection.TOP_RIGHT:
      case HandlerDirection.BOTTOM_LEFT:
        this.changeCursorShape("nesw-resize");
        break;
      case HandlerDirection.CENTER_LEFT:
      case HandlerDirection.CENTER_RIGHT:
        this.changeCursorShape("ew-resize");
        break;

    }
  }

  public changeToGrab() {
    this.changeCursorShape(CursorSetting.canvas_mover);
  }

  public changeToGrabbing() {
    this.changeCursorShape(CursorSetting.canvas_mover_active);
  }

  private changeCursorShape(cursorName){
    this.htmlCanvasElement.style.cursor = cursorName;
    this.htmlTempCanvasElement.style.cursor = cursorName;
  }
}
