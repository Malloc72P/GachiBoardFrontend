import {EditableStroke} from '../editable-stroke';

import * as paper from 'paper';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {HighlightStrokeDto} from '../../../WhiteboardItemDto/EditableStrokeDto/HighlightStrokeDto/highlight-stroke-dto';
// @ts-ignore
import Path = paper.Path;

export class HighlightStroke extends EditableStroke {
  private _opacity: number;
  constructor(id, path:Path, layerService) {
    super(id, WhiteboardItemType.HIGHLIGHT_STROKE,
            path,
            layerService);

  }

  public exportToDto(): HighlightStrokeDto {
    let edtStrokeDto = super.exportToDto();
    return new HighlightStrokeDto(
      edtStrokeDto.id, edtStrokeDto.type, edtStrokeDto.center,
      edtStrokeDto.segments, edtStrokeDto.strokeWidth, edtStrokeDto.strokeColor, this.opacity
    );
  }

  get opacity(): number {
    return this._opacity;
  }

  set opacity(value: number) {
    this._opacity = value;
  }
}
