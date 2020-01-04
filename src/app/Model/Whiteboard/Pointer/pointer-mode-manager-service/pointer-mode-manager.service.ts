import {Injectable} from '@angular/core';

import * as paper from 'paper';
import {Brush} from '../brush/brush';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  // private toolMap: Map<number, object>;
  public currentPointerMode: number;
  public brush: Brush;
  public eraser;
  public selector;
  public mover;

  constructor() {
    this.brush = new Brush();
  }
}
