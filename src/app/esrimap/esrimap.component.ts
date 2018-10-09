
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
  public slideStatus = 'slideIn';
  public slideOpen = true;
  public displayslidebtn = 'nodisplay';

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
  public addBufferGraphic;
  public selectFeaturesByGeom;
  public performSpatialQuery;
  public buffer;
  public editGraphic;
  public sketchViewModel: esri.SketchViewModel;
  public setupSketchViewModel;
  public bufferLineGraphicLayer: esri.GraphicsLayer;
  public bufferLineGraphic;
  public graphicsLayer: esri.GraphicsLayer;
  public bufferGraphicsLayer: esri.GraphicsLayer;
  public tempGraphicsLayer: esri.GraphicsLayer;
  public addGraphic;
  public updateGraphic;
  public setupClickHandler;
  public touchEnabledDisplay = 'ontouchstart' in document.documentElement;
  // this is needed to be able to create the MapView at the DOM element in this component
  @ViewChild('mapViewNode') private mapViewEl: ElementRef;
  @ViewChild(SidebarComponent) private sideBar: SidebarComponent;

  public addGraphicsToMap;

  public onShowHideSideNav() {
    this.slideStatus = (this.slideOpen === true) ? 'slideOut' : 'slideIn';
    this.slideOpen = (this.slideOpen === true) ? false : true;
    console.log(this.slideOpen);
    this.displayslidebtn = (this.displayslidebtn === 'nodisplay') ? 'blockdisplay' : 'nodisplay';
  }
  public printMap() {
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        console.log('print this map');
        this.sideBar.printStatus = '';
        this.sideBar.linkToPDFReport = '';
        const _legendBase64 = this._legendDirective.prepareLegend();
        console.log(_legendBase64);
        this.printParams.extraParameters = { Primary_Legend: _legendBase64.primaryLegend, Secondary_Legend: _legendBase64.secondaryLegend };
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

  // public addGraphic(evt) {
  //   console.log('add this graphic ', evt);
  // }
  public activateBuffer() {
    const that = this;
    console.log('This is a touch screen device: ', this.touchEnabledDisplay);
    this.mapView.on('click', function (evt) {
      console.log(evt);
      that.addBufferGraphic(that, evt, that.mapView);
      // evt.stopPropagation();
      if (!that.touchEnabledDisplay) {
        that.mapView.on('click', function (evt1) {
          evt1.stopPropagation();
          evt.stopPropagation();
          that.mapView.on('click', function (ee) { ee.stopPropagation(); });
          that.mapView.on('pointer-move', function (eee) { eee.stopPropagation(); });
          that.mapView.map.remove(that.bufferLineGraphic);
          that.bufferLineGraphicLayer.removeAll();
          //  that.selectFeaturesByGeom(that.buffer, that.grp);
        });
      }
      // } else {
      //   that.mapView.on('click', function (evt1) {
      //     evt1.stopPropagation();
      //     evt.stopPropagation();
      //   });
      //   that.mapView.on('drag', function (evt1) {
      //     evt1.stopPropagation();
      //     evt.stopPropagation();
      //   });
      // }
      // that.addGraphic(evt);
    });
  }

  public activateSpatialControl(control: any) {
    this.__mapViewStatus.subscribe(_mapStatus => {
      if (_mapStatus) {
        console.log('activate this control', control);
        if (control === 'buffer') {
          this.activateBuffer();
          const that = this;
          this.mapView.on('key-down', function (evt) {
            console.log('key-down', evt);
            if (evt.key === 'Escape') {
              that.mapView.on('click', function (ee) { ee.stopPropagation(); });
              that.mapView.on('pointer-move', function (eee) { eee.stopPropagation(); });
              if (typeof (that.bufferGraphicsLayer) !== 'undefined') {
                that.bufferGraphicsLayer.removeAll();
                that.bufferLineGraphicLayer.removeAll();
                that.tempGraphicsLayer.removeAll();
              }
              that.sideBar.activatedSpatialControl = false;

            }
          });
        } else if (control === 'polygon') {
          console.log(322);
          // this.sketchViewModel.create('polygon');
          this.__sketchStatus.subscribe(_sketchStatus => {
            console.log(_sketchStatus);
            if (_sketchStatus) {
              console.log('2323');
              this.graphicsLayer.removeAll();
              this.sketchViewModel.create('polygon');
            }
          });
        } else if (control === 'point') {
          // this.sketchViewModel.create('point');
          this.__sketchStatus.subscribe(_sketchStatus => {
            if (_sketchStatus) {
              console.log('2323');
              this.graphicsLayer.removeAll();
              this.sketchViewModel.create('multipoint');
            }
          });
        }
      }
    });
  }
  constructor(private _data: IndustriesGeojson, private _legendDirective: PrintLegendDirective) { }

  public ngOnInit() {
    setTimeout(() => {
      return loadModules([
        'esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer',
        'esri/geometry/geometryEngine', 'esri/views/ui/DefaultUI',
        'esri/layers/MapImageLayer',
        'esri/widgets/Sketch/SketchViewModel',
        'esri/Graphic', 'esri/layers/GraphicsLayer', 'esri/geometry/Point', 'esri/tasks/PrintTask',
        'esri/tasks/support/PrintTemplate', 'esri/tasks/support/PrintParameters',
        'esri/widgets/BasemapToggle', 'dojo/domReady!'
      ])
        .then(([EsriMap, EsriMapView, FeatureLayer, geometryEngine, DefaultUI, MapImageLayer,
          SketchViewModel, Graphic, GraphicsLayer, Point, PrintTask, PrintTemplate, PrintParameters, BasemapToggle]) => {
          // create a boilerplate graphics layer for adding industries points later on
          this.industriesGraphicsLayer = new GraphicsLayer();
          this.graphicsLayer = new GraphicsLayer({
            id: 'tempGraphics'
          });
          this.map = new EsriMap({
            basemap: vars._basemap,
            layers: [this.industriesGraphicsLayer, this.graphicsLayer]
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
              if (typeof (this.buffer) !== 'undefined') {
                this.mapView.goTo(this.buffer).then(function () {
                  console.log(this.mapView.scale);
                  this.mapView.scale = this.mapView.scale * 0.5;
                });
              } else {
                this.mapView.goTo(graphicsArray).then(function () {
                  console.log(this.mapView.scale);
                  this.mapView.scale = this.mapView.scale * 0.5;
                });
              }
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
            exportOptions: { dpi: 300 },
            layout: 'a4-portrait'
          });


          this.printParams = new PrintParameters({
            view: this.mapView,
            template: this.printTemplate
          });
          const _addBuffer = (mapView, evt, that, mouseMove) => {
            // add a line as you move your mouse
            const tempEndPt = mapView.toMap({ x: mouseMove.x, y: mouseMove.y });
            const tempEnd = new Graphic(tempEndPt, vars.ptSymbol);
            that.tempGraphicsLayer.removeAll();
            that.tempGraphicsLayer.add(tempEnd);
            const _newLine = that.bufferLineGraphic.clone();
            _newLine.geometry.paths = [[evt.mapPoint.longitude, evt.mapPoint.latitude], [tempEndPt.longitude, tempEndPt.latitude]];
            that.bufferLineGraphicLayer.removeAll();
            const length = geometryEngine.geodesicLength(_newLine.geometry, 'miles');
            const labelGraphic = new Graphic({
              geometry: tempEndPt,
              symbol: {
                type: 'text',
                color: '#380202',
                text: length.toFixed(2) + ' miles',
                xoffset: 18,
                yoffset: 3,
                font: { // autocast as Font
                  size: 14,
                  family: 'sans-serif'
                }
              }
            });
            that.buffer = geometryEngine.geodesicBuffer(evt.mapPoint, length, 'miles');
            const bufferGraphic = new Graphic(that.buffer, {
              type: 'simple-fill',  // autocasts as new SimpleMarkerSymbol()
              color: [247, 34, 101, 0.5],
              opacity: 0.5,
              outline: {
                color: '#660404',
                width: 1
              }
            }
            );
            that.tempGraphicsLayer.add(labelGraphic);
            that.tempGraphicsLayer.add(bufferGraphic);
            that.tempGraphicsLayer.add(_newLine);
            this.sideBar.activatedSpatialControl = true;
          };
          this.addBufferGraphic = (that, evt, mapView) => {
            // function to add a buffer graphic to the map
            const initialPt = new Graphic(evt.mapPoint, vars.ptSymbol);
            console.log(this.bufferGraphicsLayer, that.bufferGraphicsLayer);
            if (typeof (this.bufferGraphicsLayer) !== 'undefined') {
              this.bufferGraphicsLayer.removeAll();
              this.bufferLineGraphicLayer.removeAll();
              this.tempGraphicsLayer.removeAll();
            }
            this.bufferGraphicsLayer = new GraphicsLayer();
            this.bufferLineGraphicLayer = new GraphicsLayer();
            this.tempGraphicsLayer = new GraphicsLayer();
            // mapView.map.remove(this.bufferGraphicsLayer);
            // mapView.map.remove(this.tempGraphicsLayer);
            // mapView.map.remove(this.bufferLineGraphicLayer);
            this.bufferGraphicsLayer.add(initialPt);
            mapView.map.add(this.bufferGraphicsLayer);
            // add graphic for lines as well
            this.bufferLineGraphic = new Graphic({ symbol: vars.lineSymbol, geometry: { type: 'polyline', paths: [], spatialReference: 4326 } });
            mapView.map.add(this.bufferLineGraphicLayer);
            that.bufferLineGraphicLayer.add(this.bufferLineGraphic);
            mapView.map.add(this.tempGraphicsLayer);
            const _that = this;
            if (!that.touchEnabledDisplay) {
              mapView.on('pointer-move', function (mouseMove) {
                _addBuffer(mapView, evt, _that, mouseMove);
                // s
              });
            } else {
              mapView.on('drag', function (mouseMove) {
                _addBuffer(mapView, evt, _that, mouseMove);
                // mouseMove.preventDefault();
                mouseMove.stopPropagation();
              });
            }

          };

          // set up logic to handle geometry update and reflect the update on "graphicsLayer"
          this.setupClickHandler = (that) => {
            console.log(1);
            that.mapView.on('click', function (event) {
              that.mapView.hitTest(event).then(function (response) {
                console.log('here in hittest', response.results);
                const results = response.results;
                if (results.length > 0) {
                  for (let i = 0; i < results.length; i++) {
                    // Check if we're already editing a graphic
                    that.sideBar.activatedSpatialControl = (that.editGraphic === null);
                    if (!that.editGraphic && results[i].graphic.layer.id === 'tempGraphics') {
                      that.sideBar.activatedSpatialControl = (that.editGraphic === null);
                      // Save a reference to the graphic we intend to update
                      that.editGraphic = results[i].graphic;
                      // Remove the graphic from the GraphicsLayer
                      // Sketch will handle displaying the graphic while being updated
                      that.graphicsLayer.remove(that.editGraphic);
                      that.sketchViewModel.update(that.editGraphic, that);
                      break;
                    }
                  }
                }
              });
            });
            this.__sketchStatus.next(true);
          };
          // called when sketchViewModel's create-complete event is fired.
          this.addGraphic = (event, that = this) => {
            // Create a new graphic and set its geometry to
            // `create-complete` event geometry.
            // this.graphicsLayer.removeAll();
            const graphic = new Graphic({
              geometry: event.geometry,
              symbol: that.sketchViewModel.graphic.symbol
            });
            that.graphicsLayer.add(graphic);
            that.sideBar.activatedSpatialControl = true;
          };
          // Runs when sketchViewModel's update-complete or update-cancel
          // events are fired.
          this.updateGraphic = (event, that = this) => {
            // Create a new graphic and set its geometry event.geometry
            const graphic = new Graphic({
              geometry: event.geometry,
              symbol: this.editGraphic.symbol
            });
            that.graphicsLayer.add(graphic);

            // set the editGraphic to null update is complete or cancelled.
            that.editGraphic = null;
            that.sideBar.activatedSpatialControl = (that.editGraphic === null);
          };
          // select features
          this.selectFeaturesByGeom = (inputgeom, graphics) => {
            const gras = graphics.graphics;
            const _selected = [];
            gras.map(function (_g) {
              if (inputgeom.contains(_g.geometry)) {
                // const __gp = _g.clone();
                // zoom to that point and also remove the old one
                // _zooms(__gp);
                // _remove(_g);
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
          this.setupSketchViewModel = (mapView) => {
            console.log(mapView);
            // setup sketch view model for drawing geometries
            this.sketchViewModel = new SketchViewModel({
              view: mapView,
              layer: this.graphicsLayer,
              pointSymbol: vars.pointSymbol,
              polylineSymbol: vars.polylineSymbol,
              polygonSymbol: vars.polygonSymbol
            });
           this.setupClickHandler(this);
            // Listen to create-complete event to add a newly created graphic to view
            this.sketchViewModel.on('create-complete', this.addGraphic);
            // Listen the sketchViewModel's update-complete and update-cancel events
            this.sketchViewModel.on('update-complete', this.updateGraphic);
            this.sketchViewModel.on('update-cancel', this.updateGraphic);
            this.__sketchStatus.next(true);
          };

          this.performSpatialQuery = (control) => {
            console.log('received this control in esir map', control);
            if (control === 'buffer') {
              this.selectFeaturesByGeom(this.buffer, this.industriesGraphicsLayer);
            }
          };

          this.mapView.when(() => {
            this.__mapViewStatus.next(true);
            this.addGraphicsToMap();
            this.setupSketchViewModel(this.mapView);
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
