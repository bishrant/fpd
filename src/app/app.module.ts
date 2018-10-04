import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { AppComponent } from './app.component';
import { EsrimapComponent } from './esrimap/esrimap.component';
import { HeaderComponent } from './header/header.component';
import { FeaturetableComponent } from './featuretable/featuretable.component';
import { MatTableModule } from '@angular/material';
import { AngularDraggableModule } from 'angular2-draggable';
import { HttpClient} from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SpatialsearchComponent } from './spatialsearch/spatialsearch.component';
import { SelectModule } from 'ng2-select';
import { PrintLegendDirective } from './directives/print-legend.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AppComponent,
    EsrimapComponent,
    HeaderComponent,
    FeaturetableComponent,
    SidebarComponent,
    SpatialsearchComponent,
    PrintLegendDirective
  ],
  imports: [
    BrowserModule, NgbModule, MatTableModule, AngularDraggableModule,
    HttpClientModule, AngularFontAwesomeModule, SelectModule, MatProgressSpinnerModule
  ],
  providers: [HttpClient],
  bootstrap: [AppComponent]
})
export class AppModule { }
