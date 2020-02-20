import { Component, OnInit } from '@angular/core';
import {subPanelStatus} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {EditableShape} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape";
import {SimpleArrowLink} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/SimpleArrowLink/simple-arrow-link";

@Component({
  selector: 'app-sub-panel-for-arrow',
  templateUrl: './sub-panel-for-arrow.component.html',
  styleUrls: ['../horizon-context-menu.component.css']
})
export class SubPanelForArrowComponent implements OnInit {
  private arrowStyles = new Array<string>(
    "default",
  );

  constructor(
    private menu: HorizonContextMenuService,
  ) { }

  ngOnInit() {
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

  get selectedSVG(): string {
    return "selected";
  }
}
