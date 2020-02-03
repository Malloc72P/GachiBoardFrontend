import {HorizonContextMenuActions} from "./horizon-context-menu.enum";

export class subPanelStatus {
  public subPanel = new Map<HorizonContextMenuActions, boolean>();

  constructor() {
    this.subPanel.set(HorizonContextMenuActions.LINE, true);
    this.subPanel.set(HorizonContextMenuActions.FILL, true);
    this.subPanel.set(HorizonContextMenuActions.ARROW_WING, true);
  }

  public isHidden(panel: HorizonContextMenuActions) {
    return this.subPanel.get(panel);
  }

  public revealThis(panel: HorizonContextMenuActions) {
    this.subPanel.set(panel, false);
  }

  public toggleThis(panel: HorizonContextMenuActions) {
    this.subPanel.set(panel, !this.isHidden(panel));
  }

  public hideAll() {
    this.subPanel.forEach((value, key) => {
      this.subPanel.set(key, true);
    });
  }

  public hideOther(panel: HorizonContextMenuActions) {
    this.subPanel.forEach((value, key) => {
      if(key !== panel) {
        this.subPanel.set(key, true);
      }
    });
  }
}

