import {Component, OnInit} from '@angular/core';
import {PointerMode, PointerModeEnumService} from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';
import {PanelManagerService} from '../../../Model/Whiteboard/Panel/panel-manager-service/panel-manager.service';

@Component({
  selector: 'app-whiteboard-tool-panel',
  templateUrl: './whiteboard-tool-panel.component.html',
  styleUrls: ['./whiteboard-tool-panel.component.css']
})
export class WhiteboardToolPanelComponent extends PopoverPanel implements OnInit {
  constructor(
    private pointerModeEnumService: PointerModeEnumService,
    public pointerModeManagerService: PointerModeManagerService,
    private panelManager: PanelManagerService,
  ) {
    super(pointerModeEnumService);
    this.pointerModeEnumService = pointerModeEnumService;
  }

  ngOnInit() {
    this.panelManager.brushPanelOutsideClickListener();
  }

  onPanelStateChangeHandler() {
    this.pointerModeManagerService.currentPointerMode = this.currentSelectedMode;
    console.log("WhiteboardToolPanelComponent >> onPanelStateChangeHandler >> pointerMode : ",this.pointerModeManagerService.currentPointerMode);
  }
  onClickPanelItem(panelItem: number) {
    switch (panelItem) {
      case PointerMode.MOVE:
        this.panelManager.isHideBrushPanel = true;
        break;
      case PointerMode.DRAW:
        this.panelManager.isHideBrushPanel = !this.panelManager.isHideBrushPanel;
        break;
      case PointerMode.ERASER:
        this.panelManager.isHideBrushPanel = true;
        break;
      case PointerMode.LASSO_SELECTOR:
        this.panelManager.isHideBrushPanel = true;
        break;
      default:
        break;
    }
  }
}
