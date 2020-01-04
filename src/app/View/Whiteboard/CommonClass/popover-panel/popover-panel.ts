import {CommonEnum} from '../../../../Model/Helper/common-enum/common-enum';
import {EventEmitter} from '@angular/core';

export abstract class PopoverPanel {
  protected currentSelectedMode;
  protected enumData;
  protected enumService: CommonEnum;
  public selectableMode: Array<any>;

  protected constructor(
    injectedEnumService: CommonEnum,
    protected onPanelStateChange: EventEmitter<any>
  ) {
    this.enumService = injectedEnumService;
    this.selectableMode = new Array<any>();
    this.enumData = this.enumService.getEnumArray();
    this.selectableMode = this.enumService.getEnumEntryArray();
    this.currentSelectedMode = this.selectableMode[0];  // default
  }
  onPanelStateChangeHandler() {
    this.onPanelStateChange.emit({mode: this.currentSelectedMode, data: null});
  }
}
