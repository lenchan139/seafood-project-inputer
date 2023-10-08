import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoxCropperSetService, IBoxType } from 'src/app/services/box-cropper-set.service';
declare var QrcodeDecoder : any 
declare var cv: any
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
  @ViewChild('qrcodeBoxCanvas') qrcodeBoxCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('testMask') testMask: ElementRef<HTMLCanvasElement> | undefined


  @ViewChild('nameboxImg') nameboxImg: ElementRef<HTMLImageElement> | undefined
  @ViewChild('box1img') box1img: ElementRef<HTMLImageElement> | undefined
  @ViewChild('box2img') box2img: ElementRef<HTMLImageElement> | undefined
  @ViewChild('qrcodeBoxImg') qrcodeBoxImg: ElementRef<HTMLImageElement> | undefined
  templateName = '_unknown_template'
  shouldHideTemplatQrcode = false
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
          this.cropBoxToCanvas('qrcodeBox')
          this.tryDecodeQrcode()
        }
      });

      img.setAttribute("src", this.inLoadDataUrl);
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
          this.templateName =   url.searchParams.get('templateName') ||'_qr_got_with_empty_tname'
         }catch(e:any){
          console.error('e',e)
          if(e instanceof TypeError){
            this.templateName = '_qr_got_but_not_valid_url'
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

  cropBoxToCanvas(type: IBoxType) {
    if (type && this.nameboxCanvas?.nativeElement && this.box1canvas?.nativeElement && this.box2canvas?.nativeElement) {
      const boxDataset = this.boxCropService.getBoxCornerActualPosition(
        this.uploadCanvas!.nativeElement.width,
        this.uploadCanvas!.nativeElement.height,
        type
      )
      const canvasElement = type == 'qrcodeBox' ? this.qrcodeBoxCanvas!.nativeElement : type == 'nameBox' ? this.nameboxCanvas!.nativeElement : type == 'firstBox' ? this.box1canvas!.nativeElement : this.box2canvas!.nativeElement
      const imgElement = type == 'qrcodeBox' ? this.qrcodeBoxImg!.nativeElement : type == 'nameBox' ? this.nameboxImg!.nativeElement : type == 'firstBox' ? this.box1img!.nativeElement : this.box2img!.nativeElement
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
        imgElement.src = canvasElement.toDataURL()
      }

    }
  }


  uploadIt() {

  }
}
