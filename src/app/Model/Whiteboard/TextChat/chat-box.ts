import {ChatMessage} from "./chat-message";

export class ChatBox {
  private chatMessages: Array<ChatMessage>;

  constructor() {
    this.chatMessages = new Array<ChatMessage>();
  }

  public addMessage(message: ChatMessage) {
    this.chatMessages.push(message);
  }

  public addPrevious(messages: Array<ChatMessage>) {
    messages.forEach((value, index) => {
      this.chatMessages.splice(index, 0, value);
    });
  }

  get messages(): Array<ChatMessage> {
    return this.chatMessages;
  }
}
