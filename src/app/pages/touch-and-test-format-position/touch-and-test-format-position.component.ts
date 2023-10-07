import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BoxCropperSetService, IBoxType } from 'src/app/services/box-cropper-set.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-touch-and-test-format-position',
  templateUrl: './touch-and-test-format-position.component.html',
  styleUrls: ['./touch-and-test-format-position.component.less']
})
export class TouchAndTestFormatPositionComponent implements AfterViewInit {

  @ViewChild('loadImg') loadImg: ElementRef<HTMLImageElement> | undefined
  @ViewChild('drawingCanvas') drawingCanvas: ElementRef<HTMLCanvasElement> | undefined

  @ViewChild('uploadInputElement') uploadImageInput: ElementRef<HTMLInputElement> | undefined
  constructor(
    private commonService: CommonService,
    private dialog: MatDialog,
    private boxCropperDatasetService: BoxCropperSetService,
  ) {

  }
  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

  }
  onImgClick(e: Event) {
    if (e instanceof PointerEvent) {
      console.log(e)
      console.log(e.target)
      const img = <HTMLImageElement>e.target
      console.log('masked img size', {
        width: img.width,
        height: img.height
      })
      console.log('actual img size', {
        width: img.naturalWidth,
        height: img.naturalHeight
      })
      console.log('currenct offset position', {
        x: e.offsetX,
        y: e.offsetY
      })
      const widthX = e.offsetX / img.width
      const heightY = e.offsetY / img.height
      console.log('percentage of width-x', widthX)
      console.log('percentage of width-y', heightY)
      this.commonService.openSnackBarDefault(`clicked x=${this.parseFloatLimit(widthX * 100, 10)}% y=${this.parseFloatLimit(heightY * 100, 10)}%`)
    }
  }
  parseFloatLimit(theNumber: number, n: number) {
    let v = 1
    if (n > 0) {
      for (const i of Array(n).keys()) {
        v = v * 10
      }
      let t = parseInt((theNumber * v).toString()) / v

      return t;
    }

    return theNumber
  }
  drawAllBox() {
    this.copyImgToCanvas()
    this.drawNameBox('nameBox')
    this.drawNameBox('firstBox')
    this.drawNameBox('lastBox')
    this.endDraw()
  }
  copyImgToCanvas() {
    this.drawingCanvas!.nativeElement.width = this.loadImg?.nativeElement.naturalWidth || 0
    this.drawingCanvas!.nativeElement.height = this.loadImg?.nativeElement.naturalHeight || 0

    const ctx = this.drawingCanvas!.nativeElement!.getContext("2d");

    if (ctx) {

      ctx.drawImage(this.loadImg!.nativeElement, 0, 0);

    }

  }

  drawNameBox(type?: IBoxType) {
    if (this.drawingCanvas?.nativeElement?.getContext) {
      // this.drawingCanvas!.nativeElement.width = this.loadImg?.nativeElement.naturalWidth || 0
      // this.drawingCanvas!.nativeElement.height = this.loadImg?.nativeElement.naturalHeight || 0

      const nameBoxDataset = this.boxCropperDatasetService.getBoxCornerActualPosition(
        this.drawingCanvas!.nativeElement.width,
        this.drawingCanvas!.nativeElement.height,
        type || 'nameBox'
      )
      const ctx = this.drawingCanvas!.nativeElement!.getContext("2d");
      if (ctx) {

        // ctx.beginPath();
        ctx.moveTo(nameBoxDataset.topLeft.x, nameBoxDataset.topLeft.y);
        ctx.lineTo(nameBoxDataset.topRight.x, nameBoxDataset.topRight.y);
        ctx.lineTo(nameBoxDataset.bottomRight.x, nameBoxDataset.bottomRight.y);
        ctx.lineTo(nameBoxDataset.bottomLeft.x, nameBoxDataset.bottomLeft.y);
        ctx.lineTo(nameBoxDataset.topLeft.x, nameBoxDataset.topLeft.y);
        ctx.strokeStyle = "red";
        // ctx.stroke();
      }
    }
  }
  endDraw() {

    if (this.drawingCanvas?.nativeElement?.getContext) {
      const ctx = this.drawingCanvas!.nativeElement!.getContext("2d");
      if (ctx) {
        ctx.stroke();
      }
    }
  }


  async onUploadImage(e: Event) {
    console.log(e)
    console.log(e.target)
    const t = <HTMLInputElement>e.target

    console.log(t.files)
    if (t?.files && t?.files?.length > 0) {
      const tfile1 = t.files[0]
      const fileReader = new FileReader()
      if (this.loadImg && this.loadImg?.nativeElement && tfile1) {
        try {

          // const buffer = await tfile1.arrayBuffer()

          // this.selectedImage!.nativeElement!.onload = (e) => {
          //   this.convertImgToDocumentCanvas()
          // }
          // this.selectedImage!.nativeElement!.src = URL.createObjectURL(tfile1)
          // this.openCameraDialog(URL.createObjectURL(tfile1))
          this.loadImg!.nativeElement.src = URL.createObjectURL(tfile1)


        } catch (e: any) {
          console.log('got file have error', e)
          this.commonService.openSnackBarDefault("Converting file have erorr: ", `${e?.toString()}`)
        }

      }
    }
  }


  
  clickInputUploadImage() {
    if (this.uploadImageInput?.nativeElement) {
      console.log('1')
      this.uploadImageInput.nativeElement.value = ""
      this.uploadImageInput.nativeElement.click()
    }
  }
}
