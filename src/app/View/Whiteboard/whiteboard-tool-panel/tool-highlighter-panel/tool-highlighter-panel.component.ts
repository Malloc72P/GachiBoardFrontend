import { Component, OnInit } from '@angular/core';
import * as paper from 'paper'
// @ts-ignore
import Color = paper.Color;
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

type SelectableColor = {
  isSelect: boolean;
  color: Color;
}

@Component({
  selector: 'app-tool-highlighter-panel',
  templateUrl: './tool-highlighter-panel.component.html',
  styleUrls: ['./tool-highlighter-panel.component.css']
})
export class ToolHighlighterPanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;
  private highlighterAlpha = 0.3;
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
    this.pointerModeManagerService.highlighter.setWidth(this.strokeWidth);
  }
  colorToHTMLRGB(selectableColor: SelectableColor) {
    return "rgba(" + selectableColor.color.red + ", "
      + selectableColor.color.green + ", "
      + selectableColor.color.blue + ", "
      + 1 + ")";
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
    this.pointerModeManagerService.highlighter.setColor(selectableColor.color);
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
