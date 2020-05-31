import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {take} from "rxjs/operators";
import {TextChatService} from "../../../../Model/Whiteboard/TextChat/text-chat.service";
import {WebsocketManagerService} from "../../../../Controller/Controller-WebSocket/websocket-manager/websocket-manager.service";
import {ChatMessage} from "../../../../Model/Whiteboard/TextChat/chat-message";

@Component({
  selector: 'app-text-chat-core',
  templateUrl: './text-chat-core.component.html',
  styleUrls: ['./text-chat-core.component.css']
})
export class TextChatCoreComponent implements OnInit, AfterViewInit {
  private profiles: Map<string, {name: string, img: string}>;
  private messagesDivElement: HTMLDivElement;
  private oldScrollHeight: number;

  constructor(
    private _ngZone: NgZone,
    private textChat: TextChatService,
    private _socketManager: WebsocketManagerService,
    private cdr: ChangeDetectorRef,
  ) {
    this.profiles = new Map<string, {name: string, img: string}>()
  }

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('input') input: ElementRef;

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    let inputElm = document.getElementById('text-chat-input-area');

    inputElm.addEventListener('keypress', (event: KeyboardEvent) => {
      if(event.key === 'Enter' && !event.shiftKey && !event.altKey && !event.ctrlKey) {
        event.preventDefault();
        this.onClickSendButton();
      }
    });

    this.messagesDivElement = document.getElementById("text-chat-messages") as HTMLDivElement;
    this.textChat.messageEmitter.subscribe((userId) => {
      this.oldScrollHeight = this.messagesDivElement.scrollHeight;
      this.cdr.detectChanges();
      if (
        this.oldScrollHeight === this.messagesDivElement.scrollTop + this.messagesDivElement.offsetHeight ||
        this.socketManager.userInfo.idToken === userId
      ) {
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (event.target.scrollTop <= 0) {
      this.oldScrollHeight = this.messagesDivElement.scrollHeight;
      this.textChat.loadMore().then(() => {
        this.cdr.detectChanges();
        this.messagesDivElement.scrollTop = this.messagesDivElement.scrollHeight - this.oldScrollHeight;
      });
    }
  }

  triggerResize() {
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public onClickMinimizeButton() {
      this.textChat.close();
  }

  public onClickSendButton() {
    if(this.input.nativeElement.value !== "") {
      let message = new ChatMessage({
        userId: this.socketManager.userInfo.idToken,
        projectId: this.socketManager.currentProjectDto._id,
        message: this.input.nativeElement.value,
        sentDate: new Date()
      });

      this.textChat.sendMessage(message);
      this.input.nativeElement.value = "";
    }
  }

  public getProfileImage(userId: string): string {
    if(this.profiles.has(userId)) {
      return this.profiles.get(userId).img;
    } else {
      for(let userInfo of this.socketManager.currentProjectDto.participantList) {
        if(userId === userInfo.idToken) {
          this.profiles.set(userId, {name: userInfo.userName, img: userInfo.profileImg});
          return userInfo.profileImg;
        }
      }
      throw `${userId} -- not found`;
    }
  }

  public getProfileName(userId: string): string {
    if(this.profiles.has(userId)) {
      return this.profiles.get(userId).name;
    } else {
      for(let userInfo of this.socketManager.currentProjectDto.participantList) {
        if(userId === userInfo.idToken) {
          this.profiles.set(userId, {name: userInfo.userName, img: userInfo.profileImg});
          return userInfo.userName;
        }
      }
      throw `${userId} -- not found`
    }
  }

  public dateFormatter(format: string, date: Date): string{
    return format.toString().replace(/(yyyy|mm|dd|MM|DD|H|i|s)/g, (t: string): any => {
      switch (t) {
        case "yyyy":
          return date.getFullYear();
        case "mm":
          return date.getMonth() + 1;
        case "dd":
          return date.getDate();
        case "MM":
          return this.zero(date.getMonth() + 1);
        case "DD":
          return this.zero(date.getDate());
        case "H":
          return this.zero(date.getHours());
        case "i":
          return this.zero(date.getMinutes());
        case "s":
          return this.zero(date.getSeconds());
        default:
          return "";
      }
    });
  }

  public scrollToBottom() {
    this.messagesDivElement.scrollTop = this.messagesDivElement.scrollHeight;
  }

  private zero(value: number): string {
    return value.toString().length === 1 ? `0${value}` : `${value}`;
  }


  get socketManager(): WebsocketManagerService {
    return this._socketManager;
  }

  get messages(): Array<ChatMessage> {
    return this.textChat.messages;
  }
}
