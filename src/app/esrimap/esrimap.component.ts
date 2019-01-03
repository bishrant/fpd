
import { Component, OnInit, ViewChild, ElementRef, EventEmitter } from '@angular/core';
import { loadModules } from 'esri-loader';
import { ReplaySubject } from 'rxjs';
import * as vars from './variables';
import * as fn from './utilityFunctions';
import esri = __esri;
import { IndustriesGeojson } from '../services/industries-geojson.service';
import { PrintLegendDirective } from '../directives/print-legend.directive';
import { PointincountyService } from '../services/pointincounty.service';
import { DatafiltersService } from '../services/datafilters.service';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-esrimap',
  templateUrl: './esrimap.component.html',
  styleUrls: ['./esrimap.component.scss'],
  providers: [PrintLegendDirective]

})

export class EsrimapComponent implements OnInit {
  public slideStatus = 'slideIn';
  public slideOpen = true;
  public displayslidebtn = 'nodisplay';
  public basemapWidgetVisible = false;
  public basemapWidgetClass = 'basemapToggleHidden';
  mapView: esri.MapView;
  map: esri.Map;
  public industriesGraphicsLayer: esri.GraphicsLayer;
  public allIndustries: any = [];
  public mapLoaded = new EventEmitter<boolean>();
  public __mapViewStatus = new ReplaySubject<boolean>();
  public __sketchStatus = new ReplaySubject<boolean>();
  public printTask: esri.PrintTask;
  public printParams: esri.PrintParameters;
  public printTemplate: esri.PrintTemplate;
  public selectFeaturesByGeom;
  public performSpatialQuery;
  public addVertices;
  public action;
  public createGraphic;
  public drawLine;
  public editGraphic;
  public sketchViewModel: esri.SketchViewModel;
  public setupSketchViewModel;
  public graphicsLayer: esri.GraphicsLayer;
  public tempGraphicsLayer: esri.GraphicsLayer;
  public circleGraphicsLayer: esri.GraphicsLayer;
  public addGraphic;
  public clearDrawGraphics;
  public draw: esri.Draw;
  public updateGraphic;
  public completeGraphicsForCircle;
  public updateGraphicTemp;
  public setupClickHandler;
  public touchEnabledDisplay = 'ontouchstart' in document.documentElement;
  public activatedSpatialControl = false;
  public drawToolActive = false;
  public drawInstructions = '';
  public _tempZoomPt;
  public mapBusy = false;
  public Instructions = {
    circle: 'Click on the map, hold and drag your mouse cursor. Click to complete the circle.',
    polygon: 'Click to add  points to the polygon. Double click to complete.',
    rectangle: 'Click hold and drag to draw a rectangle.',
    multipoint: 'Click to select one or more counties. Double click to complete.',
    clear: ''
  };
  public nativeWindow: any;
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;

  public addGraphicsToMap;

  public toggleBasemaps() {
    this.basemapWidgetVisible = this.basemapWidgetVisible ? false : true;
    this.basemapWidgetClass = this.basemapWidgetVisible ? 'basemapToggleVisible' : 'basemapToggleHidden';
  }

