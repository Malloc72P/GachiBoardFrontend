import { Injectable } from '@angular/core';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';

// @ts-ignore
import Tool = paper.Tool;
// @ts-ignore
import Path = paper.Path;

import * as paper from 'paper';

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  private toolMap: Map<number, Tool>;
  private test = Tool;
  private currentPointerMode: number;

  constructor() {
    this.toolMap = new Map<number, Tool>();
    this.initializeTool(this.toolMap);
  }

  // TODO : 레퍼런스인지 테스트 해봐야함. 여기서 문제 발생 가능성 있음
  private initializeTool(toolMap: Map<number, Tool>) {
    toolMap.set(PointerMode.DRAW, this.createBrush());
  }

  public activateTool(mode:number){
    this.currentPointerMode = mode;
    return this.toolMap.get(mode).activate();
  }

  private createBrush(): Tool{
    let newTool = new Tool();
    let newPath:Path;

    newTool.onMouseDown = (event) => {
      if(this.currentPointerMode === PointerMode.DRAW){
        // If we produced a path before, deselect it:
        if (newPath) {
          newPath.selected = false;
        }

        // Create a new path and set its stroke color to black:
        newPath = new Path({
          segments: [event.point],
          strokeColor: 'black',
          // Select the path, so we can see its segment points:
          //fullySelected: true
        });
      }
    };

    newTool.onMouseDrag = (event) => {
      if(this.currentPointerMode === PointerMode.DRAW){
        newPath.add(event.point);
      }
      else if(this.currentPointerMode === PointerMode.MOVE){
        //this.movingAlg(event);
      }
    };

    newTool.onMouseUp = () => {
      //let segmentCount = newPath.segments.length;

      // When the mouse is released, simplify it:
      newPath.simplify(2);
      //this.wbRelay.sendData(newPath.exportJSON());
      //this.wbRelay.sendDrawStrokeCreate(newPath.exportJSON());
      // this.wbRelay.drawsStrokeController.drawsStrokeCreate(newPath);
    };

    return newTool;
  }
}
