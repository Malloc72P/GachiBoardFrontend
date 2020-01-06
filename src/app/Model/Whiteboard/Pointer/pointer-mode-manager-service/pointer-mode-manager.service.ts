import {Injectable} from '@angular/core';

import * as paper from 'paper';
import {Brush} from '../brush/brush';
import {Eraser} from '../eraser/eraser';
import {LassoSelector} from '../lasso-selector/lasso-selector';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  // private toolMap: Map<number, object>;
  public currentPointerMode: number;
  public brush: Brush;
  public eraser: Eraser;
  public lassoSelector: LassoSelector;
  public mover;

  private touchStart = false;
  private mouseDown = false;

  constructor() {
    this.brush = new Brush();
    this.eraser = new Eraser();
    this.lassoSelector = new LassoSelector();
  }

  public initListener() {
    const htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;

    htmlCanvasObject.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    htmlCanvasObject.addEventListener("mousemove", (event) => {
      this.onMouseMove(event);
    });
    htmlCanvasObject.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });
    htmlCanvasObject.addEventListener("touchstart", (event) => {
      this.onTouchStart(event);
    });
    htmlCanvasObject.addEventListener("touchmove", (event) => {
      this.onTouchMove(event);
    });
    htmlCanvasObject.addEventListener("touchend", (event) => {
      this.onTouchEnd(event);
    });
  }

  // Touch - Start Listener
  private onTouchStart(event) {
    event.preventDefault();
    this.touchStart = true;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.brush.createPath(event);
        break;
      case PointerMode.ERASER:
        this.eraser.createPath(event);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.createPath(event);
        break;
      default:
        break;
    }
  }

  // Touch - Move Listener
  private onTouchMove(event) {
    event.preventDefault();
    if(this.touchStart) {
      switch (this.currentPointerMode) {
        case PointerMode.MOVE:
          break;
        case PointerMode.DRAW:
          this.brush.drawPath(event);
          break;
        case PointerMode.ERASER:
          this.eraser.drawPath(event);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.lassoSelector.drawPath(event);
          break;
        default:
          break;
      }
    }
  }

  // Touch - End Listener
  private onTouchEnd(event) {
    event.preventDefault();
    this.touchStart = false;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.brush.endPath();
        break;
      case PointerMode.ERASER:
        this.eraser.endPath();
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.endPath(event);
        break;
      default:
        break;
    }
  }

  // Mouse - Down Listener
  private onMouseDown(event) {
    event.preventDefault();
    this.mouseDown = true;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.brush.createPath(event);
        break;
      case PointerMode.ERASER:
        this.eraser.createPath(event);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.createPath(event);
        break;
      default:
        break;
    }
  }

  // Mouse - Move Listener
  private onMouseMove(event) {
    event.preventDefault();
    if(this.mouseDown) {
      switch (this.currentPointerMode) {
        case PointerMode.MOVE:
          break;
        case PointerMode.DRAW:
          this.brush.drawPath(event);
          break;
        case PointerMode.ERASER:
          this.eraser.drawPath(event);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.lassoSelector.drawPath(event);
          break;
        default:
          break;
      }
    }
  }

  // Mouse - Up Listener
  private onMouseUp(event) {
    event.preventDefault();
    this.mouseDown = false;
    switch (this.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.brush.endPath();
        break;
      case PointerMode.ERASER:
        this.eraser.endPath();
        break;
      case PointerMode.LASSO_SELECTOR:
        this.lassoSelector.endPath(event);
        break;
      default:
        break;
    }
  }
}
