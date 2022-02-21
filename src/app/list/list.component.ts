import { Component, OnInit, ViewChild, AfterViewInit, Output, EventEmitter, Input, ElementRef, Renderer2 } from '@angular/core';
import { ListDataSource } from './list.datasource';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
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
  public rowsPerPage = 10;
  public pageLength = 0;
  public pageSizeOptions = [10, 20, 50];
  public totalRowsFiltered = 0;
  displayedColumns = ['Id', 'Company', 'County', 'MainIndustryType', 'SpecificIndustryType'];
  featureTableClass = 'featureTableMaximized';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('featureTable') featureTableDiv!: ElementRef;
  @Output() zoomIntoRow = new EventEmitter<any>();
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('featureTableContainer') featureTableContainer!: ElementRef;
  constructor(private _data: IndustriesGeojson, public renderer: Renderer2,
    public tourService: TourService,
    private winRef: WindowService) { }

  ngOnInit() {

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
    this.dataSource = new ListDataSource(this._data);
    this.dataSource.loadTable('asc', 'Company', 0, 10);
    this._data.tableDataService.subscribe(f => {
      this.totalRowsFiltered = f.length;
      this.pageLength = f.length;
      this.selectedRowIndex = -99999;
      this.paginator.pageIndex = 0;
      if (this.pageSizeOptions.indexOf(f.length) === -1 && f.length !== 0) {
        this.pageSizeOptions.push(f.length);
        this.paginator.pageSizeOptions = this.pageSizeOptions;
      }
      this.dataSource.loadTable('asc', 'Company', 0, 10);
      this.paginator.length = f.length;
    });
    this._data.totalRowsInTableObservable.subscribe((total) => {
      this.paginator.pageSize = total;
      this.rowsPerPage = total;
    });

    // reset page if sorting is enabled
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0
    });

    setTimeout(() => {
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => {
          this.loadTable();
        })
      )
      .subscribe();
    }, 0);

      this.tourService.stepShow$.subscribe((res: any) => {
        if (res.anchorId === 'industries-list' || res.anchorId === 'mainmap') {
          this.toggleTable();
        }
      });



  }

  getPageLength() {
    return this.pageLength;
  }
 public toggleTable(forceHide = false) {
    const activeCls1 = this.featureTableClass.split(' ')[0];
    if (forceHide) {
      this.featureTableClass = activeCls1 === 'featureTableMaximized' ? 'featureTableMinimized animate' : 'featureTableMaximized animate';
    } else {
      this.featureTableClass = 'featureTableMaximized';
    }
    setTimeout(() => {
      const activeCls = this.featureTableClass.split(' ')[0];
      if (activeCls !== 'featureTableMinimized') {
        this.featureTableClass =  'featureTableMaximized unsetAnimation';
      }
    }, 1000);
  }

  public showTable() {
    this.featureTableClass = 'featureTableMaximized unsetAnimation';
    setTimeout(() => {
      this.featureTableDiv.nativeElement.style.transform = 'none';
    }, 100);
  }

  public hideTable() {
    this.featureTableClass = 'featureTableMinimized animate';
  }

  loadTable() {
    this.dataSource.loadTable(
      this.sort.direction,
      this.sort.active,
      this.paginator.pageIndex,
      this.paginator.pageSize);
      this.selectedRowIndex = -9999;
  }

  loadFullTable(selectedId) {
    this.pageLength = this.totalRowsFiltered ? this.totalRowsFiltered : this._data.totalRows;
    this.dataSource.loadTable(
      this.sort.direction,
      this.sort.active,
      0, this.pageLength);
      this.selectedRowIndex = selectedId;
      this.paginator.pageSize = this.pageLength;
      setTimeout(() => {
        const _selectedRowDiv = this.featureTableContainer.nativeElement.querySelectorAll('.highlight')[0];
        _selectedRowDiv.scrollIntoView(false);
        // _selectedRowDiv.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
      }, 100);

  }

}
