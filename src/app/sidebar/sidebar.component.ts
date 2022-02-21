import { Component, OnInit, ViewEncapsulation, Output, EventEmitter, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { Injectable } from '@angular/core';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { ReplaySubject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';
import { ExcelService } from '../services/excel.service';
import { TourService } from 'ngx-tour-md-menu';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./sidebar.component.scss'],
})

@Injectable()
export class SidebarComponent implements OnInit {
  public counties: any = [''];
  public companies: any = [''];
  public industrytype: any = [''];
  public specificIndustryType: any = [''];
  public sawmillMajorSpecies: any = [''];
  public showSawMillSpecies = false;
  public value: any = {};
  public _disabledV = '0';
  public disabled = false;
  public tableData;
  public selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
  @Output() exportButtonClicked = new EventEmitter<string>();
  @Output() performSpatialQuery = new EventEmitter<any>();
  @Output() hideSidebarEvent = new EventEmitter<any>();
  public _exportPDFSubject = new ReplaySubject<any>(1);
  public _exportPDFEvent = this._exportPDFSubject.asObservable();
  public activeControl: string;
  public printingPDFStatus = '';
  public linkToPDFReport = '';
  public activeAttributeFilter: string;

  @ViewChildren('companiess') public cc: ElementRef;
  @ViewChild('companiess') public ccc: NgSelectComponent;
  @ViewChild('ngSpecificIndustry') public ngSpecificIndustry: NgSelectComponent;
  @ViewChild('ngCounty') public ngCounty: NgSelectComponent;
  @ViewChild ('sidebarMaps') sidebarMaps: any;
  @ViewChild('sidebarSearch') sidebarSearch: any;
  @ViewChild('sidebarExport') sidebarExport: any;

  public sidebarSearchExpanded =  true;
  public sidebarMapSearchExpanded = false;
  public sidebarExportExpanded = false;
  public _reportFields: string[] = ['Id', 'Company', 'County', 'Address', 'Phone1', 'Phone2', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'SawMillType', 'Products', 'Species', 'Status', 'City', 'Lat', 'Lon'];

  hideSidebarFn() {
    this.hideSidebarEvent.next(true);
  }

  public get disabledV(): string {
    return this._disabledV;
  }

  public set disabledV(value: string) {
    this._disabledV = value;
    this.disabled = this._disabledV === '1';
  }

  // function to apply filter to table data
  public applyFilter(attribute, selected) {
    let reg;
    if (attribute === 'SpecificIndustryType') {
      reg = new RegExp(selected);
    } else {
      reg = new RegExp(selected , 'i');
    }
    if (attribute === 'maj_spec') {
      this._data.orginalDataObservable.subscribe(d => {
        // reset the data from original data source
        const d1 = d as any[];
        const _specRegex = new RegExp('Sawmill', 'i');
        this._data.allDataService.next(d1.filter(f => selected.toLowerCase() === (f.properties[attribute]).toLowerCase()
        && _specRegex.test(f.properties['SpecificIndustryType']) ));
      });
    } else {
      this._data.orginalDataObservable.subscribe(d => {
        const d1 = d as any[];
        this._data.allDataService.next(d1.filter(f => reg.test(f.properties[attribute])));
      });
    }
  }

  public selected(value: any, attribute: string): void {
    this.selectedValues[attribute] = value;
    if (typeof attribute === 'undefined') {
      return;
    } else if (attribute === 'MainIndustryType') {
        this.ngSpecificIndustry.items = this.specificIndustryType;
        if (typeof value === 'undefined') {
          this._data.getSpecificIndustryList();
        } else {
          this._data.getDataForSpecificIndustry(value);
        }
        this.selectedValues.Company = null;
        this.selectedValues.County = null;
    } else if (attribute === 'SpecificIndustryType') {
      this.selectedValues.Company = null;
      this.selectedValues.County = null;
      this.selectedValues[attribute] = value;
    } else {
      this.selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
      this.selectedValues[attribute] = value;
      this._data.getSpecificIndustryList();
    }
    this.applyFilter(attribute, value);
  }

