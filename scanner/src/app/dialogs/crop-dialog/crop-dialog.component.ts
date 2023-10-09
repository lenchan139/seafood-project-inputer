import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoxCropperSetService, IBoxType } from 'src/app/services/box-cropper-set.service';
declare var cv: any
declare var QrcodeDecoder : any
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

  @ViewChild('qrcodeBoxCanvas') qrcodeBoxCanvas: ElementRef<HTMLCanvasElement> | undefined

  @ViewChild('qrcodeBoxImg') qrcodeBoxImg: ElementRef<HTMLImageElement> | undefined
  shouldHideTemplatQrcode  =false;
  constructor(


    @Inject(MAT_DIALOG_DATA) public data: { dataURL: string },
    private dialogRef: MatDialogRef<CropDialogComponent>,
    private boxCropService:BoxCropperSetService,
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
          this.cropQrCodeBoxToCanvas()
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

  cropQrCodeBoxToCanvas() {
    const type = 'qrcodeBox'
    if (type && this.qrcodeBoxCanvas?.nativeElement) {
      const boxDataset = this.boxCropService.getBoxCornerActualPosition(
        this.uploadCanvas!.nativeElement.width,
        this.uploadCanvas!.nativeElement.height,
        type
      )
      const canvasElement = this.qrcodeBoxCanvas!.nativeElement 
      const imgElement =  this.qrcodeBoxImg!.nativeElement
      // end get input data,then calculate width/height
      const squaredWidth = boxDataset.bottomRight.x - boxDataset.bottomLeft.x
      const squaredHeight = boxDataset.bottomRight.y - boxDataset.topRight.y

      // try set the canvas width/height
      canvasElement.width = squaredWidth
      canvasElement.height = squaredHeight

      //draw canvas cropped image 
      const ctx = canvasElement.getContext("2d")
      if (ctx) {
        ctx.drawImage(
          this.uploadCanvas!.nativeElement,
          boxDataset.topLeft.x, boxDataset.topLeft.y, squaredWidth, squaredHeight,  // source rect with content to crop
          0, 0, squaredWidth, squaredHeight);      // newCanvas, same size as source rect
        this.boxCropService.canny(canvasElement, canvasElement.id)
        imgElement.onload=()=>{
          this.tryDecodeQrcode()
        }
        imgElement.src = canvasElement.toDataURL()
      }

    }
  }


  tryDecodeQrcode() {
    const qr = new QrcodeDecoder();
    const imgT = new Image()
    imgT.onload = ()=>{
      qr.decodeFromImage(imgT).then((v: any)=>{
        console.log('got data from qr', v)
        if(v?.data && typeof v?.data  == 'string'){
          const qrData = <string> v.data
         try{
          const url = new URL(qrData)
          this.cropIt()
          // this.templateName =   url.searchParams.get('templateName') ||'_qr_got_with_empty_tname'
         }catch(e:any){
          console.error('e',e)
          if(e instanceof TypeError){
            // this.templateName = '_qr_got_but_not_valid_url'
          }

         }
        }
      })
      .catch((e: any)=>{
        console.error('got error from qr', e)
      })
      .finally(()=>{
        console.log('load qr end')
        this.shouldHideTemplatQrcode = true;
      })
    }
    imgT.src = this.qrcodeBoxCanvas!.nativeElement.toDataURL()
  }
}
