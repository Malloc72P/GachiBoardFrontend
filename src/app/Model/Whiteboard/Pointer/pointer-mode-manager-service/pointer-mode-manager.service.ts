import { Injectable } from '@angular/core';
import * as paper from 'paper';
import {PointerMode} from '../pointer-mode-enum-service/pointer-mode-enum.service';
import Path = paper.Path;
import Tool = paper.Tool;

@Injectable({
  providedIn: 'root'
})

export class PointerModeManagerService {
  private toolMap: Map<number, paper.Tool>;
  private test = Tool
  private currentPointerMode: number;

  constructor() {
    this.toolMap = new Map<number, paper.Tool>();
    this.initializeTool(this.toolMap);
  }

  // TODO : 레퍼런스인지 테스트 해봐야함. 여기서 문제 발생 가능성 있음
  private initializeTool(toolMap: Map<number, paper.Tool>) {
    toolMap.set(PointerMode.DRAW, this.createBrush());

    toolMap.get(PointerMode.DRAW).activate();
  }

  private createBrush(): paper.Tool{
    let newTool = new paper.Tool();
    let newPath: Path;

    newTool.onMouseDown = (event) => {
      if(this.currentPointerMode === PointerMode.DRAW){
        // If we produced a path before, deselect it:
        if (newPath) {
          newPath.selected = false;
        }

        // Create a new path and set its stroke color to black:
        newPath = new paper.Path({
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
      newPath.simplify(10);
      //this.wbRelay.sendData(newPath.exportJSON());
      //this.wbRelay.sendDrawStrokeCreate(newPath.exportJSON());
      // this.wbRelay.drawsStrokeController.drawsStrokeCreate(newPath);
    };

    return newTool;
  }
}
