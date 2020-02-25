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
import {WhiteboardItemDto} from "../../../../DTO/WhiteboardItemDto/whiteboard-item-dto";
import {ItemLifeCycleEnum, ItemLifeCycleEvent} from "../WhiteboardItemLifeCycle/WhiteboardItemLifeCycle";

export class WhiteboardShape extends WhiteboardItem implements Editable{
  private _linkPortMap:Map<any,LinkPort>;

  protected constructor(id, type, item:Item,layerService) {
    super(id, type, item, layerService);

    this.initLinkPortMap();
    this.activateShadowEffect();
    this.setLifeCycleEvent();
  }

  protected initLinkPortMap(){
    //링크포트 생성
    this.linkPortMap = new Map<any, LinkPort>();
    this.linkPortMap.set( LinkPortDirectionEnum.TOP, new LinkPort(this, LinkPortDirectionEnum.TOP) );
    this.linkPortMap.set( LinkPortDirectionEnum.BOTTOM, new LinkPort(this, LinkPortDirectionEnum.BOTTOM) );
    this.linkPortMap.set( LinkPortDirectionEnum.LEFT, new LinkPort(this, LinkPortDirectionEnum.LEFT) );
    this.linkPortMap.set( LinkPortDirectionEnum.RIGHT, new LinkPort(this, LinkPortDirectionEnum.RIGHT) );
  }

  private setLifeCycleEvent() {
    this.localLifeCycleEmitter.subscribe((event: ItemLifeCycleEvent) => {
      switch (event.action) {
        case ItemLifeCycleEnum.DESELECTED:
          this.disableLinkPort();
          break;
      }
    });
  }

  public enableLinkPort() {
    this.linkPortMap.forEach(value => {
      value.enable();
    });
  }
  public disableLinkPort() {
    this.linkPortMap.forEach(value => {
      value.disable();
    });
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

  destroyItem() {
    super.destroyItem();
    if(this.linkPortMap){
      this.linkPortMap.forEach((value, key, map)=>{
        value.destroyLink();
      })
    }

  }
  exportToDto(): WhiteboardShapeDto {
    let wbShapeDto:WhiteboardShapeDto = super.exportToDto() as WhiteboardShapeDto;

    let linkPortsDto = new Array<LinkPortDto>();
    this.linkPortMap.forEach((value, key, map)=>{
      linkPortsDto.push(value.exportToDto());
    });

    wbShapeDto.width = this.width;
    wbShapeDto.height = this.height;
    wbShapeDto.borderColor = GachiColorDto.createColor(this.borderColor);
    wbShapeDto.borderWidth = this.borderWidth;
    wbShapeDto.fillColor = GachiColorDto.createColor(this.fillColor);
    wbShapeDto.opacity = this.opacity;
    wbShapeDto.linkPortsDto = linkPortsDto;

    return wbShapeDto;
  }

  public update(dto: WhiteboardShapeDto) {
    this.width = dto.width;
    this.height = dto.height;
    this.borderColor = dto.borderColor;
    this.fillColor = dto.fillColor;
    this.opacity = dto.opacity;

    super.update(dto as WhiteboardItemDto);

    // TODO : linkPort 에 대한 정보를 업데이트 할 필요가 있을지 검증 필요
    // dto.linkPortsDto.forEach(value => {
    //   this.linkPortMap.set()
    // });
  }

  get width(): number {
    return this.coreItem.bounds.width;
  }

  set width(value: number) {
    this.coreItem.bounds.width = value;
  }

  get height(): number {
    return this.coreItem.bounds.height;
  }

  set height(value: number) {
    this.coreItem.bounds.height = value;
  }

  get borderColor() {
    return this.coreItem.strokeColor;
  }

  set borderColor(value) {
    this.coreItem.strokeColor = value;
  }

  get borderWidth(): number {
    return this.coreItem.strokeWidth;
  }

  set borderWidth(value: number) {
    this.coreItem.strokeWidth = value;
  }

  get fillColor(): paper.Color {
    return this.coreItem.fillColor;
  }

  set fillColor(value: paper.Color) {
    this.coreItem.fillColor = value;
  }

  get opacity(): number {
    return this.coreItem.opacity;
  }

  set opacity(value: number) {
    this.coreItem.opacity = value;
  }
}
