import * as paper from 'paper';

import {Component, OnInit} from '@angular/core';
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import {EditableShape} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape";
// @ts-ignore
import Color = paper.Color;
import {HotKeyManagementService} from "../../../../../Model/Whiteboard/HotKeyManagement/hot-key-management.service";

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
  public colors = [
    new Color(0, 0, 0),
    new Color(255, 0, 0),
    new Color(0, 255, 0),
    new Color(0, 0, 255),
  ];

  // TODO : WebFont 넣어주면 댐
  public fontFamilyList = [
    "sans-serif",
    "monospace",
  ];
  public colorPickerPicked;
  public fontStyle: FormGroup;

  public minSize = 10;
  public maxSize = 100;

  constructor(
    public menu: HorizonContextMenuService,
    public formBuilder: FormBuilder,
    private hotKeyManagement: HotKeyManagementService,
  ) {
    this.fontStyle = formBuilder.group({
      family: this.fontFamilyList[0],
      size: [10, [Validators.min(10), Validators.max(100)]]
    });
  }

  ngOnInit() {
    const fontSizeElement = document.getElementById("font-size");

    fontSizeElement.onfocus = () => {
      this.hotKeyManagement.disableHotKeySystem();
    };

    fontSizeElement.onblur = () => {
      this.hotKeyManagement.enableHotKeySystem();
    };
  }

  // ############# Font Family ##############

  public onChangeFontFamily() {
    this.menu.item.textStyle.fontFamily = this.fontStyle.value.family;
  }

  get fontFamily(): string {
    if(this.menu.item instanceof EditableShape) {
      return this.menu.item.textStyle.fontFamily;
    } else {
      return "sans-serif";
    }
  }

  // ############## Font Size ###############

  public onChangeFontSize() {
    let changedSize = this.fontStyle.value.size;

    if(!(changedSize >= this.minSize && changedSize <= this.maxSize)) {
      return;
    }
    if(this.menu.item.textStyle.fontSize !== this.fontStyle.value.size) {
      this.menu.item.textStyle.fontSize = this.fontStyle.value.size;
      this.menu.item.isModified = true;
    }
  }

  get fontSize(): string {
    if(this.menu.item instanceof EditableShape) {
      return this.menu.item.textStyle.fontSize + "";
    } else {
      return 10 + "";
    }
  }

  // ############# Font Weight ##############

  public onChangeFontWeight(event: MatButtonToggleChange) {
    if(this.menu.item.textStyle.isBold !== event.value.includes("bold")) {
      this.menu.item.textStyle.isBold = event.value.includes("bold");
      this.menu.item.isModified = true;
    }
    if(this.menu.item.textStyle.isItalic !== event.value.includes("italic")) {
      this.menu.item.textStyle.isItalic = event.value.includes("italic");
      this.menu.item.isModified = true;
    }
  }

  get isBold(): boolean {
    if(this.menu.item instanceof EditableShape) {
      return this.menu.item.textStyle.isBold;
    }
    return false;
  }

  get isItalic(): boolean {
    if(this.menu.item instanceof EditableShape) {
      return this.menu.item.textStyle.isItalic;
    }
    return false;
  }

  // ################ Color #################

  public colorToHTMLRGB(index: number) {
    return this.colors[index].toCSS(true);
  }

  public onColorPickerClicked(index: number) {
    if(this.menu.item.textStyle.fontColor !== this.colors[index].toCSS(true)) {
      this.menu.item.textStyle.fontColor = this.colors[index].toCSS(true);
      this.menu.item.isModified = true;
    }
  }

  public onAddColorClicked() {
    let color = new Color(this.colorPickerPicked);
    this.colors.push(color);
    this.onColorPickerClicked(this.colors.length - 1);
  }

  public colorSelectedToHTML(index: number) {
    if(this.menu.item instanceof EditableShape) {
      if(this.colors[index].toCSS(true) === this.menu.item.textStyle.fontColor) {
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

  get hidden(): boolean {
    return this.menu.subPanelManager.isHidden(HorizonContextMenuActions.FONT_STYLE);
  }

  get horizonContextMenuActions() {
    return HorizonContextMenuActions;
  }
}
