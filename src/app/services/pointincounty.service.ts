import { Injectable} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PointincountyService {
  pointInCountyDataService = new ReplaySubject<object>(1);
  pointInCountyData = new ReplaySubject<object>(1);
  constructor(private http: HttpClient) { }
  public getCountyNameFromPoint(geom) {
    const body = `f=geojson&where=1=1&outfields=name&geometry=${geom}&spatialRel=esriSpatialRelIntersects&geometryType=esriGeometryMultipoint&returnGeometry=false`;

    this.http.post('https://services5.arcgis.com/ELI1iJkCzTIagHkp/ArcGIS/rest/services/rwhrtntgr_y54tr/FeatureServer/1/query', body, {
      headers : {
          'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
      }
  }).subscribe(data => {
      console.log(data);
      const features = data['features'];
      const counties = [];
      if (features.length > 0) {
        features.forEach((f) => {
          counties.push(f['properties']['NAME']);
        } );
      }
      console.log(counties);
      this.pointInCountyDataService.next(counties);
    //   outfields: 'NAME',
    //   geometry: geom,
    //   geometryType: 'esriGeometryMultipoint',
    //  // inSRA: encodeURIComponent('{\'latestWkid\':3857,\'wkid\':102100}'),
    //   spatialRel: 'esriSpatialRelIntersects',
    //   returnGeometry: 'false',
    //   f: 'geojson'
    });
  }
}
