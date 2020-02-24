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
import Rectangle = paper.Rectangle;

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

export abstract class WhiteboardItem {

  protected _id: number;
  protected _type;
  protected _group:Group;
  protected _topLeft: Point;
  protected _coreItem: Item;
  protected _isSelected: boolean;
  protected _isLocked: boolean;
  protected _myItemAdjustor: ItemAdjustor;

  private _isGrouped = false;
  private _parentEdtGroup:EditableItemGroup = null;

  private _disableLinkHandler;
  private _longTouchTimer;
  private downPoint: Point;

  private _layerService:DrawingLayerManagerService;

  protected _trailDistance = 0;
  protected _prevPoint = new Point(0,0);
  protected _selectMode;

  protected _globalLifeCycleEmitter: EventEmitter<any>;
  protected _localLifeCycleEmitter = new EventEmitter<any>();
  protected _zoomEventEmitter: EventEmitter<any>;
  protected constructor(id, type, item, layerService){
    this.id = id;
    this.isSelected = false;
    this.selectMode = SelectModeEnum.SINGLE_SELECT;
    this.group = new Group();
    this.disableLinkHandler = false;
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

  protected calcCurrentDistance(event){
    let point = event.point;
    let currentDistance = this.layerService.posCalcService.calcPointDistanceOn2D(point, this.prevPoint);
    this.trailDistance += currentDistance;
  }
  protected resetDistance(){
    this.trailDistance = 0;
  }

  private onPointerDownForEdit(event){
    if(!this.checkEditable()){
      return;
    }
    if(event.modifiers.control === true || event.modifiers.shift === true){
      this.setMultipleSelectMode();
    }
    else{
      this.setSingleSelectMode();
    }
    if(!this.isSelected){
      if(this.isSingleSelectMode()){
        this.layerService.globalSelectedGroup.extractAllFromSelection();
      }
      if(this.isGrouped && this.parentEdtGroup){//해당 WbItem이 그룹화되어 있는 경우
        this.parentEdtGroup.pushAllChildIntoGSG();
      }
      else{//해당 WbItem이 그룹화되어 있지 않은 경우(통상)
        this.layerService.globalSelectedGroup.insertOneIntoSelection(this);
      }
      this.isSelected = true;
    }
  }
  private onPointerDownForContextMenu(event){
    if(!this.checkContextMenuIsAvailable()){
      return;
    }
    if(!this.isSelected){
      if(this.isSingleSelectMode()){
        this.layerService.globalSelectedGroup.extractAllFromSelection();
      }
      this.layerService.globalSelectedGroup.insertOneIntoSelection(this);
      this.isSelected = true;
    }
  }



  public abstract notifyItemCreation();
  public abstract notifyItemModified();
  public abstract refreshItem();

  public update(dto: WhiteboardItemDto) {
    this.group.position = GachiPointDto.getPaperPoint(dto.center);
    this.isGrouped = dto.isGrouped;
    this.parentEdtGroup = dto.parentEdtGroupId;
  }

  public destroyItem(){
    if(this.isGrouped && this.parentEdtGroup){
      this.parentEdtGroup.destroyItem();
    }
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESTROY));
  }
  public abstract destroyItemAndNoEmit();

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
      parentEdtGroupId
    );
    return wbItemDto;
  }

  // ################ LifeCycle Emit Method #################

  public emitCreate() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.CREATE));
  }

  public emitModify() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MODIFY));
  }

  public emitDestroy() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, null, ItemLifeCycleEnum.DESTROY));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, null, ItemLifeCycleEnum.DESTROY));
  }

  public emitMoved() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MOVED));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.MOVED));
  }

  public emitResized() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.RESIZED));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.RESIZED));
  }

  public emitSelected() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.SELECTED));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.SELECTED));
  }

  public emitDeselected() {
    this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESELECTED));
    this.globalLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.DESELECTED));
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
    if(value) {
      this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.LOCKED));
    } else {
      this.localLifeCycleEmitter.emit(new ItemLifeCycleEvent(this.id, this, ItemLifeCycleEnum.UNLOCKED));
    }

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
}
