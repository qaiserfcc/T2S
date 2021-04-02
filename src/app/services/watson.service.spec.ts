import { TestBed } from '@angular/core/testing';

import { WatsonService } from './watson.service';

describe('WatsonService', () => {
  let service: WatsonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WatsonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
