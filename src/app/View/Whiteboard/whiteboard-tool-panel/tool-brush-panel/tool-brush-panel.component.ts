import { Component, OnInit } from '@angular/core';
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import * as paper from 'paper'
// @ts-ignore
import Color = paper.Color;
import {PanelManagerService} from '../../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PointerMode} from '../../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';


@Component({
  selector: 'app-tool-brush-panel',
  templateUrl: './tool-brush-panel.component.html',
  styleUrls: ['./tool-brush-panel.component.css']
})

export class ToolBrushPanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;

  private strokeColorIndex: number = 0;
  private colors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
  ];

  constructor(
    private pointerModeManagerService: PointerModeManagerService,
    private panelManger: PanelManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.brushService.setWidth(this.strokeWidth);
  }
  colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(false);
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
    this.pointerModeManagerService.brushService.setColor(this.colors[index]);
    this.panelManger.toolIconColor[PointerMode.DRAW] = this.colors[index].toCSS(false);
  }
  onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }
}
