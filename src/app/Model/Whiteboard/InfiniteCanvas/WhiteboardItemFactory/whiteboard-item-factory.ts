import {WhiteboardItemDto} from '../../../../DTO/WhiteboardItemDto/whiteboard-item-dto';
import {ShapeStyle, WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {SimpleStroke} from '../../Whiteboard-Item/editable-stroke/SimpleStroke/simple-stroke';
import {DrawingLayerManagerService} from '../DrawingLayerManager/drawing-layer-manager.service';

import {EditableStrokeDto} from '../../../../DTO/WhiteboardItemDto/EditableStrokeDto/editable-stroke-dto';
import {HighlightStroke} from '../../Whiteboard-Item/editable-stroke/HighlightStroke/highlight-stroke';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {EditableRectangleDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableRectangleDto/editable-rectangle-dto';
import {TextStyle} from '../../Pointer/shape-service/text-style';


import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;
// @ts-ignore
import RegularPolygon = paper.Path.RegularPolygon;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Size = paper.Size;
// @ts-ignore
import Circle = paper.Path.Circle;
// @ts-ignore
import Raster = paper.Raster;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Group = paper.Group;

import {WhiteboardShapeDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/whiteboard-shape-dto';
import {GachiColorDto} from '../../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto';
import {EditableCircleDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCircleDto/editable-circle-dto';
import {EditableTriangleDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableTriangleDto/editable-triangle-dto';
import {EditableCardDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCardDto/editable-card-dto';
import {from, Observable} from 'rxjs';
import {EditableShapeDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/editable-shape-dto';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {EditableRectangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableRectangle/editable-rectangle';
import {EditableCircle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCircle/editable-circle';
import {EditableTriangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableTriangle/editable-triangle';
import {EditableCard} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCard/editable-card';
import {EditableRasterDto} from '../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/editable-raster-dto';
import {EditableRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/editable-raster';
import {SimpleRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/SimpleRaster/simple-raster';
import {WbItemFactoryResult} from './WbItemFactoryResult/wb-item-factory-result';
import {EditableLink} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {LinkPortDto} from "../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/link-port-dto";
import {LinkPort} from "../../Whiteboard-Item/Whiteboard-Shape/LinkPort/link-port";
import {EditableLinkDto} from "../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/LinkPortDto/EditableLinkDto/editable-link-dto";
import {WhiteboardShape} from "../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape";
import {GachiPointDto} from "../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto";
import {GachiTextStyleDto} from "../../../../DTO/WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/GachiTextStyleDto/gachi-text-style-dto";


enum BUILD_MODE {
  CREATE,
  CLONE
}

export class WhiteboardItemFactory {
  private static layerService:DrawingLayerManagerService;
  public static initWhiteboardItemFactory(layerService:DrawingLayerManagerService){
    WhiteboardItemFactory.layerService = layerService;
  }
  private static _tempIdGen = 0;


  static get tempIdGen(): number {
    return this._tempIdGen++;
  }

  public static cloneWbItems(copiedDtoArray):Observable<any>{
    return new Observable((observer)=>{
      let copyLinkMap: Map<number, EditableLinkDto>;
      copyLinkMap = WhiteboardItemFactory.extractCopyLinkArray(copiedDtoArray);

      let copyWbItemArray: Array<WhiteboardItemDto>;
      copyWbItemArray = WhiteboardItemFactory.extractCopyWbItemArray(copiedDtoArray);
      let observerCount = copyWbItemArray.length;

      let wbItemIdMap = new Map<number, number>();
      let tempGsgArray = new Array<WhiteboardItem>();

      for (let i = 0; i < copyWbItemArray.length; i++) {
        let currDto = copyWbItemArray[i];
        WhiteboardItemFactory.waitForCreateWbItem(currDto, BUILD_MODE.CLONE).subscribe((factoryResult:WbItemFactoryResult)=>{
          wbItemIdMap.set(currDto.id, factoryResult.newWbItem.id);
          tempGsgArray.push(factoryResult.newWbItem);
          observerCount--;
          if(observerCount <= 0) {
            for(let [id, linkDto] of copyLinkMap) {
              let replacedLinkDto = this.replaceLinkPort(linkDto, wbItemIdMap);
              tempGsgArray.push(WhiteboardItemFactory.buildEditableLink(BUILD_MODE.CLONE, replacedLinkDto, tempGsgArray));
            }
            observer.next(tempGsgArray);
          }
        });
      }
      if(copyWbItemArray.length <= 0) {
        for(let [id, linkDto] of copyLinkMap) {
          let replacedLinkDto = this.replaceLinkPort(linkDto, wbItemIdMap);
          tempGsgArray.push(WhiteboardItemFactory.buildEditableLink(BUILD_MODE.CLONE, replacedLinkDto, tempGsgArray));
        }
        observer.next(tempGsgArray);
      }
    });
  }
  public static buildWbItems(wbItemDto:WhiteboardItemDto, wbItemArray?:Array<WhiteboardItem>):Observable<any>{
    return new Observable((observer)=>{
      if(wbItemArray){
        WhiteboardItemFactory.waitForCreateWbItem(wbItemDto, BUILD_MODE.CREATE, wbItemArray)
          .subscribe((wbFactoryRes:WbItemFactoryResult)=>{
            // console.log("WhiteboardItemFactory >> buildWbItems >> wbFactoryRes : ",wbFactoryRes);
            observer.next(wbFactoryRes);
          });
      }
      else {
        WhiteboardItemFactory.waitForCreateWbItem(wbItemDto, BUILD_MODE.CREATE)
          .subscribe((wbFactoryRes:WbItemFactoryResult)=>{
            // console.log("WhiteboardItemFactory >> buildWbItems >> wbFactoryRes : ",wbFactoryRes);
            observer.next(wbFactoryRes);
          });

      }
    });
  }

  private static replaceLinkPort(linkDto: EditableLinkDto, wbItemIdMap: Map<number, number>): EditableLinkDto {
    let newLinkDto = EditableLinkDto.clone(linkDto);

    if(!!linkDto.toLinkPort) {
      newLinkDto.toLinkPort.ownerWbItemId = wbItemIdMap.get(linkDto.toLinkPort.ownerWbItemId);
    }
    if(!!linkDto.fromLinkPort) {
      newLinkDto.fromLinkPort.ownerWbItemId = wbItemIdMap.get(linkDto.fromLinkPort.ownerWbItemId);
    }

    return newLinkDto;
  }

  public static waitForCreateWbItem(wbItemDto:WhiteboardItemDto, buildMode:BUILD_MODE, wbItemArray?:Array<WhiteboardItem>) :Observable<any>{
    return new Observable((observer)=>{
      if(wbItemArray){
        WhiteboardItemFactory.createWbItem(buildMode, wbItemDto, wbItemArray)
          .subscribe((data:WhiteboardItem)=>{
            data.group.opacity = 1;
            data.groupedIdList = wbItemDto.groupedIdList;
            observer.next(new WbItemFactoryResult( data, wbItemDto ));
          });
      }else {
        WhiteboardItemFactory.createWbItem(buildMode, wbItemDto)
          .subscribe((data:WhiteboardItem)=>{
            data.group.opacity = 1;
            data.groupedIdList = wbItemDto.groupedIdList;
            observer.next(new WbItemFactoryResult( data, wbItemDto ));
          });
      }

    });
  }

  private static getWbId(buildMode:BUILD_MODE, originId){
    let wbId = -1;
    switch (buildMode) {
      case BUILD_MODE.CREATE:
        wbId = originId;
        break;
      case BUILD_MODE.CLONE:
        // wbId = WhiteboardItemFactory.layerService.getWbId();
        wbId = WhiteboardItemFactory.tempIdGen;
        break;
    }
    return wbId;
  }
  private static createWbItem(buildMode:BUILD_MODE, wbItemDto:WhiteboardItemDto, wbItemArray?:Array<WhiteboardItem>) :Observable<any>{
    return new Observable((observer)=>{
      let newWbItem;

      let wbId = WhiteboardItemFactory.getWbId(buildMode, wbItemDto.id);

      let typeOfDto:WhiteboardItemType = wbItemDto.type;
      let newPath;
      switch (typeOfDto) {
        case WhiteboardItemType.SIMPLE_STROKE:
          newPath = WhiteboardItemFactory.buildPathObject(wbItemDto as EditableStrokeDto);
          newWbItem = new SimpleStroke(wbId, newPath, WhiteboardItemFactory.layerService);

          observer.next(newWbItem);
          break;
        case WhiteboardItemType.HIGHLIGHT_STROKE:
          newPath = WhiteboardItemFactory.buildPathObject(wbItemDto as EditableStrokeDto);
          newWbItem = new HighlightStroke(wbId, newPath, WhiteboardItemFactory.layerService);

          observer.next(newWbItem);
          break;
        case WhiteboardItemType.EDITABLE_RECTANGLE:
        case WhiteboardItemType.EDITABLE_CIRCLE:
        case WhiteboardItemType.EDITABLE_TRIANGLE:
        case WhiteboardItemType.EDITABLE_CARD:
          newWbItem = WhiteboardItemFactory.buildEditableShape(wbId, wbItemDto as EditableShapeDto);
          observer.next(newWbItem);
          break;
        case WhiteboardItemType.EDITABLE_LINK:
          if(wbItemArray){
            newWbItem = WhiteboardItemFactory.buildEditableLink(BUILD_MODE.CREATE, wbItemDto as EditableLinkDto, wbItemArray);
          }else {
            newWbItem = WhiteboardItemFactory.buildEditableLink(BUILD_MODE.CREATE, wbItemDto as EditableLinkDto);
          }
          observer.next(newWbItem);
          break;
        case WhiteboardItemType.SIMPLE_RASTER:
          WhiteboardItemFactory.buildEditableRaster(wbId, wbItemDto as EditableRasterDto).subscribe((data)=>{
            observer.next(data);
          });
          break;
      }//switch
    });
  }

  private static buildPathObject(edtStrokeDto:EditableStrokeDto) : Path{
    let newPath:Path;
    newPath =  new paper.Path({
      segments: [],
      strokeColor: GachiColorDto.getPaperColor(edtStrokeDto.strokeColor),
      strokeWidth: edtStrokeDto.strokeWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
    });
    for(let i = 0 ; i < edtStrokeDto.segments.length; i++){
      let newSegment = edtStrokeDto.segments[i];
      newPath.add( new Segment(new Point(newSegment.point), new Point(newSegment.handleIn), new Point(newSegment. handleOut)) );
    }
    // newPath.smooth({ type: 'catmull-rom', factor: 0.5 });
    //newPath.simplify(1);

    return newPath
  }

  private static buildEditableShape(wbId, editableShapeDto:EditableShapeDto) :EditableShape{
    let newEdtShape:EditableShape;
    let typeOfDto:WhiteboardItemType = editableShapeDto.type;

    let tempPointText = WhiteboardItemFactory.createPointText(editableShapeDto);
    let tempShapeObject;

    switch (typeOfDto) {
      case WhiteboardItemType.EDITABLE_RECTANGLE:
        tempShapeObject = WhiteboardItemFactory.createRectangle(editableShapeDto as EditableRectangleDto);
        newEdtShape = new EditableRectangle(
          wbId,
          tempShapeObject,
          GachiTextStyleDto.getTextStyle(editableShapeDto.textStyle),
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_CIRCLE:
        tempShapeObject = WhiteboardItemFactory.createCircle(editableShapeDto as EditableCircleDto);
        newEdtShape = new EditableCircle(
          wbId,
          tempShapeObject,
          GachiTextStyleDto.getTextStyle(editableShapeDto.textStyle),
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_TRIANGLE:
        tempShapeObject = WhiteboardItemFactory.createTriangle(editableShapeDto as EditableTriangleDto);
        newEdtShape = new EditableTriangle(
          wbId,
          tempShapeObject,
          GachiTextStyleDto.getTextStyle(editableShapeDto.textStyle),
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_CARD:
        tempShapeObject = WhiteboardItemFactory.createCard(editableShapeDto as EditableCardDto);
        newEdtShape = new EditableCard(
          wbId,
          tempShapeObject,
          GachiTextStyleDto.getTextStyle(editableShapeDto.textStyle),
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
    }

    newEdtShape.textContent = editableShapeDto.textContent;
    newEdtShape.rawTextContent = editableShapeDto.rawTextContent;

    newEdtShape.refreshItem();

    return newEdtShape;
  }
  private static buildEditableRaster(wbId, rasterDto:EditableRasterDto) :Observable<any> {
    return new Observable((observer)=>{

      let rasterObject: Raster;
      rasterObject = new Raster(rasterDto.imageBlob);
      rasterObject.opacity = 0;
      rasterObject.onLoad = () => {
        let newEdtRaster:EditableRaster;
        rasterObject.bounds.width = rasterDto.width;
        rasterObject.bounds.height = rasterDto.height;
        rasterObject.position = new Point(rasterDto.center.x, rasterDto.center.y);
        newEdtRaster = new SimpleRaster(wbId, rasterObject, WhiteboardItemFactory.layerService);
        observer.next(newEdtRaster);
      };
    });
  }

  private static createPointText(editableShapeDto:EditableShapeDto) : PointText{
    let tempPointText:PointText;
    let textStyle = GachiTextStyleDto.getTextStyle(editableShapeDto.textStyle);

    //#1 PointText 생성
    tempPointText = new PointText(
      {
        fontFamily  : textStyle.fontFamily,
        fontSize    : textStyle.fontSize,
        fontWeight  : textStyle.fontWeight,
        fillColor   : textStyle.fontColor,
      }
    );
    return tempPointText;
  }

  private static createRectangle(wbShapeDto:EditableRectangleDto) {
    let newWbShapeSize = new Size(wbShapeDto.width,wbShapeDto.height);
    let newWbShape = new Rectangle(new Point(wbShapeDto.center.x, wbShapeDto.center.y), newWbShapeSize);

    WhiteboardItemFactory.setWbShapeAttribute(newWbShape, wbShapeDto);

    return newWbShape;
  }
  private static createCircle(wbShapeDto:EditableCircleDto) {
    let newWbShapeSize = new Size(wbShapeDto.width,wbShapeDto.height);
    let newWbShape = new Circle({
      center: wbShapeDto.center,
      radius: wbShapeDto.width/2,
    });
    WhiteboardItemFactory.setWbShapeAttribute(newWbShape, wbShapeDto);
    return newWbShape;
  }
  private static createTriangle(wbShapeDto:EditableTriangleDto) {
    let newWbShapeSize = new Size(wbShapeDto.width,wbShapeDto.height);
    let newWbShape = new RegularPolygon({
      center: wbShapeDto.center,
      sides: 3,
      radius: wbShapeDto.width/2,
    });
    WhiteboardItemFactory.setWbShapeAttribute(newWbShape, wbShapeDto);
    return newWbShape;
  }
  private static createCard(wbShapeDto:EditableCardDto) {
    let centerPoint = new Point(wbShapeDto.center.x, wbShapeDto.center.y);
    let halfOfWidth = wbShapeDto.width/2;
    let halfOfHeight = wbShapeDto.height/2;

    let fromPoint = new Point(centerPoint.x - halfOfWidth, centerPoint.y - halfOfHeight);
    let toPoint   = new Point(centerPoint.x + halfOfWidth, centerPoint.y + halfOfHeight);

    let min = Math.min(wbShapeDto.width, wbShapeDto.height);

    let cornerSize = new Size(min * 0.1, min * 0.1);

    let newWbShape = new Rectangle({
      from: fromPoint,
      to: toPoint,
      radius: cornerSize
    });

    WhiteboardItemFactory.setWbShapeAttribute(newWbShape, wbShapeDto);

    return newWbShape;
  }


  private static setWbShapeAttribute(shapeObject, wbShapeDto:WhiteboardShapeDto){
    shapeObject.bounds.width = wbShapeDto.width;
    shapeObject.bounds.height = wbShapeDto.height;
    shapeObject.position = new Point(wbShapeDto.center.x, wbShapeDto.center.y);
    shapeObject.strokeColor = GachiColorDto.getPaperColor(wbShapeDto.borderColor);
    shapeObject.fillColor = GachiColorDto.getPaperColor(wbShapeDto.fillColor);
    shapeObject.strokeWidth = wbShapeDto.borderWidth;
  }

  private static createEditableLink(wbId, linkDto: EditableLinkDto, copiedGSG?: Array<WhiteboardItem>): EditableLink {
    let linkLine = EditableLink.createLinkLine(
      GachiPointDto.getPaperPoint(linkDto.fromPoint),
      GachiPointDto.getPaperPoint(linkDto.toPoint),
      GachiColorDto.getPaperColor(linkDto.linkColor),
      linkDto.linkWidth,
      linkDto.isDashed);

    let linkHead = EditableLink.createCap(GachiColorDto.getPaperColor(linkDto.linkColor), linkDto.linkWidth);
    let linkTail = EditableLink.createCap(GachiColorDto.getPaperColor(linkDto.linkColor), linkDto.linkWidth);

    let group: Group = new Group();
    group.addChildren([linkLine, linkHead, linkTail]);

    return new EditableLink(
      wbId,
      group,
      linkDto.linkHeadType,
      linkDto.linkTailType,
      WhiteboardItemFactory.layerService,
      this.getLinkPort(linkDto.toLinkPort, copiedGSG),
      this.getLinkPort(linkDto.fromLinkPort, copiedGSG)
    );
  }

  // ##### Linking Operation #####
  private static buildEditableLink(buildMode, linkDto: EditableLinkDto, copiedGSG?: Array<WhiteboardItem>): EditableLink{
    let wbId = WhiteboardItemFactory.getWbId(buildMode, linkDto.id);
    return WhiteboardItemFactory.createEditableLink(wbId, linkDto, copiedGSG);
  }

  private static extractCopyLinkArray(copiedWbDto: Array<WhiteboardItemDto>): Map<number, EditableLinkDto> {
    let copyLinkArray = new Map<number, EditableLinkDto>();

    copiedWbDto.forEach(dto => {
      if(dto.type === WhiteboardItemType.EDITABLE_LINK) {
        copyLinkArray.set(dto.id, dto as EditableLinkDto);
      }
    });

    return copyLinkArray;
  }

  private static extractCopyWbItemArray(copiedWbDto: Array<WhiteboardItemDto>): Array<WhiteboardItemDto> {
    let copyWbItemArray = new Array<WhiteboardItemDto>();

    copiedWbDto.forEach(dto => {
      if(dto.type !== WhiteboardItemType.EDITABLE_LINK) {
        copyWbItemArray.push(dto);
      }
    });

    return copyWbItemArray;
  }

  private static isWbShapeDto(type){
    return type === WhiteboardItemType.EDITABLE_RECTANGLE ||
      type === WhiteboardItemType.EDITABLE_TRIANGLE ||
      type === WhiteboardItemType.EDITABLE_CIRCLE ||
      type === WhiteboardItemType.EDITABLE_CARD;
  }

  private static getLinkPort(linkPortDto: LinkPortDto, copiedGSG?: Array<WhiteboardItem>): LinkPort{
    if(!linkPortDto) {
      return undefined;
    }

    let wbItemGroup: Array<WhiteboardItem>;

    if(!!copiedGSG) {
      wbItemGroup = copiedGSG;
    } else {
      wbItemGroup = WhiteboardItemFactory.layerService.whiteboardItemArray;
    }

    for(let wbItem of wbItemGroup) {
      if(wbItem.id === linkPortDto.ownerWbItemId && wbItem instanceof WhiteboardShape) {
        return wbItem.linkPortMap.get(linkPortDto.direction);
      }
    }
    return undefined;
  }
  // ##### Linking Operation #####
}

