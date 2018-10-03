import { Component, OnInit, ViewChild, NgModule, EventEmitter, Output, Injectable } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { MatTableModule, MatPaginatorModule, MatSortModule } from '@angular/material';
import { AngularDraggableModule } from 'angular2-draggable';
import { HttpClient } from '@angular/common/http';
// import { WindowService } from '../services/window.service';
import { ExcelService } from '../services/excel.service';

@NgModule({
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    HttpClient,
    AngularDraggableModule
  ],
  providers: [HttpClient]
})
@Component({
  selector: 'app-featuretable',
  templateUrl: './featuretable.component.html',
  styleUrls: ['./featuretable.component.scss']
})

export class FeaturetableComponent implements OnInit {
  public isSingleClick = true;
  public selectedRowIndex;
  featuredataSource: any;
  nativeWindow: any;
  public popupVisibility: any = 'invisible';
  public reportUrl = '#';
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['id', 'Company', 'County', 'Prim_secon', 'Industry_t'];
  public selectRow(row) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        console.log(row);
        this._data.selectedRowService.next(row);
        this.selectedRowIndex = row.id;
      }
    }, 250);
  }
  public doubleClick(evt, row) {
    this.isSingleClick = false;
    this.selectedRowIndex = row.id;
    evt.stopPropagation();
  }
  public openUrl(url: any) {
    console.log(233);
    // const _x = this.winRef.getNativeWindow();
    // _x.open(url);
  }



  public genetateReportPostData(): any {
    const dummy: any = [];
    const _postdata: any = [];
    const _reportFields: string[] = ['Company', 'County', 'Address', 'Phone1', 'Homepage', 'Email', 'Prim_secon', 'Industry_t', 'PRODUCTS', 'SPECIES'];
    this.featuredataSource.forEach(_d => {
      const _partialArray: any = {};
      _reportFields.forEach(_attr => {
        if (_d['properties'].hasOwnProperty(_attr)) {
          _partialArray[_attr] = _d['properties'][_attr];
        }
      });
      _postdata.push(_partialArray);
    });
    return _postdata;
  }

  public exportToExcel(event) {
    const y = this.genetateReportPostData();
    console.log(y);
    this._excelService.exportAsExcelFile(y, 'tes');
  }

  public export(event) {
    const _postdata = this.genetateReportPostData();
    this.http.post('https://localhost:44327/postJson', _postdata).subscribe(data => {
      const e: any = data;
      const ur = 'https://localhost:44327/report/' + e.fileName;
      const newWin = this.nativeWindow.open(ur);
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // POPUP BLOCKED
        this.popupVisibility = 'visible';
        this.reportUrl = ur;
      }
    });
  }

  public applyFilter(d) {
    // console.log(d);
    const re = new RegExp('12');
    //  console.log(d.filter(ff => ff.id > 445 && ff.properties.Id < 40 && re.test(ff.properties.ARC_Street)));
  }
  constructor(private _data: IndustriesGeojson, private http: HttpClient,
    private _excelService: ExcelService,
  ) {
    // this.nativeWindow = winRef.getNativeWindow();
  }
  ngOnInit() {
    this._data.currentData.subscribe(d => {
      console.log('got this in filter tbale');
      this.featuredataSource = d;
      this.applyFilter(d);
    });
  }

}
