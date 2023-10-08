import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
declare var cv: any
@Component({
  selector: 'app-crop-dialog',
  templateUrl: './crop-dialog.component.html',
  styleUrls: ['./crop-dialog.component.less']
})
export class CropDialogComponent implements AfterViewInit {
  inLoadDataUrl = ''
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined

  @ViewChild('displayImg') displayImg: ElementRef<HTMLImageElement> | undefined
  @ViewChild('inputImg') inputImg: ElementRef<HTMLImageElement> | undefined
  constructor(


    @Inject(MAT_DIALOG_DATA) public data: { dataURL: string },
    private dialogRef: MatDialogRef<CropDialogComponent>,
  ) {

    if (data && data.dataURL) {
      this.inLoadDataUrl = data.dataURL
    }
  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    // const img = new Image()
    this.inputImg!.nativeElement.src = this.inLoadDataUrl
    if (this.inputImg?.nativeElement && this.uploadCanvas?.nativeElement) {
      this.inputImg!.nativeElement.addEventListener("load", () => {
        this.uploadCanvas!.nativeElement!.width = this.inputImg?.nativeElement.naturalWidth || 0
        this.uploadCanvas!.nativeElement!.height = this.inputImg?.nativeElement.naturalHeight || 0
        const ctx = this.uploadCanvas!.nativeElement!.getContext("2d")

        if (ctx) {
          ctx.drawImage(this.inputImg!.nativeElement, 0, 0);
          // this.uploadCanvas!.nativeElement!.width = this.inputImg?.nativeElement.naturalWidth || 0
          // this.uploadCanvas!.nativeElement!.height = this.inputImg?.nativeElement.naturalHeight || 0

          this.updateCanvasToImg()
        }
      });

      this.inputImg!.nativeElement.setAttribute("src", this.inLoadDataUrl);

    }
  }

  cropIt() {
    const dataURL = this.uploadCanvas?.nativeElement.toDataURL()
    if (dataURL) {
      this.dialogRef.close(dataURL)
    }
  }
  updateCanvasToImg() {
    if (this.displayImg?.nativeElement && this.uploadCanvas?.nativeElement) {
      this.displayImg!.nativeElement.src = this.uploadCanvas!.nativeElement.toDataURL()
      this.inputImg!.nativeElement.style.display = 'none'
    }
  }

  rotateControl(rotate: -1 | 1) {
    let src = cv.imread('uploadCanvas1');
    let dst = new cv.Mat();
    cv.rotate(src, dst, rotate == -1 ? cv.ROTATE_90_CLOCKWISE : cv.ROTATE_90_COUNTERCLOCKWISE);
    cv.imshow('uploadCanvas1', dst);
    src.delete()
    dst.delete()
    this.updateCanvasToImg()
  }
}
