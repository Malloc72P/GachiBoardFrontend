import {GachiPointDto} from '../../../WhiteboardItemDto/PointDto/gachi-point-dto';


export class CursorData {
  public idToken;
  public position:GachiPointDto;

  constructor(idToken, position: GachiPointDto) {
    this.idToken = idToken;
    this.position = position;
  }
}
