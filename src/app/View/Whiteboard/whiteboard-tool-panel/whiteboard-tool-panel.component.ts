import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { PointerModeEnumService } from '../../../Model/Whiteboard/Pointer/pointer-mode-enum-service/pointer-mode-enum.service';
import {PopoverPanel} from '../CommonClass/popover-panel/popover-panel';

@Component({
  selector: 'app-whiteboard-tool-panel',
  templateUrl: './whiteboard-tool-panel.component.html',
  styleUrls: ['./whiteboard-tool-panel.component.css']
})
export class WhiteboardToolPanelComponent extends PopoverPanel implements OnInit {
  @Output() onPointerModeChanged;
  private pointerModeService: PointerModeEnumService;

  constructor(
    pointerModeService: PointerModeEnumService
  ) {
    super(pointerModeService, new EventEmitter<any>());
    this.pointerModeService = pointerModeService;
    // onPanelStateChange : new EventEmitter<any>
    this.onPointerModeChanged = this.onPanelStateChange;
  }

  ngOnInit() {
  }
}
