import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import PointText = paper.PointText;

import {EventEmitter} from '@angular/core';
import {ItemAdjustor} from './ItemAdjustor/item-adjustor';
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PointerMode} from '../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {SelectEvent} from '../InfiniteCanvas/DrawingLayerManager/SelectEvent/select-event';
import {SelectEventEnum} from '../InfiniteCanvas/DrawingLayerManager/SelectEventEnum/select-event.enum';
import {SelectModeEnum} from '../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {EditableItemGroup} from './ItemGroup/EditableItemGroup/editable-item-group';
import {WhiteboardItemDto} from '../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {GachiPointDto} from '../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "./WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";
import {WhiteboardItemType} from '../../Helper/data-type-enum/data-type.enum';
import {WorkHistoryManager} from '../InfiniteCanvas/DrawingLayerManager/WorkHistoryManager/work-history-manager';

export abstract class WhiteboardItem {
  protected _id: number;
  protected _type;
  protected _group:Group;
  protected _topLeft: Point;
  protected _coreItem: Item;
  protected _isSelected: boolean;
  protected _isLocked: boolean;
  protected _myItemAdjustor: ItemAdjustor;

  private _zIndex;

  private _isGrouped = false;
  private _isModified: boolean = false;
  private _parentEdtGroup:EditableItemGroup = null;

  public groupedIdList:Array<any> = new Array<any>();

  private _disableLinkHandler;
  private _longTouchTimer;

  private downPoint: Point;

  private _layerService:DrawingLayerManagerService;

  protected _trailDistance = 0;
  protected _prevPoint = new Point(0,0);
  protected _selectMode;

  public isOccupied = false;

  public isVisited = false;//layer서비스의 getIntersectedList의 순회에서 방문된 경우 true값이 됨.

  protected _globalLifeCycleEmitter: EventEmitter<any>;
  protected _localLifeCycleEmitter = new EventEmitter<any>();
  protected _zoomEventEmitter: EventEmitter<any>;
  protected constructor(id, type, item, layerService){
    this.id = id;
    this.isSelected = false;
    this.selectMode = SelectModeEnum.SINGLE_SELECT;
    this.group = new Group();
    this.disableLinkHandler = false;
    this.groupedIdList = new Array<any>();
    if(item){
      item.data.myGroup = this.group;
      this.group.addChild(item);
      this.coreItem = item;
      this.topLeft = item.bounds.topLeft;
    }
    this.group.data.struct = this;

    this.type = type;

    this.layerService = layerService;

    this.globalLifeCycleEmitter = this.layerService.globalLifeCycleEmitter;
    this.zoomEventEmitter = this.layerService.infiniteCanvasService.zoomEventEmitter;

    this.layerService.selectModeEventEmitter.subscribe((data: SelectEvent)=>{
      this.onSelectEvent(data);
    });

    // TODO : 로컬 라이프사이클 체크용 로그
    // this._localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
    //   console.log("LocalLifeCycle >> ", event.item.constructor.name, " ", event.item.id, " : ", ItemLifeCycleEnum[event.action]);
    // });
  }
  protected activateShadowEffect(){
    this.coreItem.shadowColor = new Color(0,0,0);
    this.coreItem.shadowBlur = 8;
    this.coreItem.shadowOffset = new Point(1,1);
  }
  protected isMouseEvent(event){
    return event.event instanceof MouseEvent;
  }
  protected isTouchEvent(event) {
    return event.event instanceof TouchEvent;
  }
  protected setSingleSelectMode(){
    this.selectMode = SelectModeEnum.SINGLE_SELECT;
  }
  protected setMultipleSelectMode(){
    this.selectMode = SelectModeEnum.MULTIPLE_SELECT;
  }
  protected isSingleSelectMode(){
    return this.selectMode === SelectModeEnum.SINGLE_SELECT;
  }

  //####################


  private onSelectEvent(event:SelectEvent){
    if(!this.isSelected){//선택되지 않은 아이템은 수행할 필요 없음.
      return;
    }

    switch (event.action) {
      case SelectEventEnum.SELECT_MODE_CHANGED:
        break;
      case SelectEventEnum.ITEM_SELECTED:
        break;
      case SelectEventEnum.ITEM_DESELECTED:
        break;
    }
  }

  private calcTolerance(point: Point) {
    return this.downPoint.getDistance(point) > 10;
  }

  private initDownPoint(point: Point) {
    this.downPoint = point;
  }
  private initPoint(event: MouseEvent | TouchEvent): Point {
    let point: Point;
    if(event instanceof MouseEvent) {
      point = new Point(event.clientX, event.clientY);
    } else {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
    }
    return point;
  }

