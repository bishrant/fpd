// import { DataSource } from '@angular/cdk/collections';
// import {MatPaginator, MatSort} from '@angular/material';
// import { OnInit } from '@angular/core';
// import { IndustriesGeojson } from '../services/industries-geojson.service';
// import { map } from 'rxjs/operators';
// import { Observable, of as ObservableOf, merge} from 'rxjs';




// export class FeatureTableDataSource extends DataSource<FeatureTemplate> implements OnInit {
//     // data:
//     featuredataSource: FeatureTemplate[];
//     constructor (private _data: IndustriesGeojson, private paginator: MatPaginator, private sort: MatSort) {
//         super();
//     }

//     connect(): Observable<FeatureTemplate[]> {
//         const dataMutations = [
//             ObservableOf(this.featuredataSource),
//             this.paginator.page
//         ];
//         this.paginator.length = this.featuredataSource.length;
//         return merge(...dataMutations).pipe(map(() => {
//             return this.getPagedData(([...this.featuredataSource]));
//         }));
//         // return this.featuredataSource;
//     }
//     disconnect() {}

//     private getPagedData(data: FeatureTemplate[]) {
//         const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
//         return data.splice(startIndex, this.paginator.pageSize);
//       }

//     ngOnInit() {
//         this._data.currentData.subscribe(d => {
//             console.log('got this in filter tbale');
//             console.log(d);
//             this.featuredataSource = d;
//           });
//     }
// }
import { DataSource, CollectionViewer } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Observable, of, merge } from 'rxjs';
// import {Observable} from 'rxjs';
// import 'rxjs/add/observable/merge';
// import { merge } from 'rxjs/observable/merge';
// import 'rxjs/add/operator/merge';

import { IndustriesGeojson } from '../services/industries-geojson.service';
import { OnInit } from '@angular/core';

// TODO: Replace this with your own data model type
export interface DataTableItem {
  name: string;
  id: number;
}
export interface FeatureTemplate {
  type: string;
  id: number;
  geometry: object;
  properties: object;
}

export interface TableTemplate {
  id: number;
  // Company: string;
}

/**
 * Data source for the DataTable view. This class should
 * encapsulate all logic for fetching and manipulating the displayed data
 * (including sorting, pagination, and filtering).
 */
export class FeatureTableDataSource extends DataSource<any> {
  //   data: DataTableItem[] = EXAMPLE_DATA;
  data: any[] = [];
  constructor(private _data: IndustriesGeojson, private paginator: MatPaginator, private sort: MatSort) {
    super();
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    console.log(this._data.tableDataService);
    const dataMutations = [
      this._data.tableDataService,
      this.paginator.page,
      this.sort.sortChange
    ];
    // Set the paginator's length
    this.paginator.length = 300;
    const j = merge(...dataMutations).pipe(map(() => {
      console.log(...this.data);
      console.log(this._data.tableDataService);
      // return this.getPagedData([...this._data.tableDataService]);
      // return 0;
    }));
    console.log(j);
    // let j = Observable.merge(...dataMutations).map(() => {

    // })

    return this._data.tableDataService.asObservable();
  }

  // connect(): Observable<any[]> {
  //   // Combine everything that affects the rendered data into one update
  //   // stream for the data-table to consume.
  //  console.log(this.data, this._data.currentTableData);
  //   return this._data.currentTableData;
  // let subject = new Subject();
  // this._data.currentData.subscribe(d => {
  //     console.log('got this in filter tbale');
  //     console.log(d);
  //     this.data = d;


  //   return merge(...dataMutations).pipe(map(() => {
  //       console.log(this.getPagedData(this.getSortedData([...this.data])));
  //     return this.getPagedData(this.getSortedData([...this.data]));
  //   }));
  //   });
  //   return subject;
  // }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() { }

  findTableData(pageNumber = 0, pageSize = 3) {
    const e = this._data.currentTableData.splice(pageNumber, pageSize);
    console.log(e);
    this._data.tableDataService.next(e);
   // return this._data.tableDataService.asObservable();
  }

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  // private getPagedData(data: any[]) {
  //   const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  //   const splicedData = data.splice(startIndex, this.paginator.pageSize);
  //   console.log(splicedData);
  //   return splicedData;
  // }

  // /**
  //  * Sort the data (client-side). If you're using server-side sorting,
  //  * this would be replaced by requesting the appropriate data from the server.
  //  */
  // private getSortedData(data: any[]) {
  //   if (!this.sort.active || this.sort.direction === '') {
  //     return data;
  //   }

  //   return data.sort((a, b) => {
  //     const isAsc = this.sort.direction === 'asc';
  //     switch (this.sort.active) {
  //       // case 'name': return compare(a.name, b.name, isAsc);
  //       case 'id': return compare(+a.id, +b.id, isAsc);
  //       default: return 0;
  //     }
  //   });
  // }

}

// /** Simple sort comparator for example ID/Name columns (for client-side sorting). */
// function compare(a, b, isAsc) {
//   return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
// }
