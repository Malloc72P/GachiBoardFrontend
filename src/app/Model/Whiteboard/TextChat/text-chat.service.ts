import {EventEmitter, Injectable} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {ChatMessage} from "./chat-message";
import {ComponentType} from "@angular/cdk/overlay";
import {ChatBox} from "./chat-box";
import {WebsocketManagerService} from "../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";
import {Socket} from "ngx-socket-io";
import {HttpHelper} from "../../Helper/http-helper/http-helper";
import {ChatMessageDto} from "../../../DTO/ChatMessageDto/chat-message-dto";

@Injectable({
  providedIn: 'root'
})
export class TextChatService {
  private _bottomSheetRef: MatBottomSheetRef;
  private chatBox: ChatBox;

  private _isOpen: boolean = false;
  private _isFirstOpen: boolean = true;

  private _messageEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _bottomSheet: MatBottomSheet,
    private socketManager: WebsocketManagerService,
  ) {
    this.chatBox = new ChatBox();

    this.socket.on(HttpHelper.websocketApi.textChat.receiveMessage.event, (message: ChatMessageDto) => {
      message = ChatMessageDto.clone(message);
      this.chatBox.addMessage(new ChatMessage(message));
      this.messageEmitter.emit();
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
      this.loadRequest(HttpHelper.websocketApi.textChat.loadMessages.event).then((data: Array<ChatMessageDto>) => {
        data.forEach((value) => {
          this.chatBox.addMessage(new ChatMessage(ChatMessageDto.clone(value)));
          this.messageEmitter.emit();
        });
      });
      this._isFirstOpen = false;
    }
  }

  public close() {
    if(!!this._bottomSheetRef) {
      this._bottomSheetRef.dismiss();
      this._isOpen = false;
    }
  }

  public async loadMore(): Promise<any> {
    return new Promise<ChatMessage>((resolve) => {
      const latestMessageId = this.chatBox.messages[0].id;
      const tempArray = new Array<ChatMessage>();

      this.loadRequest(HttpHelper.websocketApi.textChat.loadMessages.event, latestMessageId).then((data: Array<ChatMessageDto>) => {
        data.forEach((value) => {
          tempArray.push(new ChatMessage(ChatMessageDto.clone(value)));
        });
        this.chatBox.loadPrevious(tempArray);

        resolve();
      });
    });

  }

  public sendMessage(message: ChatMessage) {
    this.sendRequest(HttpHelper.websocketApi.textChat.sendMessage.event, message.exportDto()).then((result) => {
      this.chatBox.addMessage(result);
      this.messageEmitter.emit();
    });
  }

  private async sendRequest(event: string, dto?: ChatMessageDto): Promise<ChatMessage> {
    return new Promise<ChatMessage>((resolve, reject) => {
      this.socket.emit(event, dto);
      this.socket.once(event, (ackSocketDto: ChatMessageDto) => {
        ackSocketDto = ChatMessageDto.clone(ackSocketDto);
        if(ackSocketDto.verify) {
          resolve(new ChatMessage(ackSocketDto));
        } else {
          reject(`Project ID - ${ackSocketDto.projectId}, User ID - ${ackSocketDto.userId}, message send failed`);
        }
      });
    });
  }

  private async loadRequest(event: string, loadAt?: string): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.socket.emit(event, { projectId: this.socketManager.currentProjectDto._id, loadAt: loadAt });
      this.socket.once(event, (data) => {
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

  get messageEmitter(): EventEmitter<any> {
    return this._messageEmitter;
  }

  private get socket(): Socket {
    return this.socketManager.socket;
  }
}
