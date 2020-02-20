import { TestBed } from '@angular/core/testing';

import { HtmlHelperService } from './html-helper.service';

describe('HtmlHelperService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HtmlHelperService = TestBed.get(HtmlHelperService);
    expect(service).toBeTruthy();
  });
});
