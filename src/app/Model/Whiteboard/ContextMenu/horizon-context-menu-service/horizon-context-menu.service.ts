import * as paper from 'paper';

import {EventEmitter, Injectable} from '@angular/core';
import {HorizonContextMenuActions, HorizonContextMenuTypes} from "./horizon-context-menu.enum";
import {WhiteboardItem} from "../../Whiteboard-Item/whiteboard-item";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {EditableShape} from "../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape";
import {EditableStroke} from "../../Whiteboard-Item/editable-stroke/editable-stroke";
// @ts-ignore
import Rectangle = paper.Rectangle;
import {ZoomEvent} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {ZoomEventEnum} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum";
import {DrawingLayerManagerService} from "../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";
import {GlobalSelectedGroup} from "../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group";
import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";

@Injectable({
  providedIn: 'root'
})
export class HorizonContextMenuService {
  private _isHidden = true;
  private _subPanelHidden = new subPanelIsHidden();
  private _centerTop = { x: 0, y: 0};
  private _menuItemArray = new Array<HorizonContextMenuActions>();
  private _globalSelectedGroup: GlobalSelectedGroup;

  private menuWidth: number;
  private menuHeight: number;

  constructor(
    private positionCalcService: PositionCalcService,
    private infiniteCanvasService: InfiniteCanvasService,
  ) { }

