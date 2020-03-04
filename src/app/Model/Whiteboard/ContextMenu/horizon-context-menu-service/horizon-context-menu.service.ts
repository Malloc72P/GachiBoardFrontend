import * as paper from 'paper';
// @ts-ignore
import Rectangle = paper.Rectangle;

import {Injectable} from '@angular/core';
import {HorizonContextMenuActions, HorizonContextMenuTypes} from "./horizon-context-menu.enum";
import {WhiteboardItem} from "../../Whiteboard-Item/whiteboard-item";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {EditableShape} from "../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape";
import {EditableStroke} from "../../Whiteboard-Item/editable-stroke/editable-stroke";
import {ZoomEvent} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event";
import {ZoomEventEnum} from "../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum";
import {GlobalSelectedGroup} from "../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/global-selected-group";
import {InfiniteCanvasService} from "../../InfiniteCanvas/infinite-canvas.service";
import {EditableRaster} from "../../Whiteboard-Item/Whiteboard-Shape/editable-raster/editable-raster";
import {EditableLink} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link";
import {
  ItemLifeCycleEnum,
  ItemLifeCycleEvent
} from "../../Whiteboard-Item/WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
import {SubPanelManager} from "../../Panel/sub-panel-manager/sub-panel-manager";

@Injectable({
  providedIn: 'root'
})
export class HorizonContextMenuService {
  private _isHidden = true;
  private readonly _subPanelManager: SubPanelManager;
  private _centerTop = { x: 0, y: 0};
  private _menuItemArray = new Array<HorizonContextMenuActions>();
  private _globalSelectedGroup: GlobalSelectedGroup;
  private _item;

  private menuWidth: number;
  private menuHeight: number;

  constructor(
    private positionCalcService: PositionCalcService,
    private infiniteCanvasService: InfiniteCanvasService,
  ) {
    this._subPanelManager = new SubPanelManager([
      HorizonContextMenuActions.LINE,
      HorizonContextMenuActions.FILL,
      HorizonContextMenuActions.ARROW_WING,
      HorizonContextMenuActions.FONT_STYLE
    ]);
  }

  public initializeHorizonContextMenuService(globalSelectedGroup: GlobalSelectedGroup){
    this._globalSelectedGroup = globalSelectedGroup;
    this.subscribeLifeCycleEvent();
    this.subscribeZoomEvent();
  }

  public open() {
    this.setMenuItem(this.instanceCheckItem(this._globalSelectedGroup.wbItemGroup));
    this.setMenuPosition(this.coreItem.bounds);
    this._isHidden = false;
    this.subPanelManager.hideAll();
    setTimeout(() => {
      this.initMenuSizeValue();
    }, 0);
  }

  public close() {
    this._isHidden = true;
    this.checkModifiedItem();
    this.subPanelManager.hideAll();
  }

  public refreshPosition() {
    if(!!this.coreItem) {
      this.setMenuPosition(this.coreItem.bounds);
    }
  }

  public refreshMenuItem() {
    this.setMenuItem(this.instanceCheckItem(this._globalSelectedGroup.wbItemGroup));
  }

  // ################### Private Method #####################
  private checkModifiedItem() {
    if(!!this.item) {
      if(this.item.isModified) {
        console.log("HorizonContextMenuService >> checkModifiedItem >> this.item.isModified >> 진입함");
        this.globalSelectedGroup.pushGsgWorkIntoWorkHistroy(ItemLifeCycleEnum.MODIFY);
        this.item.localEmitModify();
        this.item.globalEmitModify();
        this.item.isModified = false;
      }
    }
  }

