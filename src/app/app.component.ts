import { Component, OnInit, HostListener, ViewChild, AfterViewInit, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AboutpageComponent } from './aboutpage/aboutpage.component';
import { AddupdatepageComponent } from './addupdatepage/addupdatepage.component';
import { ContactuspageComponent } from './contactuspage/contactuspage.component';
import { HelppageComponent } from './helppage/helppage.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
import { TourService } from 'ngx-tour-md-menu';
import { CookieService } from 'ngx-cookie-service';
import * as vars from './esrimap/variables';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'Directory of Forest Products Industries';
  featureTableStatus = 'featureTableMinimized';
  drawerMode = new FormControl('over');
  public openPage: string;
  public innerWidth: any;
  public deviceType: string;
  public sliderBackdrop = false;
  public openSideBarButtonVisible = false;
  public isLegendVisible = false;
  pageList = { aboutpage: AboutpageComponent, addupdatepage: AddupdatepageComponent, contactus: ContactuspageComponent, helppage: HelppageComponent };
  @ViewChild('drawer') drawer!: any;
  @ContentChild('welcomeMsg') welcomeMsg!: TemplateRef<any>;

  public showHideFeatureTable(evt) {
    this.featureTableStatus = this.featureTableStatus === 'featureTableMaximized' ? 'featureTableMinimized' : 'featureTableMaximized';
    evt.preventDefault();
    evt.stopPropagation();
  }
  public showHelp() {
    this.tourService.start();
  }
  public toggleLegend() {
    this.isLegendVisible = !this.isLegendVisible;
  }
  ngOnInit() {

  }
  ngAfterViewInit() {
    this.innerWidth = window.innerWidth;
    this.deviceType = this.findSceenType(window.innerWidth);

    this.sliderBackdrop = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
    this.openSideBarButtonVisible = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
    if (this.sliderBackdrop) {
      this.drawer.close();
    }
    this.drawer.openedChange.subscribe((e) => {
      this.openSideBarButtonVisible = !e;
    });
    this.tourService.initialize(vars.tourRoutes);
    setTimeout(() => {
      if (this.cookieService.get('disableHelp') !== 'true') {
        const dialogReference = this.dialog.open(WelcomepageComponent, {
          //  maxHeight: '90vh',
          minWidth: '320px',
          height: 'auto',
          maxWidth: '80vh',
          autoFocus: false,
          hasBackdrop: true,
          backdropClass: 'welcomeDialogBg',
          panelClass: 'custom-modalbox',
        });
        dialogReference.afterClosed().subscribe(m => {
          dialogReference.close();
          if (m === 'startHelpTour') {
            dialogReference.close();
            this.tourService.start();
          }
        });
      }
    }, 50);

    this.tourService.stepShow$.subscribe((res: any) => {
      if (['sidebar-export', 'sidebar-mapsearch', 'sidebar-search'].indexOf(res.anchorId) !== -1) {
        this.openSidebar();
      }
    });

    this.tourService.end$.subscribe(() => {
      this.openSidebar();
    });
  }
  @HostListener('window:resize', ['$event'])
  onresize() {
    this.innerWidth = window.innerWidth;
    this.deviceType = this.findSceenType(window.innerWidth);
    this.sliderBackdrop = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
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

  openDialogs(evt) {
    const dialogRef = this.dialog.open(this.pageList[evt], {
      minWidth: '320px',
      height: 'auto',
      maxWidth: '80vh',
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'welcomeDialogBg',
      disableClose: false,
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(page => {
      if (page !== '' && typeof page !== 'undefined') {
        if (page !== 'starttour') {
          this.openDialogs(page);
        } else {
          this.tourService.start();
        }
      }
    });
  }

  openSidebar() {
    this.drawer.open();
    this.openSideBarButtonVisible = false;
  }


  constructor(public dialog: MatDialog, public tourService: TourService, private cookieService: CookieService) { }
}
