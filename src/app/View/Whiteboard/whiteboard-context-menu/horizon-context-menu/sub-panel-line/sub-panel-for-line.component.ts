import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import {Component, OnInit} from '@angular/core';
import {MatSliderChange} from "@angular/material/slider";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {subPanelStatus} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";
import {WhiteboardItem} from "../../../../../Model/Whiteboard/Whiteboard-Item/whiteboard-item";
import {SimpleArrowLink} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/SimpleArrowLink/simple-arrow-link";

@Component({
  selector: 'app-sub-panel-for-line',
  templateUrl: './sub-panel-for-line.component.html',
  styleUrls: ['../horizon-context-menu.component.css']
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
    private menu: HorizonContextMenuService,
  ) { }

  ngOnInit() {
  }

  private colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(false);
  }

  private onStrokeWidthChanged(event: MatSliderChange) {
    this.coreItem.strokeWidth = event.value;
  }

  private onColorPickerClicked(index: number) {
    this.coreItem.strokeColor = this.colors[index];
  }

  private onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }

  private colorSelectedToHTML(index: number) {
    if(this.menu.globalSelectedGroup.wbItemGroup.length > 0) {
      if(this.colors[index].equals(this.coreItem.strokeColor)) {
        return "selected";
      } else {
        return;
      }
    } else {
      return;
    }
  }

  get strokeWidth(): number {
    if(this.menu.globalSelectedGroup.wbItemGroup.length > 0) {
      return this.coreItem.strokeWidth;
    } else {
      return 1;
    }
  }

  get coreItem() {
    if(this.menu.item instanceof WhiteboardItem) {
      return this.menu.item.coreItem;
    } else if(this.menu.item instanceof SimpleArrowLink) {
      return this.menu.item.linkObject;
    }
  }

  get centerTop(): { x: number; y: number } {
    return this.menu.centerTop;
  }

  get isHiddenSubPanel(): subPanelStatus {
    return this.menu.subPanelHidden;
  }

  get horizonContextMenuActions() {
    return HorizonContextMenuActions;
  }
}
