import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
import {InputType} from '../input-type-enum/input-type.enum';

export class LassoSelector {
  private newPath: Path;
  private selectedGroup: paper.Group;
  private selectedItems = Array<paper.Item>();
  private previousPoint: Point;
  private hitOption = { segments: true, stroke: true, fill: true, tolerance: 3 };

  constructor() {
  }

  public createPath(event, type: number) {
    if(this.newPath) {
      this.newPath.selected = false;
    }

    if(!this.selectedGroup){
      this.selectedGroup = new paper.Group();
    }

    let point: Point;

    // 입력 타입에 맞게 필요한 값들 초기화
    if(type === InputType.MOUSE) {
      point = new Point(event.x, event.y);
    } else if (type === InputType.TOUCH) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
      this.previousPoint = new Point(point);
    } else {
      return;
    }
    // *선택이 되어있는지 확인
    // 선택 그룹이 있는지 확인
    if (this.selectedGroup.hasChildren()) {
      // 클릭 시작 포인트가 선택그룹 안쪽인지 확인
      if (this.selectedGroup.contains(point)) {
        /* 선택 초기화 안함 */
      } else {
        /* 선택 초기화 함 */
        const selectRange = this.selectedGroup.getItem({name: 'selectRange'});
        if (selectRange) {
          selectRange.remove();
        }
        this.selectedGroup.selected = false;
        this.unGroup(this.selectedGroup);
      }
    }

    this.newPath = new Path({
      segments: [point],
      strokeColor: 'blue',
      strokeCap: 'round',
      strokeJoin: 'round',
      dashArray: [5, 5],
      data : { wbID : 1 }
    });
  }

  public drawPath(event, type: number) {
    let point: Point;
    let delta: Point;
    // 입력 타입에 맞게 필요한 값들 초기화
    if(type === InputType.MOUSE) {
      point = new Point(event.x, event.y);
      delta = new Point(event.movementX, event.movementY);
    } else if (type === InputType.TOUCH) {
      point = new Point(event.touches[0].clientX, event.touches[0].clientY);
      delta = new Point (point.x - this.previousPoint.x, point.y - this.previousPoint.y);
      this.previousPoint = new Point(point);
      console.log('LassoSelector >> drawPath >> delta : ', delta);
    } else {
      return;
    }

    // 선택 그룹 객체 있는지 확인
    if (this.selectedGroup.hasChildren()) {
      this.selectedGroup.position.x += delta.x;
      this.selectedGroup.position.y += delta.y;
    } else {
      this.newPath.add(point);
    }
  }

  public endPath(event, type: number) {
    // 입력 타입에 맞게 필요한 값들 초기화
    let point: Point;
    if(type === InputType.MOUSE) {
      point = new Point(event.x, event.y);
    } else if (type === InputType.TOUCH) {
      point = new Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
      this.previousPoint = new Point(point);
    } else {
      return;
    }

    let selectRange;
    const currentProject = paper.project;
    this.newPath.closed = true;

    if (this.selectedGroup.hasChildren()) {
      // nothing
      this.selectedGroup.children.forEach(( segment )=>{
        console.log("PointerModeManager >> onMouseUp >> segment : ",segment);
        // this.sendWbItemMovementData(segment);
      })
    } else {
      this.selectedGroup = new paper.Group();
      if (this.newPath.segments.length > 1) {
        for (const item of currentProject.activeLayer.children) {
          if (item instanceof Path || item instanceof paper.Raster) {
            if (this.isInside(this.newPath, item)) {
              //console.log("PointerModeManager >> onMouseUp >> path-item : ",item);
              this.selectedItems.push(item);
            }
          }
        }
      } else {
        const hitResult = currentProject.hitTestAll(point, this.hitOption)[1];
        let segment = null;

        // 세그먼트 디버깅용 해당 세그먼트의 타입이 뭔지 알기위해 사용
        // if(!(segment = this.segmentParser(hitResult))){
        //   return;
        // }
        if(!this.segmentVerifier(segment)){
          this.newPath.remove();
          return null;
        }
        if (hitResult) {
          this.selectedItems.push(hitResult.item);
        }
      }

      this.selectedItems.forEach((value) => {
        this.selectedGroup.addChild(value);
      });
      this.selectedGroup.selected = true;

      selectRange = new Path.Rectangle(this.selectedGroup.strokeBounds);
      selectRange.name = 'selectRange';
      selectRange.strokeColor = 'blue';
      selectRange.dashArray = [5, 5];

      this.selectedGroup.addChild(selectRange);
      this.selectedItems.splice(0, this.selectedItems.length);
    }

    this.newPath.remove();
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
  private segmentParser(hitResult){
    let segment = null;
    //디버깅용. 해당 세그먼트의 타입이 뭔지 알기 위해 사용
    // if (hitResult !== null) {
    //   console.log("PointerModeManager >> segmentParser >> hitResult : ", hitResult.type);
    // }
    if (hitResult.type === 'segment') {//세그먼트를 선택한 경우
      //segment = hitResult.segment;
      // this.debugService.openSnackBar("hitResult.type === 'segment'");
    }
    else if (hitResult.type === 'stroke') {//스트로크를 선택한 경우
      segment = hitResult.item;
      // this.debugService.openSnackBar("hitResult.type === 'stroke'");
    }
    else if(hitResult.type === 'pixel'){//레스터 이미지를 선택한 경우
      segment = hitResult.item;
      // this.debugService.openSnackBar("hitResult.type === 'pixel'");
    }
    else if(hitResult.type === 'fill'){//PointText를 선택한 경우
      segment = hitResult.item;
      // this.debugService.openSnackBar("hitResult.type === 'fill'");
    }
    return segment;
  }
  private segmentVerifier(segment){
    if(!segment){
      //hit했지만, item을 못불러온 경우 리턴
      return false;
    }
    if(!segment.parent){
      //item은 있지만, 부모레이어가 없는 경우 리턴
      return  false;
    }
    return true;
    // return segment.parent.name !== 'mainframeMatrix';
  }
}