  private subscribeLifeCycleEvent() {
    this.globalSelectedGroup.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.MOVED:
        case ItemLifeCycleEnum.RESIZED:
        case ItemLifeCycleEnum.SELECTED:
        case ItemLifeCycleEnum.DESELECTED:
          this.refreshPosition();
          break;
      }
    });
  }
  private subscribeZoomEvent() {
    this.infiniteCanvasService.zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      if(this.isHidden) {
        return;
      }
      if(zoomEvent.action === ZoomEventEnum.ZOOM_CHANGED) {
        setTimeout(() => {
          this.refreshPosition();
        }, 0);
      }
    });
  }

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
      case HorizonContextMenuTypes.RASTER:
        this.setMenuForItem();
        break;
    }

    if(this.globalSelectedGroup.isLocked) {
      this.menuItemArray.forEach(((value, index) => {
        if(value === HorizonContextMenuActions.LOCK) {
          this.menuItemArray[index] = HorizonContextMenuActions.UNLOCK;
        }
      }));
    }
  }

  private instanceCheckItem(wbItemGroup: Array<WhiteboardItem>): HorizonContextMenuTypes {
    //EditableItemGroup으로 잡힌 경우, GSG에 있는 대상은 EditableItemGroup이 아닌,
    //해당 그룹 안의 WbItem들이다. 그러므로 별도의 체크 메서드를 통해, 먼저 검사한다.
    if(this.instanceCheckEdtGroup()){
      return HorizonContextMenuTypes.GROUP;
    }

    // GSG 에 선택된 아이템이 한개이상 (다중선택)
    if(wbItemGroup.length > 1) {
      this._item = wbItemGroup;
      return HorizonContextMenuTypes.ITEMS;
    // GSG 에 선택된 아이템이 한개 (단일선택)
    } else {
      let item = wbItemGroup[0];
      if(item instanceof EditableRaster) {
        this._item = item;
        return HorizonContextMenuTypes.RASTER;
      } else if(item instanceof EditableShape) {
        this._item = item;
        return HorizonContextMenuTypes.SHAPE;
      } else if(item instanceof EditableStroke) {
        this._item = item;
        return HorizonContextMenuTypes.STROKE;
      } else if(item instanceof EditableLink) {
        this._item = item;
        return HorizonContextMenuTypes.ARROW;
      } else {
        this._item = item;
      }
    }
  }

  private findLink(item: EditableShape): EditableLink {
    let findItem = undefined;
    item.linkPortMap.forEach(value => {
      value.fromLinkList.forEach( valueOfValue => {
        if(valueOfValue.isSelected) {
          findItem = valueOfValue;
        }
      })
    });

    return findItem;
  }

  private instanceCheckEdtGroup(){
    let gsg = this.globalSelectedGroup;
    let edtGroupId = -1;

    if(gsg.wbItemGroup[0].isGrouped && gsg.wbItemGroup[0].parentEdtGroup.id){
      edtGroupId = gsg.wbItemGroup[0].parentEdtGroup.id;
    }else{//첫번째 선택된 아이템부터 그룹화 되어 있지 않음. 그러므로 리턴 false
      return false;
    }

    for (let i = 1; i < gsg.wbItemGroup.length; i++) {
      let currWbItem = gsg.wbItemGroup[i];
      if(currWbItem.isGrouped && currWbItem.parentEdtGroup.id === edtGroupId){
        //그룹화 되어 있으면서 같은 그룹인 경우
      }else {//현재 아이템이 그룹화 되어 있지 않거나, 다른 그룹의 아이템인 경우 return false
        return false;
      }
    }
    return true;
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

  private setMenuForItem() {
    this._menuItemArray = new Array<HorizonContextMenuActions>(
      HorizonContextMenuActions.LOCK,
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

  get isOpen(): boolean {
    return !this.isHidden;
  }

  get centerTop(): { x: number; y: number } {
    return this._centerTop;
  }

  get menuItemArray(): HorizonContextMenuActions[] {
    return this._menuItemArray;
  }

  get subPanelManager(): SubPanelManager {
    return this._subPanelManager;
  }

  get globalSelectedGroup(): GlobalSelectedGroup {
    return this._globalSelectedGroup;
  }

  get item() {
    return this._item;
  }

  get coreItem() {
    if(this.item instanceof WhiteboardItem) {
      return this.item.coreItem;
    } else if(Array.isArray(this.item)) {
      return this.globalSelectedGroup.group;
    }
  }
}
