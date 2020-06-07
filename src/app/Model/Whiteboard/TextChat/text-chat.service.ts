import {EventEmitter, Injectable} from '@angular/core';
import {MatBottomSheet, MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {ChatMessage} from "./chat-message";
import {ComponentType} from "@angular/cdk/overlay";
import {ChatBox} from "./chat-box";
import {WebsocketManagerService} from "../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";
import {Socket} from "ngx-socket-io";
import {HttpHelper} from "../../Helper/http-helper/http-helper";
import {ChatMessageDto} from "../../../DTO/ChatMessageDto/chat-message-dto";
import {timeout} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TextChatService {
  private _bottomSheetRef: MatBottomSheetRef;
  private chatBox: ChatBox;
  private _unReadMessage: number = 0;

  private _isOpen: boolean = false;
  private _isFirstOpen: boolean = true;
  private _isLoadFinished: boolean = false;

  private _messageEmitter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private _bottomSheet: MatBottomSheet,
    private socketManager: WebsocketManagerService,
  ) {
    this.chatBox = new ChatBox();

    this.socket.on(HttpHelper.websocketApi.textChat.receiveMessage.event, (message: ChatMessageDto) => {
      message = ChatMessageDto.clone(message);
      this.chatBox.addMessage(new ChatMessage(message));
      this._messageEmitter.emit();

      if(!this._isOpen) {
        this.getUnreadCount().then(data => {
          this._unReadMessage = data;
        });
      }
    });
  }

  public initializeTextChatService() {
    this.getUnreadCount().then(data => {
      this._unReadMessage = data;
    });
  }

  public open<T>(component: ComponentType<T>, usePage: 'whiteboard' | 'projectPage') {
    if(this.isOpen) {
      return;
    }

    this._bottomSheetRef = this._bottomSheet.open(component, {
      hasBackdrop: false,
      panelClass: usePage === 'whiteboard' ? 'text-chat-for-whiteboard-page' : 'text-chat-for-project-page'
    });
    this._unReadMessage = 0;
    this._isOpen = true;
    window.setTimeout(() => { document.getElementById('text-chat-input-area').focus(); }, 0);

    if(this._isFirstOpen) {
      this.loadRequest(HttpHelper.websocketApi.textChat.loadMessages.event).then((data: Array<ChatMessageDto>) => {
        data.forEach((value) => {
          this.chatBox.addMessage(new ChatMessage(ChatMessageDto.clone(value)));
          this._messageEmitter.emit();
        });
      });
      this._isFirstOpen = false;
    }
  }

  public close() {
    if(!!this._bottomSheetRef) {
      this._bottomSheetRef.dismiss();
      this.updateLastReadDateForNow();
      this._isOpen = false;
    }
  }

  public async loadMore(): Promise<any> {
    if (this._isLoadFinished) {
      return new Promise<any>(reject => {
        reject(`Not finished previous request`);
      })
    }
    return new Promise<ChatMessage>((resolve) => {
      const latestMessageId = this.chatBox.messages[0].id;
      const tempArray = new Array<ChatMessage>();
      let confirm = { timer: false, request: false };

      this._isLoadFinished = true;

      // 최소 1초 딜레이
      // 딜레이를 위한 타이머 => 타이머 완료되었는데 백엔드에서 못받아왔으면 로드 리퀘스트 쪽에서 완료함
      setTimeout(() => {
        confirm.timer = true;

        // 완료하는 부분
        if (confirm.timer && confirm.request) {
          this.chatBox.addPrevious(tempArray);
          this._isLoadFinished = false;  // 스피너 숨김
          resolve();
        }
      }, 1000);

      // 로드 리퀘스트는 끝났는데 타이머가 안끝났으면 타이머쪽에서 완료함.
      this.loadRequest(HttpHelper.websocketApi.textChat.loadMessages.event, latestMessageId).then((data: Array<ChatMessageDto>) => {
        data.forEach((value) => {
          tempArray.push(new ChatMessage(ChatMessageDto.clone(value)));
        });

        confirm.request = true;

        // 완료하는 부분
        if(confirm.timer && confirm.request) {
          this.chatBox.addPrevious(tempArray);
          this._isLoadFinished = false;  // 스피너 숨김
          resolve();
        }
      });
    });

  }

  public sendMessage(message: ChatMessage) {
    this.sendRequest(HttpHelper.websocketApi.textChat.sendMessage.event, message.exportDto()).then((result) => {
      this.chatBox.addMessage(result);
      this._messageEmitter.emit(result.userId);
    });
  }

  public updateLastReadDateForNow() {
    const event = HttpHelper.websocketApi.textChat.updateReadDate.event;
    this.socket.emit(event, {
      projectId: this.socketManager.currentProjectDto._id,
      userId: this.socketManager.userInfo.idToken,
      date: Date.now()
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
      console.log(`emitted`);
      this.socket.once(event, (data) => {
        if (data !== null) {
          console.log(`received`);
          resolve(data);
        } else {
          reject(`Message Load Error`);
        }
      })
    }));
  }

  private async getUnreadCount(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const event = HttpHelper.websocketApi.textChat.getUnreadCount.event;
      this.socket.emit(event, {
        projectId: this.socketManager.currentProjectDto._id,
        userId: this.socketManager.userInfo.idToken
      });

      this.socket.once(event, (data) => {
        if (data !== null) {
          resolve(data);
        } else {
          reject(`UnreadCount Load Error`);
        }
      });
    });
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

  get unReadMessage(): number | string {
    if (this._unReadMessage > 9) {
      return 9 + "+"
    } else if (this._unReadMessage <= 0) {
      return "";
    }
    return this._unReadMessage;
  }

  get isLoadFinished(): boolean {
    return this._isLoadFinished;
  }

  private get socket(): Socket {
    return this.socketManager.socket;
  }
}
