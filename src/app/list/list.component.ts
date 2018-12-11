import { Component, OnInit, ViewChild, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator, MatSort, MatIcon } from '@angular/material';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExcelService } from '../services/excel.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit {

  dataSource: ListDataSource;
  public pageLength = 10;
  displayedColumns = ['Id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;
  // @ViewChild('featureTable') featureTable: ElementRef;
  constructor(private _data: IndustriesGeojson, private _excelService: ExcelService,) { }

  ngOnInit() {
    this.dataSource = new ListDataSource(this._data);
    this.dataSource.loadTable('asc', 'Id', 0, 10);
   // this.paginator.length = this.dataSource.length;
   this._data.tableDataService.subscribe(f => {
    this.pageLength = f.length;
    this.paginator.pageIndex = 0;
    this.dataSource.loadTable('asc', 'Id', 0, 10);
  });
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
dockTable() {
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
public exportAsExcel(evt){
  console.log(evt);
  const y = this.genetateReportPostData();
  this._excelService.exportAsExcelFile(y, 'FPD');
}

public genetateReportPostData(): any {
  const dummy: any = [];
  const _postdata: any = [];
  const _reportFields: string[] = ['Company', 'County', 'Address', 'Phone1', 'Homepage', 'Email', 'MainIndustryType', 'SpecificIndustryType', 'Products', 'Species'];
  console.log(this._data.currentTableData);
  this._data.currentTableData.forEach(_d => {
    const _partialArray: any = {};
    _reportFields.forEach(_attr => {
    //  if (_d['properties'].hasOwnProperty(_attr)) {
        _partialArray[_attr] = _d[_attr];
  //    }
    });
    _postdata.push(_partialArray);
  });
  console.log(_postdata);
  // return [];
  return _postdata;
}

private onMouseDown(event) {
  console.log(event);
}


}
