import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WindowService {
  constructor() {}
  getNativeWindow() {
    return window;
  }
}
interface MyWindow extends Window {
  myFunction(): void;
}
declare var win: MyWindow;
