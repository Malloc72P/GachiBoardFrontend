import { TestBed } from '@angular/core/testing';

import { ItemBlinderManagementService } from './item-blinder-management.service';

describe('ItemBlinderManagementService', () => {
  let service: ItemBlinderManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ItemBlinderManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
