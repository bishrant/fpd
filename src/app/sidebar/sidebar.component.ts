import { Component, OnInit, NgModule, ViewEncapsulation, Output, EventEmitter, ElementRef, ViewChildren, ViewChild } from '@angular/core';
import { SelectModule, SelectComponent } from 'ng2-select';
import { Injectable } from '@angular/core';
import { Rest, SidebarService } from './sidebar.service';
import { IndustriesGeojson } from '../services/industries-geojson.service';
// import { _CdkTextareaAutosize } from '@angular/material';
import { SpatialsearchComponent } from '../spatialsearch/spatialsearch.component';
import { ReplaySubject } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./sidebar.component.scss'],
  providers: [SidebarService, SpatialsearchComponent]
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
  public linkToPDFReport = '';
  public printStatus = '';
  public selectedValues = {'Company': null, 'County': null, 'SpecificIndustryType': null, 'MainIndustryType': null};
  // @Output() messageEvent = new EventEmitter<string>();
  @Output() exportButtonClicked = new EventEmitter<string>();
  @Output() spatialControlClicked = new EventEmitter<string>();
  @Output() performSpatialQuery = new EventEmitter<any>();
  public _exportPDFSubject = new ReplaySubject<any>(1);
  public _exportPDFEvent = this._exportPDFSubject.asObservable();
  public activeControl: String;
  public activatedSpatialControl = false;
  public activeAttributeFilter: String;

  // @ViewChild('companies') public cc: SelectComponent;
  @ViewChildren('companiess') public cc: ElementRef;
  @ViewChild('companiess') public ccc: NgSelectComponent;
  // sendMessage() {
  //   this.messageEvent.emit('btn clicked');
  // }
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

  public applyFilterArray(attribute, listOfValues) {
    const reg = new RegExp(listOfValues.join('|'), 'i'); // i is for ignoring case
      this._data.orginalDataObservable.subscribe(d => {
        // reset the data from original data source
        const d1 = d as any[];
        this._data.allDataService.next(d1.filter(f => reg.test(f.properties[attribute])));
      });
  }

  public selected(value: any, attribute: string): void {
    this.selectedValues[attribute] = value;
    console.log('Selected value is: ', value, ' of name: ', attribute);
    if (typeof attribute === 'undefined') {
      return;
    }
    switch (attribute) {
      case 'MainIndustryType':
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
    this._exportPDFSubject.next('clicked');
    //  this._esrimap.executePrint();
    // this._legend.prepareLegend();
  }
  public activateSpatialControl(control: string) {
    this.activeControl = control;
    this.spatialControlClicked.emit(control);
  }
  public clickedSpatialQuery(evt) {
    console.log('active control to do qyuery', this.activeControl);
    this.performSpatialQuery.emit(this.activeControl);
    // this.spatialControlClicked.emit(this.activeControl);
  }

  constructor(private sidebarService: SidebarService, private _data: IndustriesGeojson,
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
