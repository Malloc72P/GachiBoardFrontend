import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {DataName, DataState, DataType, ItemName} from '../../../Helper/data-type-enum/data-type.enum';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
// @ts-ignore
import Group = paper.Group;
import {WhiteboardItem} from '../../Whiteboard-Item/whiteboard-item';

// @ts-ignore
import Point = paper.Point;

@Injectable({
  providedIn: 'root'
})
export class LassoSelectorService {
  private newPath: paper.Path;
  private selectedGroup: paper.Group;
  private handlerGroup: paper.Group;
  private selectedItems = Array<paper.Item>();
  private previousPoint: paper.Point;
  private currentProject: paper.Project;
  private selectRange: paper.Path;
  private hitOption = { segments: true, stroke: true, fill: true, tolerance: 20 };
  private isSelected = false;
  private handleOption = {strokeWidth: 1, handleRadius: 6, dashLength: 5};
  private dashLength = 5;
  private strokeWidth = 1;

  private readonly MOUSE_TOLERANCE = 5;
  private readonly TOUCH_TOLERANCE = 10;

  constructor(
    private posCalcService: PositionCalcService,
    private layerService: DrawingLayerManagerService,
  ) { }

  public initializeLassoSelectorService(project: paper.Project) {
    this.currentProject = project;
  }