  protected blindGroup;
  onOccupied(occupierName){
    console.log("WhiteboardItem >> onOccupied >> 진입함");
    // let blindRect:Rectangle = new Rectangle(this.group.bounds);
    if(!this.isOccupied){
      this.isOccupied = true;

      this.blindGroup = new Group();

      let blindRect = new Rectangle({
        from: this.group.bounds.topLeft,
        to: this.group.bounds.bottomRight,
      });
      blindRect.name = "blind-main";
      // @ts-ignore
      blindRect.fillColor = "black";
      // @ts-ignore
      blindRect.opacity = 0.3;

      let blindText = new PointText(this.group.bounds.bottomRight);
      // @ts-ignore
      blindText.fillColor = "white";
      blindText.fontWeight = "bold";
      blindText.content = occupierName + " 님이 수정중";
      blindText.bounds.topRight = this.group.bounds.bottomRight;
      blindText.name = "blind-text";

      let blindTextBg = new Rectangle({
        from: blindText.bounds.topLeft,
        to: blindText.bounds.bottomRight,
      });
      // @ts-ignore
      blindTextBg.fillColor = "black";
      blindTextBg.name = "blind-text-bg";
      // @ts-ignore
      blindTextBg.opacity = 0.5;
      blindTextBg.bounds.topLeft = blindText.bounds.topLeft;

      blindText.bringToFront();

      this.blindGroup.addChild(blindRect);
      this.blindGroup.addChild(blindTextBg);
      this.blindGroup.addChild(blindText);

      this.layerService.globalSelectedGroup.extractOneFromGroup(this);
      this.blindGroup.bringToFront();
    }
  }
  updateBlindGroup(){
    if(!this.blindGroup){
      return;
    }
    let blindRect;
    let blindText;
    let blindTextBg;
    for(let i = 0 ; i < this.blindGroup.children.length; i++){
      let currItem = this.blindGroup.children[i];
      console.log("WhiteboardItem >> updateBlindGroup >> currItem : ",currItem);
      console.log("WhiteboardItem >> updateBlindGroup >> currItem : ",currItem.name);
      if (currItem.name === 'blind-main') {
        blindRect = currItem;
      } else if (currItem.name === 'blind-text-bg') {
        blindTextBg = currItem;
      } else if (currItem.name === 'blind-text') {
        blindText = currItem;
      }
    }

    if( !blindText || !blindRect || !blindTextBg ){
      return;
    }
    console.log("WhiteboardItem >> updateBlindGroup >> blindRect : ",blindRect);
    console.log("WhiteboardItem >> updateBlindGroup >> blindText : ",blindText);
    console.log("WhiteboardItem >> updateBlindGroup >> blindTextBg : ",blindTextBg);
    blindRect.bounds = this.group.bounds;
    blindText.bounds.topRight = this.group.bounds.bottomRight;
    blindTextBg.bounds.topLeft = blindText.bounds.topLeft;
    this.blindGroup.bringToFront();
  }
  onNotOccupied(){
    if(this.isOccupied){
      this.isOccupied = false;
      if(this.blindGroup){
        this.blindGroup.removeChildren();
        this.blindGroup.remove();
      }
    }
  }

  protected calcCurrentDistance(event){
    let point = event.point;
    let currentDistance = this.layerService.posCalcService.calcPointDistanceOn2D(point, this.prevPoint);
    this.trailDistance += currentDistance;
  }
  protected resetDistance(){
    this.trailDistance = 0;
  }


  public update(dto: WhiteboardItemDto) {
    this.group.position = GachiPointDto.getPaperPoint(dto.center);
    this.isGrouped = dto.isGrouped;
    this.parentEdtGroup = dto.parentEdtGroupId;
    this.zIndex = dto.zIndex;
    this.groupedIdList = dto.groupedIdList;
    if(this.blindGroup){
      this.updateBlindGroup();
    }
  }

  public destroyItem(){
    if(this.isGrouped && this.parentEdtGroup){
      this.parentEdtGroup.destroyItem();
    }
    this.localEmitDestroy();
    this.globalEmitDestroy();
  }
  public abstract destroyItemAndNoEmit();
  destroyBlind(){//여기서 말하는 블라인드는, 다른 유저가 선점했을때 ...님이 수정중 이라고 뜨는 그 회색음영의 개체를 말함
    if(this.blindGroup){
      this.blindGroup.remove();
    }
  }

  checkEditable(){
    let currentPointerMode = this.layerService.currentPointerMode;
    return currentPointerMode === PointerMode.POINTER || currentPointerMode === PointerMode.LASSO_SELECTOR;
  }
  checkContextMenuIsAvailable(){
    let currentPointerMode = this.layerService.currentPointerMode;
    return currentPointerMode === PointerMode.POINTER || currentPointerMode === PointerMode.LASSO_SELECTOR
            || PointerMode.DRAW || PointerMode.ERASER || PointerMode.HIGHLIGHTER || PointerMode.SHAPE;
  }

  public activateSelectedMode(){
    if(!this.isSelected){
      this.isSelected = true;
      this.myItemAdjustor = new ItemAdjustor(this);
    }
    if(this.isLocked) {
      this.myItemAdjustor.disable();
    } else {
      this.myItemAdjustor.enable();
    }
  }

  public deactivateSelectedMode(){
    if(this.isSelected){
      this.isSelected = false;
      let purgedAdjustor = this.myItemAdjustor;
      this.myItemAdjustor = null;
      if(purgedAdjustor){
        purgedAdjustor.destroyItemAdjustor();
      }
    }
  }

