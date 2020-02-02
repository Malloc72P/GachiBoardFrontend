import {Component, OnInit} from '@angular/core';
import {HorizonContextMenuActions} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";


@Component({
  selector: 'app-horizon-context-menu',
  templateUrl: './horizon-context-menu.component.html',
  styleUrls: ['./horizon-context-menu.component.css']
})
export class HorizonContextMenuComponent implements OnInit {

  constructor(
    private horizonContextMenuService: HorizonContextMenuService,
  ) { }

  ngOnInit() {
  }

  // ################### Private Method #####################

  private onClickMenuItem(action: HorizonContextMenuActions) {
    switch (action) {
      case HorizonContextMenuActions.LINE:
        break;
      case HorizonContextMenuActions.FILL:
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
        return "/assets/images/context-menu/arrow_wing.svg#arrow_wing";
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

  get leftTop(): { x: string; y: string } {
    return this.horizonContextMenuService.leftTop;
  }

  get menuItemArray(): HorizonContextMenuActions[] {
    return this.horizonContextMenuService.menuItemArray;
  }
}
