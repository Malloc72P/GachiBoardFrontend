import {LinkInfo} from './LinkInfo/link-info';
import {WhiteboardShape} from '../whiteboard-shape';
import {LinkPortDirectionEnum} from './LinkPortDirectionEnum/link-port-direction-enum.enum';

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Rectangle = paper.Rectangle;
import {PositionCalcService} from '../../../PositionCalc/position-calc.service';

export class LinkPort {
  private _owner:WhiteboardShape;
  private _direction;
  private _linkInfoList:Array<LinkInfo>;
  private _posCalcService:PositionCalcService;

  private tempLinkPath:Path;

  constructor(owner, direction, posCalcService){
    this.owner = owner;
    this.direction = direction;
    this.posCalcService = posCalcService;
    this.tempLinkPath = new Path({
      segments: [this.calcLinkPortPosition()],
      strokeColor: "black",
      strokeWidth: "1",
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    this.tempLinkPath.onFrame = (event)=>{
      this.adjustTempLinkPosition();
    };
    this.linkInfoList = new Array<LinkInfo>();
  }

  public calcLinkPortPosition(){
    let group = this.owner.group.bounds;
    switch (this.direction) {
      case LinkPortDirectionEnum.TOP:
        return group.topCenter;
      case LinkPortDirectionEnum.BOTTOM:
        return group.bottomCenter;
      case LinkPortDirectionEnum.LEFT:
        return group.leftCenter;
      case LinkPortDirectionEnum.RIGHT:
        return group.rightCenter;
    }
  }

  public tempLinkToEmptyField(point){
    this.tempLinkPath.removeSegments();
    this.tempLinkPath.add( this.calcLinkPortPosition() );
    this.tempLinkPath.add(point);
  }
  public tempLinkToWbItem(toWbShape:WhiteboardShape, point){
    this.tempLinkPath.removeSegments();
    this.tempLinkPath.add( this.calcLinkPortPosition() );

    let toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));

    this.tempLinkPath.add(toLinkPort.calcLinkPortPosition());
  }
  public createLink(toWbShape, point){
    if(toWbShape){//링크 연결대상이 존재하여 링크 생성하는 경우
      let toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));
      let newLink:Path = new Path({
        segments: [this.calcLinkPortPosition()],
        strokeColor: "black",
        strokeWidth: "1",
        strokeCap: 'round',
        strokeJoin: 'round',
      });
      newLink.add( toLinkPort.calcLinkPortPosition() );
      let newLinkInfo = new LinkInfo(this, toLinkPort, newLink);
      this.linkInfoList.push(newLinkInfo);
    }
    this.resetTempLink();
  }


  private getCloseDirection(wbShape:WhiteboardShape, point:Point){
    let closestDirection = 0;
    console.log("LinkPort >> getCloseDirection >> owner : ",this.owner);
    let closestDistance = this.owner.posCalcService.calcPointDistanceOn2D(point, wbShape.group.bounds.topCenter);
    for(let i = 1 ; i < 4; i++){
      let newDistance = wbShape.posCalcService.calcPointDistanceOn2D(point, wbShape.getDirectionPoint(i));
      console.log("\n\nLinkPort >> getCloseDirection >> tempLinkPath : ",LinkPortDirectionEnum[i]);
      console.log("LinkPort >> getCloseDirection >> newDistance : ",newDistance);
      console.log("LinkPort >> getCloseDirection >> closestDistance : ",closestDistance);
      if(newDistance < closestDistance){
        closestDirection = i;
        closestDistance = newDistance;
      }
    }
    console.log("\n\nLinkPort >> getCloseDirection >> tempLinkPath : ",LinkPortDirectionEnum[closestDirection]);
    return closestDirection;
  }
  public onOwnerChanged(){
    this.adjustTempLinkPosition();
  }

  get posCalcService(): PositionCalcService {
    return this._posCalcService;
  }

  set posCalcService(value: PositionCalcService) {
    this._posCalcService = value;
  }

  private adjustTempLinkPosition(){
    if(this.tempLinkPath.segments.length > 1){
      this.tempLinkPath.firstSegment.point = this.calcLinkPortPosition();
    }
  }
  private resetTempLink(){
    this.tempLinkPath.removeSegments();
  }

  get owner() {
    return this._owner;
  }

  set owner(value) {
    this._owner = value;
  }

  get direction() {
    return this._direction;
  }

  set direction(value) {
    this._direction = value;
  }

  get linkInfoList(): Array<LinkInfo> {
    return this._linkInfoList;
  }

  set linkInfoList(value: Array<LinkInfo>) {
    this._linkInfoList = value;
  }
}
