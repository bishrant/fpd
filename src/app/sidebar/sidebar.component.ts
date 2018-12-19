import { Component, OnInit, NgModule, ViewEncapsulation, Output, EventEmitter, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { SelectModule, SelectComponent } from 'ng2-select';
import { Injectable } from '@angular/core';
import { Rest, SidebarService } from './sidebar.service';
import { IndustriesGeojson } from '../services/industries-geojson.service';
// import { _CdkTextareaAutosize } from '@angular/material';
import { ReplaySubject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { HttpClient } from '@angular/common/http';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./sidebar.component.scss'],
  providers: [SidebarService]
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

  // public printStatus = '';
  public selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
  // @Output() messageEvent = new EventEmitter<string>();
  @Output() exportButtonClicked = new EventEmitter<string>();
  @Output() spatialControlClicked = new EventEmitter<string>();
  @Output() performSpatialQuery = new EventEmitter<any>();
  @Output() hideSidebarEvent = new EventEmitter<any>();
  public _exportPDFSubject = new ReplaySubject<any>(1);
  public _exportPDFEvent = this._exportPDFSubject.asObservable();
  public activeControl: string;
  public printingPDFStatus = '';
  public linkToPDFReport = '';
  public activeAttributeFilter: string;

  // @ViewChild('companies') public cc: SelectComponent;
  @ViewChildren('companiess') public cc: ElementRef;
  @ViewChild('companiess') public ccc: NgSelectComponent;
  @ViewChild('ngSpecificIndustry') public ngSpecificIndustry: NgSelectComponent;
  @ViewChild('ngCounty') public ngCounty: NgSelectComponent;
  // sendMessage() {
  //   this.messageEvent.emit('btn clicked');
  // }
  hideSidebarFn() {
    this.hideSidebarEvent.next(true);
  }

  getData() {
    this.sidebarService.getInitialRestData()
      .subscribe((data: Rest) => console.log(data));
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
    const reg = new RegExp(selected , 'i');
    // this._data.allDataService.next(this.tableData.filter(f => reg.test(f.properties[attribute])));
    if (attribute === 'maj_spec') {
      this._data.orginalDataObservable.subscribe(d => {
        // reset the data from original data source
        const d1 = d as any[];
        const _specRegex = new RegExp('Sawmill', 'i');
        this._data.allDataService.next(d1.filter(f => selected.toLowerCase() === (f.properties[attribute]).toLowerCase()
        && _specRegex.test(f.properties['SpecificIndustryType']) ));
       // console.log(d1.filter(f => reg.test(f.properties[attribute])));
      });
    } else {
      this._data.orginalDataObservable.subscribe(d => {
        // reset the data from original data source
        const d1 = d as any[];
        this._data.allDataService.next(d1.filter(f => reg.test(f.properties[attribute])));
      });
    }
  }



  public selected(value: any, attribute: string): void {
    this.selectedValues[attribute] = value;
    console.log('Selected value is: ', value, ' of name: ', attribute);
    if (typeof attribute === 'undefined') {
      return;
    } else {
    switch (attribute) {
      case 'MainIndustryType':
        console.log(this.ngSpecificIndustry);
        this.ngSpecificIndustry.items = this.specificIndustryType;
        this.ngSpecificIndustry.clearModel();
        this.ngCounty.clearModel();
        this._data.getDataForSpecificIndustry(value);
        break;
      case 'SpecificIndustryType':
        if (value.toLowerCase === 'sawmill') {
          console.log('show filter by Sawmilltype');
        }
        break;
    }
    this.applyFilter(attribute, value);
  }
  }

  public removed(value: any): void {
    console.log('Removed value is: ', value);
  }

  public typed(value: any): void {
    console.log('New search input: ', value);
  }

  public refreshValue(value: any): void {
    this.value = value;
  }

  public updateItems() {
    this.counties = ['test1', 'test3', 'something else very long'];
  }
  public resetData() {
    console.log('rest', this.ccc, this.cc);
    this.selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
    // //this.ccc.select(null);
    this._data.orginalDataObservable.subscribe(d => {
      // reset the data from original data source
      this._data.allDataService.next(d);
      this._data.featureLoaded(d);

    //  this.ccc.active = [];
    });
  }

  public printMapPDF() {
    this.exportButtonClicked.emit('clickedExport');
    console.log('here');
    // this._exportPDFSubject.next('clicked');
    this._data.printMapSubject.next('clicked');
    //  this._esrimap.executePrint();
    // this._legend.prepareLegend();
  }
  public activateSpatialControl(control: string) {
    this.activeControl = control;
    this.spatialControlClicked.emit(control);
    console.log(control);
    this._data.activeSpataiControl.next(control);
  }
  public clickedSpatialQuery(evt) {
    console.log('active control to do qyuery', this.activeControl);
    this._data.performSpatailQuery.next(this.activeControl);
    // this.performSpatialQuery.emit(this.activeControl);
    // this.spatialControlClicked.emit(this.activeControl);
  }
  public genetateReportPostData(): any {
    const dummy: any = [];
    const _postdata: any = [];
    const _reportFields: string[] = ['Company', 'County', 'Address', 'Phone1', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'Products', 'Species'];
    console.log(this.tableData);
    // console.log(this.)
    this.tableData.forEach(_d => {
      const _partialArray: any = {};
      _reportFields.forEach(_attr => {
        if (_d['properties'].hasOwnProperty(_attr)) {
          _partialArray[_attr] = _d['properties'][_attr];
        }
      });
      _postdata.push(_partialArray);
    });
    console.log(_postdata);
    return _postdata;
  }

  public exportDataPDF() {
    const _postdata = this.genetateReportPostData();
    this.printingPDFStatus = 'running';
    this.linkToPDFReport = '';
    this.http.post('./report', _postdata).subscribe(data => {
      const e: any = data;
      this.linkToPDFReport = './report/' + e.fileName;
      console.log(this.linkToPDFReport);
      this.printingPDFStatus = 'completed';
      // const newWin = this.nativeWindow.open(ur);
      // if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
      //   // POPUP BLOCKED
      //   this.popupVisibility = 'visible';
      //   this.reportUrl = ur;
      // }
    }, err => {
      console.log(err);
      this.printingPDFStatus = 'error';
      this.linkToPDFReport = '';
    });

    this.http.post('http://localhost:5000/test', {name: 'test2'} ).subscribe(d => {
      console.log(d);
    }, e => {
      console.log(e);
    });
  }

  public exportDataXLS() {
    const _postdataxls = this.genetateReportPostData();
    this._excelService.exportAsExcelFile(_postdataxls, 'FPD');
  }
  constructor(private sidebarService: SidebarService, public _data: IndustriesGeojson, private http: HttpClient,
    private _excelService: ExcelService
  ) { }

  ngOnInit() {
    this._data.currentData.subscribe(d => {
      this.tableData = d;
    });
    this._data.currentCountyList.subscribe(d => {
      console.log('got distinct ');
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
      // console.log(d);
      this.sawmillMajorSpecies = d;
    });
  }
}
