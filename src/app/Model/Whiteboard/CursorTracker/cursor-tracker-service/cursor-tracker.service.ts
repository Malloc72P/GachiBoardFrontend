import * as paper from 'paper';
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import CompoundPath = paper.CompoundPath;
// @ts-ignore
import Project = paper.Project;

import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class CursorTrackerService {
  private userArray = new Map<String, Position>();
  private readonly cursorPath = "M4 0l16 12.279-6.78 1.138 4.256 8.676-3.902 1.907-4.281-8.758-5.293 4.581z";
  private currentProject: Project;
  private _isActivate = false;

  constructor() { }

  public on() {
    this._isActivate = true;
  }

  public off() {
    this._isActivate = false;
    this.userArray.forEach((value, key) => {
      this.deleteUser(key);
    });
  }

  public initializeCursorTrackerService(project: Project) {
    this.currentProject = project;
  }

  // userArray 가 갖고 있는 포지션 정보로 커서 아이템의 위치를 이동함
  public refreshPoint() {
    if(!this._isActivate) {
      return;
    }
    this.userArray.forEach(value => {
      value.pointer.tween({
        'bounds.topLeft': value.position
      }, {
        easing: 'linear',
        duration: 166,
      });
      value.pointer.bringToFront();
    });
  }

  public addUser(userName: String, firstPosition: Point, userColor: Color) {
    let cursor = this.drawCursor(userColor);
    this.userArray.set(userName, new Position(firstPosition, cursor));
  }

  public deleteUser(userName: String) {
    this.userArray.get(userName).pointer.remove();
    if(!this.userArray.delete(userName)) {
      console.log("CursorTrackerService >> deleteUser >> Array delete failed");
    }
  }

  public updateUser(userName: String, position: Point) {
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

  private initCallback() {

  }

  private drawCursor(color: Color): CompoundPath {
    let path = new CompoundPath(this.cursorPath);
    path.fillColor = color;
    path.shadowColor = new Color("grey");
    path.shadowBlur = 10;
    path.shadowOffset = new Point(1,1);

    return path;
  }

  // ################## Getter & Setter ###################

  get isActivate(): boolean {
    return this._isActivate;
  }
}

class Position {
  private _position: Point;
  private readonly _pointer: CompoundPath;

  constructor(position: Point, pointer) {
    this._position = position;
    this._pointer = pointer;
  }

  get pointer() {
    return this._pointer;
  }

  get position(): paper.Point {
    return this._position;
  }

  set position(value: paper.Point) {
    this._position = value;
  }
}
