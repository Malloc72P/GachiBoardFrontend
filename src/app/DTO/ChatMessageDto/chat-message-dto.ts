export class ChatMessageDto {
  public _id: string;
  public userId: string;
  public content: string;
  public projectId: string;
  public sentDate: string;
  public verifyId: string;
  public verify: boolean;

  public static clone(chatMessageDto: ChatMessageDto): ChatMessageDto {
    let dto = new ChatMessageDto();

    dto._id = chatMessageDto._id;
    dto.userId = chatMessageDto.userId;
    dto.content = chatMessageDto.content;
    dto.projectId = chatMessageDto.projectId;
    dto.sentDate = chatMessageDto.sentDate;
    dto.verifyId = chatMessageDto.verifyId;
    dto.verify = chatMessageDto.verify;

    return dto;
  }
}
