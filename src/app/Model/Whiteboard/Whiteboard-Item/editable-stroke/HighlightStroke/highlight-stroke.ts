import {EditableStroke} from '../editable-stroke';

import * as paper from 'paper';
import {WhiteboardItemType} from '../../../../Helper/data-type-enum/data-type.enum';
import {HighlightStrokeDto} from '../../../../../DTO/WhiteboardItemDto/EditableStrokeDto/HighlightStrokeDto/highlight-stroke-dto';
// @ts-ignore
import Path = paper.Path;

export class HighlightStroke extends EditableStroke {
  constructor(id, path:Path, layerService) {
    super(id, WhiteboardItemType.HIGHLIGHT_STROKE,
            path,
            layerService);
  }

  public exportToDto(): HighlightStrokeDto {
    return super.exportToDto() as HighlightStrokeDto;
  }

  public update(dto: HighlightStrokeDto) {
    super.update(dto);
  }
}
