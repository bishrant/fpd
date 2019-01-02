import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-aboutpage',
  templateUrl: './aboutpage.component.html',
  styleUrls: ['./aboutpage.component.scss']
})


export class AboutpageComponent implements OnInit {
  public addupdatepage = 'addupdatepage';
  constructor() { }

  ngOnInit() {
  }
}
