import { Component, OnInit } from '@angular/core';
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import * as paper from 'paper'
// @ts-ignore
import Color = paper.Color;

type SelectableColor = {
  isSelect: boolean;
  color: Color;
}

@Component({
  selector: 'app-tool-brush-panel',
  templateUrl: './tool-brush-panel.component.html',
  styleUrls: ['./tool-brush-panel.component.css']
})

export class ToolBrushPanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;
  private strokeColors = [
    {isSelect: true, color: new Color(0, 0, 0, 1)},
    {isSelect: false, color: new Color(255, 0, 0, 1)},
    {isSelect: false, color: new Color(0, 255, 0, 1)},
    {isSelect: false, color: new Color(0, 0, 255, 1)}];

  constructor(
    private pointerModeManagerService: PointerModeManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.brush.setWidth(this.strokeWidth);
  }
  colorToHTMLRGB(selectableColor: SelectableColor) {
    return "rgba(" + selectableColor.color.red + ", "
      + selectableColor.color.green + ", "
      + selectableColor.color.blue + ", "
      + selectableColor.color.alpha + ")";
  }
  selectedToCSSClass(selectableColor: SelectableColor) {
    if(selectableColor.isSelect) {
      return "selected";
    } else {
      return;
    }
  }
  onColorPickerClicked(selectableColor: SelectableColor) {
    this.unSelectAllColor();
    selectableColor.isSelect = true;
    this.pointerModeManagerService.brush.setColor(selectableColor.color);
  }
  unSelectAllColor() {
    for(let color of this.strokeColors) {
      color.isSelect = false;
    }
  }
  onAddColorClicked() {
    this.strokeColors.push({isSelect: false, color: new Color(this.colorPickerPicked)});
  }
}