  public onShowHideSideNav() {
    this.slideStatus = (this.slideOpen === true) ? 'slideOut' : 'slideIn';
    this.slideOpen = (this.slideOpen === true) ? false : true;
    this.displayslidebtn = (this.displayslidebtn === 'nodisplay') ? 'blockdisplay' : 'nodisplay';
  }
  public printMap() {
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        this._data.printStatus = '';
        this._data.linkToPDFReport = '';
        const _legendBase64 = this._legendDirective.prepareLegend();
        console.log(_legendBase64);
        this.printParams.extraParameters = { Primary_Legend: _legendBase64.primaryLegend, Secondary_Legend: _legendBase64.secondaryLegend };
        this.printParams.set('Primary_Legend', _legendBase64.primaryLegend);
        const printTaskExecuted = this.printTask.execute(this.printParams);
        this._data.printStatus = 'running';
        printTaskExecuted.then((result) => {
          this._data.printStatus = 'completed';
          console.log(result['url']);
          this._data.linkToPDFReport = result['url'];

        }, (error) => {
          this._data.printStatus = 'error';
          console.log(error);
        });
      }
    });
  }

  public zoomIntoRowMap(evt) {
    const industryId = evt.industryId;
    const isSingleClick = evt.isSingleClick;
    // just open popup and pan if single click, otherwise zoom into it
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        const iii = this.allIndustries.filter(__i => __i.properties.Id === industryId)[0];
        this.industriesGraphicsLayer.when(() => {
          let ind: any;
          this.industriesGraphicsLayer.graphics.forEach(_i => {
            if (_i.attributes.Id === industryId) {
              ind = _i;
            }
          });
          this._tempZoomPt.x = iii.geometry.coordinates[0];
          this._tempZoomPt.y = iii.geometry.coordinates[1];
          if (!isSingleClick) {
            this.mapView.goTo({ center: iii.geometry.coordinates, zoom: 13 });
          }
          this.mapView.popup.open({
            location: this._tempZoomPt,
            features: [ind]
          });
        },
          (err) => console.log('load failed', err));
      }
    });
  }

  public activateSpatialControl(control: any) {
    this.drawToolActive = true;
    this.mapBusy = true;
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        if (['polygon', 'multipoint', 'rectangle', 'circle'].indexOf(control) !== -1) {
          if (control === 'multipoint') {
            // clear graphics for county selection
            this.clearDrawGraphics(true);
            this.drawInstructions = this.Instructions[control];
            this.mapBusy = false;
          } else {
            this.clearDrawGraphics(false);
            this.drawInstructions = this.Instructions[control];
            this.mapBusy = false;
          }
          this.__sketchStatus.subscribe(_sketchStatus => {
            if (_sketchStatus) {
              this.sketchViewModel.create(control);
            }
          });

        } else {
          this.clearDrawGraphics(true);
          this.drawInstructions = this.Instructions[control];
          this.mapBusy = false;
        }
      }
    });
  }
  constructor(private _data: IndustriesGeojson, private _legendDirective: PrintLegendDirective,
    private winRef: WindowService,
    private pointInCountyService: PointincountyService, private dataFilterService: DatafiltersService) {
    this.nativeWindow = this.winRef.getNativeWindow();
  }

  public ngOnInit() {

    this._data.activeSpatialControlObservable.subscribe(control => {
      console.log('activated this control ', control);
      this.activateSpatialControl(control);
    });

    // subscribe to perform query button click from sidebar
    this._data.performSpatialQueryObservable.subscribe(control => {
      this.drawToolActive = false;
      this.performSpatialQuery(control);
    });

    this._data.printMapObservable.subscribe(() => {
      this.printMap();
    });

    setTimeout(() => {
      return loadModules([
        'esri/Map', 'esri/views/MapView',
        'esri/layers/MapImageLayer',
        'esri/views/2d/draw/Draw', 'esri/widgets/Home',
        'esri/widgets/Sketch/SketchViewModel', 'esri/geometry/SpatialReference', 'esri/geometry/Extent',
        'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/tasks/PrintTask',
        'esri/tasks/support/PrintTemplate', 'esri/tasks/support/PrintParameters', 'esri/widgets/BasemapGallery',
        'dojo/domReady!'
      ])
        .then(([EsriMap, EsriMapView, MapImageLayer, Draw, Home,
          SketchViewModel, SpatialReference, Extent, Graphic, GraphicsLayer,
          Point, PrintTask, PrintTemplate, PrintParameters, BasemapGallery]) => {
          // create a boilerplate graphics layer for adding industries points later on
          this.industriesGraphicsLayer = new GraphicsLayer();
          this.graphicsLayer = new GraphicsLayer({ id: 'userGraphicsLayer' });
          this.circleGraphicsLayer = new GraphicsLayer({ id: 'circleGraphicsLayer' });
          this.tempGraphicsLayer = new GraphicsLayer({ id: 'tempGraphicsLayer' });

          const countyLayer = new MapImageLayer({ url: 'https://tfsgis-dfe02.tfs.tamu.edu/arcgis/rest/services/FPD/fpd2/MapServer' });
          this.map = new EsriMap({
            basemap: vars._basemap,
            layers: [countyLayer, this.industriesGraphicsLayer, this.graphicsLayer],
            spatialReference: new SpatialReference({ wkid: 4326 })
          });

          // set a empty point geometry for zoom in later
          this._tempZoomPt = new Point({x: 0, y: 0, spatialReference: { wkid: 4326 }
          });
          const fullExtent = new Extent({ xmin: -106.645646, ymin: 25.837377, xmax: -93.508292, ymax: 36.500704 }).expand(1.2);
          const _mapViewProperties = {
            container: this.mapViewEl.nativeElement,
            extent: fullExtent,
            map: this.map,
            constraints: {
              snapToZoom: false
            },
            popup: {
              dockEnabled: false,
              dockOptions: {
                // Disables the dock button from the popup and default breakpoints for responsive docking
                buttonEnabled: true,
                breakpoint: false,
                position: 'top-center'
              }
            },
          };
          this.addGraphicsToMap = () => {
            this._data.currentData.subscribe(d => {
              this.allIndustries = d;
              this.industriesGraphicsLayer.removeAll();
              const graphicsArray: Array<any> = [];
              this.allIndustries.forEach(_industry => {
                const _industryPt = new Point({ longitude: _industry.geometry.coordinates[0], latitude: _industry.geometry.coordinates[1], spatialReference: { wkid: 4326 } });
                const _industryGraphic = new Graphic({
                  geometry: _industryPt,
                  symbol: fn.getSymbol(_industry.properties),
                  attributes: _industry.properties,
                  popupTemplate: vars.industriesPopupTemplate
                });
                graphicsArray.push(_industryGraphic);
              });
              // add them to the map
              this.industriesGraphicsLayer.addMany(graphicsArray);
              if (typeof (this.graphicsLayer) !== 'undefined' || typeof (this.circleGraphicsLayer) !== 'undefined') {
                if (this.circleGraphicsLayer.graphics.length > 0) {
                  const ext = this.circleGraphicsLayer.graphics.getItemAt(0).geometry.extent;
                  const cloneExt = ext.clone();
                  this.mapView.extent = cloneExt.expand(1.5);
                } else if (this.graphicsLayer.graphics.length > 0) {
                  const ext = this.graphicsLayer.graphics.getItemAt(0).geometry.extent;
                  const cloneExt = ext.clone();
                  this.mapView.extent = cloneExt.expand(1.5);
                } else {
                  this.mapView.goTo(graphicsArray).then(() => {
                    this.mapView.goTo({ extent: this.mapView.extent.expand(1.5) });
                  });
                }
              } else {
                this.mapView.goTo(graphicsArray).then(function () {
                  this.mapView.scale = this.mapView.scale * 0.5;
                });
              }
            });
          };
          this.mapView = new EsriMapView(_mapViewProperties);
          this.mapView.ui.move('zoom', 'top-right');
          this.printTask = new PrintTask({
            url: 'https://tfsgis-dfe02.tfs.tamu.edu/arcgis/rest/services/FPD/FPDPrint/GPServer/FPDPrintService'
          });

          this.printTemplate = new PrintTemplate({
            format: 'pdf',
            exportOptions: { dpi: 300 },
            layout: 'a4-portrait'
          });


          this.printParams = new PrintParameters({
            view: this.mapView,
            template: this.printTemplate
          });

          const basemapGallery = new BasemapGallery({
            view: this.mapView,
            container: 'basemapToggle'
          });
          this.mapView.ui.add(basemapGallery);

          const homeBtn = new Home({
            view: this.mapView
          });
          // Add the home button to the top left corner of the view
          this.mapView.ui.add(homeBtn, 'top-right');

          // called when sketchViewModel's create-complete event is fired.
          this.addGraphic = (event, that = this) => {
            // Create a new graphic and set its geometry to
            // `create-complete` event geometry.
            const graphic = new Graphic({
              geometry: event.geometry,
            });
            that.graphicsLayer.add(graphic);
            that.editGraphic = null;
            that.activatedSpatialControl = true;
          };

          // select features
          this.selectFeaturesByGeom = (inputgeom, graphics) => {
            const gras = graphics.graphics;
            const _selected = [];
            gras.map(function (_g) {
              if (inputgeom.contains(_g.geometry)) {
                _selected.push({
                  'type': 'Feature', 'id': _g.uid, 'geometry': {
                    'type': 'Point',
                    'coordinates': [_g.geometry.toJSON().x, _g.geometry.toJSON().y]
                  }, 'properties': _g.attributes
                });
              }
            });
            console.log(_selected);
            console.log(this._data);
            this._data.allDataService.next(_selected);
          };
          this.setupSketchViewModel = (mapView, _that = this) => {
            // setup sketch view model for drawing geometries
            this.sketchViewModel = new SketchViewModel({
              view: mapView,
              layer: this.graphicsLayer,
              pointSymbol: vars.pointSymbol,
              polylineSymbol: vars.polylineSymbol,
              polygonSymbol: vars.polygonSymbol
            });
            mapView.map.addMany([this.graphicsLayer, this.circleGraphicsLayer, this.tempGraphicsLayer]);
            this.sketchViewModel.on('create', function (event) {
              if (event.state === 'complete') {
                console.log(event);
                _that.addGraphic(event.graphic.geometry, _that);
                console.log(event);
              }
            });
            this.__sketchStatus.next(true);
          };

          this.clearDrawGraphics = (isResetData) => {
            // function to clear all active graphics in the map along with the view and graphcis layer
            // also resets the sketchviewmodel is that is active so that next drawing could be initialized properly
            console.time('clear');
            if (isResetData) {
              this.dataFilterService.resetDataSpatial();
            }
            this.__sketchStatus.subscribe(_sketchStatus => {
              if (_sketchStatus) {
                this.sketchViewModel.reset();
                this.graphicsLayer.removeAll();
                this.circleGraphicsLayer.removeAll();
                this.tempGraphicsLayer.removeAll();
                this.editGraphic = null;
                this.sketchViewModel.complete();
                this.sketchViewModel.reset();
                this.mapView.goTo({ extent: fullExtent });
                console.timeEnd('clear');
              }
            });
          };

          this.performSpatialQuery = (control) => {
            console.log('received this control in esir map', control);
            if (this.sketchViewModel) {
              if (this.sketchViewModel.state === 'creating' || this.sketchViewModel.state === 'updating') {
                this.sketchViewModel.complete();
              }
              if (control === 'multipoint') {
                const totalPt = (this.graphicsLayer.graphics.length);
                console.log(totalPt);
                if (totalPt > 0) {
                  const geoj = JSON.stringify(this.graphicsLayer.graphics.getItemAt(0).geometry.toJSON());
                  this.pointInCountyService.getCountyNameFromPoint(geoj);
                  this.pointInCountyService.pointInCountyDataService.subscribe(d => {
                    this.dataFilterService.applyFilterArray('County', d);
                  });
                  // .subscribe(d => console.log(d));
                }
              } else if (control === 'rectangle' || control === 'polygon' || control === 'circle') {
                this.selectFeaturesByGeom(this.graphicsLayer.graphics.getItemAt(0).geometry, this.industriesGraphicsLayer);
              }
            }
          };

          this.mapView.when(() => {
            this.__mapViewStatus.next(true);
            this.addGraphicsToMap();
            this.setupSketchViewModel(this.mapView);
            // initialize a draw action for creating a buffer polygon
            this.draw = new Draw({
              view: this.mapView
            });
          }, (err) => {
            this.__mapViewStatus.next(false);
            console.log(err);
          });

        })
        .catch(err => {
          console.error(err);
        });
    }, 200);
  } // ngOnInit

}
