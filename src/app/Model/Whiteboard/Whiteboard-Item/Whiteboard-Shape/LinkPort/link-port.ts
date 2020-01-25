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
// @ts-ignore
import Circle = paper.Path.Circle;

import {PositionCalcService} from '../../../PositionCalc/position-calc.service';

export class LinkPort {
  private _owner:WhiteboardShape;
  private _direction;
  private _linkInfoList:Array<LinkInfo>;
  private _posCalcService:PositionCalcService;

  private tempLinkPath:Path;

  private tempLinkEntryCircle:Circle;
  private tempLinkExitCircle:Circle;

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
    this.onCreateTempLink();
  }
  public tempLinkToWbItem(toWbShape:WhiteboardShape, point){
    this.tempLinkPath.removeSegments();
    this.tempLinkPath.add( this.calcLinkPortPosition() );

    let toLinkPort = toWbShape.linkPortMap.get(this.getCloseDirection(toWbShape, point));

    this.tempLinkPath.add(toLinkPort.calcLinkPortPosition());
    this.onCreateTempLink();
  }
  private onCreateTempLink(){
    let step = 0.1;
    this.tempLinkPath.onFrame = (event)=>{
      if(this.tempLinkPath.segments.length > 1){
        let entrySegment, exitSegment;
        entrySegment = this.tempLinkPath.firstSegment;
        exitSegment = this.tempLinkPath.lastSegment;

        if(!this.tempLinkEntryCircle && !this.tempLinkExitCircle){
          this.tempLinkEntryCircle = new Circle(new Point(entrySegment.point), 5);
          this.tempLinkExitCircle = new Circle(new Point(exitSegment.point), 5);

          // @ts-ignore
          this.tempLinkEntryCircle.style.strokeColor = "blue";
          // @ts-ignore
          this.tempLinkExitCircle.style.strokeColor = "blue";

          this.tempLinkEntryCircle.strokeWidth = 3;
          this.tempLinkExitCircle.strokeWidth = 3;

          this.tempLinkEntryCircle.opacity = 0.5;
          this.tempLinkExitCircle.opacity = 0.5;

          this.tempLinkExitCircle.applyMatrix = false;
        }
        else{
          this.tempLinkEntryCircle.position = entrySegment.point;
          this.tempLinkExitCircle.position = exitSegment.point;
          /*if(event.count % 4 === 0){
            this.tempLinkExitCircle.matrix.reset();
          }*/

        }
      }
    }
  }
  private onDeleteTempLink(){
    if(this.tempLinkEntryCircle){
      this.tempLinkEntryCircle.remove();
      this.tempLinkEntryCircle = null;
    }
    if(this.tempLinkExitCircle){
      this.tempLinkExitCircle.remove();
      this.tempLinkExitCircle = null;
    }
    this.tempLinkPath.onFrame = ()=>{};
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
    let closestDistance = this.posCalcService.calcPointDistanceOn2D(point, wbShape.group.bounds.topCenter);
    for(let i = 1 ; i < 4; i++){
      let newDistance = this.posCalcService.calcPointDistanceOn2D(point, wbShape.getDirectionPoint(i));
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
    this.onDeleteTempLink();
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
