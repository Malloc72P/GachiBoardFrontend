import { Component, OnInit } from '@angular/core';
import {subPanelStatus} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/sub-panel-status";
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {LinkModeManagerService} from "../../../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service";
import {EditableLink} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {EditableLinkTypes} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";

@Component({
  selector: 'app-sub-panel-for-arrow',
  templateUrl: './sub-panel-for-arrow.component.html',
  styleUrls: ['../horizon-context-menu.component.css']
})
export class SubPanelForArrowComponent implements OnInit {
  public arrowStyles: Array<string>;

  constructor(
    public menu: HorizonContextMenuService,
    public linkModeManager: LinkModeManagerService
  ) { }

  ngOnInit() {
    this.initArrowStyles();
  }

  // public isSelect(style: EditableLinkTypes): boolean {
  //   if(this.menu.item instanceof EditableLink) {
  //     if(style === this.menu.item.linkType) {
  //       return true;
  //     }
  //   }
  //
  //   return false;
  // }

  public onClickArrowStyle(style: string) {

  }

  public initArrowStyles() {
    this.arrowStyles = new Array<string>();
    for(let style in EditableLinkTypes) {
      if(EditableLinkTypes.hasOwnProperty(style)) {
        if(parseInt(style) >= 0) {
          this.arrowStyles[style] = EditableLinkTypes[style];
        }
      }
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

  get editableLinkTypes() {
    return EditableLinkTypes;
  }
}
