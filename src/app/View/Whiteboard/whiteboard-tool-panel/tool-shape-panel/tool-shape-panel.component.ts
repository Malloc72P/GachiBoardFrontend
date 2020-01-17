import { Component, OnInit } from '@angular/core';
import * as paper from 'paper'
import {PointerModeManagerService} from '../../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {PointerMode} from '../../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {ShapeStyle} from '../../../../Model/Helper/data-type-enum/data-type.enum';

enum ColorMode {
  STROKE,
  FILL,
}

@Component({
  selector: 'app-tool-shape-panel',
  templateUrl: './tool-shape-panel.component.html',
  styleUrls: ['./tool-shape-panel.component.css']
})
export class ToolShapePanelComponent implements OnInit {
  private strokeWidth: number;
  private colorPickerPicked: string;

  private colorSelectMode: number = 0;
  private strokeColorIndex: number = 0;
  private fillColorIndex: number = -1;
  private colors = [
    new paper.Color(0, 0, 0),
    new paper.Color(255, 0, 0),
    new paper.Color(0, 255, 0),
    new paper.Color(0, 0, 255),
  ];

  constructor(
    private pointerModeManagerService: PointerModeManagerService,
    private panelManagerService: PanelManagerService
  ) { }

  ngOnInit() {
  }

  onStrokeWidthChanged() {
    this.pointerModeManagerService.shape.strokeWidth = this.strokeWidth;
  }
  colorToHTMLRGB(color: paper.Color) {
    if(color != null) {
      return color.toCSS(false);
    } else {
      return ;
    }
  }

  transparencySelectedToHTML() {
    if(this.colorSelectMode === ColorMode.STROKE) {
      if(this.strokeColorIndex === -1) {
        return "/assets/images/tools/color_none.svg#color_none_selected";
      }
      return "/assets/images/tools/color_none.svg#color_none";
    }
    if(this.fillColorIndex === -1) {
      return "/assets/images/tools/color_none.svg#color_none_selected";
    }
    return "/assets/images/tools/color_none.svg#color_none";
  }

  colorSelectedToHTML(index: number) {
    if(this.colorSelectMode === ColorMode.STROKE) {
      if(index === this.strokeColorIndex) {
        return "selected";
      }
      return;
    } else {
      if(index === this.fillColorIndex) {
        return "selected";
      } else {
        return;
      }
    }
  }
  colorChangeModeSelectedToHTML(index: number) {
    if(index === this.colorSelectMode) {
      return "selected";
    } else {
      return;
    }
  }
  onColorPickerClicked(index: number) {
    if(this.colorSelectMode === ColorMode.STROKE) {
      this.strokeColorIndex = index;
      if(index === -1) {
        this.pointerModeManagerService.shape.strokeColor = null;
        this.panelManagerService.toolIconColor[PointerMode.SHAPE] = "none";
        return;
      }
      this.pointerModeManagerService.shape.strokeColor = this.colors[index];
      this.panelManagerService.toolIconColor[PointerMode.SHAPE] = this.colors[index].toCSS(false);
    } else {
      this.fillColorIndex = index;
      if(index === -1) {
        this.pointerModeManagerService.shape.fillColor = null;
        return;
      }
      this.pointerModeManagerService.shape.fillColor = this.colors[index];
      // this.panelManagerService.toolIconColor[PointerMode.SHAPE] = this.colors[index].toCSS(false);
    }
  }
  onAddColorClicked() {
    let color = new paper.Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }
  onShapePickerClicked(shape: string) {
    this.pointerModeManagerService.shape.shapeStyle = ShapeStyle[shape];
  }
  onColorSelectModeChangeClicked(mode: number) {
    this.colorSelectMode = mode;
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

  get colorMode() {
    return ColorMode;
  }
}
