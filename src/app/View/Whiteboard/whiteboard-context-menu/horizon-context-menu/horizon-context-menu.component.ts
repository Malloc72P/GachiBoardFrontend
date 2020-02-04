import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import {Component, Input, OnInit} from '@angular/core';
import {HorizonContextMenuActions} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {MatSliderChange} from "@angular/material/slider";
import {subPanelStatus} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";


@Component({
  selector: 'app-horizon-context-menu',
  templateUrl: './horizon-context-menu.component.html',
  styleUrls: ['./horizon-context-menu.component.css']
})
export class HorizonContextMenuComponent implements OnInit {
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

  // ################### Private Method #####################

  private onClickMenuItem(action: HorizonContextMenuActions) {
    this.horizonContextMenuService.subPanelHidden.hideOther(action);
    switch (action) {
      case HorizonContextMenuActions.LINE:
        this.horizonContextMenuService.subPanelHidden.toggleThis(action);
        break;
      case HorizonContextMenuActions.FILL:
        this.horizonContextMenuService.subPanelHidden.toggleThis(action);
        break;
      case HorizonContextMenuActions.LOCK:
        break;
      case HorizonContextMenuActions.UNLOCK:
        break;
      case HorizonContextMenuActions.FONT_STYLE:
        break;
      case HorizonContextMenuActions.MORE:
        break;
      case HorizonContextMenuActions.ARROW_WING:
        this.horizonContextMenuService.subPanelHidden.toggleThis(action);
        break;
      case HorizonContextMenuActions.GROUP:
        break;
      case HorizonContextMenuActions.UNGROUP:
        break;
    }
  }

  private getMenuButtonIcon(action: HorizonContextMenuActions) {
    switch (action) {
      case HorizonContextMenuActions.LINE:
        return "/assets/images/context-menu/line.svg#line";
      case HorizonContextMenuActions.FILL:
        return "/assets/images/context-menu/circle.svg#circle";
      case HorizonContextMenuActions.LOCK:
        return "/assets/images/context-menu/locked.svg#locked";
      case HorizonContextMenuActions.UNLOCK:
        return "/assets/images/context-menu/unlocked.svg#unlocked";
      case HorizonContextMenuActions.FONT_STYLE:
        return "/assets/images/context-menu/font.svg#font";
      case HorizonContextMenuActions.MORE:
        return "/assets/images/context-menu/more.svg#more";
      case HorizonContextMenuActions.ARROW_WING:
        return "/assets/images/context-menu/arrow.svg#arrow";
      case HorizonContextMenuActions.GROUP:
        return "/assets/images/context-menu/group.svg#group";
      case HorizonContextMenuActions.UNGROUP:
        return "/assets/images/context-menu/ungroup.svg#ungroup";
    }
  }

  // ################ Getter & Setter #################

  get isHidden(): boolean {
    return this.horizonContextMenuService.isHidden;
  }

  get centerTop(): { x: number; y: number } {
    return this.horizonContextMenuService.centerTop;
  }

  get menuItemArray(): HorizonContextMenuActions[] {
    return this.horizonContextMenuService.menuItemArray;
  }
}
