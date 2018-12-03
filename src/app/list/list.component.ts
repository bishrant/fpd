import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator, MatSort, MatIcon } from '@angular/material';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit {

  dataSource: ListDataSource;
  public pageLength = 10;
  displayedColumns = ['Id', 'Company'];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  constructor(private _data: IndustriesGeojson) { }

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

loadTable() {
  this.dataSource.loadTable(
    this.sort.direction,
    this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize);
}


private onMouseDown(event) {
  console.log(event);
}


}
