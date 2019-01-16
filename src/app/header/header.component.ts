import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import {NgbDropdownConfig} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [NgbDropdownConfig]
})
export class HeaderComponent implements OnInit {
  @Output() openDialog: EventEmitter<any> = new EventEmitter();
  constructor(config: NgbDropdownConfig) {
    // customize default values of dropdowns used by this component tree
    config.placement = 'bottom-right';
    config.autoClose = true;
  }
  public collapsed = true;
  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }
  openDialogFn(evt) {
    this.openDialog.emit(evt.page);
  }
  ngOnInit() {
  }
  @HostListener('window:resize', ['$event'])
  onresize() {
    const deviceType = this.findSceenType(window.innerWidth);
    if (deviceType === 'desktop-lg' || deviceType === 'tablet') {
      this.collapsed = true;
    }
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
}
