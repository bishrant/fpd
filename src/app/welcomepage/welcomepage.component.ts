import { Component, OnInit } from '@angular/core';
import { TourService } from 'ngx-tour-core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-welcomepage',
  templateUrl: './welcomepage.component.html',
  styleUrls: ['./welcomepage.component.scss']
})
export class WelcomepageComponent implements OnInit {
  public disableHelpCheckbox = false;
  constructor(public tourService: TourService, private cookieService: CookieService) { }
  public msg;

  hideHelp() {
    console.log(this.disableHelpCheckbox);
    if (this.disableHelpCheckbox === true) {
      this.cookieService.set('disableHelp', 'true');
    }
  }
  ngOnInit() {
  }

}
