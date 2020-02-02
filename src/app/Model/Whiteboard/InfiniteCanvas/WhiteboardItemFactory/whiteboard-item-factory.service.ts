import { Injectable } from '@angular/core';
import {DrawingLayerManagerService} from '../DrawingLayerManager/drawing-layer-manager.service';
import {WhiteboardItemDto} from '../../WhiteboardItemDto/whiteboard-item-dto';
import {WhiteboardItemType} from '../../../Helper/data-type-enum/data-type.enum';

@Injectable({
  providedIn: 'root'
})
export class WhiteboardItemFactoryService {

  constructor(
    private layerService:DrawingLayerManagerService
  ) {

  }

}
