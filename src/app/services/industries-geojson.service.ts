import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ReplaySubject, Subscription, BehaviorSubject, Observable, from } from 'rxjs';
import {pluck} from 'rxjs/operators';
import { map } from 'rxjs/operators';
import esri = __esri;

export interface FeatureTemplate {
  type: string;
  id: number;
  geometry: object;
  properties: object;
}

export interface TableTemplate {
  id: number;
 // Company: string;
}

@Injectable({
  providedIn: 'root'
})
export class IndustriesGeojson implements OnInit {
  // data for the tables
  public tableDataService = new BehaviorSubject<any[]>([]);
  currentTableData = [];

  // private allDataService = new BehaviorSubject<any>(null);
  allDataService = new ReplaySubject<FeatureTemplate[]>(1);
  originalData = new ReplaySubject<FeatureTemplate[]>(1);

  // currentTableData = this.allDataService.forEach(val => val.id);
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

    // filter by specific industry type
    private filteredSpecificIndustryType = new ReplaySubject<object>(1);
    currentSpecificIndustryTypeList = this.filteredSpecificIndustryType.asObservable();

  // create a mapping between specific and main industry
  public mappingMainSpecificIndustryType: any = {};

  // filter only by the sawmill to get a second list of major species
  private filteredSawmillSpecies = new ReplaySubject<object>(1);
  currentSawmillSpecies = this.filteredSawmillSpecies.asObservable();
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

  // function to filter by sawmill for getting major species
  public getDataForComboBoxSawMill(d, attribute, secondaryAttribute, secondaryValue) {
    const lookup = {};
    const result = [];
    for (let item, i = 0; item = d[i++];) {
      const val = item.properties[attribute];
      const industry = item.properties[secondaryAttribute];
      if (!(val in lookup) && industry === secondaryValue && val !== '' && val !== ' ') {
        lookup[val] = 1;
        result.push(val);
      }
    }
    return result;
  }

  // function to filter specific industry type after user selects a main industry type (primary/secondary)
  public getDataForSpecificIndustry(primaryValue) {
    const _filtered = this.mappingMainSpecificIndustryType[primaryValue];
    this.filteredSpecificIndustryType.next(_filtered.sort());
    console.log(_filtered);
    // console.log(this.filteredIndustryType);
    console.log('user selected this industry type ', primaryValue);
  }

  // function to generate specific and main industry mapping
  public createMappingMaintoSpeicifcIndustryType(d) {
    const lookup = {};
    const result = {'Primary': [], 'Secondary': []};
    for (let item, i = 0; item = d[i++];) {
      const val = item.properties['SpecificIndustryType'];
      if (!(val in lookup)) {
        lookup[val] = 1;
        result[item.properties['MainIndustryType']].push(val);
        // result.push(val);
      }
    }
    this.mappingMainSpecificIndustryType = result;
   // console.log(result);
  //  return result;
  }

  getTableData(d): void {
    // console.log(d);
    // const d1 = d.sort();
    const _tableData = d.map(f => f.properties);
    const _t = Object.values(_tableData).sort((a, b) => a['id'] - b['id']);
    // console.log(_tableData);
    this.currentTableData = _t;
    this.tableDataService.next(_t);
  }

  getPagedData(sort= 'asc', sortField= 'Company', index= 0, size= 3) {
    console.log(this.currentTableData);
    let clonedTableData  = Object.assign([], Object.values(this.currentTableData).sort((a, b) => {
      let A;
      let B;
      if (sortField !== 'Id') {
        A = a[sortField].toLowerCase(), B = b[sortField].toLowerCase();
      } else {
        A = a[sortField], B = b[sortField];
      }
      if (A < B) {return -1; } // sort string ascending
      if (A > B) {return 1; }
      return 0; // default return value (no sorting)
    }));
   // sort = sortField === 'Id' ? sort: (sort === 'asc')
    if (sort === 'desc') {
      clonedTableData = clonedTableData.reverse();
      console.log(clonedTableData);
    }
    return from([clonedTableData.slice(index * size, index * size + size)]);
  }


  featureLoaded(d) {
      const counties = this.getDataForComboBox(d, 'County');
      this.filteredCounty.next(counties.sort());
      // repeat same for company names
      const companies = this.getDataForComboBox(d, 'Company');
      this.filteredCompany.next(companies.sort());
      // repeat same for main industry type no need to query though
      const industryType = ['Primary', 'Secondary'];
      // const industryType = this.getDataForComboBox(d, 'MainIndustryType');
      this.filteredIndustryType.next(industryType.sort());
      // for specific industry type n
      const specificIndustryType = this.getDataForComboBox(d, 'SpecificIndustryType');
      this.filteredSpecificIndustryType.next(specificIndustryType.sort());

      this.createMappingMaintoSpeicifcIndustryType(d);
      // similar for sawmill
      const sawmillMajorSpecies = this.getDataForComboBoxSawMill(d, 'Species', 'SpecificIndustryType', 'Sawmill');
     // console.log(sawmillMajorSpecies);
      this.filteredSawmillSpecies.next(sawmillMajorSpecies.sort());
  }
  // function to get unique values for drop down boxes
  constructor(private http: HttpClient) {
    // const urls = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/arcgis/rest/services/rwhrtntgr_y54tr/FeatureServer/0/query?returnGeometry=true&outFields=%2A&f=geojson&outSR=4326&where=1=1';
    const urls = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/ArcGIS/rest/services/Forest_Products_Industries_ViewOnly/FeatureServer/0/query?returnGeometry=true&outFields=%2A&f=geojson&outSR=4326&where=1=1&orderByFields=Id';
    this.http.get(urls).subscribe(data => {
     // console.log(data['features']);
      this.allDataService.next(data['features']);
      this.originalData.next(data['features']);
      this.featureLoaded(data['features']);
      this.getTableData(data['features']);
    });

    this.currentData.subscribe(d => {
      this.getTableData(d);
    });
  }

  ngOnInit() {
    this.allDataService.subscribe(data => {
      // apply filter to format data for table
      console.log('for filtered data');
      console.log(data);
    });
   }

}
