export class SubPanelManager {
  private subPanels = new Map<number, boolean>();

  constructor(subPanels?: Array<number>) {
    if(!!subPanels) {
      subPanels.forEach(value => {
        this.subPanels.set(value, true);
      });
    }
  }

  set panel(subPanel: number) {
    this.subPanels.set(subPanel, true);
  }

  public isHidden(subPanel: number) {
    return this.subPanels.get(subPanel);
  }

  public revealThis(subPanel: number) {
    this.subPanels.set(subPanel, false);
  }

  public hideThis(subPanel: number) {
    this.subPanels.set(subPanel, true);
  }

  public toggleThis(subPanel: number) {
    this.subPanels.set(subPanel, !this.isHidden(subPanel));
  }

  public hideAll() {
    this.subPanels.forEach((value, key) => {
      this.subPanels.set(key, true);
    });
  }

  public hideOther(subPanel: number) {
    this.subPanels.forEach((value, key) => {
      if(key !== subPanel) {
        this.subPanels.set(key, true);
      }
    });
  }
}
