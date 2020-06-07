export class FileMetadataDto {
  public _id;
  public projectId;
  public title;
  public path;
  public type:FileTypeEnum;
  public size;
  public uploaderId;
  public uploaderName;
  public uploadDate;
  public children:Array<FileMetadataDto>;
  public filePointer;


  constructor(projectId, path, title, type, size, uploaderId, uploaderName, uploadDate, filePointer?) {
    this.projectId = projectId;
    this.path = path;
    this.title = title;
    this.type = type;
    this.size = size;
    this.uploaderId = uploaderId;
    this.uploaderName = uploaderName;
    this.uploadDate = uploadDate;
    this.children = new Array<FileMetadataDto>();
    this.filePointer = filePointer;
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
