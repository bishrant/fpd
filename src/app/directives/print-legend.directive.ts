import { Directive, ElementRef, OnInit } from '@angular/core';
import { IndustriesGeojson } from '../services/industries-geojson.service';

@Directive({
  selector: '[appPrintLegend]'
})
export class PrintLegendDirective implements OnInit {
  element: ElementRef;
  constructor(private el: ElementRef, private _data: IndustriesGeojson) {
    // console.log(el.nativeElement);
    this.element = el.nativeElement;
  }
  public convertCanvasToWhite(ctx, canvas) {
    // change non-opaque pixels to white
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    // console.log(data);
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
    return imgData;
  }
  public drawCircle(ctx, x, y, radius, fillColor) {
    ctx.beginPath();
    ctx.arc(x, y + 18, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
  }
  public prepareLegend() {
    this._data.currentData.subscribe(d => {
      const canvas: any = document.getElementById('canvasPrimaryLegend');
      const ctx = canvas.getContext('2d');
      const totalLegend = this._data.getDataForComboBox(d, 'Industry_t');
      const activeLegendPrimary = ['Biomass', 'paper', 'ply', 'post', 'saw', 'other-primary'];
      const legendSymbol = ['red', 'blue', 'yellow', 'green', 'purple', 'black'];
      const activeSecondary = ['Engineered', 'Millwork', 'Pallet', 'Panel', 'Preservation', 'Other-seconday'];
      canvas.height = activeLegendPrimary.length * 80;
      const rowHeight = 80;
      let _i = 0;
      ctx.font = '30pt Arial';
      ctx.imageSmoothingEnabled = true;
      ctx.webkitImageSmoothingEnabled = true;
      for (_i = 0; _i < activeLegendPrimary.length; _i++) {
        ctx.fillStyle = legendSymbol[_i];
        ctx.strokeStyle = 'black';
        ctx.textAlign = 'start';
        // const i = _i === 0 ? 0.1 : _i;
        const i = _i;
        this.drawCircle(ctx, 30, rowHeight * i, rowHeight * 0.3, legendSymbol[_i]);
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.fillText(activeLegendPrimary[_i], 60, rowHeight * i);
        // ctx.fillText'other', 500, rowHeight * _i);
        // ctx.fillText(activeSecondary[_i], 120, rowHeight*_i);
      }
      const canvas2: any = document.getElementById('canvasSecondayLegend');
      const ctx2 = canvas2.getContext('2d');
      canvas2.height = activeSecondary.length * 80;
      let __i = 0;
      ctx2.font = '30pt Arial';
      ctx2.imageSmoothingEnabled = true;
      ctx2.webkitImageSmoothingEnabled = true;
      for (__i = 0; __i < activeSecondary.length; __i++) {
        ctx2.fillStyle = legendSymbol[__i];
        ctx2.strokeStyle = 'black';
        ctx2.textAlign = 'start';
        ctx2.fillRect(10, rowHeight * __i , 50 * 0.8, 50 * 0.8);
        ctx2.fillStyle = 'black';
        ctx2.textBaseline = 'top';
        ctx2.fillText(activeSecondary[__i], 60, rowHeight * __i);
      }
      const imgData = this.convertCanvasToWhite(ctx, canvas);
      ctx.putImageData(imgData, 0, 0);

      const imgData2 = this.convertCanvasToWhite(ctx2, canvas2);
      ctx2.putImageData(imgData2, 0, 0);
      return [{'primaryLegend': canvas.toDataURL('image/jpg'), 'secondaryLegend': canvas2.toDataURL('image/jpg') }];
    });
    const _cR1 = document.getElementById('canvasPrimaryLegend') as HTMLCanvasElement;
    const _cR2 = document.getElementById('canvasSecondayLegend') as HTMLCanvasElement;
    return {'primaryLegend': _cR1.toDataURL('image/jpg'),
    'secondaryLegend': _cR2.toDataURL('image/jpg')
  };
  }
  ngOnInit() {
  }

}