import { TestBed } from '@angular/core/testing';

import { DatafiltersService } from './datafilters.service';

describe('DatafiltersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatafiltersService = TestBed.get(DatafiltersService);
    expect(service).toBeTruthy();
  });
});
