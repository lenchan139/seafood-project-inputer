import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.less']
})
export class UploadDialogComponent {
  inLoadDataUrl = ''
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined

  constructor(


    @Inject(MAT_DIALOG_DATA) public data: { dataURL: string },
  ) {

    if (data && data.dataURL) {
      this.inLoadDataUrl = data.dataURL
    }
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    const img = new Image()
    if (this.uploadCanvas?.nativeElement) {
      img.addEventListener("load", () => {
        const ctx = this.uploadCanvas!.nativeElement!.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      });

    img.setAttribute("src", this.inLoadDataUrl);
    }
  }
  uploadIt(){
    
  }
}