  public initializeHorizonContextMenuService(globalSelectedGroup: GlobalSelectedGroup){
    this._globalSelectedGroup = globalSelectedGroup;
    this.infiniteCanvasService.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      if(zoomEvent.action === ZoomEventEnum.ZOOM_CHANGED) {
        setTimeout(() => {
          this.refreshPosition();
        }, 0);
      }
    });
  }

  public open() {
    this.setMenuItem(this.instanceCheckItem(this._globalSelectedGroup.wbItemGroup));
    this.setMenuPosition(this._globalSelectedGroup.group.bounds);
    this._isHidden = false;
    this.initMenuSizeValue();
  }

  public close() {
    this._isHidden = true;
    this.subPanelHidden.hideAll();
  }

  public refreshPosition() {
    this.setMenuPosition(this._globalSelectedGroup.group.bounds);
  }

  // ################### Private Method #####################

  private setMenuItem(type: HorizonContextMenuTypes) {
    switch (type) {
      case HorizonContextMenuTypes.SHAPE:
        this.setMenuForShape();
        break;
      case HorizonContextMenuTypes.ARROW:
        this.setMenuForArrow();
        break;
      case HorizonContextMenuTypes.STROKE:
        this.setMenuForStroke();
        break;
      case HorizonContextMenuTypes.ITEMS:
        this.setMenuForWhiteboardItems();
        break;
      case HorizonContextMenuTypes.GROUP:
        this.setMenuForGroup();
        break;
    }
  }

  private instanceCheckItem(wbItemGroup: Array<WhiteboardItem>): HorizonContextMenuTypes {
    // GSG 에 선택된 아이템이 한개이상 (다중선택)
    if(wbItemGroup.length > 1) {
      return HorizonContextMenuTypes.ITEMS;
    // GSG 에 선택된 아이템이 한개 (단일선택)
    } else {
      let item = wbItemGroup[0];
      if(item instanceof EditableShape) {
        return HorizonContextMenuTypes.SHAPE;
      } else if(item instanceof EditableStroke) {
        return HorizonContextMenuTypes.STROKE;
      } else {
        console.log("HorizonContextMenuService >> instanceCheckItem >> item : ", item);
      }
    }
    console.log("HorizonContextMenuComponent >> instanceCheckItem >> wbItemGroup : ", wbItemGroup);
  }

  // #################### Menu Set ######################

  private setMenuPosition(bound: Rectangle) {
    this.setMenuVerticalPosition(this.centerTop, bound);
    this.setMenuHorizontalPosition(this.centerTop, bound);
  }

  private setMenuForShape() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LINE,
      HorizonContextMenuActions.FILL,
      HorizonContextMenuActions.FONT_STYLE,
      HorizonContextMenuActions.LOCK,
      HorizonContextMenuActions.MORE,
    );
  }

  private setMenuForStroke() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LINE,
      HorizonContextMenuActions.LOCK,
      HorizonContextMenuActions.MORE,
    );
  }

  private setMenuForArrow() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LINE,
      HorizonContextMenuActions.ARROW_WING,
      HorizonContextMenuActions.MORE,
    );
  }

  private setMenuForWhiteboardItems() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LOCK,
      HorizonContextMenuActions.GROUP,
      HorizonContextMenuActions.MORE,
    );
  }

  private setMenuForGroup() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LOCK,
      HorizonContextMenuActions.UNGROUP,
      HorizonContextMenuActions.MORE,
    );
  }

  private initMenuSizeValue() {
    let htmlMenuElement = document.getElementById('horizonContextMenu');
    if(htmlMenuElement.offsetWidth > 0) {
      this.menuWidth = htmlMenuElement.offsetWidth;
    }
    if(htmlMenuElement.offsetHeight > 0) {
      this.menuHeight = htmlMenuElement.offsetHeight;
    }
  }

  private setMenuVerticalPosition(point: {x: number, y: number}, bound: Rectangle) {
    let topCenterOnNg = this.positionCalcService.advConvertPaperToNg(bound.topCenter);
    if(topCenterOnNg.y - 85 < 0) {
      let bottomCenterOnNg = this.positionCalcService.advConvertPaperToNg(bound.bottomCenter);
      point.x = bottomCenterOnNg.x;
      point.y = bottomCenterOnNg.y + 47;
    } else {
      point.x = topCenterOnNg.x;
      point.y = topCenterOnNg.y - 85;
    }
  }

  private setMenuHorizontalPosition(point: {x: number, y: number}, bound: Rectangle) {
    let margin = 10;

    let topCenterOnNg = this.positionCalcService.advConvertPaperToNg(bound.topCenter);
    let menuRightPoint = topCenterOnNg.x + (this.menuWidth / 2);

    if(menuRightPoint > this.positionCalcService.getWidthOfBrowser()) {
      point.x -= (menuRightPoint - this.positionCalcService.getWidthOfBrowser() + margin);
    }
    let menuLeftPoint = topCenterOnNg.x - (this.menuWidth / 2);
    if(menuLeftPoint < 0) {
      point.x -= (menuLeftPoint - margin);
    }
  }

  // ################ Getter & Setter #################

  get isHidden(): boolean {
    return this._isHidden;
  }

  get centerTop(): { x: number; y: number } {
    return this._centerTop;
  }

  get menuItemArray(): HorizonContextMenuActions[] {
    return this._menuItemArray;
  }

  get subPanelHidden(): subPanelIsHidden {
    return this._subPanelHidden;
  }

  get globalSelectedGroup(): GlobalSelectedGroup {
    return this._globalSelectedGroup;
  }
}

export class subPanelIsHidden {
  public subPanel = new Map<HorizonContextMenuActions, boolean>();

  constructor() {
    this.subPanel.set(HorizonContextMenuActions.LINE, true);
  }

  public isHidden(panel: HorizonContextMenuActions) {
    return this.subPanel.get(panel);
  }

  public hideThis(panel: HorizonContextMenuActions) {
    this.subPanel.set(panel, true);
  }

  public revealThis(panel: HorizonContextMenuActions) {
    this.subPanel.set(panel, false);
  }

  public toggleThis(panel: HorizonContextMenuActions) {
    this.subPanel.set(panel, !this.isHidden(panel));
  }

  public hideAll() {
    this.subPanel.forEach((value, key) => {
      this.subPanel.set(key, true);
    });
  }

  public hideOther(panel: HorizonContextMenuActions) {
    this.subPanel.forEach((value, key) => {
      if(key !== panel) {
        this.subPanel.set(key, true);
      }
    });
  }
}
