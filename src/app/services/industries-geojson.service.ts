import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ReplaySubject, BehaviorSubject, from } from 'rxjs';

export interface FeatureTemplate {
  type: string;
  id: number;
  geometry: object;
  properties: object;
}

@Injectable({
  providedIn: 'root'
})
export class IndustriesGeojson implements OnInit {
  // data for the tables
  public tableDataService = new BehaviorSubject<any[]>([]);
  currentTableData = [];
  public printStatus;
  public linkToPDFReport = '';
  public specificIndustryTypeList;
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

  public activeSpatialControl = new ReplaySubject<string>(1);
  public activeSpatialControlObservable = this.activeSpatialControl.asObservable();

  public printMapSubject = new ReplaySubject<string>(1);
  public printMapObservable = this.printMapSubject.asObservable();

  public totalRowsInTable = new ReplaySubject<number>(1);
  public totalRowsInTableObservable = this.totalRowsInTable.asObservable();

  public totalRows = 0;

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
  }

  public getSpecificIndustryList() {
    this.filteredSpecificIndustryType.next(this.specificIndustryTypeList.sort());
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
  }

  getTableData(d): void {
    const _tableData = d.map(f => f.properties);
    const _t = Object.keys(_tableData).map(e => _tableData[e]).sort((a, b) => a['id'] - b['id']);
    this.currentTableData = _t;
    this.tableDataService.next(_t);
  }

  getPagedData(sort= 'asc', sortField= 'Company', index= 0, size= 3) {
    let clonedTableData  = Object.assign([], Object.keys(this.currentTableData).map(e => this.currentTableData[e]).sort((a, b) => {
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

    if (sort === 'desc') {
      clonedTableData = clonedTableData.reverse();
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
      this.specificIndustryTypeList = this.getDataForComboBox(d, 'SpecificIndustryType');
      this.filteredSpecificIndustryType.next(this.specificIndustryTypeList.sort());

      this.createMappingMaintoSpeicifcIndustryType(d);
      // similar for sawmill
      const sawmillMajorSpecies = this.getDataForComboBoxSawMill(d, 'Species', 'SpecificIndustryType', 'Sawmill');
      this.filteredSawmillSpecies.next(sawmillMajorSpecies.sort());
  }
  // function to get unique values for drop down boxes
  constructor(private http: HttpClient) {
    const urls = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/ArcGIS/rest/services/Forest_Products_Industries_ViewOnly/FeatureServer/0/query?returnGeometry=true&outFields=%2A&f=geojson&outSR=4326&where=Status+%3D+%27Active%27&orderByFields=Id';
    this.http.get(urls).subscribe(data => {
      this.allDataService.next(data['features']);
      this.originalData.next(data['features']);
      // this.totalRowsInTable.next(data['features'].length);
      this.totalRows = data['features'].length;
      this.featureLoaded(data['features']);
      this.getTableData(data['features']);
    });

    this.currentData.subscribe(d => {
      this.getTableData(d);
    });
  }

  ngOnInit() { }

}
