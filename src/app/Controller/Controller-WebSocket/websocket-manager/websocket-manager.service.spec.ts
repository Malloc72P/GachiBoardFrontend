import { TestBed } from '@angular/core/testing';

import { WebsocketManagerService } from './websocket-manager.service';

describe('WebsocketManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebsocketManagerService = TestBed.get(WebsocketManagerService);
    expect(service).toBeTruthy();
  });
});
