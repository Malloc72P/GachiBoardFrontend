import {EditableLinkDto} from '../editable-link-dto';
import {LinkPortDto} from '../../link-port-dto';

export class SimpleLineLinkDto extends EditableLinkDto{


  constructor(id, fromLinkPortDto: LinkPortDto, toLinkPortDto: LinkPortDto, isDashed, dashLength) {
    super(id, fromLinkPortDto, toLinkPortDto, isDashed, dashLength);
  }
}