  public createPath(event) {

    let advHitOption;
    // 올가미를 그려주는 패스(newPath)가 있거나 선택된 아이템이 있으면
    if(this.newPath != null) {
      if(!this.selectedGroup.hasChildren()) {
        this.newPath.selected = false;
        this.cancelSelect();
      }
    }

    if(!this.selectedGroup){
      this.selectedGroup = new paper.Group();
    }

    let point: paper.Point;

    // 입력 타입에 맞게 필요한 값들 초기화
    if(event instanceof MouseEvent) {
      advHitOption = { segments: true, stroke: true, fill: true, tolerance: this.MOUSE_TOLERANCE };
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      advHitOption = { segments: true, stroke: true, fill: true, tolerance: this.TOUCH_TOLERANCE };
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    // *선택이 되어있는지 확인
    // 선택 그룹이 있는지 확인
    if (this.selectedGroup.hasChildren()) {
      // 클릭 시작 포인트가 선택그룹 안쪽인지 확인
      let tempTest;

      tempTest = this.handlerGroup.hitTest(point, advHitOption);

      if(tempTest && tempTest.item.data.type == DataType.LASSO_HANDLER) {
        this.selectedGroup.data.state = DataState.RESIZING;

        let i = tempTest.item.data.handlerIndex;

        let opposite = (i + 2) % 4;
        this.selectedGroup.data.from = this.handlerGroup.children[opposite].position;
        this.selectedGroup.data.to = this.handlerGroup.children[i].position;
      } else if (this.selectedGroup.contains(point)) {
        this.selectedGroup.data.state = DataState.MOVING;
        /* 선택 초기화 안함 */
      } else {
        /* 선택 초기화 함 */
        this.selectedGroup.data.state = "";
        this.cancelSelect();
      }
    }

    let zoomFactor = this.currentProject.view.zoom;

    this.newPath = new paper.Path({
      segments: [point],
      strokeColor: 'blue',
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: [this.dashLength / zoomFactor, this.dashLength / zoomFactor],
      strokeWidth: this.strokeWidth / zoomFactor,
      data : { wbID : 1 }
    });
  }

  public drawPath(event) {
    let point: paper.Point;
    let delta: paper.Point;

    // 입력 타입에 맞게 필요한 값들 초기화
    if(event instanceof MouseEvent) {
      point = new paper.Point(event.x, event.y);
      delta = new paper.Point(event.movementX, event.movementY);
    } else if (event instanceof TouchEvent) {
      point = new paper.Point(event.touches[0].clientX, event.touches[0].clientY);
      delta = new paper.Point (point.x - this.previousPoint.x, point.y - this.previousPoint.y);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);
    delta = this.posCalcService.reflectZoomWithPoint(delta);

    // 선택 그룹 객체 있는지 확인
    if (this.selectedGroup.hasChildren()) {
      if(this.selectedGroup.data.state === DataState.MOVING) {
        this.selectedGroup.position.x += delta.x;
        this.handlerGroup.position.x += delta.x;
        this.selectedGroup.position.y += delta.y;
        this.handlerGroup.position.y += delta.y;
      } else if (this.selectedGroup.data.state === DataState.RESIZING) {
        let resizePoint = point;
        let minSize = 5;

        const width = this.selectedGroup.data.from.x - resizePoint.x;
        if(width < minSize && width >= 0) {
          resizePoint.x = this.selectedGroup.data.from.x - minSize;
        } else if (width > -minSize && width < 0) {
          resizePoint.x = this.selectedGroup.data.from.x + minSize;
        }


        const height = this.selectedGroup.data.from.y - resizePoint.y;
        if(height < minSize && height >= 0) {
          resizePoint.y = this.selectedGroup.data.from.y - minSize;
        } else if (height > -minSize && height < 0) {
          resizePoint.y = this.selectedGroup.data.from.y + minSize;
        }

        let bound = new paper.Rectangle(this.selectedGroup.data.from, resizePoint);

        this.selectedGroup.bounds = bound;
        this.handlerGroup.children[0].position = bound.bottomLeft;
        this.handlerGroup.children[1].position = bound.topLeft;
        this.handlerGroup.children[2].position = bound.topRight;
        this.handlerGroup.children[3].position = bound.bottomRight;
      }

    } else {
      this.newPath.add(point);
    }
  }

  public endPath(event) {
    // 입력 타입에 맞게 필요한 값들 초기화
    let advHitOption;
    let point: paper.Point;

    if(event instanceof MouseEvent) {
      advHitOption = { segments: true, stroke: true, fill: true, tolerance: this.MOUSE_TOLERANCE };
      point = new paper.Point(event.x, event.y);
    } else if (event instanceof TouchEvent) {
      advHitOption = { segments: true, stroke: true, fill: true, tolerance: this.TOUCH_TOLERANCE };
      point = new paper.Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      this.previousPoint = new paper.Point(point);
    } else {
      return;
    }
    point = this.posCalcService.advConvertNgToPaper(point);

    this.newPath.closed = true;
    // selectedGroup에 자식 아이템들이 있을 때 == 아이템 옮김 + 크기 조정된 경우
    if (this.selectedGroup.hasChildren()) {
      this.selectedGroup.children.forEach(( value, index, array)=>{
        if(value instanceof Group){
          let whiteboardItem:WhiteboardItem = value.data.struct as WhiteboardItem;
          whiteboardItem.refreshItem();
        }
      })
    // selectedGroup에 자식 아이템들이 없을 때 == 올가미툴을 아이템 선택에 사용
    } else {
      this.selectedGroup = new paper.Group();
      // 올가미로 범위 지정해서 여러 아이템 묶는 경우
      if (this.newPath.segments.length > 20) {
        this.selectBound();
      // 올가미로 클릭해서 하나의 아이템만 선택하는 경우 (가장 먼저 HitTest에 걸리는 아이템이 선택됨)
      } else {
        this.selectPoint(point, advHitOption);
      }

      // 선택 아이템들을 temp 영역이었던 selectedItems에서 Group으로 옮겨주는 과정
      this.selectedItems.forEach((value) => {
        this.selectedGroup.addChild(value);
      });
      this.selectedGroup.data.type = "selectedGroup";
      // this.selectedGroup.selected = true;

      // 선택된 Item이 있을때만 그림
      if(this.selectedGroup.hasChildren()) {
        this.createSelectRangePath();
        this.selectedGroup.addChild(this.selectRange);
        this.createHandler();
      }


      // selectedItems의 모든 아이템 제거
      this.selectedItems.splice(0, this.selectedItems.length);
    }
    this.newPath.remove();

  }

  public lassoHandleResizeForZooming(zoomValue) {
    if(this.isSelected) {
      this.selectRange.strokeWidth = this.handleOption.strokeWidth / zoomValue;
      this.selectRange.dashArray = [this.handleOption.dashLength / zoomValue, this.handleOption.dashLength / zoomValue];

      this.handlerGroup.children.forEach(value => {
        const diameter = this.handleOption.handleRadius / zoomValue * 2;
        const center = value.position;
        value.strokeWidth = this.handleOption.strokeWidth / zoomValue;
        value.bounds = new paper.Rectangle(value.bounds.topLeft, new paper.Size(diameter, diameter));
        value.position = center;
      });
    }
  }

  private createHandler(){
    let handlerName = 'selectHandler';
    let handlerFillColor = 'white';
    let handlerStrokeColor = 'black';

    if(this.selectedGroup.getItem({name: DataName.SELECT_RANGE}) == null) {
      return;
    }

    if(!this.handlerGroup) {
      this.handlerGroup = new paper.Group();
    }
    this.handlerGroup.addChild(new paper.Path.Circle({
      name: handlerName,
      center: this.selectRange.bounds.topLeft,
      radius: this.handleOption.handleRadius / this.currentProject.view.zoom,
      strokeWidth: this.handleOption.strokeWidth / this.currentProject.view.zoom,
      fillColor: handlerFillColor,
      strokeColor: handlerStrokeColor,
    }));
    this.handlerGroup.addChild(new paper.Path.Circle({
      name: handlerName,
      center: this.selectRange.bounds.topRight,
      radius: this.handleOption.handleRadius / this.currentProject.view.zoom,
      strokeWidth: this.handleOption.strokeWidth / this.currentProject.view.zoom,
      fillColor: handlerFillColor,
      strokeColor: handlerStrokeColor
    }));
    this.handlerGroup.addChild(new paper.Path.Circle({
      name: handlerName,
      center: this.selectRange.bounds.bottomRight,
      radius: this.handleOption.handleRadius / this.currentProject.view.zoom,
      strokeWidth: this.handleOption.strokeWidth / this.currentProject.view.zoom,
      fillColor: handlerFillColor,
      strokeColor: handlerStrokeColor
    }));
    this.handlerGroup.addChild(new paper.Path.Circle({
      name: handlerName,
      center: this.selectRange.bounds.bottomLeft,
      radius: this.handleOption.handleRadius / this.currentProject.view.zoom,
      strokeWidth: this.handleOption.strokeWidth / this.currentProject.view.zoom,
      fillColor: handlerFillColor,
      strokeColor: handlerStrokeColor
    }));
    this.handlerGroup.children.forEach((value, index, array)=>{
      value.data.type = DataType.LASSO_HANDLER;
      value.data.handlerIndex = index;
    });
    this.handlerGroup.bringToFront();
  }

  private createSelectRangePath(){

    this.selectRange = new paper.Path.Rectangle(this.selectedGroup.strokeBounds);
    this.selectRange.name = DataName.SELECT_RANGE;
    this.selectRange.strokeWidth = this.handleOption.strokeWidth / this.currentProject.view.zoom;
    this.selectRange.strokeColor = new paper.Color('blue');
    this.selectRange.dashArray = [this.handleOption.dashLength / this.currentProject.view.zoom, this.handleOption.dashLength / this.currentProject.view.zoom];
  }

  private selectPoint(point, advHitOption) {
    let found = this.layerService.getHittedItem(point);
    if(found){
      this.selectedItems.push(found.group);
    }

    this.isSelected = true;
  }

  private selectBound() {
    for(let i = 0; i < this.layerService.whiteboardItemArray.length; i++){
      let value = this.layerService.whiteboardItemArray[i].group;
      if(this.isInside(this.newPath, value)){
        this.selectedItems.push(value);
      }
    }
    this.isSelected = true;
  }

  public cancelSelect() {
    if (this.selectedGroup) {
      if (this.selectRange) {
        this.selectRange.remove();
      }
      // this.selectedGroup.selected = false;

      this.unGroup(this.selectedGroup);
      this.newPath.remove();
    }
    if (this.handlerGroup) {
      this.handlerGroup.removeChildren();
    }
    this.isSelected = false;
  }

  public removeSelectedItem() {
    if(this.selectedGroup) {
      this.selectedGroup.removeChildren();
      this.handlerGroup.removeChildren();
      this.selectedGroup.remove();
      this.newPath.remove();
      this.isSelected = false;
    }
  }

  private unGroup(group: paper.Group) {
    if (group.parent) {
      group.parent.insertChildren(group.index, group.removeChildren());
      group.remove();
    }
  }
  private isInside(selection, item) {
    if(selection.contains(item.bounds.center)){
      return item.data.wbID !== 1;
    }
  }
}
