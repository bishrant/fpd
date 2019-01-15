import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator, MatSort } from '@angular/material';
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
  public pageSizeOptions = [10, 20, 50];
  displayedColumns = ['Id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];
  featureTableClass = 'featureTableMaximized';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() zoomIntoRow = new EventEmitter<any>();
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _data: IndustriesGeojson, private _excelService: ExcelService, private winRef: WindowService) { }

  ngOnInit() {
    this.dataSource = new ListDataSource(this._data);
    this.dataSource.loadTable('asc', 'Id', 0, 10);
    this._data.tableDataService.subscribe(f => {
      this.pageLength = f.length;
      this.selectedRowIndex = -99999;
      this.paginator.pageIndex = 0;
      if (this.pageSizeOptions.indexOf(f.length) === -1 && f.length !== 0) {
        this.pageSizeOptions.push(f.length);
        this.paginator.pageSizeOptions = this.pageSizeOptions;
      }
      this.dataSource.loadTable('asc', 'Id', 0, 10);
      this.paginator.length = f.length;
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
    this.isSingleClick = false;
    this.selectedRowIndex = row.Id;
    this.zoomIntoRow.emit({industryId: this.selectedRowIndex, isSingleClick: false});
    evt.stopPropagation();
  }
  public openUrl(url: any) {
    const _x = this.winRef.getNativeWindow();
    _x.open(url);
  }

  ngAfterViewInit() {
    // reset page if sorting is enabled
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
  toggleTable() {
    const activeCls1 = this.featureTableClass.split(' ')[0];
    this.featureTableClass = activeCls1 === 'featureTableMaximized' ? 'featureTableMinimized animate' : 'featureTableMaximized animate';
    setTimeout(() => {
      const activeCls = this.featureTableClass.split(' ')[0];
      if (activeCls !== 'featureTableMinimized') {
        this.featureTableClass =  'featureTableMaximized unsetAnimation';
      } else {

      }
    }, 1000);
  }
  loadTable() {
    this.dataSource.loadTable(
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize);
      this.selectedRowIndex = -9999;
  }
  public exportAsExcel(evt) {
    console.log(evt);
    const y = this.genetateReportPostData();
    this._excelService.exportAsExcelFile(y, 'FPD');
  }

  public genetateReportPostData(): any {
    const _postdata: any = [];
    const _reportFields: string[] = ['Id', 'Company', 'County', 'Address', 'Phone1', 'Phone2', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'SawMillType', 'Products', 'Species', 'Status', 'City', 'Lat', 'Lon'];
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
