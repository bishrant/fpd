import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Rest {
  data: any;
}

@Injectable()
export class SidebarService {
  constructor(private http: HttpClient) { }
  public restUrl = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/arcgis/rest/services/rwhrtntgr_y54tr/FeatureServer/0/query?returnGeometry=false&outFields=%2A&f=json&where=Status+%3D%27Active%27&orderByFields=Id';
  getInitialRestData() {
    return this.http.get<Rest>(this.restUrl);
  }
}
