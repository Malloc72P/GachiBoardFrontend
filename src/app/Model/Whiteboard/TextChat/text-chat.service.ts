import {Injectable} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {ChatMessage} from "./chat-message";
import {ComponentType} from "@angular/cdk/overlay";
import {ChatBox} from "./chat-box";
import {WebsocketPacketActionEnum} from "../../../DTO/WebsocketPacketDto/WebsocketPacketActionEnum";
import {WebsocketManagerService} from "../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";
import {Socket} from "ngx-socket-io";
import {HttpHelper} from "../../Helper/http-helper/http-helper";
import {ChatMessageDto} from "../../../DTO/ChatMessageDto/chat-message-dto";
import {WebsocketPacketDto} from "../../../DTO/WebsocketPacketDto/WebsocketPacketDto";

@Injectable({
  providedIn: 'root'
})
export class TextChatService {
  private _bottomSheetRef: MatBottomSheetRef;
  private chatBox: ChatBox;

  private _isOpen: boolean = false;
  private _isFirstOpen: boolean = true;

  constructor(
    private _bottomSheet: MatBottomSheet,
    private socketManager: WebsocketManagerService,
  ) {
    this.chatBox = new ChatBox();

    this.socket.on(HttpHelper.websocketApi.textChat.receiveMessage.event, (message: ChatMessageDto) => {
      message = ChatMessageDto.clone(message);
      this.chatBox.addMessage(new ChatMessage(message));
    });
  }

  public open<T>(component: ComponentType<T>) {
    if(this.isOpen) {
      return;
    }
    this._bottomSheetRef = this._bottomSheet.open(component, { hasBackdrop: false });
    this._isOpen = true;
    window.setTimeout(() => { document.getElementById('text-chat-input-area').focus(); }, 0);

    if(this._isFirstOpen) {
      this.loadRequest(HttpHelper.websocketApi.textChat.loadMessages.event, 0).then((data) => {

      });
    }
  }

  public close() {
    if(!!this._bottomSheetRef) {
      this._bottomSheetRef.dismiss();
      this._isOpen = false;
    }
  }

  public initialize() {

  }

  public sendMessage(message: ChatMessage) {
    this.sendRequest(HttpHelper.websocketApi.textChat.sendMessage.event, message.exportDto()).then((result) => {
      this.chatBox.addMessage(result);
    });
  }

  private async sendRequest(event: string, dto?: ChatMessageDto): Promise<ChatMessage> {
    return new Promise<ChatMessage>((resolve, reject) => {
      this.socket.emit(event, dto);
      console.log(`${event} : emitted`);
      this.socket.once(event, (ackSocketDto: ChatMessageDto) => {
        console.log(`${event} : received`);
        ackSocketDto = ChatMessageDto.clone(ackSocketDto);
        if(ackSocketDto.verify) {
          console.log("TextChatService >>  >> ackSocketDto instanceof ChatMessageDto : ", ackSocketDto instanceof ChatMessageDto);
          resolve(new ChatMessage(ackSocketDto));
        } else {
          reject(`Project ID - ${ackSocketDto.projectId}, User ID - ${ackSocketDto.userId}, message send failed`);
        }
      });
    });
  }

  private async loadRequest(event: string, start: number): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.socket.emit(event, { projectId: this.socketManager.currentProjectDto._id, start: start });
      console.log(`${event} : emitted`);
      this.socket.once(event, (data) => {
        console.log(`${event} : received`);
        if (data !== null) {
          resolve(data);
        } else {
          reject(`Message Load Error`);
        }
      })
    }));
  }

  get isOpen(): boolean {
    return this._isOpen;
  }

  get messages(): Array<ChatMessage> {
    return this.chatBox.messages;
  }

  private get socket(): Socket {
    return this.socketManager.socket;
  }
}
