import * as paper from 'paper';

export class LongTouch {
  private readonly tolerance = 5;

  private longTouchTimer;
  private fromPoint: paper.Point;
  private _longTouched: boolean = false;
  private isStarted: boolean = false;

  public stop(event?: any) {
    if(!!this.longTouchTimer) {
      if(!!event) {
        if(this.checkTolerance(event.point)) {
          return;
        }
      }
      clearTimeout(this.longTouchTimer);
      this.isStarted = false;
    }
  }

  public start(event, callback: Function) {
    //console.log("LongTouch >> start >> event : ",event);
    if(event.event.constructor.name !== "TouchEvent") {
      return;
    }
    if (!!this.longTouchTimer) {
      clearTimeout(this.longTouchTimer);
    }
    if (this.isStarted){
      return;
    }

    this.isStarted = true;

    this.fromPoint = event.point.clone();

    this.longTouchTimer = setTimeout(() => {
      this._longTouched = true;
      callback();
    }, 800)
  }

  public touchEnd() {
    this._longTouched = false;
  }

  private checkTolerance(point: paper.Point): boolean {
    return this.fromPoint.getDistance(point) < this.tolerance;
  }

  get longTouched(): boolean {
    return this._longTouched;
  }
}
