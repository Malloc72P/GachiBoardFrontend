import * as paper from 'paper';
// @ts-ignore
import Segment = paper.Segment;

import {GachiPointDto} from "../PointDto/gachi-point-dto";

export class GachiSegmentDto {
  public point: GachiPointDto;
  public handleIn: GachiPointDto;
  public handleOut: GachiPointDto;

  constructor(segment?: Segment) {
    if(!!segment) {
      this.point = new GachiPointDto(segment.point.x, segment.point.y);
      this.handleIn = new GachiPointDto(segment.handleOut.x, segment.handleOut.y);
      this.handleOut = new GachiPointDto(segment.handleIn.x, segment.handleIn.y);
    } else {
      this.point = new GachiPointDto(0, 0);
      this.handleIn = new GachiPointDto(0, 0);
      this.handleOut = new GachiPointDto(0, 0);
    }
  }

  // handle 을 반대로 대입해야하는데 검증 필요
  // public clone(): GachiSegmentDto {
  //   let segment = new GachiSegmentDto();
  //   segment.point = this.point.clone();
  //   segment.handleIn = this.handleOut.clone();
  //   segment.handleOut = this.handleIn.clone();
  //
  //   return segment;
  // }
}
