import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PanelManagerService {
  private HTMLBrushPanel;
  private HTMLToolPanel;
  public isHideBrushPanel: boolean = true;

  constructor() { }

  private onClickOutsidePanel(event) {
    this.HTMLBrushPanel = document.getElementById("brushPanel");
    this.HTMLToolPanel = document.getElementById("toolPanel");

    if(!(this.HTMLBrushPanel.contains(event.target) || this.HTMLToolPanel.contains(event.target))){
      this.isHideBrushPanel = true;
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
