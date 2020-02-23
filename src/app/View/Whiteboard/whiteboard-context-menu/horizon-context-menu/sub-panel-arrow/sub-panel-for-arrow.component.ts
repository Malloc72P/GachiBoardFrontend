import * as paper from "paper";
// @ts-ignore
import Color = paper.Color;

import {Component, OnInit} from '@angular/core';
import {HorizonContextMenuActions} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.enum";
import {HorizonContextMenuService} from "../../../../../Model/Whiteboard/ContextMenu/horizon-context-menu-service/horizon-context-menu.service";
import {LinkModeManagerService} from "../../../../../Model/Whiteboard/InfiniteCanvas/DrawingLayerManager/LinkModeManagerService/link-mode-manager.service";
import {
  EditableLinkCapTypes,
  EditableLinkTypes
} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link-types.enum";
import {EditableLink} from "../../../../../Model/Whiteboard/Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {SubPanelManager} from "../../../../../Model/Whiteboard/Panel/sub-panel-manager/sub-panel-manager";

enum SelectMode {
  TAIL,
  LINE,
  HEAD,
}

@Component({
  selector: 'app-sub-panel-for-arrow',
  templateUrl: './sub-panel-for-arrow.component.html',
  styleUrls: ['../horizon-context-menu.component.css',
    './sub-panel-for-arrow.component.css']
})
export class SubPanelForArrowComponent implements OnInit {
  public arrowStyles: Array<string>;
  public colors = [
    new paper.Color(0, 0, 0),
    new paper.Color(255, 0, 0),
    new paper.Color(0, 255, 0),
    new paper.Color(0, 0, 255),
  ];

  private _currentMode: SelectMode = SelectMode.LINE;
  private _subPanel: SubPanelManager;

  constructor(
    public menu: HorizonContextMenuService,
    public linkModeManager: LinkModeManagerService
  ) { }

  ngOnInit() {
    this.initArrowStyles();
    this._subPanel = new SubPanelManager([
      SelectMode.TAIL,
      SelectMode.LINE,
      SelectMode.HEAD,
    ]);
    this._subPanel.revealThis(SelectMode.LINE);
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

  public onClickModeSelector(mode: SelectMode) {
    this._currentMode = mode;
    this._subPanel.hideOther(mode);
    this._subPanel.revealThis(mode);
  }

  public onClickHeadSelector(type: string) {
    if(this.menu.item instanceof EditableLink) {
      this.menu.item.linkHeadType = EditableLinkCapTypes[type];
    }
  }

  public onClickTailSelector(type: string) {
    if(this.menu.item instanceof EditableLink) {
      this.menu.item.linkTailType = EditableLinkCapTypes[type];
      console.log("SubPanelForArrowComponent >> onClickTailSelector >> this.menu.item.linkTailType : ", this.menu.item.linkTailType);
    }
  }

  public onChangeColorSelector(color: Color) {
    if(this.menu.item instanceof EditableLink) {
      this.menu.item.linkColor = color;
    }
  }

  public svgReflection(mode: SelectMode) {
    if(mode === SelectMode.TAIL) {
      return "transform: scaleX(-1)";
    }
    return "";
  }

  public currentMode(mode: SelectMode): boolean {
    return mode === this._currentMode;
  }

  public colorSelected(index: number) {
    if(this.menu.item instanceof EditableLink) {
      if(this.colors[index].equals(this.menu.item.linkColor)) {
        return "selected";
      }
      return "";
    }
  }

  public colorToHtml(color: Color) {
    return color.toCSS(false);
  }

  get centerTop(): { x: number; y: number } {
    return this.menu.centerTop;
  }

  get hidden(): boolean {
    return this.menu.subPanelManager.isHidden(HorizonContextMenuActions.ARROW_WING);
  }

  get ModeArray(): Array<string> {
    return [
      this.currentLinkTail,
      this.currentLinkLine,
      this.currentLinkHead,
    ];
  }

  get linkColor(): string {
    if(this.menu.item instanceof EditableLink) {
      return this.menu.item.linkColor.toCSS(true);
    }
    return "#000";
  }

  get subPanel(): SubPanelManager {
    return this._subPanel;
  }

  get SelectMode() {
    return SelectMode;
  }

  get LinkArray(): Array<string> {
    return [
      "NONE",
      "ARROW",
    ];
  }

  get currentLinkHead(): string {
    if(this.menu.item instanceof EditableLink) {
      return EditableLinkCapTypes[this.menu.item.linkHeadType];
    }
    return "NONE"
  }

  get currentLinkTail(): string {
    if(this.menu.item instanceof EditableLink) {
      return EditableLinkCapTypes[this.menu.item.linkTailType];
    }
    return "NONE"
  }

  get currentLinkLine(): string {
    if(this.menu.item instanceof EditableLink) {
      if(this.menu.item.isDashed) {
        return "DASHED";
      }
      return "NONE";
    }
  }

  get linkWidth(): number {
    if(this.menu.item instanceof EditableLink) {
      return this.menu.item.linkWidth;
    }
    return 1;
  }

  set linkWidth(value: number) {
    if(this.menu.item instanceof EditableLink) {
      this.menu.item.linkWidth = value;
    }
  }

  get isDashed(): boolean {
    if(this.menu.item instanceof EditableLink) {
      return this.menu.item.isDashed;
    }
    return false;
  }

  set isDashed(value: boolean) {
    if(this.menu.item instanceof EditableLink) {
      this.menu.item.isDashed = value;
    }
  }

  get horizonContextMenuActions() {
    return HorizonContextMenuActions;
  }

  get editableLinkTypes() {
    return EditableLinkTypes;
  }
}
