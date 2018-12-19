import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Directory of Forest Products Industries';
  featureTableStatus = 'featureTableMinimized';
  drawerMode = new FormControl('over');
  public innerWidth: any;
  public deviceType: string;
  public sliderBackdrop = false;
  @ViewChild ('drawer') drawer: any;
  public showHideFeatureTable(evt) {
    this.featureTableStatus = this.featureTableStatus === 'featureTableMaximized' ? 'featureTableMinimized' : 'featureTableMaximized';
    evt.preventDefault();
    evt.stopPropagation();
  }
  ngOnInit() {
    this.innerWidth = window.innerWidth;
    this.deviceType = this.findSceenType(window.innerWidth);
    this.sliderBackdrop = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
    if (this.sliderBackdrop) {
      this.drawer.close();
    }
  }
  @HostListener('window:resize', ['$event'])
  onresize(event) {
    this.innerWidth = window.innerWidth;
    console.log(this.innerWidth);
    this.deviceType = this.findSceenType(window.innerWidth);
    this.sliderBackdrop = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
   // this.drawer.toggle();
    // #drawerContainer.
  }

  closeSidebar() {
    this.drawer.close();
  }
  findSceenType(width) {
    let _dType;
    const md = 992;
    const lg = 1200;
    const sm = 768;
    const xs = 600;
    if (width >= lg) {
      _dType = 'desktop-lg';
    } else if (width >= md && width < lg) {
      _dType = 'tablet';
    } else if (width >= sm && width < md) {
      _dType = 'mobile';
    } else if (width >= xs && width < sm) {
      _dType = 'mobile';
    } else {
      _dType = 'mobile-xs';
    }
    return _dType;

  }

  getSliderBackdrop() {
    console.log(1);
    // $event.stopPropagation();
    // return true;
  }
}
