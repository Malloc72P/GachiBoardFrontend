import {ChatMessage} from "./chat-message";

export class ChatBox {
  private chatMessages: Array<ChatMessage>;

  constructor() {
    this.chatMessages = new Array<ChatMessage>();
  }

  public addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
  }

  get messages(): Array<ChatMessage> {
    return this.chatMessages;
  }
}
