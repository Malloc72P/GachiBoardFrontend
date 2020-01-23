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
  private toolPanelToggleGroupValue;

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
    this.modeChange(PointerMode.POINTER);
  }

  onClickPanelItem(panelItem: number) {
    switch (panelItem) {
      case PointerMode.POINTER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.MOVE:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.DRAW:
        this.modeChange(panelItem);
        this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        this.panelManager.isHideBrushPanel = !this.panelManager.isHideBrushPanel;
        break;
      case PointerMode.HIGHLIGHTER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideShapePanel = true;
        this.panelManager.isHideHighlighterPanel = !this.panelManager.isHideHighlighterPanel;
        break;
      case PointerMode.SHAPE:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = true;
        this.panelManager.isHideShapePanel = !this.panelManager.isHideShapePanel;
        break;
      case PointerMode.ERASER:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      case PointerMode.LASSO_SELECTOR:
        this.modeChange(panelItem);
        this.panelManager.isHideBrushPanel = this.panelManager.isHideHighlighterPanel = this.panelManager.isHideShapePanel = true;
        break;
      default:
        break;
    }
  }

  modeChange(mode: number) {
    this.pointerModeManagerService.currentPointerMode = this.toolPanelToggleGroupValue = mode;
  }

  get PointerModeEnum() {
    return PointerMode;
  }
}
