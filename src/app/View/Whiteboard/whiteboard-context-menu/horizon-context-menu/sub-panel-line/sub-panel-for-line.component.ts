import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import {Component, OnInit} from '@angular/core';
import {MatSliderChange} from "@angular/material/slider";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {subPanelStatus} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";

@Component({
  selector: 'app-sub-panel-for-line',
  templateUrl: './sub-panel-for-line.component.html',
  styleUrls: ['./sub-panel-for-line.component.css']
})
export class SubPanelForLineComponent implements OnInit {
  // TODO : 유저 데이터에 있을 컬러를 colors 로 지정해주면 댐 -- 전역에서 사용하는 user-color
  private colors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
  ];
  private colorPickerPicked;

  constructor(
    private horizonContextMenuService: HorizonContextMenuService,
  ) { }

  ngOnInit() {
  }

  private colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(false);
  }

  private onStrokeWidthChanged(event: MatSliderChange) {
    this.horizonContextMenuService.globalSelectedGroup.wbItemGroup[0].coreItem.strokeWidth = event.value;
  }

  private onColorPickerClicked(index: number) {
    this.horizonContextMenuService.globalSelectedGroup.wbItemGroup[0].coreItem.strokeColor = this.colors[index];
  }

  private onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }

  private colorSelectedToHTML(index: number) {
    if(this.horizonContextMenuService.globalSelectedGroup.wbItemGroup.length > 0) {
      if(this.colors[index].equals(this.horizonContextMenuService.globalSelectedGroup.wbItemGroup[0].coreItem.strokeColor)) {
        return "selected";
      } else {
        return;
      }
    } else {
      return;
    }
  }

  get strokeWidth(): number {
    if(this.horizonContextMenuService.globalSelectedGroup.wbItemGroup.length > 0) {
      return this.horizonContextMenuService.globalSelectedGroup.wbItemGroup[0].coreItem.strokeWidth;
    } else {
      return 1;
    }
  }

  get centerTop(): { x: number; y: number } {
    return this.horizonContextMenuService.centerTop;
  }

  get isHiddenSubPanel(): subPanelStatus {
    return this.horizonContextMenuService.subPanelHidden;
  }

  get horizonContextMenuActions() {
    return HorizonContextMenuActions;
  }
}
