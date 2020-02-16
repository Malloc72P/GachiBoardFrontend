import * as paper from 'paper';
// @ts-ignore
import Segment = paper.Segment;

import {GachiPointDto} from "../PointDto/gachi-point-dto";

export class GachiSegmentDto {
  private _point: GachiPointDto;
  private _handleIn: GachiPointDto;
  private _handleOut: GachiPointDto;

  constructor(segment?: Segment) {
    if(!!segment) {
      this._point = new GachiPointDto(segment.point.x, segment.point.y);
      this._handleIn = new GachiPointDto(segment.handleOut.x, segment.handleOut.y);
      this._handleOut = new GachiPointDto(segment.handleIn.x, segment.handleIn.y);
    } else {
      this._point = new GachiPointDto(0, 0);
      this._handleIn = new GachiPointDto(0, 0);
      this._handleOut = new GachiPointDto(0, 0);
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

  get point(): GachiPointDto {
    return this._point;
  }

  set point(value: GachiPointDto) {
    this._point = value;
  }

  get handleIn(): GachiPointDto {
    return this._handleIn;
  }

  set handleIn(value: GachiPointDto) {
    this._handleIn = value;
  }

  get handleOut(): GachiPointDto {
    return this._handleOut;
  }

  set handleOut(value: GachiPointDto) {
    this._handleOut = value;
  }
}
