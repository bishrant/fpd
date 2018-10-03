import { TestBed, inject } from '@angular/core/testing';

import { IndustriesGeojsonService } from './industries-geojson.service';

describe('IndustriesGeojsonService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IndustriesGeojsonService]
    });
  });

  it('should be created', inject([IndustriesGeojsonService], (service: IndustriesGeojsonService) => {
    expect(service).toBeTruthy();
  }));
});
