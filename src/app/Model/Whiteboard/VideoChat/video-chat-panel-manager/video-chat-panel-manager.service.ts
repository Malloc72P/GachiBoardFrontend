import {Injectable} from '@angular/core';
import {PanelData} from "../../../../View/Whiteboard/video-chat/PanelData/panel-data";

@Injectable({
  providedIn: 'root'
})
export class VideoChatPanelManagerService {
  private _videoPanels = new Map<string, PanelData>();
  private readonly margin = 10;
  private readonly panelSize = 200;

  constructor( ) {

  }

  public addPanel(userName: string) {
    let maxRow = Math.trunc((this.browserHeight - this.margin) / (this.panelSize + this.margin));
    let maxColumn = Math.trunc((this.browserWidth - this.margin) / (this.panelSize + this.margin));

    let row = this.numberOfPanel % maxColumn;
    let column = Math.trunc(this.numberOfPanel / maxColumn);

    this._videoPanels.set(userName, new PanelData(
      userName,
      this.margin + this.panelSize + (this.panelSize + this.margin) * column,
      this.margin + (this.panelSize + this.margin) * row
    ))
  }

  public removePanel(userName: string) {
    this._videoPanels.delete(userName);
  }

  public clearPanel() {
    this._videoPanels.clear();
  }

  get videoPanels(): Map<string, PanelData> {
    return this._videoPanels;
  }

  get isPanelHidden(): boolean {
    return this._videoPanels.size === 0;
  }

  get browserWidth(): number {
    return document.body.offsetWidth;
  }

  get browserHeight(): number {
    return document.body.offsetHeight;
  }

  private get numberOfPanel(): number {
    return this._videoPanels.size;
  }
}
