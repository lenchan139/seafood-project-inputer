import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoxCropperSetService, IBoxType } from 'src/app/services/box-cropper-set.service';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.less']
})
export class UploadDialogComponent {
  inLoadDataUrl = ''
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined

  @ViewChild('nameboxCanvas') nameboxCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('box1canvas') box1canvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('box2canvas') box2canvas: ElementRef<HTMLCanvasElement> | undefined


  @ViewChild('nameboxImg') nameboxImg: ElementRef<HTMLImageElement> | undefined
  @ViewChild('box1img') box1img: ElementRef<HTMLImageElement> | undefined
  @ViewChild('box2img') box2img: ElementRef<HTMLImageElement> | undefined

  constructor(


    @Inject(MAT_DIALOG_DATA) public data: { dataURL: string },
    private dialogRef: MatDialogRef<UploadDialogComponent>,
    private boxCropService: BoxCropperSetService,
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
        this.uploadCanvas!.nativeElement.width = img.naturalWidth
        this.uploadCanvas!.nativeElement.height = img.naturalHeight
        const ctx = this.uploadCanvas!.nativeElement!.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          this.cropBoxToCanvas('nameBox')
          this.cropBoxToCanvas('firstBox')
          this.cropBoxToCanvas('lastBox')
        }
      });

      img.setAttribute("src", this.inLoadDataUrl);
    }
  }


  cropBoxToCanvas(type: IBoxType) {
    if (type && this.nameboxCanvas?.nativeElement && this.box1canvas?.nativeElement && this.box2canvas?.nativeElement) {
      const boxDataset = this.boxCropService.getBoxCornerActualPosition(
        this.uploadCanvas!.nativeElement.width,
        this.uploadCanvas!.nativeElement.height,
        type
      )
      const canvasElement = type == 'nameBox' ? this.nameboxCanvas!.nativeElement : type == 'firstBox' ? this.box1canvas!.nativeElement : this.box2canvas!.nativeElement
      const imgElement = type == 'nameBox' ? this.nameboxImg!.nativeElement : type == 'firstBox' ? this.box1img!.nativeElement : this.box2img!.nativeElement
      // end get input data,then calculate width/height
      const squaredWidth = boxDataset.bottomRight.x  -boxDataset.bottomLeft.x
      const squaredHeight = boxDataset.bottomRight.y - boxDataset.topRight.y

      // try set the canvas width/height
      canvasElement.width = squaredWidth
      canvasElement.height = squaredHeight

      //draw canvas cropped image 
      const ctx = canvasElement.getContext("2d")
      if(ctx){
        ctx.drawImage(
          this.uploadCanvas!.nativeElement,
          boxDataset.topLeft.x,boxDataset.topLeft.y,squaredWidth,squaredHeight,  // source rect with content to crop
          0,0,squaredWidth,squaredHeight);      // newCanvas, same size as source rect
          imgElement.src = canvasElement.toDataURL()
      }

    }
  }
  uploadIt() {

  }
}
