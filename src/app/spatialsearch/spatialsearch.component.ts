import { Component, OnInit, Injectable } from '@angular/core';
// import { ControlsService } from '../controls.service';

@Component({
  selector: 'app-spatialsearch',
  templateUrl: './spatialsearch.component.html',
  styleUrls: ['./spatialsearch.component.scss']
})
@Injectable()
export class SpatialsearchComponent implements OnInit {
  control: object;
  constructor() { }
  ngOnInit() {
    // this._controls.currentControl.subscribe(control => this.control = control);
  }
  activateControl(controlname: string, controlStatus: boolean) {
  //  this.control = {'controlname': controlname, 'controlStatus': controlStatus};
  //  console.log(this.control);
  //  this._controls.changeControl(this.control);
  }

  activateDrawing(mapView) {
    mapView.on('click', function (event) {
      console.log(event);
    });
  }
  testFn(map, geom) {
    map.goTo(geom);
  }

}
