import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatSortModule, MatPaginatorModule, MatDialogModule} from '@angular/material';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatToolbarModule, MatButtonModule  } from '@angular/material';
import {MatTooltipModule} from '@angular/material/tooltip';
import { AngularDraggableModule } from 'angular2-draggable';
import { HttpClient, HttpClientModule} from '@angular/common/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { EsrimapComponent } from './esrimap/esrimap.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { PrintLegendDirective } from './directives/print-legend.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResizableModule  } from 'angular-resizable-element';
import { VirtualScrollComponent } from './virtual-scroll/virtual-scroll.component';
import { ListComponent } from './list/list.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import { AboutpageComponent } from './aboutpage/aboutpage.component';
import { AddupdatepageComponent } from './addupdatepage/addupdatepage.component';
import { ContactuspageComponent } from './contactuspage/contactuspage.component';
import { HelppageComponent } from './helppage/helppage.component';

@NgModule({
  declarations: [
    AppComponent,
    EsrimapComponent,
    HeaderComponent,
    SidebarComponent,
    PrintLegendDirective,
    VirtualScrollComponent,
    ListComponent,
    AboutpageComponent,
    AddupdatepageComponent,
    ContactuspageComponent,
    HelppageComponent,
  ],
  imports: [
    MatSortModule, MatPaginatorModule, ResizableModule, MatDialogModule, BrowserModule, BrowserAnimationsModule,  NgbModule, MatTableModule, AngularDraggableModule, NgSelectModule,
    HttpClientModule, MatSidenavModule, MatExpansionModule, AngularFontAwesomeModule, DragDropModule, MatProgressSpinnerModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatIconModule, MatToolbarModule, MatButtonModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent],
  entryComponents: [AboutpageComponent, AddupdatepageComponent, ContactuspageComponent, HelppageComponent]
})
export class AppModule { }
