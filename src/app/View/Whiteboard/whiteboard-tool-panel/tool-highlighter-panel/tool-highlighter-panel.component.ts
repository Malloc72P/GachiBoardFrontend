import { Component, OnInit } from '@angular/core';
import * as paper from 'paper'
// @ts-ignore
import Color = paper.Color;
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PointerMode} from '../../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

@Component({
  selector: 'app-tool-highlighter-panel',
  templateUrl: './tool-highlighter-panel.component.html',
  styleUrls: ['./tool-highlighter-panel.component.css']
})
export class ToolHighlighterPanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;
  private highlighterAlpha = 0.3;

  private strokeColorIndex: number = 0;
  private colors = [
    new Color(255, 255, 0, this.highlighterAlpha),
    new Color(0, 255, 0, this.highlighterAlpha),
    new Color(255, 0, 0, this.highlighterAlpha),
  ];

  constructor(
    private pointerModeManagerService: PointerModeManagerService,
    private panelManger: PanelManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.highlighter.setWidth(this.strokeWidth * 20);
  }
  colorToHTMLRGB(index: number) {
    let tempColor = this.colors[index].clone();
    tempColor.alpha = 1;
    return tempColor.toCSS(false);
  }
  colorSelectedToHTML(index: number) {
    if(index === this.strokeColorIndex) {
      return "selected";
    } else {
      return;
    }
  }
  onColorPickerClicked(index: number) {
    this.strokeColorIndex = index;
    this.pointerModeManagerService.highlighter.setColor(this.colors[index]);
    this.panelManger.toolIconColor[PointerMode.HIGHLIGHTER] = this.colorToHTMLRGB(index);
  }
  onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    color.alpha = this.highlighterAlpha;
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }
}
