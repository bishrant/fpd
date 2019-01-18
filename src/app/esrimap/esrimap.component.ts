
import { Component, OnInit, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
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
import { TourService } from 'ngx-tour-core';
import { ListComponent } from '../list/list.component';

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
  public selectedCountiesGraphicsLayer;
  public sketchViewModel: esri.SketchViewModel;
  public setupSketchViewModel;
  public graphicsLayer: esri.GraphicsLayer;
  public tempGraphicsLayer: esri.GraphicsLayer;
  public addGraphic;
  public addBuffer;
  public selectCounties;
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
  public basemapGallery;
  public isLegendOpen = false;
  public Instructions = {
    point: 'Click on the map to add a buffer with your specified radius.',
    polygon: 'Click/drag your mouse to add points to the polygon. Double click to complete.',
    rectangle: 'Click hold and drag to draw a rectangle.',
    multipoint: 'Click to select one or more counties. Double click to complete.',
    clear: ''
  };
  public nativeWindow: any;
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @Output() toggleLegendEvent = new EventEmitter();
  @ViewChild(ListComponent) listComponent: ListComponent;

  public addGraphicsToMap;

  public toggleBasemaps() {
    this.basemapWidgetVisible = this.basemapWidgetVisible ? false : true;
    this.basemapWidgetClass = this.basemapWidgetVisible ? 'basemapToggleVisible' : 'basemapToggleHidden';
    if (this.isLegendOpen) {
      this.isLegendOpen = !this.isLegendOpen;
      this.toggleLegendEvent.emit();
    }
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
        const _legendBase64 = this._legendDirective.prepareLegend(false);
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

  public toggleLegend() {
    this.isLegendOpen = !this.isLegendOpen;
    this.toggleLegendEvent.emit();
    if (this.basemapWidgetVisible) {
      this.basemapWidgetVisible = this.basemapWidgetVisible ? false : true;
      this.basemapWidgetClass = this.basemapWidgetVisible ? 'basemapToggleVisible' : 'basemapToggleHidden';
    }
  }
  public showHelp() {
    this.tourService.start();
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
    if (!this.drawToolActive) {
      this.listComponent.toggleTable();
      this.drawToolActive = true;
    } else {
    }
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        if (['polygon', 'multipoint', 'rectangle', 'point'].indexOf(control) !== -1) {
          if (control === 'multipoint') {
            this.selectedCountiesGraphicsLayer.removeAll();
            this.drawInstructions = this.Instructions[control];
            this.mapBusy = false;
          } else {
            this.clearDrawGraphics(false);
            this.drawInstructions = this.Instructions[control];
            console.log(this.drawInstructions);
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
    private winRef: WindowService, public tourService: TourService,
    private pointInCountyService: PointincountyService, private dataFilterService: DatafiltersService) {
    this.nativeWindow = this.winRef.getNativeWindow();
  }

  public ngOnInit() {

    this._data.activeSpatialControlObservable.subscribe(control => {
      this.activateSpatialControl(control);
    });

    this._data.printMapObservable.subscribe(() => {
      this.printMap();
    });

    setTimeout(() => {
      return loadModules([
        'esri/Map', 'esri/views/MapView', 'esri/core/watchUtils',
        'esri/layers/MapImageLayer',
        'esri/views/2d/draw/Draw', 'esri/widgets/Home',
        'esri/widgets/Sketch/SketchViewModel', 'esri/geometry/SpatialReference', 'esri/geometry/Extent',
        'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/geometry/Polygon',
        'esri/tasks/PrintTask', 'esri/geometry/geometryEngine',
        'esri/tasks/support/PrintTemplate', 'esri/tasks/support/PrintParameters', 'esri/widgets/BasemapGallery',
        'dojo/domReady!'
      ])
        .then(([EsriMap, EsriMapView, watchUtils, MapImageLayer, Draw, Home,
          SketchViewModel, SpatialReference, Extent, Graphic, GraphicsLayer,
          Point, Polygon, PrintTask, geometryEngine, PrintTemplate, PrintParameters, BasemapGallery]) => {
          // create a boilerplate graphics layer for adding industries points later on
          this.industriesGraphicsLayer = new GraphicsLayer();
          this.graphicsLayer = new GraphicsLayer({ id: 'userGraphicsLayer' });
          this.tempGraphicsLayer = new GraphicsLayer({ id: 'tempGraphicsLayer' });
          this.selectedCountiesGraphicsLayer = new GraphicsLayer({ id: 'selectedCountiesGraphicsLayer' });

          const countyLayer = new MapImageLayer({ url: 'https://tfsgis02.tfs.tamu.edu/arcgis/rest/services/ForestProductsDirectory/FPDMapService/MapServer' });
          this.map = new EsriMap({
            basemap: vars._basemap,
            layers: [countyLayer, this.industriesGraphicsLayer, this.graphicsLayer, this.selectedCountiesGraphicsLayer],
            spatialReference: new SpatialReference({ wkid: 4326 })
          });

          // set a empty point geometry for zoom in later
          this._tempZoomPt = new Point({
            x: 0, y: 0, spatialReference: { wkid: 4326 }
          });
          const fullExtent = new Extent({ xmin: -106.645646, ymin: 24.837377, xmax: -93.508292, ymax: 37.500704 }).expand(1.2);
          const _mapViewProperties = {
            container: this.mapViewEl.nativeElement,
            extent: fullExtent,
            map: this.map,
            constraints: {
              snapToZoom: false
            },
            spatialReference: {
              wkid: 3857
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
              if (typeof (this.graphicsLayer) !== 'undefined') {
                if (this.graphicsLayer.graphics.length > 0) {
                  this.mapView.goTo(this.graphicsLayer.graphics, { animate: true, duration: 500 }).then(() => {
                    this.mapView.goTo({ extent: this.mapView.extent.expand(1.5) });
                  });
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
            url: 'https://tfsgis02.tfs.tamu.edu/arcgis/rest/services/ForestProductsDirectory/FPDPrintMapService/GPServer/FPDPrintService'
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

          this.basemapGallery = new BasemapGallery({
            view: this.mapView,
            container: 'basemapToggle'
          });
          this.mapView.ui.add(this.basemapGallery);

          const homeBtn = new Home({
            view: this.mapView
          });
          // Add the home button to the top left corner of the view
          this.mapView.ui.add(homeBtn, 'top-right');

          // called when sketchViewModel's create-complete event is fired.
          this.addGraphic = (event, that = this) => {
            const graphic = new Graphic({
              geometry: event.geometry,
            });
            that.graphicsLayer.add(graphic);
            that.editGraphic = null;
            that.activatedSpatialControl = true;
          };

          this.addBuffer = (geom, that = this) => {
            const graphic = new Graphic({
              geometry: geom,
              symbol: vars.polygonSymbol
            });
            that.graphicsLayer.add(graphic);
            that.editGraphic = null;
            that.activatedSpatialControl = true;
            this.performSpatialQuery('point');
          };

          this.selectCounties = (inputGeom) => {
            // this.sketchViewModel.pointSymbol = vars.emptypointSymbol;
            this.mapBusy = true;
            const clonePtGeom = inputGeom.points[inputGeom.points.length - 1];
            const newlyaddedPt = new Point({
              x: clonePtGeom[0],
              y: clonePtGeom[1],
              spatialReference: { 'wkid': 3857 }
            });
            // ;
            const existingCounties = [];
            const countiesToAdd = [];
            const countiesToRemove = [];
            this.selectedCountiesGraphicsLayer.graphics.forEach(g => {
              existingCounties.push(g['attributes']['NAME']);
            });
            const existingGraphics = this.selectedCountiesGraphicsLayer.graphics.clone();
            this.pointInCountyService.getCountiesGeometry(JSON.stringify(newlyaddedPt.toJSON())).subscribe(d => {
              const features = d['features'];
              const newCountyNames = [];
              if (features.length > 0) {
                features.forEach((f) => {
                  newCountyNames.push(f['properties']['NAME']);
                  const _g = new Graphic({
                    geometry: new Polygon({
                      rings: f['geometry']['coordinates'],
                      spatialReference: { wkid: 3857 }
                    }),
                    symbol: vars.polygonSymbol,
                    attributes: f['properties']
                  });
                  if (existingCounties.indexOf(f['properties']['NAME']) !== -1 && existingCounties.length !== 0) {
                    countiesToRemove.push(_g);
                    // just remove it
                    existingGraphics.forEach((item, index, object) => {
                      if (typeof item !== 'undefined') {
                        if (item['attributes']['NAME'] === f['properties']['NAME']) {
                          object.splice(index, 1);
                        }
                      }
                    });

                  } else {
                    countiesToAdd.push(_g);
                    existingGraphics.push(_g);
                  }
                });
              }
              this.selectedCountiesGraphicsLayer.graphics = existingGraphics;
              this.mapBusy = false;
            });
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
            this._data.allDataService.next(_selected);
            this.drawToolActive = false;
          };
          this.setupSketchViewModel = (mapView, _that = this) => {
            // setup sketch view model for drawing geometries
            this.sketchViewModel = new SketchViewModel({
              view: mapView,
              layer: this.graphicsLayer,
              pointSymbol: vars.emptypointSymbol,
              // pointSymbol: vars.pointSymbol,
              polylineSymbol: vars.polylineSymbol,
              polygonSymbol: vars.polygonSymbol
            });
            mapView.map.addMany([this.graphicsLayer, this.tempGraphicsLayer]);
            this.sketchViewModel.on('create', function (event) {
              if (event.state === 'complete') {
                if (event.tool === 'point') {
                  const bufferedPt = geometryEngine.geodesicBuffer(event.graphic.geometry, parseInt((<HTMLInputElement>document.getElementById('bufferDistance')).value, 10), 'miles');
                  _that.addBuffer(bufferedPt, _that);
                } else if (event.tool === 'multipoint') {
                  _that.performSpatialQuery('multipoint');
                } else {
                  _that.addGraphic(event.graphic.geometry, _that);
                  _that.performSpatialQuery(event.tool);
                }
              } else if (event.state === 'start' || event.state === 'active') {
                if (event.tool === 'multipoint') {
                  _that.selectCounties(event.graphic.geometry);
                }
              }
            });
            this.__sketchStatus.next(true);
          };

          this.clearDrawGraphics = (isResetData, resetZoom = true) => {
            // function to clear all active graphics in the map along with the view and graphcis layer
            // also resets the sketchviewmodel is that is active so that next drawing could be initialized properly
            console.time('clear');
            if (isResetData) {
              this.drawToolActive = false;
              this.dataFilterService.resetDataSpatial();
            }
            this.__sketchStatus.subscribe(_sketchStatus => {
              if (_sketchStatus) {
                this.sketchViewModel.reset();
                this.graphicsLayer.removeAll();
                this.selectedCountiesGraphicsLayer.removeAll();
                this.tempGraphicsLayer.removeAll();
                this.editGraphic = null;
                this.sketchViewModel.complete();
                this.sketchViewModel.reset();
                if (resetZoom) { this.mapView.goTo({ extent: fullExtent }); }
                console.timeEnd('clear');
              }
            });
          };

          this.performSpatialQuery = (control) => {
            if (this.sketchViewModel) {
              if (this.sketchViewModel.state === 'creating' || this.sketchViewModel.state === 'updating') {
                this.sketchViewModel.complete();
              }
              if (control === 'multipoint') {
                const totalPt = (this.graphicsLayer.graphics.length);
                if (totalPt > 0) {
                  const geoj = JSON.stringify(this.graphicsLayer.graphics.getItemAt(0).geometry.toJSON());
                  this.pointInCountyService.getCountyNameFromPoint(geoj);
                  this.pointInCountyService.pointInCountyDataService.subscribe(d => {
                    this.dataFilterService.applyFilterArray('County', d);
                    this.drawToolActive = false;
                    this.mapView.extent = this.selectedCountiesGraphicsLayer.extent;
                  });
                }
              } else if (control === 'rectangle' || control === 'polygon') {
                console.log(this.graphicsLayer.graphics.getItemAt(0).geometry);
                this.selectFeaturesByGeom(this.graphicsLayer.graphics.getItemAt(0).geometry, this.industriesGraphicsLayer);
                this.drawToolActive = false;
              } else if (control === 'point') {
                this.selectFeaturesByGeom(this.graphicsLayer.graphics.getItemAt(1).geometry, this.industriesGraphicsLayer);
              }
            }
          };

          const getGraphics = (response, mapPt) => {
            if (response.results.length > 0) {
              const highlightGraphic = new Graphic({
                geometry: response.results[0].graphic.geometry,
                symbol: fn.getHighlightSymbol(response.results[0].graphic.attributes),
                attributes: response.results[0].graphic.attributes,
                popupTemplate: vars.industriesPopupTemplate
              });
              this.tempGraphicsLayer.removeAll();
              this.tempGraphicsLayer.add(highlightGraphic);
              console.log(response);
              this.mapView.popup.open({
                location: mapPt,
                features: [response.results[0].graphic]
              });
              console.log(response.results[0].graphic);
            }
          };

          const removeTempGraphics = () => {
            this.tempGraphicsLayer.removeAll();
          };
          this.mapView.popup.watch('visible', function (visible) {
            if (!visible) {
              removeTempGraphics();
            }
          });

          this.mapView.when(() => {
            this.__mapViewStatus.next(true);
            this.addGraphicsToMap();
            this.setupSketchViewModel(this.mapView);
            // initialize a draw action for creating a buffer polygon
            this.draw = new Draw({
              view: this.mapView
            });

            const mapV = this.mapView;
            this.mapView.whenLayerView(this.industriesGraphicsLayer).then(function (lView) {
              watchUtils.whenFalseOnce(lView, 'updating', function () {
                mapV.on('pointer-move', function (evt) {
                  const screenPt = {
                    x: evt.x,
                    y: evt.y
                  };
                  if (mapV.scale < 1529770) {
                    const mapPt = mapV.toMap(screenPt);
                    mapV.hitTest(screenPt)
                      .then(function (response) {
                        getGraphics(response, mapPt);
                      });
                  }
                });
                mapV.on('click', function (evt) {
                  const screenPt = {
                    x: evt.x,
                    y: evt.y
                  };
                  const mapPt = mapV.toMap(screenPt);
                  mapV.hitTest(screenPt)
                    .then(function (response) {
                      getGraphics(response, mapPt);
                    }).catch(function (error) {
                      console.log(error);
                    });
                });
              });
            }).catch(function (error) {
              console.log(error);
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
