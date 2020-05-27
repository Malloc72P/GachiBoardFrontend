import { TestBed } from '@angular/core/testing';

import { CommonSnackbarService } from './common-snackbar.service';

describe('CommonSnackbarService', () => {
  let service: CommonSnackbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommonSnackbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
