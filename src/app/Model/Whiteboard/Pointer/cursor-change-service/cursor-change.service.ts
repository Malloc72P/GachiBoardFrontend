import { Injectable } from '@angular/core';
import CursorSetting from './cursors.json';
import {PointerMode} from "../pointer-mode-enum-service/pointer-mode-enum.service";

@Injectable({
  providedIn: 'root'
})
export class CursorChangeService {
  private htmlCanvasElement: HTMLCanvasElement;

  constructor() { }

  initializeCursorChangeService() {
    this.htmlCanvasElement = document.getElementById("cv1") as HTMLCanvasElement;
  }

  public change(mode: PointerMode) {
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

  public changeToGrab() {
    this.htmlCanvasElement.style.cursor = CursorSetting.canvas_mover;
  }

  public changeToGrabbing() {
    this.htmlCanvasElement.style.cursor = CursorSetting.canvas_mover_active;
  }
}
