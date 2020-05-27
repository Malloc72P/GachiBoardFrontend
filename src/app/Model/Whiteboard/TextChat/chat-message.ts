import {ChatMessageDto} from "../../../DTO/ChatMessageDto/chat-message-dto";
import {v4 as uuidv4} from 'uuid';

export class ChatMessage {
  private readonly _id: string;
  private readonly _userId: string;
  private readonly _projectId: string;
  private readonly _content: string;
  private readonly _sentDate: Date;
  private _verifyId: string;

  constructor(chatData: ChatMessageDto | {userId: string, projectId: string,
              message: string, sentDate: Date}) {
    if(chatData instanceof ChatMessageDto) {
      console.log("11", );
      this._id = chatData._id;
      this._userId = chatData.userId;
      this._projectId = chatData.projectId;
      this._content = chatData.content;
      this._sentDate = new Date(chatData.sentDate);
    } else {
      this._id = null;  // 처음엔 null, DB에 추가 후 id 생성

      this._userId = chatData.userId;
      this._projectId = chatData.projectId;
      this._content = chatData.message;
      this._sentDate = chatData.sentDate;
      this._verifyId = uuidv4();
    }
  }

  public exportDto(): ChatMessageDto {
    let dto = new ChatMessageDto();

    dto._id = this._id;
    dto.userId = this._userId;
    dto.projectId = this._projectId;
    dto.content = this._content;
    dto.sentDate = this._sentDate.toString();

    return dto;
  }

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get projectId(): string {
    return this._projectId;
  }

  get content(): string {
    return this._content;
  }

  get sentDate(): Date {
    return this._sentDate;
  }

  get verifyId(): string {
    return this._verifyId;
  }
}
