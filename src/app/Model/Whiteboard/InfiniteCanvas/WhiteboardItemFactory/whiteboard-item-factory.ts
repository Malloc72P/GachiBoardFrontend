import {WhiteboardItemDto} from '../../WhiteboardItemDto/whiteboard-item-dto';
import {ShapeStyle, WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';
import {SimpleStroke} from '../../Whiteboard-Item/editable-stroke/SimpleStroke/simple-stroke';
import {DrawingLayerManagerService} from '../DrawingLayerManager/drawing-layer-manager.service';

import {EditableStrokeDto} from '../../WhiteboardItemDto/EditableStrokeDto/editable-stroke-dto';
import {HighlightStroke} from '../../Whiteboard-Item/editable-stroke/HighlightStroke/highlight-stroke';
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';
import {EditableRectangleDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableRectangleDto/editable-rectangle-dto';
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

import {WhiteboardShapeDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/whiteboard-shape-dto';
import {GachiColorDto} from '../../WhiteboardItemDto/ColorDto/gachi-color-dto';
import {EditableCircleDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCircleDto/editable-circle-dto';
import {EditableTriangleDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableTriangleDto/editable-triangle-dto';
import {EditableCardDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableCardDto/editable-card-dto';
import {from, Observable} from 'rxjs';
import {EditableShapeDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/editable-shape-dto';
import {EditableShape} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {EditableRectangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableRectangle/editable-rectangle';
import {EditableCircle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCircle/editable-circle';
import {EditableTriangle} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableTriangle/editable-triangle';
import {EditableCard} from '../../Whiteboard-Item/Whiteboard-Shape/EditableShape/EditableCard/editable-card';
import {EditableRasterDto} from '../../WhiteboardItemDto/WhiteboardShapeDto/EditableRasterDto/editable-raster-dto';
import {EditableRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/editable-raster';

import {SimpleRaster} from '../../Whiteboard-Item/Whiteboard-Shape/editable-raster/SimpleRaster/simple-raster';
import {WbItemFactoryResult} from './WbItemFactoryResult/wb-item-factory-result';
import {CopiedLinkData} from '../../Whiteboard-Item/ItemGroup/GlobalSelectedGroup/CopiedLinkData/copied-link-data';
import {WhiteboardShape} from '../../Whiteboard-Item/Whiteboard-Shape/whiteboard-shape';
import {EditableLink} from '../../Whiteboard-Item/Whiteboard-Shape/LinkPort/EditableLink/editable-link';
import {EditableLinkDto} from "../../WhiteboardItemDto/EditableLinkDto/editable-link-dto";


enum BUILD_MODE {
  CREATE,
  CLONE
}

export class WhiteboardItemFactory {

  private static MIN_SIZE_OF_WB_SHAPE = 5;

  private static layerService:DrawingLayerManagerService;
  public static initWhiteboardItemFactory(layerService:DrawingLayerManagerService){
    WhiteboardItemFactory.layerService = layerService;
  }

  public static cloneWbItems(copiedDtoArray):Observable<any>{
    return new Observable((observer)=>{
      let observerCounter = copiedDtoArray.length;
      let tempGsgArray = new Array<WhiteboardItem>();
      let copyLinkArray: Array<EditableLinkDto>;

      copyLinkArray = WhiteboardItemFactory.extractCopyLinkArray(copiedDtoArray);

      for (let i = 0; i < copiedDtoArray.length; i++) {
        let currDto = copiedDtoArray[i];
        WhiteboardItemFactory.waitForCreateWbItem(currDto, BUILD_MODE.CLONE).subscribe((factoryResult:WbItemFactoryResult)=>{

          tempGsgArray.push(factoryResult.newWbItem);
          // copyLinkArray = WhiteboardItemFactory.fillCopyLinkMap(copyLinkArray, factoryResult);
          observerCounter--;

          if(observerCounter <= 0){
            // #### 복제가 완전히 완료된 경우, 해당 조건문에 진입함 ####
            console.log("WhiteboardItemFactory >>  >> doLinking");
            WhiteboardItemFactory.doLinkingOperation(copyLinkArray, BUILD_MODE.CLONE);
            observer.next(tempGsgArray);
          }
        });
      }
    });

  }

  public static waitForCreateWbItem(wbItemDto:WhiteboardItemDto, buildMode:BUILD_MODE) :Observable<any>{
    return new Observable((observer)=>{
      WhiteboardItemFactory.createWbItem(buildMode, wbItemDto)
        .subscribe((data:WhiteboardItem)=>{
          data.group.opacity = 0;
          observer.next(new WbItemFactoryResult( data, wbItemDto ));
        });
    });
  }

  private static getWbId(buildMode:BUILD_MODE, originId){
    let wbId = -1;
    switch (buildMode) {
      case BUILD_MODE.CREATE:
        wbId = originId;
        break;
      case BUILD_MODE.CLONE:
        wbId = WhiteboardItemFactory.layerService.getWbId();
        break;
    }
    return wbId;
  }
  private static createWbItem(buildMode:BUILD_MODE, wbItemDto:WhiteboardItemDto) :Observable<any>{
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
        case WhiteboardItemType.SIMPLE_RASTER:
          WhiteboardItemFactory.buildEditableRaster(wbId, wbItemDto as EditableRasterDto).subscribe((data)=>{
            console.log("WhiteboardItemFactory >> 5 >> 진입함");
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
      strokeColor: WhiteboardItemFactory.convertGachiColorToPaperColor(edtStrokeDto.strokeColor),
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
          editableShapeDto.textStyle,
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_CIRCLE:
        tempShapeObject = WhiteboardItemFactory.createCircle(editableShapeDto as EditableCircleDto);
        newEdtShape = new EditableCircle(
          wbId,
          tempShapeObject,
          editableShapeDto.textStyle,
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_TRIANGLE:
        tempShapeObject = WhiteboardItemFactory.createTriangle(editableShapeDto as EditableTriangleDto);
        newEdtShape = new EditableTriangle(
          wbId,
          tempShapeObject,
          editableShapeDto.textStyle,
          tempPointText,
          WhiteboardItemFactory.layerService);
        break;
      case WhiteboardItemType.EDITABLE_CARD:
        tempShapeObject = WhiteboardItemFactory.createCard(editableShapeDto as EditableCardDto);
        newEdtShape = new EditableCard(
          wbId,
          tempShapeObject,
          editableShapeDto.textStyle,
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

    //#1 PointText 생성
    tempPointText = new PointText(
      {
        fontFamily  : editableShapeDto.textStyle.fontFamily,
        fontSize    : editableShapeDto.textStyle.fontSize,
        fontWeight  : editableShapeDto.textStyle.fontWeight,
        fillColor   : editableShapeDto.textStyle.fontColor,
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
    shapeObject.strokeColor = WhiteboardItemFactory.convertGachiColorToPaperColor(wbShapeDto.borderColor);
    shapeObject.fillColor = WhiteboardItemFactory.convertGachiColorToPaperColor(wbShapeDto.fillColor);
    shapeObject.strokeWidth = wbShapeDto.borderWidth;
  }

  private static convertGachiColorToPaperColor(gachiColor:GachiColorDto){
    return new Color(
      gachiColor.red,
      gachiColor.green,
      gachiColor.blue,
      gachiColor.alpha );
  }

  private static createEditableLink(wbId, linkDto: EditableLinkDto): EditableLink {
    let linkLine = new Path.Line({
      from: linkDto.fromPoint.paperPoint,
      to: linkDto.toPoint.paperPoint,
      strokeColor: linkDto.linkColor.paperColor,
      strokeWidth: linkDto.linkWidth,
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: linkDto.isDashed ? [linkDto.linkWidth * 2, linkDto.linkWidth * 2] : undefined,
    });

    let linkHead = new Path();
    let linkTail = new Path();

    let group = new Group();
    group.addChildren([linkLine, linkHead, linkTail]);

    return new EditableLink(wbId, group, linkDto.linkHeadType, linkDto.linkTailType, WhiteboardItemFactory.layerService);
  }

  // ##### Linking Operation #####
  private static buildEditableLink(buildMode, linkDto: EditableLinkDto): EditableLink{
    let wbId = WhiteboardItemFactory.getWbId(buildMode, linkDto.id);
    return WhiteboardItemFactory.createEditableLink(wbId, linkDto);
  }

  private static doLinkingOperation(copyLinkArray: Array<EditableLinkDto>, buildMode){
    console.log("WhiteboardItemFactory >> doLinkingOperation >> copyLinkArray : ",copyLinkArray);
    copyLinkArray.forEach(linkDto => {
      WhiteboardItemFactory.buildEditableLink(buildMode, linkDto);
    });
  }

  // private static fillCopyLinkMap( copyLinkMap:Map<any, CopiedLinkData>, factoryResult:WbItemFactoryResult ){
  //   console.log("WhiteboardItemFactory >> fillCopyLinkMap >> copyLinkMap : ",copyLinkMap);
  //   if( WhiteboardItemFactory.isWbShapeDto(factoryResult.originDto.type) ){
  //     let originWbShapeDto:WhiteboardShapeDto = factoryResult.originDto as WhiteboardShapeDto;
  //     let currLinkPorts = originWbShapeDto.linkPortsDto;
  //     for (let i = 0; i < currLinkPorts.length; i++) {
  //       let currPort = currLinkPorts[i];
  //
  //       let fromLinkList = currPort.fromLinkList;
  //       for (let j = 0; j < fromLinkList.length; j++) {
  //         let currLink = fromLinkList[j];
  //         if(copyLinkMap.has(currLink.id)){
  //           copyLinkMap.get(currLink.id).fromWbItem = factoryResult.newWbItem as WhiteboardShape;
  //         }
  //       }
  //
  //       let toLinkList = currPort.toLinkList;
  //       for (let j = 0; j < toLinkList.length; j++) {
  //         let currLink = toLinkList[j];
  //         if(copyLinkMap.has(currLink.id)){
  //           copyLinkMap.get(currLink.id).toWbItem = factoryResult.newWbItem as WhiteboardShape;
  //         }
  //       }
  //
  //     }
  //   }
  //   return copyLinkMap;
  // }

  private static extractCopyLinkArray(copiedWbDto: Array<WhiteboardItemDto>): Array<EditableLinkDto>{
    let copyLinkMap = new Array<EditableLinkDto>();
    copiedWbDto.forEach((dto, index) => {
      if(dto.type === WhiteboardItemType.EDITABLE_LINK) {
        copyLinkMap.push(dto as EditableLinkDto);
        copiedWbDto.splice(index, 1);
      }
    });

    return copyLinkMap;
  }//createCopiedLinkMap

  private static isWbShapeDto(type){
    return type === WhiteboardItemType.EDITABLE_RECTANGLE ||
      type === WhiteboardItemType.EDITABLE_TRIANGLE ||
      type === WhiteboardItemType.EDITABLE_CIRCLE ||
      type === WhiteboardItemType.EDITABLE_CARD;
  }
  // ##### Linking Operation #####
}

