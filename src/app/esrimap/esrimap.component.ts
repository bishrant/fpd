
import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import { ReplaySubject } from 'rxjs';
import { SidebarComponent } from '../sidebar/sidebar.component';
import * as vars from './variables';
import * as fn from './utilityFunctions';
import esri = __esri;
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { PrintLegendDirective } from '../directives/print-legend.directive';

@Component({
  selector: 'app-esrimap',
  templateUrl: './esrimap.component.html',
  styleUrls: ['./esrimap.component.scss'],
  providers: [PrintLegendDirective]

})

export class EsrimapComponent implements OnInit {

  // map vars with default values
  public title = 'fa-chevron-left';
  public sc = 'fa-chevron-left';
  public slidestatus = 'slideIn';
  public displayslidebtn = 'nodisplay';

  mapView: esri.MapView;
  map: esri.Map;
  public industriesGraphicsLayer: esri.GraphicsLayer;
  public allIndustries: any = [];
  public mapLoaded = new EventEmitter<boolean>();
  public __mapViewStatus = new ReplaySubject<boolean>();
  public printTask: esri.PrintTask;
  public printParams: esri.PrintParameters;
  public printTemplate: esri.PrintTemplate;

  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @ViewChild(SidebarComponent) private sideBar: SidebarComponent;

  public addGraphicsToMap;

  public printMap() {
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        console.log('print this map');
        this.sideBar.printStatus = '';
        this.sideBar.linkToPDFReport = '';
        const _legendBase64 = this._legendDirective.prepareLegend();
        console.log(_legendBase64);
        this.printParams.extraParameters = {Primary_Legend: _legendBase64.primaryLegend, Secondary_Legend: _legendBase64.secondaryLegend};
        this.printParams.set('Primary_Legend', _legendBase64.primaryLegend);
        const printTaskExecuted = this.printTask.execute(this.printParams);
        this.sideBar.printStatus = 'running';
        printTaskExecuted.then((result) => {
          this.sideBar.printStatus = 'completed';
          console.log(result['url']);
          this.sideBar.linkToPDFReport = result['url'];

        }, (error) => {
          this.sideBar.printStatus = 'error';
          console.log(error);
        });
      }
    });
  }
  public activateSpatialControl(control: any) {
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        console.log('activate this control', control);
      }
    });
  }
  constructor(private _data: IndustriesGeojson, private _legendDirective: PrintLegendDirective) { }

  public ngOnInit() {
    setTimeout(() => {
      return loadModules([
        'esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer',
        'esri/geometry/geometryEngine', 'esri/views/ui/DefaultUI',
        'esri/layers/GraphicsLayer', 'esri/layers/MapImageLayer',
        'esri/Graphic', 'esri/geometry/Point', 'esri/tasks/PrintTask',
        'esri/tasks/support/PrintTemplate', 'esri/tasks/support/PrintParameters',
        'esri/widgets/BasemapToggle', 'dojo/domReady!'
      ])
        .then(([EsriMap, EsriMapView, FeatureLayer, geometryEngine, DefaultUI, GraphicsLayer, MapImageLayer,
          Graphic, Point, PrintTask, PrintTemplate, PrintParameters, BasemapToggle]) => {
            // create a boilerplate graphics layer for adding industries points later on
          this.industriesGraphicsLayer = new GraphicsLayer();
          this.map = new EsriMap({
            basemap: vars._basemap,
            layers: [this.industriesGraphicsLayer]
          });

          const _mapViewProperties = {
            container: this.mapViewEl.nativeElement,
            center: vars._center,
            zoom: vars._zoom,
            map: this.map
          };
          this.addGraphicsToMap = () => {
            this._data.currentData.subscribe(d => {
              this.allIndustries = d;
              console.log(d);
              const e = new Graphic();
              this.industriesGraphicsLayer.removeAll();
              const graphicsArray: Array<any> = [];
              console.time('adding graphics intially');
              this.allIndustries.forEach(_industry => {
                const _industryPt = new Point({ longitude: _industry.geometry.coordinates[0], latitude: _industry.geometry.coordinates[1], spatialReference: { wkid: 4326 } });
                const _industryGraphic = new Graphic({
                  geometry: _industryPt,
                  symbol: fn.getSymbol(_industry.properties),
                  attributes: _industry.properties,
                  popupTemplate: { title: '{Company}', content: '{Company}<br>County: {County}' }
                });
                graphicsArray.push(_industryGraphic);
              });
              // add them to the map
              this.industriesGraphicsLayer.addMany(graphicsArray);
              this.mapView.goTo(graphicsArray).then(function () {
                console.log(this.mapView.scale);
                this.mapView.scale = this.mapView.scale * 0.5;
              });
              console.timeEnd('adding graphics intially');
            });
          };
          this.mapView = new EsriMapView(_mapViewProperties);
          this.mapView.ui.move('zoom', 'top-right');
          this.printTask = new PrintTask({
            url: 'http://128.194.232.177/arcgis/rest/services/FPD/ExportToPDF/GPServer/ExportToPDF'
          });
          this.printTemplate = new PrintTemplate({
            format: 'pdf',
            exportOptions: {dpi: 300},
            layout: 'a4-portrait'
          });
          this.printParams = new PrintParameters({
            view: this.mapView,
            template: this.printTemplate
          });
          this.mapView.when(() => {
            this.__mapViewStatus.next(true);
            this.addGraphicsToMap();
          }, (err) => {
            this.__mapViewStatus.next(false);
            console.log(err);
          });
        })
        .catch(err => {
          console.error(err);
        });
    }, 2000);
  } // ngOnInit

}
