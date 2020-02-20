import {WhiteboardItem} from '../whiteboard-item';

import * as paper from 'paper';
import {LinkPort} from './LinkPort/link-port';
import {LinkPortDirectionEnum} from './LinkPort/LinkPortDirectionEnum/link-port-direction-enum.enum';
import {Editable} from '../InterfaceEditable/editable';
import {WhiteboardShapeDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/whiteboard-shape-dto';
// @ts-ignore
import Item = paper.Item;
import {GachiColorDto} from '../../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto';
import {LinkPortDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto';

export class WhiteboardShape extends WhiteboardItem implements Editable{
  private _width: number;
  private _height: number;
  private _borderColor;
  private _borderWidth: number;
  private _fillColor: paper.Color;
  private _opacity: number;
  private _linkPortMap:Map<any,LinkPort>;
  protected constructor(id, type, item:Item,layerService) {
    super(id, type, item, layerService);
    this.topLeft  = item.bounds.topLeft;
    this.width    = item.bounds.width;
    this.height    = item.bounds.height;
    this.borderColor = item.style.strokeColor;
    this.borderWidth = item.style.strokeWidth;

    if(item.style.fillColor){
      this.fillColor = item.style.fillColor;
    }else{
      // @ts-ignore
      this.fillColor = "transparent";
    }
    this.opacity = item.opacity;

    this.initLinkPortMap();
    this.activateShadowEffect();
  }

  protected initLinkPortMap(){
    //링크포트 생성
    this.linkPortMap = new Map<any, LinkPort>();
    this.linkPortMap.set( LinkPortDirectionEnum.TOP, new LinkPort(this, LinkPortDirectionEnum.TOP) );
    this.linkPortMap.set( LinkPortDirectionEnum.BOTTOM, new LinkPort(this, LinkPortDirectionEnum.BOTTOM) );
    this.linkPortMap.set( LinkPortDirectionEnum.LEFT, new LinkPort(this, LinkPortDirectionEnum.LEFT) );
    this.linkPortMap.set( LinkPortDirectionEnum.RIGHT, new LinkPort(this, LinkPortDirectionEnum.RIGHT) );
  }


  get linkPortMap(): Map<any, LinkPort> {
    return this._linkPortMap;
  }

  set linkPortMap(value: Map<any, LinkPort>) {
    this._linkPortMap = value;
  }
  public getDirectionPoint(direction){
    switch (direction) {
      case LinkPortDirectionEnum.TOP :
        return this.group.bounds.topCenter;
      case LinkPortDirectionEnum.BOTTOM :
        return this.group.bounds.bottomCenter;
      case LinkPortDirectionEnum.LEFT :
        return this.group.bounds.leftCenter;
      case LinkPortDirectionEnum.RIGHT :
        return this.group.bounds.rightCenter;
      case LinkPortDirectionEnum.CENTER_TOP :
        return this.group.bounds.topCenter;
      case LinkPortDirectionEnum.BOTTOM_LEFT :
        return this.group.bounds.bottomLeft;
      case LinkPortDirectionEnum.BOTTOM_RIGHT :
        return this.group.bounds.bottomRight;
    }
  }
  public getClosestLinkPort(point){
    let centerOfToWbShape = point;

    let closestDirection = -1;
    let closestDistance;

    this.linkPortMap.forEach((value, key, map)=>{
      if(closestDirection === -1){
        closestDistance = this.layerService.posCalcService
          .calcPointDistanceOn2D(centerOfToWbShape, this.group.bounds.topCenter);
        closestDirection = value.direction;
        return;
      }

      let newDistance = this.layerService.posCalcService
        .calcPointDistanceOn2D(centerOfToWbShape, this.getDirectionPoint(value.direction));

      if(newDistance < closestDistance){
        closestDirection = value.direction;
        closestDistance = newDistance;
      }

    });

    return closestDirection;
  }

  notifyItemCreation() {
  }

  notifyItemModified() {
  }

  refreshItem() {
  }

  destroyItem() {
    super.destroyItem();
    if(this.linkPortMap){
      this.linkPortMap.forEach((value, key, map)=>{
        value.destroyPortAndLink();
      })
    }

  }
  exportToDto(): WhiteboardShapeDto {
    let wbShapeDto:WhiteboardShapeDto = super.exportToDto() as WhiteboardShapeDto;

    let bounds = this.coreItem.bounds;
    let linkPortsDto = new Array<LinkPortDto>();
    this.linkPortMap.forEach((value, key, map)=>{
      linkPortsDto.push(value.exportToDto());
    });

    wbShapeDto.width = bounds.width;
    wbShapeDto.height = bounds.height;
    wbShapeDto.borderColor = GachiColorDto.createColor(this.coreItem.strokeColor);
    wbShapeDto.borderWidth = this.coreItem.strokeWidth;
    wbShapeDto.fillColor = GachiColorDto.createColor(this.coreItem.fillColor);
    wbShapeDto.opacity = this.coreItem.opacity;
    wbShapeDto.linkPortsDto = linkPortsDto;

    return wbShapeDto;
  }

  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }

  get borderColor() {
    return this._borderColor;
  }

  set borderColor(value) {
    this._borderColor = value;
  }

  get borderWidth(): number {
    return this._borderWidth;
  }

  set borderWidth(value: number) {
    this._borderWidth = value;
  }

  get fillColor(): paper.Color {
    return this._fillColor;
  }

  set fillColor(value: paper.Color) {
    this._fillColor = value;
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }

}
