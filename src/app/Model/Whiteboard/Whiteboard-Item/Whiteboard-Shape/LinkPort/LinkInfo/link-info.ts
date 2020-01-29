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
import {LinkPort} from '../link-port';
import {WhiteboardShape} from '../../whiteboard-shape';
import {LinkPortDirectionEnum} from '../LinkPortDirectionEnum/link-port-direction-enum.enum';
export class LinkInfo {
  private _midPoints:Array<Point>;
  private _linkObject:Path;
  private _fromLinkPort:LinkPort;
  private _toLinkPort:LinkPort;


  constructor(fromLinkPort, toLinkPort, linkObject){
    this.fromLinkPort = fromLinkPort;
    this.toLinkPort = toLinkPort;

    this.linkObject = linkObject;

    this.linkObject.onFrame = ()=>{
      this.linkObject.firstSegment.point = this.fromLinkPort.calcLinkPortPosition();
      this.linkObject.lastSegment.point = this.toLinkPort.calcLinkPortPosition();
      this.linkObject.sendToBack();
    }
  }

  public destroyItem(){
    if(this.linkObject){
      this.linkObject.remove();
    }
  }
  get fromLinkPort(): LinkPort {
    return this._fromLinkPort;
  }

  set fromLinkPort(value: LinkPort) {
    this._fromLinkPort = value;
  }

  get toLinkPort(): LinkPort {
    return this._toLinkPort;
  }

  set toLinkPort(value: LinkPort) {
    this._toLinkPort = value;
  }

  get midPoints(): Array<paper.Point> {
    return this._midPoints;
  }

  set midPoints(value: Array<paper.Point>) {
    this._midPoints = value;
  }

  get linkObject(): paper.Path {
    return this._linkObject;
  }

  set linkObject(value: paper.Path) {
    this._linkObject = value;
  }
}
