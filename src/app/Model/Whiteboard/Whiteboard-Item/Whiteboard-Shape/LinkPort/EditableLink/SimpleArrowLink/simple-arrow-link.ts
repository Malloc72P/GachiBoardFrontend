import {EditableLink} from '../editable-link';
import {LinkPort} from '../../link-port';
import {WhiteboardShape} from '../../../whiteboard-shape';
import {LinkEvent} from '../../LinkEvent/link-event';
import {LinkEventEnum} from '../../LinkEvent/link-event-enum.enum';

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
import {SimpleArrowLinkDto} from '../../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/SimpleArrowLinkDto/simple-arrow-link-dto';
import {WhiteboardItemType} from '../../../../../../Helper/data-type-enum/data-type.enum';
import {SimpleLineLinkDto} from '../../../../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/SimpleLineLinkDto/simple-line-link-dto';

enum  ArrowSegmentEnum{
  ENTRY_POINT,
  EXIT_POINT_1,
  LEFT_WING,
  EXIT_POINT_2,
  RIGHT_WING,
  EXIT_POINT_3,
}

export class SimpleArrowLink extends EditableLink{
  private readonly normalizeFactor = 25;

  constructor(fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed? ) {
    super(WhiteboardItemType.SIMPLE_ARROW_LINK, fromLinkPort, strokeColor, strokeWidth, fillColor, isDashed);
  }

  // #### 링크객체 생성 메서드 오버라이드
  protected createLinkObject(){
    return new Path({
      strokeColor   : this.strokeColor,
      strokeWidth   : this.strokeWidth,
      fillColor     : this.fillColor,
      strokeCap     : 'round',
      strokeJoin    : 'round',
      dashArray     : [ this.dashLength, this.dashLength * 0.6 ]
    });
  }


  // ####  임시링크 메서드
  public initTempLink(downPoint){
    this.startPoint = downPoint;
    this.tempLinkPath = this.createLinkObject();
  }

  public drawTempLink(draggedPoint){
    let hitWbShape:WhiteboardShape = this.layerService.getHittedItem(draggedPoint) as WhiteboardShape;


    if(hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap){
      //this.tempLinkToWbItem(hitWbShape, draggedPoint);
      draggedPoint = hitWbShape.linkPortMap
        .get(hitWbShape.getClosestLinkPort(draggedPoint)).calcLinkPortPosition();
    }

    this.tempLinkPath.removeSegments();

    let vector = this.startPoint.subtract(draggedPoint);

    let arrowVector = vector.normalize(this.normalizeFactor);
    // @ts-ignore
    let arrowLeftWing = draggedPoint.add(arrowVector.rotate(35));
    // @ts-ignore
    let arrowRightWing = draggedPoint.add(arrowVector.rotate(-35));

    this.tempLinkPath.add( this.fromLinkPort.calcLinkPortPosition() );
    this.tempLinkPath.add(draggedPoint);
    this.tempLinkPath.add(arrowLeftWing);
    this.tempLinkPath.add(draggedPoint);
    this.tempLinkPath.add(arrowRightWing);
    this.tempLinkPath.add(draggedPoint);
  }
  // ####

  // #### 실제 링크 메서드
  public linkToWbShape(upPoint) : EditableLink{
    let hitWbShape:WhiteboardShape = this.layerService.getHittedItem(upPoint) as WhiteboardShape;

    this.destroyTempLink();

    if(hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap){
      //this.tempLinkToWbItem(hitWbShape, draggedPoint);
      let toLinkPort = hitWbShape.linkPortMap.get(hitWbShape.getClosestLinkPort(upPoint));
      upPoint = toLinkPort.calcLinkPortPosition();
      this.toLinkPort = toLinkPort;
      this.setToLinkEventEmitter();
    }
    else{
      return null;
    }

    this.tempLinkPath.removeSegments();

    let vector = this.startPoint.subtract(upPoint);

    let arrowVector = vector.normalize(this.normalizeFactor);
    // @ts-ignore
    let arrowLeftWing = upPoint.add(arrowVector.rotate(35));
    // @ts-ignore
    let arrowRightWing = upPoint.add(arrowVector.rotate(-35));

    this.linkObject.add( this.fromLinkPort.calcLinkPortPosition() );
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowLeftWing);
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowRightWing);
    this.linkObject.add(upPoint);

    this.linkObject.onFrame = (event)=>{
      this.refreshLink();
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
    this.onLinkEstablished();
    return this;
  }
  public manuallyLinkToWbShape(toWbShape:WhiteboardShape, toLinkPortDirection) : EditableLink{
    this.destroyTempLink();
    this.toLinkPort = toWbShape.linkPortMap.get(toLinkPortDirection);
    this.setToLinkEventEmitter();

    this.startPoint = this.fromLinkPort.calcLinkPortPosition();

    let upPoint = this.toLinkPort.calcLinkPortPosition();

    let vector = this.startPoint.subtract(upPoint);

    let arrowVector = vector.normalize(this.normalizeFactor);
    // @ts-ignore
    let arrowLeftWing = upPoint.add(arrowVector.rotate(35));
    // @ts-ignore
    let arrowRightWing = upPoint.add(arrowVector.rotate(-35));

    this.linkObject.add( this.fromLinkPort.calcLinkPortPosition() );
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowLeftWing);
    this.linkObject.add(upPoint);
    this.linkObject.add(arrowRightWing);
    this.linkObject.add(upPoint);

    this.linkObject.onFrame = (event)=>{
      this.refreshLink();
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
    this.onLinkEstablished();
    return this;
  }
  // ####

  // ####

  // #### 링크 위치 재조정
  public refreshLink(){
    if(this.fromLinkPort && this.toLinkPort){

      let segments = this.linkObject.segments;
      this.startPoint = segments[ArrowSegmentEnum.ENTRY_POINT].point = this.fromLinkPort.calcLinkPortPosition();

      this.endPoint = segments[ArrowSegmentEnum.EXIT_POINT_1].point = this.toLinkPort.calcLinkPortPosition();
      segments[ArrowSegmentEnum.EXIT_POINT_2].point = this.toLinkPort.calcLinkPortPosition();
      segments[ArrowSegmentEnum.EXIT_POINT_3].point = this.toLinkPort.calcLinkPortPosition();

      let vector = this.startPoint.subtract(this.endPoint);

      let arrowVector = vector.normalize(this.normalizeFactor);
      // @ts-ignore
      let arrowLeftWing = this.endPoint.add(arrowVector.rotate(35));
      // @ts-ignore
      let arrowRightWing = this.endPoint.add(arrowVector.rotate(-35));

      segments[ArrowSegmentEnum.LEFT_WING].point = arrowLeftWing;
      segments[ArrowSegmentEnum.RIGHT_WING].point = arrowRightWing;

    }
  }

  exportToDto(): SimpleArrowLinkDto {
    let simpleArrowLinkDto:SimpleArrowLinkDto = super.exportToDto() as SimpleArrowLinkDto;
    simpleArrowLinkDto.normalizeFactor = this.normalizeFactor;
    return simpleArrowLinkDto
  }
}
