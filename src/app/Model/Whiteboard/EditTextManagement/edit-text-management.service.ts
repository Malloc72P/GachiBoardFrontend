import { Injectable } from '@angular/core';
import {EditableShape} from '../Whiteboard-Item/Whiteboard-Shape/EditableShape/editable-shape';
import {TextStyle} from '../Pointer/shape-service/text-style';
import {DrawingLayerManagerService} from '../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';

import * as paper from 'paper';
// @ts-ignore
import Path = paper.Path;
// @ts-ignore
import Point = paper.Point;
// @ts-ignore
import Item = paper.Item;
// @ts-ignore
import Segment = paper.Segment;
// @ts-ignore
import Color = paper.Color;
// @ts-ignore
import PointText = paper.PointText;
// @ts-ignore
import Group = paper.Group;
// @ts-ignore
import Rectangle = paper.Path.Rectangle;

@Injectable({
  providedIn: 'root'
})
export class EditTextManagementService {
  constructor(
    private layerService:DrawingLayerManagerService
  ) {}



}
