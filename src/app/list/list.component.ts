import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter, Input } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator, MatSort } from '@angular/material';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { merge } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WindowService } from '../services/window.service';
import { TourService } from 'ngx-tour-core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, AfterViewInit {
  public isSingleClick = true;
  @Input() public selectedRowIndex = -9999;
  dataSource: ListDataSource;
  public pageLength = 10;
  public pageSizeOptions = [10, 20, 50];
  displayedColumns = ['Id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];
  featureTableClass = 'featureTableMaximized';
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Output() zoomIntoRow = new EventEmitter<any>();
  @ViewChild(MatSort) sort: MatSort;
  constructor(private _data: IndustriesGeojson,
    public tourService: TourService,
    private winRef: WindowService) { }

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
        })
      )
      .subscribe();

      this.tourService.stepShow$.subscribe((res: any) => {
        if (res.anchorId === 'industries-list') {
          this.toggleTable();
        } else if (res.anchorId === 'mainmap') {
          this.toggleTable();
        }
      });

  }

  getPageLength() {
    return this.pageLength;
  }
 public toggleTable() {
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

}
