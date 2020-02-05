import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import { Component, OnInit } from '@angular/core';
import {subPanelStatus} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {FormBuilder, FormGroup} from "@angular/forms";
import {MatButtonToggleChange} from "@angular/material/button-toggle";

@Component({
  selector: 'app-sub-panel-for-font',
  templateUrl: './sub-panel-for-font.component.html',
  styleUrls: [
    '../horizon-context-menu.component.css',
    './sub-panel-for-font.component.css'
  ]
})
export class SubPanelForFontComponent implements OnInit {
  // TODO : 유저 데이터에 있을 컬러를 colors 로 지정해주면 댐 -- 전역에서 사용하는 user-color
  private colors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
  ];
  private colorPickerPicked;
  private fontStyle: FormGroup;

  constructor(
    private menu: HorizonContextMenuService,
    private formBuilder: FormBuilder,
  ) {
    this.fontStyle = formBuilder.group({
      family: "Hi",
      size: 10,
    });
  }

  ngOnInit() {
  }

  // ############## Font Size ###############

  private onChangeFontSize() {
    this.menu.item.editText.fontSize = this.fontStyle.value.size;
    this.menu.item.textStyle.fontSize = this.fontStyle.value.size;
  }

  get fontSize(): string {
    if(this.menu.item) {
      return this.menu.item.editText.fontSize + "";
    } else {
      return 10 + "";
    }
  }

  // ############# Font Weight ##############

  private onChangeFontWeight(event: MatButtonToggleChange) {
    if(event.value.includes("bold")) {
      this.menu.item.textStyle.fontWeight = "bold";
      this.menu.item.editText.fontWeight = "bold";
    } else {
      this.menu.item.textStyle.fontWeight = "";
      this.menu.item.editText.fontWeight = "";
    }
    if(event.value.includes("italic")) {
      this.menu.item.textStyle.isItalic = true;
      this.menu.item.textStyle.fontWeight += " italic";
      this.menu.item.editText.fontWeight += " italic";
    }
  }

  // ################ Color #################

  private colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(false);
  }

  private onColorPickerClicked(index: number) {
    this.menu.item.editText.fillColor = this.colors[index];
    this.menu.item.textStyle.fontColor = this.colors[index].toCSS(false);
  }

  private onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }

  private colorSelectedToHTML(index: number) {
    if(this.menu.globalSelectedGroup.wbItemGroup.length > 0) {
      if(this.colors[index].equals(this.menu.item.editText.fillColor)) {
        return "selected";
      } else {
        return;
      }
    } else {
      return;
    }
  }

  // ################ Panel #################

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
