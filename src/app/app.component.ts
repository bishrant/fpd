import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Directory of Forest Products Industries';
  featureTableStatus = 'featureTableMinimized';
  public showHideFeatureTable(evt) {
    this.featureTableStatus = this.featureTableStatus === 'featureTableMaximized' ? 'featureTableMinimized' : 'featureTableMaximized';
    evt.preventDefault();
    evt.stopPropagation();
  }
}
