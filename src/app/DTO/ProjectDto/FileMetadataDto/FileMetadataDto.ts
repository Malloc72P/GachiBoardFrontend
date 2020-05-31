export class FileMetadataDto {
  public id;
  public title;
  public type:FileTypeEnum;
  public size;
  public uploaderId;
  public uploaderName;
  public uploadDate;
  public children:Array<FileMetadataDto>;


  constructor(id, title, type, size, uploaderId, uploaderName, uploadDate) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.size = size;
    this.uploaderId = uploaderId;
    this.uploaderName = uploaderName;
    this.uploadDate = uploadDate;
    this.children = new Array<FileMetadataDto>();
  }
}
export enum FileTypeEnum {
  DIRECTORY,
  VIDEO,
  IMAGE,
  DOCUMENT,
  COMPRESSED_FILE,
  ETC,
}
