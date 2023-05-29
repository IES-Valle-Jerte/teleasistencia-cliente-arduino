import { TestBed } from '@angular/core/testing';

import { TerminalRestService } from './terminal-rest.service';

describe('TerminalRestService', () => {
  let service: TerminalRestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerminalRestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
