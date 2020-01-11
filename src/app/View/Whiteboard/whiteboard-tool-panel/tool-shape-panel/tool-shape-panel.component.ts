import { Component, OnInit } from '@angular/core';
import * as paper from 'paper'
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PointerMode} from '../../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {ShapeStyle} from '../../../../Model/Helper/data-type-enum/data-type.enum';

type SelectableColor = {
  isSelect: boolean;
  color: paper.Color;
}

@Component({
  selector: 'app-tool-shape-panel',
  templateUrl: './tool-shape-panel.component.html',
  styleUrls: ['./tool-shape-panel.component.css']
})
export class ToolShapePanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;

  private strokeColors = [
    {isSelect: true, color: new paper.Color(0, 0, 0)},
    {isSelect: false, color: new paper.Color(255, 0, 0)},
    {isSelect: false, color: new paper.Color(0, 255, 0)},
    {isSelect: false, color: new paper.Color(0, 0, 255)}];

  constructor(
    private pointerModeManagerService: PointerModeManagerService,
    private panelManagerService: PanelManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.shape.strokeWidth = this.strokeWidth;
  }
  colorToHTMLRGB(selectableColor: SelectableColor) {
    return selectableColor.color.toCSS(false);
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
    this.pointerModeManagerService.shape.strokeColor = selectableColor.color;
    this.panelManagerService.toolIconColor[PointerMode.SHAPE] = selectableColor.color.toCSS(false);
  }
  unSelectAllColor() {
    for(let color of this.strokeColors) {
      color.isSelect = false;
    }
  }
  onAddColorClicked() {
    let color = new paper.Color(this.colorPickerPicked);
    this.strokeColors.push({isSelect: false, color: color});
    this.onColorPickerClicked(this.strokeColors[this.strokeColors.length - 1]);
  }
  onShapePickerClicked(shape: string) {
    this.pointerModeManagerService.shape.shapeStyle = ShapeStyle[shape];
  }

  get shapes() {
    let shapeList = new Array<string>();
    for (let shapeStyleKey in ShapeStyle) {
      if(ShapeStyle.hasOwnProperty(shapeStyleKey)) {
        if(parseInt(shapeStyleKey) >= 0) {
          shapeList.push(ShapeStyle[shapeStyleKey]);
        }
      }
    }
    return shapeList;
  }
}
