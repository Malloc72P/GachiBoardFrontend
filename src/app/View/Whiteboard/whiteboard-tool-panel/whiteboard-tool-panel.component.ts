import {Component, OnInit} from '@angular/core';
import { PointerModeEnumService } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';
import {PointerModeManagerService} from '../../../Model/Whiteboard/Pointer/pointer-mode-manager-service/pointer-mode-manager.service';

@Component({
  selector: 'app-whiteboard-tool-panel',
  templateUrl: './whiteboard-tool-panel.component.html',
  styleUrls: ['./whiteboard-tool-panel.component.css']
})
export class WhiteboardToolPanelComponent extends PopoverPanel implements OnInit {
  constructor(
    private pointerModeEnumService: PointerModeEnumService,
    private pointerModeManagerService: PointerModeManagerService
  ) {
    super(pointerModeEnumService);
    this.pointerModeEnumService = pointerModeEnumService;
  }

  ngOnInit() {
  }

  onPanelStateChangeHandler() {
    this.pointerModeManagerService.currentPointerMode = this.currentSelectedMode;
  }
}
