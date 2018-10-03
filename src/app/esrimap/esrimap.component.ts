
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-esrimap',
  templateUrl: './esrimap.component.html',
  styleUrls: ['./esrimap.component.scss']
})

export class EsrimapComponent implements OnInit {

  // Private vars with default values
  private _zoom = 10;
  private _center = [0.1278, 51.5074];
  private _basemap = 'topo';
  public map: __esri.Map;
  public _p: Promise<boolean>;
  public mapLoaded = new EventEmitter<boolean>();
  public __p = new ReplaySubject<boolean>();

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  public printMap() {
    console.log('print map');
    console.log(this.mapLoaded);
    this.__p.subscribe(d => {
      console.log(d);
    });
    // this._p.then((v) => {
    //   console.log(v);
    // });
  }
  constructor() { }

  public ngOnInit() {
    setTimeout( () => {
    loadModules([
      'esri/Map',
      'esri/views/MapView'
    ])
      .then(([EsriMap, EsriMapView]) => {

        const map = new EsriMap({
          basemap: 'streets'
        });

        const mapView = new EsriMapView({
          container: this.mapViewEl.nativeElement,
          center: [0.1278, 51.5074],
          zoom: 10,
          map: map
        });
        mapView.ui.move('zoom', 'top-right');
      })
      .catch(err => {
        console.error(err);
      }); }, 2000);
  } // ngOnInit

}
