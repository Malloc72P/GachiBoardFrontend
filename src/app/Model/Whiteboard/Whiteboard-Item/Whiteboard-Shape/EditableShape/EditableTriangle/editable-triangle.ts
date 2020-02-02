import {EditableShape} from '../editable-shape';
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
import {WhiteboardItemType} from '../../../../../Helper/data-type-enum/data-type.enum';
import {LinkPort} from '../../LinkPort/link-port';
import {LinkPortDirectionEnum} from '../../LinkPort/LinkPortDirectionEnum/link-port-direction-enum.enum';
import {EditableTriangleDto} from '../../../../WhiteboardItemDto/WhiteboardShapeDto/EditableShapeDto/EditableTriangleDto/editable-triangle-dto';
export class EditableTriangle extends EditableShape {
  constructor(id, item:Item, textStyle, editText, layerService) {
    super(
      id,
      WhiteboardItemType.EDITABLE_TRIANGLE,
      item,
      textStyle,
      editText,
      layerService);

  }
  protected initLinkPortMap(){
    //링크포트 생성
    this.linkPortMap = new Map<any, LinkPort>();
    this.linkPortMap.set( LinkPortDirectionEnum.CENTER_TOP, new LinkPort(this, LinkPortDirectionEnum.CENTER_TOP) );
    this.linkPortMap.set( LinkPortDirectionEnum.BOTTOM_LEFT, new LinkPort(this, LinkPortDirectionEnum.BOTTOM_LEFT) );
    this.linkPortMap.set( LinkPortDirectionEnum.BOTTOM_RIGHT, new LinkPort(this, LinkPortDirectionEnum.BOTTOM_RIGHT) );

  }

  exportToDto(): EditableTriangleDto {
    return super.exportToDto() as EditableTriangleDto;
  }

}
