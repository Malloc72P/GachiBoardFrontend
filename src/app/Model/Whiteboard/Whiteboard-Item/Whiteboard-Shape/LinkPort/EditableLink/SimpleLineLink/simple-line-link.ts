import {EditableLink} from '../editable-link';
import {LinkPort} from '../../link-port';
import {WhiteboardShape} from '../../../whiteboard-shape';

export class SimpleLineLink extends EditableLink {

  constructor(fromLinkPort: LinkPort, strokeColor?, strokeWidth?, fillColor?, isDashed?) {
    super(fromLinkPort, strokeColor, strokeWidth, fillColor, isDashed);
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
    };
    this.layerService.drawingLayer.addChild(this.linkObject);
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
}
