import {ElementRef} from "@angular/core";

export class PanelData {
  id: string;
  videoElement: ElementRef;
  audioElement: ElementRef;

  x: number;
  y: number;

  constructor(name: string, left: number, top: number) {
    this.id = name;
    this.x = left;
    this.y = top;
  }
}