  public clearAttributeFilters() {
    this.specificIndustryType = [];
    this.selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
    this.selectedValues.MainIndustryType = undefined;
    this._data.totalRowsInTable.next(10);
  }
  public resetData() {
    this.clearAttributeFilters();
    this._data.orginalDataObservable.subscribe(d => {
      // reset the data from original data source
      this._data.allDataService.next(d);
      this._data.featureLoaded(d);
    });
  }

  public printMapPDF() {
    this.exportButtonClicked.emit('clickedExport');
    this._data.printMapSubject.next('clicked');
  }
  public getBtnStyle(btn) {
    return btn === this.activeControl;
  }
  public activateSpatialControl(control: string) {
    if (this.activeControl === control || control === 'clear') {
      this.activeControl = 'clear';
      this._data.activeSpatialControl.next('clear');
      this.clearAttributeFilters();
    } else {
    this.activeControl = control;
    this._data.activeSpatialControl.next(control);
    }
  }

  public genetateReportPostData(): any {
    const _postdata: any = [];
    this.tableData.forEach(_d => {
      const _partialArray: any = {};
      this._reportFields.forEach(_attr => {
        if (_d['properties'].hasOwnProperty(_attr)) {
          _partialArray[_attr] = _d['properties'][_attr];
        }
      });
      _postdata.push(_partialArray);
    });
    const _p = this.sortByCompanyName(_postdata);
    return _p;
  }

  public exportDataPDF() {
    const _postdata = this.genetateReportPostData();
    this.printingPDFStatus = 'running';
    this.linkToPDFReport = '';
    this.http.post('./report', _postdata).subscribe(data => {
      const e: any = data;
      this.linkToPDFReport = './report/' + e.fileName;
      this.printingPDFStatus = 'completed';
    }, err => {
      this.printingPDFStatus = 'error';
      console.log(err);
      this.linkToPDFReport = '';
    });
  }
  public sortByName(a, b) {
    if (a.Company < b.Company) {
      return -1;
    }
    if (a.Company > b.Company) {
      return 1;
    }
    return 0;
  }

  public sortByCompanyName(data) {
    const _postdataxls1 = data.sort(function(a, b) {return (a.Company > b.Company) ? 1 : ((b.Company > a.Company) ? -1 : 0); } );
    const _postdataxls = _postdataxls1.map(function(e, i) {e.Id = i + 1; return e; });
    return _postdataxls;
  }
  public exportDataXLS() {
    const _postdataxls0 = this.sortByCompanyName(this.genetateReportPostData());
    const _postdataxlsFinal = _postdataxls0.map(r => ({
      '': r.Id,
      Company: r.Company,
      County: r.County,
      Address: r.Address,
      Phone1: r.Phone1,
      Phone2: r.Phone2,
      Homepage: r.Homepage,
      Email: r.Email,
      MainIndustryType: r.MainIndustryType,
      SpecificIndustryType: r.SpecificIndustryType,
      SawMillType: r.SawMillType,
      Products: r.Products,
      Species: r.Species
    }));
    this._excelService.exportAsExcelFile(_postdataxlsFinal, 'Forest Products Industries List');
  }
  constructor(public _data: IndustriesGeojson, private http: HttpClient,
    private _excelService: ExcelService, public tourService: TourService
  ) { }

  ngOnInit() {
    this._data.currentData.subscribe(d => {
      this.tableData = d;
    });
    this._data.currentCountyList.subscribe(d => {
      this.counties = d;
    });

    this._data.currentCompanyList.subscribe(d => {
      this.companies = d;
    });

    this._data.currentIndustryTypeList.subscribe(d => {
      this.industrytype = d;
    });

    this._data.currentSpecificIndustryTypeList.subscribe(d => {
      this.specificIndustryType = d;
    });

    this._data.currentSawmillSpecies.subscribe(d => {
      this.sawmillMajorSpecies = d;
    });

    this.tourService.stepShow$.subscribe((res: any) => {
      switch (res.anchorId) {
        case ('sidebar-search'):
          this.sidebarSearchExpanded = true;
          break;
        case ('sidebar-mapsearch'):
          this.sidebarMapSearchExpanded = true;
          break;
        case ('sidebar-mapsearch'):
        this.sidebarMapSearchExpanded = true;
        break;
        case ('mainmap'):
          this.hideSidebarFn();
          break;
      }
    });

  }
}
