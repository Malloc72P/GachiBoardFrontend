import {Component, ElementRef, Input, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {VideoChatPanelManagerService} from "../../../../Model/Whiteboard/VideoChat/video-chat-panel-manager/video-chat-panel-manager.service";
import {VideoChatService} from "../../../../Model/Whiteboard/VideoChat/video-chat/video-chat.service";
import {HttpHelper} from "../../../../Model/Helper/http-helper/http-helper";
import {CdkDragEnd} from "@angular/cdk/drag-drop";
import {PanelData} from "../PanelData/panel-data";
import {WebsocketManagerService} from "../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";

@Component({
  selector: 'app-video-chat-wrapper',
  templateUrl: './video-chat-wrapper.component.html',
  styleUrls: ['./video-chat-wrapper.component.css']
})
export class VideoChatWrapperComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPanel') videoPanel: ElementRef;
  @ViewChild('videoElement') videoElement: ElementRef;
  @ViewChild('audioElement') audioElement: ElementRef;
  @Input() panelData: PanelData;

  private userName: string;
  private panelSizeFactor: number = 1;
  private readonly maxPanelSize: number = 200;
  private readonly margin: number = 10;
  public position: {x: number, y: number} = { x: 0, y: 0};

  constructor(
    private videoChat: VideoChatService,
    private panelManager: VideoChatPanelManagerService,
    private websocketManager: WebsocketManagerService,
  ) { }

  ngOnInit(): void {
    this.userName = this.panelData.id;
    this.position = { x: this.browserWidth - this.panelData.x, y: this.panelData.y }
  }

  ngAfterViewInit(): void {
    let panel = this.panelManager.videoPanels.get(this.userName);
    if(!!panel) {
      panel.videoElement = this.videoElement;
      panel.audioElement = this.audioElement;
    }
  }

  public onClickSizeChangeButton() {
    if(this.panelSizeFactor === 1) {
      this.panelSizeFactor = 2;
    } else {
      this.panelSizeFactor = 1;
    }
    this.calcOutOfBounds(this.maxPanelSize * this.panelSizeFactor);
  }

  public onClickFullScreenButton() {
    let element = this.videoPanel.nativeElement;
    let methodToBeInvoked = element.requestFullscreen || element.webkitRequestFullScreen
      || element['mozRequestFullscreen'] || element['msRequestFullscreen'];
    if (methodToBeInvoked) methodToBeInvoked.call(element);
  }

  public onClickCameraFlipButton() {
    this.videoChat.changeWebCam().then();
  }

  public dragEnd(event: CdkDragEnd) {
    this.position = event.source.getFreeDragPosition();
    this.calcOutOfBounds(this.maxPanelSize * this.panelSizeFactor);
  }

  private calcOutOfBounds(panelSize: number) {
    let position = { x: this.position.x, y: this.position.y };
    if(this.position.x < 0) {
      position.x = 0;
    }
    if(this.position.x > this.browserWidth - panelSize) {
      position.x = this.browserWidth - panelSize;
    }
    if(this.position.y < 0) {
      position.y = 0;
    }
    if(this.position.y > this.browserHeight - panelSize) {
      position.y = this.browserHeight - panelSize;
    }

    this.position = position;
  }

  get left(): string {
    return this.browserWidth - this.panelData.x + this.margin + "px";
  }

  get top(): string {
    return this.panelData.y + this.margin + "px";
  }

  get browserWidth(): number {
    return document.body.offsetWidth;
  }

  get browserHeight(): number {
    return document.body.offsetHeight;
  }

  get width(): string {
    let maxValue = Math.min(
      this.browserWidth,
      this.browserHeight,
    );

    maxValue *= 0.2;

    if(maxValue > this.maxPanelSize) {
      maxValue = this.maxPanelSize;
    }

    return (maxValue * this.panelSizeFactor) + "px";
  }

  get height(): string {
    let maxValue = Math.min(
      this.browserWidth,
      this.browserHeight,
    );

    maxValue *= 0.2;

    if(maxValue > this.maxPanelSize) {
      maxValue = this.maxPanelSize;
    }

    return (maxValue * this.panelSizeFactor) + "px";
  }

  get changePanelSizeButtonLabel(): string {
    if(this.panelSizeFactor === 1) {
      return "2x";
    } else {
      return "1x";
    }
  }

  get changeWebCamIsDisable(): boolean {
    return this.videoChat.numberOfWebCams < 2;
  }

  get isForMe(): boolean {
    return this.userName === this.websocketManager.userInfo.idToken;
  }
}
