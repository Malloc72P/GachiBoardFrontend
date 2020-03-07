import {EventEmitter, Injectable} from '@angular/core';
import {GachiPointDto} from '../../../../DTO/WhiteboardItemDto/PointDto/gachi-point-dto';
import {UserBlinder} from '../UserBlinder/UserBlinder';
import {GlobalSelectedGroupDto} from '../../../../DTO/WhiteboardItemDto/ItemGroupDto/GlobalSelectedGroupDto/GlobalSelectedGroupDto';
import {DrawingLayerManagerService} from '../../InfiniteCanvas/DrawingLayerManager/drawing-layer-manager.service';

@Injectable({
  providedIn: 'root'
})
export class ItemBlinderManagementService {
  public userBinderMap:Map<any, UserBlinder>;
  private zoomEventEmitter: EventEmitter<any>;
  private layerService:DrawingLayerManagerService;
  constructor() {
    this.userBinderMap = new Map<any, UserBlinder>();
  }

  public initializeBlinderService(zoomEventEmitter, layerService:DrawingLayerManagerService) {
    this.zoomEventEmitter = zoomEventEmitter;
    this.layerService = layerService;
  }

  public updateOccupiedData(gsgDto:GlobalSelectedGroupDto) {
    if(!this.userBinderMap.has(gsgDto.userIdToken)){
      this.userBinderMap.set(gsgDto.userIdToken, new UserBlinder(gsgDto.userIdToken, gsgDto.userName, this.layerService));
    }
    this.userBinderMap.get(gsgDto.userIdToken).occupyUpdate(gsgDto);
  }
  public updateNotOccupiedData(gsgDto:GlobalSelectedGroupDto) {
    if(!this.userBinderMap.has(gsgDto.userIdToken)){
      this.userBinderMap.set(gsgDto.userIdToken, new UserBlinder(gsgDto.userIdToken, gsgDto.userName, this.layerService));
    }
    this.userBinderMap.get(gsgDto.userIdToken).notOccupyUpdate(gsgDto);
  }
  public onWbItemDestroy(destroyedItemId){
    for(let [key, userBlind] of this.userBinderMap){
      if (userBlind.blindItemMap.has(destroyedItemId)) {
        userBlind.blindItemMap.delete(destroyedItemId);
        userBlind.refreshOnDelete();
      }
    }
  }
  public deleteUser(gsgDto:GlobalSelectedGroupDto) {

  }

}
