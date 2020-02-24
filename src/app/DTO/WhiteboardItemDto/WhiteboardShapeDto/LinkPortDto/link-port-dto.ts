export class LinkPortDto {
  public direction;
  public ownerWbItemId;

  constructor(direction, ownerWbItemId) {
    this.direction = direction;
    this.ownerWbItemId = ownerWbItemId;
  }

  public static clone(dto: LinkPortDto): LinkPortDto {
    return new LinkPortDto(dto.direction, dto.ownerWbItemId);
  }
}
