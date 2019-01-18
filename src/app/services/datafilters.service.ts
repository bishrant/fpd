import { Injectable } from '@angular/core';
import { IndustriesGeojson } from './industries-geojson.service';

@Injectable({
  providedIn: 'root'
})
export class DatafiltersService {

  constructor(private _data: IndustriesGeojson) { }

  public applyFilterArray(attribute, listOfValues) {
    const reg = new RegExp(listOfValues.join('|'), 'i'); // i is for ignoring case
      this._data.orginalDataObservable.subscribe(d => {
        // reset the data from original data source
        const d1 = d as any[];
        this._data.allDataService.next(d1.filter(f => reg.test(f.properties[attribute])));
      });
  }
  public resetData() {
    this._data.orginalDataObservable.subscribe(d => {
      // reset the data from original data source
      this._data.allDataService.next(d);
      this._data.featureLoaded(d);
    });
  }

  public resetDataSpatial() {
    this._data.orginalDataObservable.subscribe(d => {
      this._data.allDataService.next(d);
    });
  }
}
