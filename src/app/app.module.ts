import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatSortModule, MatPaginatorModule} from '@angular/material';
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
import { FeaturetableComponent } from './featuretable/featuretable.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SpatialsearchComponent } from './spatialsearch/spatialsearch.component';
// import { SelectModule } from 'ng2-select';
import { PrintLegendDirective } from './directives/print-legend.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResizableModule  } from 'angular-resizable-element';
import { VirtualScrollComponent } from './virtual-scroll/virtual-scroll.component';
import { ListComponent } from './list/list.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
// import { DataTableComponent } from './data-table/data-table.component';

@NgModule({
  declarations: [
    AppComponent,
    EsrimapComponent,
    HeaderComponent,
    FeaturetableComponent,
    SidebarComponent,
    SpatialsearchComponent,
    PrintLegendDirective,
    VirtualScrollComponent,
    ListComponent,
  ],
  imports: [
    MatSortModule, MatPaginatorModule, ResizableModule, BrowserModule, BrowserAnimationsModule,  NgbModule, MatTableModule, AngularDraggableModule, NgSelectModule,
    HttpClientModule, MatSidenavModule, MatExpansionModule, AngularFontAwesomeModule, DragDropModule, MatProgressSpinnerModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatTooltipModule, MatIconModule, MatToolbarModule, MatButtonModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
