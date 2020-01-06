import { TestBed } from '@angular/core/testing';

import { PositionCalcService } from './position-calc.service';

describe('PositionCalcService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PositionCalcService = TestBed.get(PositionCalcService);
    expect(service).toBeTruthy();
  });
});