  public exportToDto(){
    let wbItemDto: WhiteboardItemDto;
    let gachiCenterPoint = new GachiPointDto(this.group.position.x, this.group.position.y);

    let parentEdtGroupId;
    if(this.parentEdtGroup){
      parentEdtGroupId = this.parentEdtGroup.id
    }else{
      parentEdtGroupId = -1;
    }
    wbItemDto = new WhiteboardItemDto(
      this.id,
      this.type,
      gachiCenterPoint,
      this.isGrouped,
      parentEdtGroupId,
      this.zIndex
    );
    if (this.groupedIdList) {
      wbItemDto.groupedIdList = this.groupedIdList;
    }
    return wbItemDto;
  }

  // ################ LifeCycle Emit Method #################

  public localEmitCreate() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }
  public globalEmitCreate() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public localEmitModify() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }
  public globalEmitModify() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  public localEmitDestroy() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  public globalEmitDestroy() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }

  public localEmitMoved() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MOVED));
  }
  public globalEmitMoved() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MOVED));
  }

  public localEmitResized() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.RESIZED));
  }
  public globalEmitResized() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.RESIZED));
  }

  public localEmitSelected() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.SELECTED));
  }
  public globalEmitSelected() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.SELECTED));
  }

  public localEmitDeselected() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESELECTED));
  }
  public globalEmitDeselected() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESELECTED));
  }

  public localEmitLocked() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.LOCKED));
  }
  public globalEmitLocked() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.LOCKED));
  }

  public localEmitUnlocked() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.UNLOCKED));
  }
  public globalEmitUnlocked() {
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.UNLOCKED));
  }

  // ################ Getter & Setter #################

  get coreItem(): paper.Item {
    return this._coreItem;
  }

  set coreItem(value: paper.Item) {
    this._coreItem = value;
  }

  get globalLifeCycleEmitter(): EventEmitter<any> {
    return this._globalLifeCycleEmitter;
  }

  set globalLifeCycleEmitter(value: EventEmitter<any>) {
    this._globalLifeCycleEmitter = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get topLeft(): paper.Point {
    return this.coreItem.bounds.topLeft;
  }

  set topLeft(value: paper.Point) {
    this.coreItem.bounds.topLeft = value;
  }

  get group() {
    return this._group;
  }

  set group(value) {
    this._group = value;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get myItemAdjustor(): ItemAdjustor {
    return this._myItemAdjustor;
  }

  set myItemAdjustor(value: ItemAdjustor) {
    this._myItemAdjustor = value;
  }

  get disableLinkHandler(): boolean {
    return this._disableLinkHandler;
  }

  set disableLinkHandler(value: boolean) {
    this._disableLinkHandler = value;
  }

  get zoomEventEmitter(): EventEmitter<any> {
    return this._zoomEventEmitter;
  }

  set zoomEventEmitter(value: EventEmitter<any>) {
    this._zoomEventEmitter = value;
  }

  get isSelected(): boolean {
    return this._isSelected;
  }

  set isSelected(value: boolean) {
    this._isSelected = value;
  }
  get layerService(): DrawingLayerManagerService {
    return this._layerService;
  }

  set layerService(value: DrawingLayerManagerService) {
    this._layerService = value;
  }


  get trailDistance(): number {
    return this._trailDistance;
  }

  set trailDistance(value: number) {
    this._trailDistance = value;
  }

  get prevPoint(): paper.Point {
    return this._prevPoint;
  }

  set prevPoint(value: paper.Point) {
    this._prevPoint = value;
  }

  get selectMode() {
    return this._selectMode;
  }

  set selectMode(value) {
    this._selectMode = value;
  }

  get longTouchTimer() {
    return this._longTouchTimer;
  }

  set longTouchTimer(value) {
    this._longTouchTimer = value;
  }

  get isGrouped(): boolean {
    return this._isGrouped;
  }

  set isGrouped(value: boolean) {
    this._isGrouped = value;
  }

  get parentEdtGroup(): EditableItemGroup {
    return this._parentEdtGroup;
  }

  set parentEdtGroup(value: EditableItemGroup) {
    this._parentEdtGroup = value;
  }

  get localLifeCycleEmitter(): EventEmitter<any> {
    return this._localLifeCycleEmitter;
  }

  get isLocked(): boolean {
    return this._isLocked;
  }

  set isLocked(value: boolean) {
    if(this.isGrouped) {
      this.parentEdtGroup.isLocked = value;
    }

    this._isLocked = value;
  }

  get isMovable(): boolean {
    if(!this.isLocked) {
      if (this.layerService.currentPointerMode === PointerMode.POINTER || this.layerService.currentPointerMode === PointerMode.LASSO_SELECTOR) {
        return true;
      }
    }
    return false;
  }

  get isModified(): boolean {
    return this._isModified;
  }

  set isModified(value: boolean) {
    this._isModified = value;
  }

  get zIndex() {
    return this._zIndex;
  }

  set zIndex(value) {
    this._zIndex = value;
  }
}
