import { Injectable } from '@angular/core';
import {PointerMode} from '../../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

@Injectable({
  providedIn: 'root'
})
export class PanelManagerService {
  private HTMLBrushPanel;
  private HTMLToolPanel;
  private HTMLHighLighterPanel;
  private HTMLShapePanel;
  public isHideBrushPanel: boolean = true;
  public isHideHighlighterPanel: boolean = true;
  public isHideShapePanel: boolean = true;

  public toolIconColor = new Array<string>();

  constructor() {
    this.toolIconColor[PointerMode.MOVE] = '#000';
    this.toolIconColor[PointerMode.DRAW] = '#000';
    this.toolIconColor[PointerMode.HIGHLIGHTER] = '#ff0';
    this.toolIconColor[PointerMode.SHAPE] = '#000';
    this.toolIconColor[PointerMode.ERASER] = '#000';
    this.toolIconColor[PointerMode.LASSO_SELECTOR] = '#000';
  }

  private onClickOutsidePanel(event) {
    this.HTMLBrushPanel = document.getElementById("brushPanel");
    this.HTMLHighLighterPanel = document.getElementById("highlighterPanel");
    this.HTMLToolPanel = document.getElementById("toolPanel");
    this.HTMLShapePanel = document.getElementById("shapePanel");

    // ToolPanel 이나 BrushPanel 을 누르지 않은경우 BrushPanel 숨김
    if(!(this.HTMLToolPanel.contains(event.target) || this.HTMLBrushPanel.contains(event.target))) {
      this.isHideBrushPanel = true;
    // ToolPanel 이나 HighLighterPanel 을 누르지 않은경우 HighLighterPanel 숨김
    }
    if (!(this.HTMLToolPanel.contains(event.target) || this.HTMLHighLighterPanel.contains(event.target))) {
      this.isHideHighlighterPanel = true;
    }
    // ToolPanel 이나 ShapePanel 을 누르지 않은경우 ShapePanel 숨김
    if (!(this.HTMLToolPanel.contains(event.target) || this.HTMLShapePanel.contains(event.target))) {
      this.isHideShapePanel = true;
      console.log('PanelManagerService >> onClickOutsidePanel >> Hi');
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
