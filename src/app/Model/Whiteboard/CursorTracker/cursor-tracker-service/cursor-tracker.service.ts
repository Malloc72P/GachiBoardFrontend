import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Group = paper.Group;

import {Injectable} from '@angular/core';
import {Cursor} from "./cursor/cursor";
import {DrawingLayerManagerService} from "../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service";


@Injectable({
  providedIn: 'root'
})
export class CursorTrackerService {
  private userArray = new Map<string, Position>();
  private _isActivate = false;

  constructor(
    private layerManagerService: DrawingLayerManagerService,
  ) { }

  public on() {
    this._isActivate = true;
  }

  public off() {
    this._isActivate = false;
    this.userArray.forEach((value, key) => {
      this.deleteUser(key);
    });
  }

  // userArray 가 갖고 있는 포지션 정보로 커서 아이템의 위치를 이동함
  public refreshPoint() {
    if(!this._isActivate) {
      return;
    }
    this.userArray.forEach(value => {
      value.cursor.moveTo(value.position);
    });
  }

  public addUser(userName: string, firstPosition: Point, userColor: Color) {
    let cursor = this.drawCursor(userColor);
    cursor.setName(userName);

    this.userArray.set(userName, new Position(firstPosition, cursor));
  }

  public deleteUser(userName: string) {
    this.userArray.get(userName).cursor.remove();
    if(!this.userArray.delete(userName)) {
      console.log("CursorTrackerService >> deleteUser >> Array delete failed");
    }
  }

  public updateUser(userName: string, position: Point) {
    if(!this._isActivate) {
      return;
    }
    // 정보가 없는 유저가 업데이트를 요청하면 Array 에 추가
    // TODO : 유저 정보의 유저색상을 가져올 수 있는 함수를 Color.random() 대신 사용
    if(!this.userArray.has(userName)) {
      this.addUser(userName, position, Color.random());
    }
    // 업데이트
    this.userArray.get(userName).position = position;
  }

  private drawCursor(color: Color): Cursor {
    return new Cursor(color, this.layerManagerService.infiniteCanvasService.zoomEventEmitter);
  }

  // ################## Getter & Setter ###################

  get isActivate(): boolean {
    return this._isActivate;
  }
}

class Position {
  private _position: Point;
  private readonly _cursor: Cursor;

  constructor(position: Point, cursor: Cursor) {
    this._position = position;
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
