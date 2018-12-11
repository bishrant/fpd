import { MatSortModule, MatSort  } from '@angular/material';
import { AfterViewInit, Component, OnInit, ElementRef, NgModule, ViewChild} from '@angular/core';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { MatPaginator, MatTableModule, MatPaginatorModule } from '@angular/material';
import { AngularDraggableModule } from 'angular2-draggable';
import { HttpClient } from '@angular/common/http';
import { WindowService } from '../services/window.service';
import { ExcelService } from '../services/excel.service';
import { FormsModule } from '@angular/forms';
import { FeatureTableDataSource } from './featuretable-datasource';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {tap, map} from 'rxjs/operators';
import { merge } from 'rxjs';

@NgModule({
  imports: [
    MatSort,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClient,
    AngularDraggableModule,
    FormsModule
  ],
  providers: [HttpClient]
})
@Component({
  selector: 'app-featuretable',
  templateUrl: './featuretable.component.html',
  styleUrls: ['./featuretable.component.scss']
})

export class FeaturetableComponent implements OnInit, AfterViewInit {
  public isSingleClick = true;
  public selectedRowIndex;
  featuredataSource: FeatureTableDataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  // @ViewChild('input') input: ElementRef;
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
  // displayedColumns = ['id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];
  displayedColumns = ['Id', 'Company'];
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
    const _x = this.winRef.getNativeWindow();
    _x.open(url);
  }



  public genetateReportPostData(): any {
    const dummy: any = [];
    const _postdata: any = [];
    const _reportFields: string[] = ['Company', 'County', 'Address', 'Phone1', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'Products', 'Species'];
    // console.log(this.)
    // this.featuredataSource.forEach(_d => {
    //   const _partialArray: any = {};
    //   _reportFields.forEach(_attr => {
    //     if (_d['properties'].hasOwnProperty(_attr)) {
    //       _partialArray[_attr] = _d['properties'][_attr];
    //     }
    //   });
    //   _postdata.push(_partialArray);
    // });
    // return [];
    // return _postdata;
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


  constructor(private _data: IndustriesGeojson, private http: HttpClient,
    private _excelService: ExcelService, private winRef: WindowService
  ) {
    this.nativeWindow = winRef.getNativeWindow();
  }
  ngOnInit() {
    // this.featuredataSource = [{type: 'Feature', id: 1, geometry: {type: 'Point', coordinates: [1, 2]},
    // properties: {Id: 123, Company: 'Dummy', County: 'Blanco', MainIndustryType: 'Primary', SpecificIndustryType: 'dummy'}}];
    // this._data.currentData.subscribe(d => {
    //   console.log('got this in filter tbale');
    //   console.log(d);
    //   this.featuredataSource = d;
    // });
    console.log(this.paginator);
   this.featuredataSource = new FeatureTableDataSource(this._data, this.paginator, this.sort);
   this.featuredataSource.findTableData(0, 3);
  }

    ngAfterViewInit() {
      console.log(1);
      this.paginator.page.subscribe(p => {
        console.log(p);
      });
      merge(this.paginator)
      .pipe(
          tap(() => {
          console.log(this.paginator);
          })
      );

    }

}
