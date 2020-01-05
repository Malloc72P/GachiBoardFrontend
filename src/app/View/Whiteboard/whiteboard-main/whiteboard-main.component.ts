import {Component, EventEmitter, HostListener, OnInit} from '@angular/core';
import { AuthRequestService } from '../../../Controller/SocialLogin/auth-request/auth-request.service';
import { RouterHelperService } from '../../../Model/Helper/router-helper-service/router-helper.service';
import {UserDTO} from '../../../DTO/user-dto';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

import { PointerMode } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';

import * as paper from 'paper';
// @ts-ignore
import Project = paper.Project;
// @ts-ignore
import Point = paper.Point;
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';
import {InputType} from '../../../Model/Whiteboard/Pointer/input-type-enum/input-type.enum';

@Component({
  selector: 'app-whiteboard-main',
  templateUrl: './whiteboard-main.component.html',
  styleUrls: ['./whiteboard-main.component.css']
})
export class WhiteboardMainComponent implements OnInit {
  private paperProject: Project;
  private mouseDown: boolean = false;
  private touchStart: boolean = false;

  private htmlCanvasObject: HTMLCanvasElement;

  // private pointerChangeEventEmitter: EventEmitter<any>;

  constructor(
    private apiRequester: AuthRequestService,
    private routerHelper: RouterHelperService,
    private pointerModeManager: PointerModeManagerService,
    private panelManager: PanelManagerService,
  ) {
    // this.pointerChangeEventEmitter = new EventEmitter<any>();
  }

  requestProtectedApi(){
    this.apiRequester.protectedApi()
      .subscribe((data: UserDTO)=>{
        let userInfo:UserDTO = {
          email       :   data.email,
          idToken     :   data.idToken,
          userName    :   data.userName,
          authToken   :   this.apiRequester.getAccessToken(),
        };
        this.apiRequester.setUserInfo(userInfo);
        console.log("PaperMainComponent >> constructor >> getUserInfo : ",this.apiRequester.getUserInfo());
        // TODO : 세션처리
        // this.wsManager = new WhiteboardWebsocketManager(this.apiRequester, this.wsService, this.debugService, this.project1);
        // this.wsManager.tryInitializewsService();
      },(error) => {
        console.log(error);
        this.routerHelper.goToLoginPage();
      });
  }

  // @HostListener('touchstart', ['$event'])
  onTouchStart(event) {
    event.preventDefault();
    this.touchStart = true;
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.pointerModeManager.brush.createPath(new Point(event.touches[0].clientX, event.touches[0].clientY));
        break;
      case PointerMode.ERASER:
        const point = new Point(event.touches[0].clientX, event.touches[0].clientY);
        this.pointerModeManager.eraser.createPath(point);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.pointerModeManager.lassoSelector.createPath(event, InputType.TOUCH);
        break;
      default:
        break;
    }
  }
  // @HostListener('touchmove', ['$event'])
  onTouchMove(event) {
    event.preventDefault();
    if(this.touchStart) {
      switch (this.pointerModeManager.currentPointerMode) {
        case PointerMode.MOVE:
          break;
        case PointerMode.DRAW:
          this.pointerModeManager.brush.drawPath(new Point(event.touches[0].clientX, event.touches[0].clientY));
          break;
        case PointerMode.ERASER:
          const point = new Point(event.touches[0].clientX, event.touches[0].clientY);
          this.pointerModeManager.eraser.drawPath(point);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.pointerModeManager.lassoSelector.drawPath(event, InputType.TOUCH);
          break;
        default:
          break;
      }
    }
  }
  // @HostListener('touchend', ['$event'])
  onTouchEnd(event) {
    event.preventDefault();
    this.touchStart = false;
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.pointerModeManager.brush.endPath(new Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY));
        break;
      case PointerMode.ERASER:
        const point = new Point(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        this.pointerModeManager.eraser.remove(point);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.pointerModeManager.lassoSelector.endPath(event, InputType.TOUCH);
        break;
      default:
        break;
    }
  }

  // @HostListener('mousedown', ['$event'])
  onMouseDown(event) {
    event.preventDefault();
    this.mouseDown = true;
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.pointerModeManager.brush.createPath(new Point(event.x, event.y));
        break;
      case PointerMode.ERASER:
        const point = new Point(event.x, event.y);
        this.pointerModeManager.eraser.createPath(point);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.pointerModeManager.lassoSelector.createPath(event, InputType.MOUSE);
        break;
      default:
        break;
    }
  }
  // @HostListener('mousemove', ['$event'])
  onMouseMove(event) {
    event.preventDefault();
    if(this.mouseDown) {
      switch (this.pointerModeManager.currentPointerMode) {
        case PointerMode.MOVE:
          break;
        case PointerMode.DRAW:
          this.pointerModeManager.brush.drawPath(new Point(event.x, event.y));
          break;
        case PointerMode.ERASER:
          const point = new Point(event.x, event.y);
          this.pointerModeManager.eraser.drawPath(point);
          break;
        case PointerMode.LASSO_SELECTOR:
          this.pointerModeManager.lassoSelector.drawPath(event, InputType.MOUSE);
          break;
        default:
          break;
      }
    }
  }
  // @HostListener('mouseup', ['$event'])
  onMouseUp(event) {
    event.preventDefault();
    this.mouseDown = false;
    switch (this.pointerModeManager.currentPointerMode) {
      case PointerMode.MOVE:
        break;
      case PointerMode.DRAW:
        this.pointerModeManager.brush.endPath(new Point(event.x, event.y));
        break;
      case PointerMode.ERASER:
        const point = new Point(event.x, event.y);
        this.pointerModeManager.eraser.remove(point);
        break;
      case PointerMode.LASSO_SELECTOR:
        this.pointerModeManager.lassoSelector.endPath(event, InputType.MOUSE);
        break;
      default:
        break;
    }
  }

  ngOnInit() {
    this.paperProject = new Project('cv1');

    this.htmlCanvasObject = document.getElementById("cv1") as HTMLCanvasElement;

    this.htmlCanvasObject.addEventListener("mousedown", (event) => {
      this.onMouseDown(event);
    });
    this.htmlCanvasObject.addEventListener("mousemove", (event) => {
      this.onMouseMove(event);
    });
    this.htmlCanvasObject.addEventListener("mouseup", (event) => {
      this.onMouseUp(event);
    });
    this.htmlCanvasObject.addEventListener("touchstart", (event) => {
      this.onTouchStart(event);
    });
    this.htmlCanvasObject.addEventListener("touchmove", (event) => {
      this.onTouchMove(event);
    });
    this.htmlCanvasObject.addEventListener("touchend", (event) => {
      this.onTouchEnd(event);
    });
  }
}
