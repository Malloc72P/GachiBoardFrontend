import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

import * as paper from 'paper';

// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import BoundsRectangle = paper.Rectangle;
import {GlobalSelectedGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/GlobalSelectedGroupDto/GlobalSelectedGroupDto';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {ZoomEvent} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event';
import {ZoomEventEnum} from '../../InfiniteCanvas/ZoomControl/ZoomEvent/zoom-event-enum.enum';

export class UserBlinder {
  public blindGroup;

  public blindRect;
  public blindTextGroup;
  public blindText;
  public blindTextBg;

  public userIdToken;
  public userName;

  public blindItemMap:Map<any, WhiteboardItem>;

  public layerService:DrawingLayerManagerService;

  public width;
  public height;

  constructor(userIdToken, userName, layerService, zoomEventEmitter){
    this.blindItemMap = new Map<any, WhiteboardItem>();
    this.userIdToken = userIdToken;
    this.userName = userName;

    this.layerService = layerService;

    this.blindGroup = new Group();
    this.blindTextGroup = new Group();

    let blindRect = new Rectangle({
      from: new Point(0,0),
      to: new Point(100,100),
    });
    blindRect.name = "blind-main";
    // @ts-ignore
    blindRect.fillColor = "black";
    // @ts-ignore
    blindRect.opacity = 0.3;

    let blindText = new PointText(blindRect.bounds.bottomRight);
    // @ts-ignore
    blindText.fillColor = "white";
    blindText.fontWeight = "bold";
    blindText.content = userName + " 님이 수정중";
    blindText.bounds.topRight = blindRect.bounds.bottomRight;
    blindText.name = "blind-text";

    let blindTextBg = new Rectangle({
      from: blindText.bounds.topLeft,
      to: blindText.bounds.bottomRight,
    });
    // @ts-ignore
    blindTextBg.fillColor = "black";
    blindTextBg.name = "blind-text-bg";
    // @ts-ignore
    blindTextBg.opacity = 0.5;
    blindTextBg.bounds.topLeft = blindText.bounds.topLeft;

    this.width = blindText.bounds.width;
    this.height = blindText.bounds.height;

    this.blindRect = blindRect;
    this.blindText = blindText;
    this.blindTextBg = blindTextBg;

    this.blindTextGroup.addChild(blindTextBg);
    this.blindTextGroup.addChild(blindText);

    this.blindGroup.addChild(blindRect);
    this.blindGroup.addChild(this.blindTextGroup);

    this.layerService.drawingLayer.addChild(this.blindGroup);

    zoomEventEmitter.subscribe((zoomEvent: ZoomEvent) => {
      this.onZoomChanged(zoomEvent);
    });

  }

  occupyUpdate(gsgDto:GlobalSelectedGroupDto){
    for(let itemId of gsgDto.wbItemGroup){
      let foundItem = this.layerService.findItemById(itemId);
      if(foundItem){
        if(!this.blindItemMap.has(foundItem.id)){
          foundItem.isOccupied = true;
          this.blindItemMap.set(foundItem.id, foundItem)
        }
      }
    }

    if(gsgDto.width === 0 || gsgDto.height === 0){
      this.blindGroup.visible = false;
      return;
    }

    if(this.blindItemMap.size > 0){
      this.blindRect.bounds.width = gsgDto.width;
      this.blindRect.bounds.height = gsgDto.height;

      this.blindRect.bounds.topLeft = new Point( gsgDto.topLeft.x, gsgDto.topLeft.y );

      this.blindTextGroup.bounds.topRight = this.blindRect.bounds.bottomRight;
      // this.blindText.bounds.topRight = this.blindRect.bounds.bottomRight;
      // this.blindTextBg.bounds.topLeft = this.blindText.bounds.topLeft;
      this.blindGroup.bringToFront();
      this.blindGroup.visible = true;
    }else{
      this.blindGroup.visible = false;
    }
  }
  notOccupyUpdate(gsgDto:GlobalSelectedGroupDto){
    for(let itemId of gsgDto.wbItemGroup){
      let foundItem = this.layerService.findItemById(itemId);
      if(foundItem){
        if(this.blindItemMap.has(foundItem.id)){
          foundItem.isOccupied = false;
          this.blindItemMap.delete(foundItem.id)
        }
      }
    }

    if(gsgDto.width === 0 || gsgDto.height === 0){
      this.blindGroup.visible = false;
      return;
    }

    if(this.blindItemMap.size > 0){
      this.blindRect.bounds.width = gsgDto.width;
      this.blindRect.bounds.height = gsgDto.height;

      this.blindRect.bounds.topLeft = new Point( gsgDto.topLeft.x, gsgDto.topLeft.y );

      this.blindTextGroup.bounds.topRight = this.blindRect.bounds.bottomRight;

      this.blindGroup.bringToFront();
      this.blindGroup.visible = true;
    }else{
      this.blindGroup.visible = false;
    }
  }
  refreshOnDelete(){
    if(this.blindItemMap.size === 0){
      this.blindGroup.visible = false;
    }
  }

  private onZoomChanged(zoomEvent: ZoomEvent) {
    if (zoomEvent.action === ZoomEventEnum.ZOOM_CHANGED) {
      this.refreshBlinderForZooming(zoomEvent.zoomFactor);
    }
  }

  private refreshBlinderForZooming(factor: number) {
    this.blindTextGroup.bounds.width = this.width / factor;
    this.blindTextGroup.bounds.height = this.height / factor;
    this.blindTextGroup.bounds.topRight = this.blindRect.bounds.bottomRight;
  }


}
