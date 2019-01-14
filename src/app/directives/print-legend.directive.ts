import { Directive, ElementRef, OnInit } from '@angular/core';
import { IndustriesGeojson } from '../services/industries-geojson.service';
import * as vars from '../esrimap/variables';
@Directive({
  selector: '[appPrintLegend]'
})
export class PrintLegendDirective implements OnInit {
  element: ElementRef;
  constructor(private el: ElementRef, private _data: IndustriesGeojson) {
    // console.log(el.nativeElement);
    this.element = this.el.nativeElement;
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
  public prepareLegend(isSmall= false) {
    this._data.currentData.subscribe(d => {
      const totalLegend = this._data.getDataForComboBox(d, 'SpecificIndustryType');
      const activeLegend = vars.masterLegend.filter(n => {
        return totalLegend.indexOf(n.name) !== -1;
      });
      const primaryLegend = activeLegend.filter(a => {
        return a.type === 'Primary';
      });
      const secondaryLegend = activeLegend.filter(a => {
        return a.type === 'Secondary';
      });
      const fontSize = isSmall ? '12pt Arial' : '30pt Arial';
      const rectSize = isSmall ? 20 : 30;
      const circleX = isSmall ? 20 : 30;
      const canvasWidth = isSmall ? 400 : 1000;
      const rowHeight = isSmall ? 30 : 80;
      console.log(activeLegend);
      // const rowHeight = 80;
      let primaryLegendImg = null;
      let secondaryLegendImg = null;
      // only show legend if there is at least one primary industry
      const canvas: any = document.getElementById('canvasPrimaryLegend');
      const ctx = canvas.getContext('2d');
      canvas.height = (secondaryLegend.length > primaryLegend.length) ? (secondaryLegend.length + 1) * rowHeight : (primaryLegend.length + 1) * rowHeight;
        canvas.width = canvasWidth;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (primaryLegend.length > 0) {
        let _i = 0;
        ctx.font = fontSize;
        ctx.imageSmoothingEnabled = true;
        ctx.webkitImageSmoothingEnabled = true;
        ctx.strokeStyle = 'black';
        ctx.textAlign = 'start';
        ctx.fillStyle = 'black';
        ctx.fillText('Primary Industries', 10, 50);
      for (_i = 0; _i < primaryLegend.length; _i++) {
        ctx.fillStyle = primaryLegend[_i].color;
        ctx.strokeStyle = 'black';
        ctx.textAlign = 'start';
        const i = _i + 1;
        this.drawCircle(ctx, circleX, rowHeight * i, rowHeight * 0.25, primaryLegend[_i].color);
        ctx.fillStyle = 'black';
        ctx.textBaseline = 'top';
        ctx.fillText(primaryLegend[_i].name, rowHeight, rowHeight * i);
      }
      const imgData = this.convertCanvasToWhite(ctx, canvas);
        ctx.putImageData(imgData, 0, 0);
        primaryLegendImg = canvas.toDataURL('image/jpg');
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        primaryLegendImg = null;
      }

      // same with secondary legend
      const canvas2: any = document.getElementById('canvasSecondayLegend');
      const ctx2 = canvas2.getContext('2d');
      canvas2.height = (secondaryLegend.length + 1) * rowHeight;
      canvas2.width = canvasWidth;
      ctx2.fillStyle = 'white';
        ctx2.fillRect(0, 0, canvas2.width, canvas2.height);
      if (secondaryLegend.length > 0) {
        let __i = 0;
        ctx2.font = fontSize;
        ctx2.imageSmoothingEnabled = true;
        ctx2.webkitImageSmoothingEnabled = true;
        ctx2.strokeStyle = 'black';
        ctx2.textAlign = 'start';
        ctx2.fillStyle = 'black';
        ctx2.fillText('Secondary Industries', 10, 50);
        for (__i = 0; __i < secondaryLegend.length; __i++) {
          ctx2.fillStyle = secondaryLegend[__i].color;
          ctx2.strokeStyle = 'black';
          ctx2.textAlign = 'start';
          const ii = __i + 1;
          ctx2.fillRect(10, rowHeight * ii, rectSize, rectSize);
          ctx2.fillStyle = 'black';
          ctx2.textBaseline = 'top';
          ctx2.fillText(secondaryLegend[__i].name, rowHeight, rowHeight * ii);
        }
        const imgData2 = this.convertCanvasToWhite(ctx2, canvas2);
        ctx2.putImageData(imgData2, 0, 0);
        secondaryLegendImg = canvas2.toDataURL('image/jpg');
      } else {
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        secondaryLegendImg = null;
      }
      return [{ 'primaryLegend': primaryLegendImg, 'secondaryLegend': secondaryLegendImg }];
    });
    const _cR1 = document.getElementById('canvasPrimaryLegend') as HTMLCanvasElement;
    const _cR2 = document.getElementById('canvasSecondayLegend') as HTMLCanvasElement;


    return {
      // @todo swap primary and secondary
      'primaryLegend':  this.isCanvasBlank(_cR1) ? '' : _cR1.toDataURL('image/jpg'),
      'secondaryLegend': this.isCanvasBlank(_cR2) ? '' : _cR2.toDataURL('image/jpg')
    };
  }

  isCanvasBlank(canvas) {
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;

    return canvas.toDataURL() === blank.toDataURL();
}

  ngOnInit() {
  }

}
