import {Injectable} from '@angular/core';

import * as paper from 'paper';
import {Brush} from '../brush/brush';
import {Eraser} from '../eraser/eraser';
import {LassoSelector} from '../lasso-selector/lasso-selector';

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

  constructor() {
    this.brush = new Brush();
    this.eraser = new Eraser();
    this.lassoSelector = new LassoSelector();
  }
}
