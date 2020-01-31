import * as paper from 'paper';
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Point = paper.Point;

import {EventEmitter} from '@angular/core';
import {ItemAdjustor} from './ItemAdjustor/item-adjustor';
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {PointerMode} from '../Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {SelectEvent} from '../InfiniteCanvas/DrawingLayerManager/SelectEvent/select-event';
import {SelectEventEnum} from '../InfiniteCanvas/DrawingLayerManager/SelectEventEnum/select-event.enum';
import {SelectModeEnum} from '../InfiniteCanvas/DrawingLayerManager/SelectModeEnum/select-mode-enum.enum';
import {MouseButtonEventEnum} from '../Pointer/MouseButtonEventEnum/mouse-button-event-enum.enum';

export abstract class WhiteboardItem {

  protected _id;
  protected _type;
  protected _group;
  protected _topLeft: Point;
  protected _coreItem:Item;
  protected _isSelected;
  protected _myItemAdjustor:ItemAdjustor;

  private _disableLinkHandler;
  private _longTouchTimer;
  private fromPoint: Point;

  private _layerService:DrawingLayerManagerService;

  protected _trailDistance = 0;
  protected _prevPoint = new Point(0,0);
  protected _selectMode;

  protected _lifeCycleEventEmitter:EventEmitter<any>;
  protected _zoomEventEmitter:EventEmitter<any>;
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

    this.lifeCycleEventEmitter = this.layerService.wbItemLifeCycleEventEmitter;
    this.zoomEventEmitter = this.layerService.infiniteCanvasService.zoomEventEmitter;
    this.notifyItemCreation();

    this.layerService.selectModeEventEmitter.subscribe((data:SelectEvent)=>{
      this.onSelectEvent(data);
    });
    this.setCallback();

  }
  protected activateShadowEffect(){
    this.coreItem.shadowColor = new Color(0,0,0);
    this.coreItem.shadowBlur = 8;
    this.coreItem.shadowOffset = new Point(1,1);
  }
  protected setCallback() {
    this.group.onMouseDown = (event) => {
      if(this.isMouseEvent(event)){
        if(!this.checkEditable()){
          return;
        }
        //#### 마우스 이벤트 인 경우
        switch (event.event.button) {
          case MouseButtonEventEnum.LEFT_CLICK:
            this.onPointerDownForEdit(event);
            break;
          case MouseButtonEventEnum.RIGHT_CLICK:
            this.onPointerDownForContextMenu(event);
            break;
        }//switch

      }//if
      else{//#### 터치 이벤트 인 경우
        //TODO 여기서 롱터치 여부를 구분해야 함
        let point = this.initPoint(event.event);
        this.initFromPoint(point);
        this.longTouchTimer = setTimeout(this.onLongTouch, 500, event.event, this.layerService);
        if(this.checkEditable()){
          this.onPointerDownForEdit(event);
        }
      }
    };
    this.group.onMouseDrag = (event) => {
      if(this.isTouchEvent(event)) {
        if(this.calcTolerance(this.initPoint(event.event))){
          clearTimeout(this.longTouchTimer); // 움직이면 롱터치 아님, 톨러런스 5
        }
      }
    };
    this.group.onMouseUp = (event) =>{
      if(this.isTouchEvent(event)) {
        clearTimeout(this.longTouchTimer); // 터치가 롱터치 반응 시간 안에 떼지면 롱터치 아님
      }
      if(!this.checkEditable()){
        return;
      }
      this.setSingleSelectMode();
    }
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

  private onLongTouch(event, layerService: DrawingLayerManagerService) {
    layerService.contextMenu.openMenu(event);
  }

  private calcTolerance(point: Point) {
    return this.fromPoint.getDistance(point) > 10;
  }

  private initFromPoint(point: Point) {
    this.fromPoint = point;
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
      this.layerService.globalSelectedGroup.insertOneIntoSelection(this);
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
  public abstract destroyItem();

  checkEditable(){
    let currentPointerMode = this.layerService.currentPointerMode;
    return currentPointerMode === PointerMode.POINTER || currentPointerMode === PointerMode.LASSO_SELECTOR;
  }
  checkContextMenuIsAvailable(){
    let currentPointerMode = this.layerService.currentPointerMode;
    return currentPointerMode === PointerMode.POINTER || currentPointerMode === PointerMode.LASSO_SELECTOR
            || PointerMode.DRAW || PointerMode.ERASER || PointerMode.HIGHLIGHTER || PointerMode.SHAPE;
  }
  checkMovable(){
    let currentPointerMode = this.layerService.currentPointerMode;
    return currentPointerMode === PointerMode.POINTER || currentPointerMode === PointerMode.LASSO_SELECTOR;
  }

  public activateSelectedMode(){
    if(!this.isSelected){
      this.isSelected = true;
      this.myItemAdjustor = new ItemAdjustor(this);
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

  get coreItem(): paper.Item {
    return this._coreItem;
  }

  set coreItem(value: paper.Item) {
    this._coreItem = value;
  }

  get lifeCycleEventEmitter(): EventEmitter<any> {
    return this._lifeCycleEventEmitter;
  }

  set lifeCycleEventEmitter(value: EventEmitter<any>) {
    this._lifeCycleEventEmitter = value;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  get topLeft(): paper.Point {
    return this._topLeft;
  }

  set topLeft(value: paper.Point) {
    this._topLeft = value;
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

  get isSelected() {
    return this._isSelected;
  }

  set isSelected(value) {
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
}
