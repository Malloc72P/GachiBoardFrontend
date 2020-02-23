import { GachiPointDto } from '../../../../DTO/GachiPoint/Gachi-Point';

export class CursorData {
  public idToken;
  public position:GachiPointDto;

  constructor(idToken, position: GachiPointDto) {
    this.idToken = idToken;
    this.position = position;
  }
}
