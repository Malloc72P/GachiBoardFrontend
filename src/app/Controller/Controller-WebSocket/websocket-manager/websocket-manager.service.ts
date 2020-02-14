import { Injectable } from '@angular/core';
import {Socket} from 'ngx-socket-io';
import {AuthRequestService} from '../../SocialLogin/auth-request/auth-request.service';
import {WsProjectController} from './ProjectWsController/ws-project.controller';

@Injectable({
  providedIn: 'root'
})
export class WebsocketManagerService {
  public isConnected = false;

  constructor(
    private _socket:Socket,
    private authRequestService:AuthRequestService
  ) {
    console.warn("WebsocketManagerService >> constructor >> 진입함");
    //#### WS Controller 초기화
    WsProjectController.initInstance(this);
    /*socket.on("test",(data)=>{
      console.log("WebsocketManagerService >> test >> data : ",data);
    })*/
  }

  resetSocket(){
    this.socket.disconnect();
    this.socket.connect();
    this.isConnected = false;
  }

  get socket(): Socket {
    return this._socket;
  }
}
