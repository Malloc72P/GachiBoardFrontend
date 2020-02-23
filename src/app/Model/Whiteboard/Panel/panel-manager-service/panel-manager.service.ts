import {Injectable} from '@angular/core';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {SubPanelManager} from "../sub-panel-manager/sub-panel-manager";

@Injectable({
  providedIn: 'root'
})
export class PanelManagerService {
  private readonly _subPanel: SubPanelManager;
  public toolIconColor = new Array<string>();

  constructor() {
    this._subPanel = new SubPanelManager([
      PointerMode.DRAW,
      PointerMode.HIGHLIGHTER,
      PointerMode.LINK,
      PointerMode.SHAPE
    ]);

    this.toolIconColor[PointerMode.MOVE] = '#000';
    this.toolIconColor[PointerMode.DRAW] = '#000';
    this.toolIconColor[PointerMode.HIGHLIGHTER] = '#ff0';
    this.toolIconColor[PointerMode.SHAPE] = '#000';
    this.toolIconColor[PointerMode.ERASER] = '#000';
    this.toolIconColor[PointerMode.LASSO_SELECTOR] = '#000';
  }

  get subPanel(): SubPanelManager {
    return this._subPanel;
  }
}
