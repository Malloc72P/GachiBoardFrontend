import { Component, OnInit } from '@angular/core';
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import * as paper from 'paper'
// @ts-ignore
import Color = paper.Color;

@Component({
  selector: 'app-tool-brush-panel',
  templateUrl: './tool-brush-panel.component.html',
  styleUrls: ['./tool-brush-panel.component.css']
})
export class ToolBrushPanelComponent implements OnInit {
  private strokeWidth: number;
  private strokeColor: string;
  private strokeColors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255)];

  constructor(
    private pointerModeManagerService: PointerModeManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.brush.setWidth(this.strokeWidth);
  }
  colorToHTMLRGB(color: Color) {
    return "rgb(" + color.red + ", " + color.green + ", " + color.blue + ")";
  }
  onColorPickerClicked(color: Color) {
    this.pointerModeManagerService.brush.setColor(color);
  }
}
