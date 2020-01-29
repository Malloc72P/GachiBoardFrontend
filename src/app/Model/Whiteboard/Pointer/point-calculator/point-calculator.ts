import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;

export class PointCalculator {

  static forSquare(startPoint: Point, endPoint: Point) {
    let widthDelta = new Point(0, 0);
    widthDelta.x = endPoint.x - startPoint.x;
    widthDelta.y = endPoint.y - startPoint.y;

    let distance = startPoint.getDistance(endPoint);
    let width = distance / Math.sqrt(2);

    if(widthDelta.x > 0) {
      endPoint.x = startPoint.x + width;
    } else {
      endPoint.x = startPoint.x - width;
    }

    if(widthDelta.y > 0) {
      endPoint.y = startPoint.y + width;
    } else {
      endPoint.y = startPoint.y - width;
    }
  }

  static forFixRatio(startPoint: Point, endPoint: Point, size: { width, height }) {
    let widthDelta = new Point(0, 0);
    widthDelta.x = endPoint.x - startPoint.x;
    widthDelta.y = endPoint.y - startPoint.y;

    let distance = startPoint.getDistance(endPoint);
    let ratio = size.height / size.width;
    let width = distance * (1 / Math.sqrt(Math.pow(ratio, 2) + 1));
    // 공식은 원노트에 써둠

    if(widthDelta.x > 0) {
      endPoint.x = startPoint.x + width;
    } else {
      endPoint.x = startPoint.x - width;
    }

    if(widthDelta.y > 0) {
      endPoint.y = startPoint.y + (width * ratio);
    } else {
      endPoint.y = startPoint.y - (width * ratio);
    }
  }
  static resizeDimensions(elem,width,height){
    //calc scale coefficients and store current position
    let scaleX = width/elem.bounds.width;
    let scaleY = height/elem.bounds.height;
    let prevPos = new Point(elem.bounds.x,elem.bounds.y);

    //apply calc scaling
    elem.scale(scaleX,scaleY);

    //reposition the elem to previous pos(scaling moves the elem so we reset it's position);
    elem.position = new Point(
      prevPos.x + elem.bounds.width / 2,
      prevPos.y + elem.bounds.height / 2
    );
  }
}
