export enum GachiSidebarEventEnum {
  OPEN_LEFT_SIDEBAR,
  CLOSE_LEFT_SIDEBAR,
  TOGGLE_LEFT_SIDEBAR,
  OPEN_RIGHT_SIDEBAR,
  CLOSE_RIGHT_SIDEBAR,
  TOGGLE_RIGHT_SIDEBAR,
}
export class GachiSidebarEvent {
  public action:GachiSidebarEventEnum;
  public data:any;

  constructor(action: GachiSidebarEventEnum, data?: any) {
    this.action = action;
    this.data = data;
  }
}
