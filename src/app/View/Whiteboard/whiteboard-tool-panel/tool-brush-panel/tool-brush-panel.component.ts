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
  private highlighterAlpha = 1;
  private strokeColors = [
    {isSelect: true, color: new Color(0, 0, 0, this.highlighterAlpha)},
    {isSelect: false, color: new Color(255, 0, 0, this.highlighterAlpha)},
    {isSelect: false, color: new Color(0, 255, 0, this.highlighterAlpha)},
    {isSelect: false, color: new Color(0, 0, 255, this.highlighterAlpha)}];


  constructor(
    private pointerModeManagerService: PointerModeManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.brushService.setWidth(this.strokeWidth);
  }
  colorToHTMLRGB(selectableColor: SelectableColor) {
    let tempColor = selectableColor.color.clone();
    tempColor.alpha = 1;
    return tempColor.toCSS(false);
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
    this.pointerModeManagerService.brushService.setColor(selectableColor.color);
  }
  unSelectAllColor() {
    for(let color of this.strokeColors) {
      color.isSelect = false;
    }
  }
  onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    color.alpha = this.highlighterAlpha;
    this.strokeColors.push({isSelect: false, color: color});
    this.onColorPickerClicked(this.strokeColors[this.strokeColors.length - 1]);
  }
}
