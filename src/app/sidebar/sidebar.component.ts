import { Component, OnInit, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { SelectModule } from 'ng2-select';
import { Injectable } from '@angular/core';
import { Rest, SidebarService } from './sidebar.service';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { _CdkTextareaAutosize } from '@angular/material';
import { SpatialsearchComponent } from '../spatialsearch/spatialsearch.component';
import { ReplaySubject } from 'rxjs';

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
  public restUrl = 'https://services5.arcgis.com/ELI1iJkCzTIagHkp/arcgis/rest/services/rwhrtntgr_y54tr/FeatureServer/0/query?returnGeometry=false&outFields=%2A&f=json&where=1=1';
  public value: any = {};
  public _disabledV = '0';
  public disabled = false;
  public tableData;
  public linkToPDFReport = '';
  public printStatus = '';
  // @Output() messageEvent = new EventEmitter<string>();
  @Output() exportButtonClicked = new EventEmitter<string>();
  @Output() spatialControlClicked = new EventEmitter<string>();
  @Output() performSpatialQuery = new EventEmitter<any>();
  public _exportPDFSubject = new ReplaySubject<any>(1);
  public _exportPDFEvent = this._exportPDFSubject.asObservable();
  public activeControl: String;
  public activatedSpatialControl = false;
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
    const reg = new RegExp(selected);
    this._data.allDataService.next(this.tableData.filter(f => reg.test(f.properties[attribute])));
  }

  public selected(value: any, attribute: string): void {
    console.log('Selected value is: ', value.text);
    this.applyFilter(attribute, value.text);
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
  resetData = () => {
    this._data.orginalDataObservable.subscribe(d => {
      // reset the data from original data source
      this._data.allDataService.next(d);
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
  }
}
