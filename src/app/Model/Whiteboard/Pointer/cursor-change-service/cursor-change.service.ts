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

  constructor() { }

  initializeCursorChangeService() {
    this.htmlCanvasElement = document.getElementById("cv1") as HTMLCanvasElement;
  }

  private changeTo(mode: PointerMode) {
    switch (mode) {
      case PointerMode.POINTER:
        this.htmlCanvasElement.style.cursor = CursorSetting.normal_pointer;
        break;
      case PointerMode.MOVE:
        this.htmlCanvasElement.style.cursor = CursorSetting.canvas_mover;
        break;
      case PointerMode.DRAW:
        this.htmlCanvasElement.style.cursor = CursorSetting.brush;
        break;
      case PointerMode.HIGHLIGHTER:
        this.htmlCanvasElement.style.cursor = CursorSetting.highlighter;
        break;
      case PointerMode.SHAPE:
        this.htmlCanvasElement.style.cursor = CursorSetting.shape;
        break;
      case PointerMode.LINK:
        this.htmlCanvasElement.style.cursor = CursorSetting.link;
        break;
      case PointerMode.ERASER:
        this.htmlCanvasElement.style.cursor = CursorSetting.eraser;
        break;
      case PointerMode.LASSO_SELECTOR:
        this.htmlCanvasElement.style.cursor = CursorSetting.lasso;
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
        this.htmlCanvasElement.style.cursor = "nwse-resize";
        break;
      case HandlerDirection.TOP_CENTER:
      case HandlerDirection.BOTTOM_CENTER:
        this.htmlCanvasElement.style.cursor = "ns-resize";
        break;
      case HandlerDirection.TOP_RIGHT:
      case HandlerDirection.BOTTOM_LEFT:
        this.htmlCanvasElement.style.cursor = "nesw-resize";
        break;
      case HandlerDirection.CENTER_LEFT:
      case HandlerDirection.CENTER_RIGHT:
        this.htmlCanvasElement.style.cursor = "ew-resize";
        break;

    }
  }

  public changeToGrab() {
    this.htmlCanvasElement.style.cursor = CursorSetting.canvas_mover;
  }

  public changeToGrabbing() {
    this.htmlCanvasElement.style.cursor = CursorSetting.canvas_mover_active;
  }
}
