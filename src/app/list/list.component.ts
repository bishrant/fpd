import { Component, OnInit, ViewChild, AfterViewInit, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator, MatSort, MatIcon } from '@angular/material';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExcelService } from '../services/excel.service';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit {
  public isSingleClick = true;
  public selectedRowIndex;
  dataSource: ListDataSource;
  public pageLength = 10;
  displayedColumns = ['Id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];
  featureTableClass = 'featureTableMaximized';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() zoomIntoRow = new EventEmitter<any>();
  @ViewChild(MatSort) sort: MatSort;
  // @ViewChild('featureTable') featureTable: ElementRef;
  constructor(private _data: IndustriesGeojson, private _excelService: ExcelService, private winRef: WindowService) { }

  ngOnInit() {
    this.dataSource = new ListDataSource(this._data, this.paginator, this.sort);
    this.dataSource.loadTable('asc', 'Id', 0, 10);
    // this.paginator.length = this.dataSource.length;
    this._data.tableDataService.subscribe(f => {
      this.pageLength = f.length;
      this.paginator.pageIndex = 0;
      this.dataSource.loadTable('asc', 'Id', 0, 10);
      console.log(this.pageLength);
    });
  }

  public selectRow(row) {
    this.isSingleClick = true;
    setTimeout(() => {
      if (this.isSingleClick) {
        console.log(row);
        this._data.selectedRowService.next(row);
        this.selectedRowIndex = row.Id;
        this.zoomIntoRow.emit({industryId: this.selectedRowIndex, isSingleClick: true});
      }
    }, 250);
  }
  public doubleClick(evt, row) {
    console.log(evt, row);
    this.isSingleClick = false;
    this.selectedRowIndex = row.Id;
    console.log(row.Id);
    this.zoomIntoRow.emit({industryId: this.selectedRowIndex, isSingleClick: false});
    evt.stopPropagation();
  }
  public openUrl(url: any) {
    console.log(233);
    const _x = this.winRef.getNativeWindow();
    _x.open(url);
  }

  ngAfterViewInit() {
    // reset page if sorting is enabled
    this.sort.sortChange.subscribe(() => {
      console.log(this.sort.direction);
      console.log(this.sort.active);
    });

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadTable();
          console.log(this.sort.direction);
          console.log(this.paginator);
        })
      )
      .subscribe();

  }

  getPageLength() {
    return this.pageLength;
  }
  toggleTable(evt) {
    console.log(this.featureTableClass);
    const activeCls1 = this.featureTableClass.split(' ')[0];
    this.featureTableClass = activeCls1 === 'featureTableMaximized' ? 'featureTableMinimized animate' : 'featureTableMaximized animate';
    setTimeout(() => {
      const activeCls = this.featureTableClass.split(' ')[0];
      if (activeCls !== 'featureTableMinimized') {
        this.featureTableClass =  'featureTableMaximized unsetAnimation';
      } else {

      }
      // this.featureTableClass = 'featureTableMinimized';
      console.log('time');
    }, 1000);
    // console.log(this.featureTable);
    // this.renderer.setStyle(this.featureTable.nativeElement, 'transform', 'translate3d(0px, 0px, 0px);');
  }
  loadTable() {
    this.dataSource.loadTable(
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize);
  }
  public exportAsExcel(evt) {
    console.log(evt);
    const y = this.genetateReportPostData();
    this._excelService.exportAsExcelFile(y, 'FPD');
  }

  public genetateReportPostData(): any {
    const _postdata: any = [];
    const _reportFields: string[] = ['Company', 'County', 'Address', 'Phone1', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'Products', 'Species'];
    console.log(this._data.currentTableData);
    this._data.currentTableData.forEach(_d => {
      const _partialArray: any = {};
      _reportFields.forEach(_attr => {
        _partialArray[_attr] = _d[_attr];
      });
      _postdata.push(_partialArray);
    });
    return _postdata;
  }

}
