import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import {Component, OnInit} from '@angular/core';
import {MatSliderChange} from "@angular/material/slider";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {EditableLink} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";

@Component({
  selector: 'app-sub-panel-for-line',
  templateUrl: './sub-panel-for-line.component.html',
  styleUrls: ['../horizon-context-menu.component.css']
})
export class SubPanelForLineComponent implements OnInit {
  // TODO : 유저 데이터에 있을 컬러를 colors 로 지정해주면 댐 -- 전역에서 사용하는 user-color
  public colors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
  ];
  public colorPickerPicked;

  constructor(
    public menu: HorizonContextMenuService,
  ) { }

  ngOnInit() {
  }

  public colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(false);
  }

  public onStrokeWidthChanged(event: MatSliderChange) {
    if(this.menu.coreItem.strokeWidth !== event.value) {
      this.menu.coreItem.strokeWidth = event.value;
      this.menu.item.isModified = true;
    }
  }

  public onColorPickerClicked(index: number) {
    if(this.menu.coreItem.strokeColor !== this.colors[index]) {
      this.menu.coreItem.strokeColor = this.colors[index];
      this.menu.item.isModified = true;
    }
  }

  public onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }

  public colorSelectedToHTML(index: number) {
    if(this.menu.globalSelectedGroup.wbItemGroup.length > 0) {
      if(this.colors[index].equals(this.menu.coreItem.strokeColor)) {
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
      return this.menu.coreItem.strokeWidth;
    } else {
      return 1;
    }
  }

  get centerTop(): { x: number; y: number } {
    return this.menu.centerTop;
  }

  get hidden(): boolean {
    return this.menu.subPanelManager.isHidden(HorizonContextMenuActions.LINE);
  }

  get horizonContextMenuActions() {
    return HorizonContextMenuActions;
  }
}
