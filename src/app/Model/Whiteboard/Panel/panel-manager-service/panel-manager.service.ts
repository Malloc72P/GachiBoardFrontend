import { Injectable } from '@angular/core';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

@Injectable({
  providedIn: 'root'
})
export class PanelManagerService {
  private HTMLBrushPanel;
  private HTMLToolPanel;
  private HTMLHighLighterPanel;
  public isHideBrushPanel: boolean = true;
  public isHideHighlighterPanel: boolean = true;

  public toolIconColor = new Array<string>();

  constructor() {
    this.toolIconColor[PointerMode.MOVE] = '#000';
    this.toolIconColor[PointerMode.DRAW] = '#000';
    this.toolIconColor[PointerMode.HIGHLIGHTER] = '#ff0';
    this.toolIconColor[PointerMode.ERASER] = '#000';
    this.toolIconColor[PointerMode.LASSO_SELECTOR] = '#000';
  }

  private onClickOutsidePanel(event) {
    this.HTMLBrushPanel = document.getElementById("brushPanel");
    this.HTMLHighLighterPanel = document.getElementById("highlighterPanel");
    this.HTMLToolPanel = document.getElementById("toolPanel");

    // ToolPanel이나 BrushPanel을 누르지 않은경우 BrushPanel 숨김
    if(!(this.HTMLToolPanel.contains(event.target) || this.HTMLBrushPanel.contains(event.target))) {
      this.isHideBrushPanel = true;
    // ToolPanel이나 HighLighterPanel 누르지 않은경우 HighLighterPanel 숨김
    }
    if (!(this.HTMLToolPanel.contains(event.target) || this.HTMLHighLighterPanel.contains(event.target))) {
      this.isHideHighlighterPanel = true;
    }
  }

  public brushPanelOutsideClickListener() {
    document.addEventListener("mousedown", (event) => {
      this.onClickOutsidePanel(event);
    });
    document.addEventListener("touchstart", (event) => {
      this.onClickOutsidePanel(event);
    });
  }
}
