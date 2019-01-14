import { Component, OnInit, HostListener, ViewChild, AfterViewInit, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { AboutpageComponent } from './aboutpage/aboutpage.component';
import { AddupdatepageComponent } from './addupdatepage/addupdatepage.component';
import { ContactuspageComponent } from './contactuspage/contactuspage.component';
import { HelppageComponent } from './helppage/helppage.component';
import { WelcomepageComponent } from './welcomepage/welcomepage.component';
// import { TourService } from 'ngx-tour-core';
import { TourService } from 'ngx-tour-md-menu';
import { CookieService } from 'ngx-cookie-service';

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
  @ViewChild('drawer') drawer: any;
  @ContentChild('welcomeMsg') welcomeMsg: TemplateRef<any>;

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
    this.innerWidth = window.innerWidth;
    this.deviceType = this.findSceenType(window.innerWidth);

    this.sliderBackdrop = (this.deviceType === 'mobile' || this.deviceType === 'mobile-xs') ? true : false;
    if (this.sliderBackdrop) {
      this.drawer.close();
    }
    this.tourService.initialize([{
      anchorId: 'sidebar-search',
      content: 'Search by attributes allows users to find industries by their name, county that they are located in, along with their main category (i.e. Primary and Secondary) as well as specific industry type',
      title: 'Search by Attributes',
      enableBackdrop: true
    }, {
      anchorId: 'sidebar-mapsearch',
      content: 'Industries could be selected directly on the map by drawing buffer(circle), polygon, rectangle as well as counties.',
      title: 'Search on the map',
      enableBackdrop: true
    }, {
      anchorId: 'sidebar-export',
      content: 'Selected and/or complete list and map of industries could be exported as PDF as well as excel file formats.',
      title: 'Export maps and tables',
      enableBackdrop: true,
      preventScrolling: false
    }, {
      anchorId: 'mainmap',
      content: 'Use your mouse/keyboard to interact with the map. Click on the dots/squares for industires to view their detail information.',
      title: 'Interacting with map',
      enableBackdrop: false,
    }, {
      anchorId: 'basemap-tour',
      content: 'Use layers button to select between different basemaps. Zoom icons and zoom to home eases map navigation.',
      title: 'Map Controls',
      enableBackdrop: false,
    },
    {
      anchorId: 'industries-list',
      content: 'Single click to select industries and double-click to zoom and center map on them. Navigate to different pages using buttons on top bar. Entries could be sorted by clicking on header row.',
      title: 'List of industries',
      enableBackdrop: true,
    }, {
      anchorId: 'more-menu',
      content: 'More menu icons such as Help and links to  Texas A&M Forest Service are located here.',
      title: 'More menu',
      enableBackdrop: true,
    },
    ]);



  }
  ngAfterViewInit() {
    this.tourService.events$.subscribe(x => console.log(x));
    setTimeout(() => {
      if (this.cookieService.get('disableHelp') !== 'true') {
        const dialogReference = this.dialog.open(WelcomepageComponent, {
          maxHeight: '80vh',
          minWidth: '250px',
          height: 'auto',
          maxWidth: '80vh',
          autoFocus: false,
          hasBackdrop: true,
          backdropClass: 'welcomeDialogBg',
          // exitAnimationDuration: '2ms',
          panelClass: 'custom-modalbox',
        });
        dialogReference.afterClosed().subscribe(m => {
          console.log(m);
          dialogReference.close();
          if (m === 'startHelpTour') {
            dialogReference.close();
            this.tourService.start();
          }
        });
      }
    }, 50);
  }
  @HostListener('window:resize', ['$event'])
  onresize() {
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

  openDialogs(evt) {
    console.log(evt);
    const dialogRef = this.dialog.open(this.pageList[evt], {
      height: '70vh',
      width: '80vh',
      autoFocus: false,
      hasBackdrop: true,
      backdropClass: 'welcomeDialogBg',
      disableClose: false,
      panelClass: 'custom-modalbox',
    });
    dialogRef.afterClosed().subscribe(page => {
      console.log(page);
      if (page !== '' && typeof page !== 'undefined' ) {
        console.log(page);
        if (page !== 'starttour') {
          this.openDialogs(page);
        } else {
          this.tourService.start();
        }
      }
    });
  }

  constructor(public dialog: MatDialog, public tourService: TourService, private cookieService: CookieService) { }
}
