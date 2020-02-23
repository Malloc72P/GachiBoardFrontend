import * as paper from 'paper';
// @ts-ignore
import Color = paper.Color;

import {Component, Input, OnInit} from '@angular/core';
import {HorizonContextMenuActions} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {DrawingLayerManagerService} from '../../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';


@Component({
  selector: 'app-horizon-context-menu',
  templateUrl: './horizon-context-menu.component.html',
  styleUrls: ['./horizon-context-menu.component.css']
})
export class HorizonContextMenuComponent implements OnInit {
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
    public layerService: DrawingLayerManagerService,
  ) { }

  ngOnInit() {
  }

  // ################### public Method #####################

  public onClickMenuItem(action: HorizonContextMenuActions) {
    this.menu.subPanelManager.hideOther(action);
    switch (action) {
      case HorizonContextMenuActions.LINE:
        this.menu.subPanelManager.toggleThis(action);
        break;
      case HorizonContextMenuActions.FILL:
        this.menu.subPanelManager.toggleThis(action);
        break;
      case HorizonContextMenuActions.LOCK:
        this.layerService.globalSelectedGroup.lockItems();
        this.menu.refreshMenuItem();
        break;
      case HorizonContextMenuActions.UNLOCK:
        this.layerService.globalSelectedGroup.unlockItems();
        this.menu.refreshMenuItem();
        break;
      case HorizonContextMenuActions.FONT_STYLE:
        this.menu.subPanelManager.toggleThis(action);
        break;
      case HorizonContextMenuActions.MORE:
        break;
      case HorizonContextMenuActions.ARROW_WING:
        this.menu.subPanelManager.toggleThis(action);
        break;
      case HorizonContextMenuActions.GROUP:
        this.layerService.groupSelectedItems();
        break;
      case HorizonContextMenuActions.UNGROUP:
        this.layerService.ungroupSelectedItems();
        break;
    }
  }

  public getMenuButtonIcon(action: HorizonContextMenuActions) {
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

  convertEnumToName(enumNumber){
    return HorizonContextMenuActions[enumNumber];
  }

  get isHidden(): boolean {
    return this.menu.isHidden;
  }

  get centerTop(): { x: number; y: number } {
    return this.menu.centerTop;
  }

  get menuItemArray(): HorizonContextMenuActions[] {
    return this.menu.menuItemArray;
  }
}
