import {EditableLink} from '../editable-link';
import {LinkPort} from '../../link-port';
import {WhiteboardShape} from '../../../whiteboard-shape';
import {SimpleArrowLinkDto} from '../../../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/SimpleArrowLinkDto/simple-arrow-link-dto';
import {SimpleLineLinkDto} from '../../../../../WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/SimpleLineLinkDto/simple-line-link-dto';
import {WhiteboardItemType} from '../../../../../../Helper/data-type-enum/data-type.enum';

export class SimpleLineLink extends EditableLink {

  constructor(fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed?) {
    super(WhiteboardItemType.SIMPLE_LINE_LINK, fromLinkPort, strokeColor, strokeWidth, fillColor, isDashed);
  }

  // ####  임시링크 메서드
  public initTempLink(downPoint) {
    this.startPoint = downPoint;
    this.tempLinkPath = this.createLinkObject();
  }

  public drawTempLink(draggedPoint) {
    let hitWbShape: WhiteboardShape = this.layerService.getHittedItem(draggedPoint) as WhiteboardShape;


    if (hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap) {
      draggedPoint = hitWbShape.linkPortMap
        .get(hitWbShape.getClosestLinkPort(draggedPoint)).calcLinkPortPosition();
    }

    this.tempLinkPath.removeSegments();

    this.tempLinkPath.add(this.fromLinkPort.calcLinkPortPosition());
    this.tempLinkPath.add(draggedPoint);
  }

  public manuallyLinkToWbShape(toWbShape:WhiteboardShape, toLinkPortDirection) : EditableLink{
    this.destroyTempLink();
    this.toLinkPort = toWbShape.linkPortMap.get(toLinkPortDirection);
    this.setToLinkEventEmitter();

    this.startPoint = this.fromLinkPort.calcLinkPortPosition();
    let draggedPoint = this.toLinkPort.calcLinkPortPosition();

    this.linkObject.add(this.fromLinkPort.calcLinkPortPosition());
    this.linkObject.add(draggedPoint);

    this.linkObject.onFrame = (event)=>{
      this.refreshLink();
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
    this.onLinkEstablished();
    return this;
  }


  // ####

  // #### 실제 링크 메서드
  public linkToWbShape(upPoint): EditableLink {
    let hitWbShape: WhiteboardShape = this.layerService.getHittedItem(upPoint) as WhiteboardShape;

    this.destroyTempLink();

    if (hitWbShape && hitWbShape.id !== this.fromLinkPort.owner.id && hitWbShape.linkPortMap) {
      let toLinkPort = hitWbShape.linkPortMap.get(hitWbShape.getClosestLinkPort(upPoint));
      upPoint = toLinkPort.calcLinkPortPosition();
      this.toLinkPort = toLinkPort;
      this.setToLinkEventEmitter();
    } else {
      return null;
    }
    this.tempLinkPath.removeSegments();

    this.linkObject.add(this.fromLinkPort.calcLinkPortPosition());
    this.linkObject.add(upPoint);

    this.linkObject.onFrame = (event) => {
      this.refreshLink();
      // TODO : EventEmitter 사용 고려
      this.layerService.horizonContextMenuService.refreshPosition();
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
    this.onLinkEstablished();
    return this;
  }

  // ####

  // ####

  // #### 링크 위치 재조정
  public refreshLink() {
    if (this.fromLinkPort && this.toLinkPort) {
      this.linkObject.firstSegment.point = this.fromLinkPort.calcLinkPortPosition();
      this.linkObject.lastSegment.point = this.toLinkPort.calcLinkPortPosition();
    }
  }

  exportToDto(): SimpleLineLinkDto {
    return super.exportToDto() as SimpleLineLinkDto;
  }
}
