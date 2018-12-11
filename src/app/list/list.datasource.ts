import {CollectionViewer, DataSource} from '@angular/cdk/collections';
import { Observable, BehaviorSubject } from 'rxjs';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { MatPaginator, MatSort } from '@angular/material';

export class ListDataSource implements DataSource<any> {

    public listSubject = new BehaviorSubject<any[]>([]);
    constructor(private _data: IndustriesGeojson, private paginator: MatPaginator, private sort: MatSort) { }

    loadTable(sort: string, sortField: string, pageIndex: number, pageSize: number) {
       return this._data.getPagedData(sort, sortField, pageIndex, pageSize)
        .pipe()
        .subscribe(d => {this.listSubject.next(d);
        console.log(d);
        });
    }

    connect(): Observable<any[]> {
        console.log('Connecting data source');
        return this.listSubject.asObservable();
    }

    disconnect(): void {
        this.listSubject.complete();
    }

}
