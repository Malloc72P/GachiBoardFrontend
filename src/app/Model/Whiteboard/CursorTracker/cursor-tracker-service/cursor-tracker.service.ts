import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;

import {EventEmitter, Injectable} from '@angular/core';
import {Cursor} from "./cursor/cursor";
import {PositionCalcService} from "../../PositionCalc/position-calc.service";
import {WebsocketManagerService} from '../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';
import {GachiColorList} from '../../../../DTO/WhiteboardItemDto/ColorDto/gachi-color-dto';
import {GachiPointDto} from '../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';

@Injectable({
  providedIn: 'root'
})
export class CursorTrackerService {
  public userCursorMap = new Map<string, Position>();
  private _isActivate = false;
  private _currentCursorPosition = new SimplePoint(0, 0);
  private zoomEventEmitter: EventEmitter<any>;

  public readonly MAXIMUM_COLOR_NUMBER = 10;

  constructor(
    private positionCalcService: PositionCalcService,
    private websocketManagerService: WebsocketManagerService,
    private layerManagerService: DrawingLayerManagerService,
  ) {

  }

  public initializeCursorTrackerService(zoomEventEmitter) {
    this.zoomEventEmitter = zoomEventEmitter;
  }

  public on() {
    this._isActivate = true;
    console.log("CursorTrackerService >> on >> this.itsMe : ", this.itsMe);
  }

  public off() {
    this._isActivate = false;
    this.userCursorMap.forEach((value, key) => {
      this.deleteUser(key);
    });
  }

  // userCursorMap 가 갖고 있는 포지션 정보로 커서 아이템의 위치를 이동함
  public refreshPoint() {
    if(!this._isActivate) {
      return;
    }
    this.userCursorMap.forEach(value => {
      value.cursor.moveTo(value.position);
    });
  }

  public addUser(idToken: string, firstPosition: Point, userColor: Color) {
    let cursor = this.drawCursor(userColor);
    cursor.setName(this.websocketManagerService.getUserInfoByIdToken(idToken).userName);

    this.userCursorMap.set(idToken, new Position(cursor));
  }

  public deleteUser(idToken: string) {
    this.userCursorMap.get(idToken)?.cursor.remove();
    if(!this.userCursorMap.delete(idToken)) {
      console.log("CursorTrackerService >> deleteUser >> Array delete failed");
    }
  }

  public updateUser(idToken: string, position: GachiPointDto) {
    if(!this._isActivate) {
      return;
    }
    //console.log("CursorTrackerService >> updateUser >> position : ",position);
    // 정보가 없는 유저가 업데이트를 요청하면 Array 에 추가
    if(!this.userCursorMap.has(idToken)) {
      let targetIndex = this.websocketManagerService.getUserIndexByIdToken(idToken);
      let userColor = GachiColorList.getColor(targetIndex);
      this.addUser(idToken, new Point(position.x, position.y), new Color(userColor));
    }
    // 업데이트
    let foundCursor = this.userCursorMap.get(idToken);
    foundCursor.position = new Point(position.x, position.y);
    // console.log("CursorTrackerService >> updateUser >> foundCursor : ",foundCursor);
  }

  private drawCursor(color: Color): Cursor {
    let newCursor = new Cursor(color, this.zoomEventEmitter);
    this.layerManagerService.drawingLayer.addChild(newCursor.getPaperInstance());
    return newCursor;
  }

  // ################## Getter & Setter ###################

  get isActivate(): boolean {
    return this._isActivate;
  }

  get currentCursorPosition(): SimplePoint {
    return this._currentCursorPosition;
  }

  set currentCursorPosition(value: SimplePoint) {
    this._currentCursorPosition = value;
  }

  get itsMe(): Point {
    return new Point(this.currentCursorPosition.x, this.currentCursorPosition.y);
  }

  get itsMeToNg(): Point {
    let point = new Point(this.currentCursorPosition.x, this.currentCursorPosition.y);
    return new Point(this.positionCalcService.advConvertPaperToNg(point));
  }
}

class Position {
  private _position: Point;
  private readonly _cursor: Cursor;

  constructor(cursor: Cursor) {
    this._position = new Point(0, 0);
    this._cursor = cursor;
  }

  get cursor() {
    return this._cursor;
  }

  get position(): paper.Point {
    return this._position;
  }

  set position(value: paper.Point) {
    this._position = value;
  }
}

export class SimplePoint {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  set x(value: number) {
    this._x = value;
  }

  get y(): number {
    return this._y;
  }

  set y(value: number) {
    this._y = value;
  }
}
