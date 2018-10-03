import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ReplaySubject, Subscription} from 'rxjs';
import esri = __esri;

@Injectable({
  providedIn: 'root'
})
export class IndustriesGeojson implements OnInit {
  // private allDataService = new BehaviorSubject<any>(null);
  allDataService = new ReplaySubject<object>(1);
  originalData = new ReplaySubject<object>(1);
  // store the original data so that we don't have to go back to the server for new data reset request
  orginalDataObservable = this.originalData.asObservable();
  currentData = this.allDataService.asObservable();
  // service for sleected row to zoom in
  selectedRowService = new ReplaySubject<any>(1);
  selectedRowObservable = this.selectedRowService.asObservable();
  // for filtered county list
  private filteredCounty = new ReplaySubject<object>(1);
  currentCountyList = this.filteredCounty.asObservable();
  // for filtering company names
  private filteredCompany = new ReplaySubject<object>(1);
  currentCompanyList = this.filteredCompany.asObservable();
  // filter by industry type
  private filteredIndustryType = new ReplaySubject<object>(1);
  currentIndustryTypeList = this.filteredIndustryType.asObservable();
  public getDataForComboBox(d, attribute) {
    const lookup = {};
    const result = [];
    for (let item, i = 0; item = d[i++];) {
      const val = item.properties[attribute];
      if (!(val in lookup)) {
        lookup[val] = 1;
        result.push(val);
      }
    }
   return result;
  }

  featureLoaded(d) {
      const counties = this.getDataForComboBox(d, 'County');
      this.filteredCounty.next(counties.sort());
      // repeat same for company names
      const companies = this.getDataForComboBox(d, 'Company');
      this.filteredCompany.next(companies.sort());
      // repeat same for industry type
      const industryType = this.getDataForComboBox(d, 'Industry_t');
      this.filteredIndustryType.next(industryType.sort());
  }
  // function to get unique values for drop down boxes
  constructor(private http: HttpClient) {
    const urls = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/arcgis/rest/services/rwhrtntgr_y54tr/FeatureServer/0/query?returnGeometry=true&outFields=%2A&f=geojson&outSR=4326&where=1=1';
    this.http.get(urls).subscribe(data => {
      console.log(data['features']);
      this.allDataService.next(data['features']);
      this.originalData.next(data['features']);
      this.featureLoaded(data['features']);
    });
  }

  ngOnInit() {  }

}
