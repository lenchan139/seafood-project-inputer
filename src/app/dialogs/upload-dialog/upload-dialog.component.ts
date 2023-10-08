import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BoxCropperSetService, IBoxType } from 'src/app/services/box-cropper-set.service';
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
  @ViewChild('testMask') testMask: ElementRef<HTMLCanvasElement> | undefined


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
          this.canny(canvasElement, canvasElement.id)
        imgElement.src = canvasElement.toDataURL()
      }

    }
  }


  canny(inCanvas: HTMLCanvasElement, resultCanvasId: string,) {
    // const { orgImg, brightness, contrast } = this.state;
    if (!inCanvas) return;
    const contrast = 1.5;
    const brightness = -60;
    const orgImg = cv.imread(inCanvas);
    // contrast & brightness
    const canny = new cv.Mat();
    orgImg.convertTo(canny, -1, contrast, brightness);
    cv.imshow("cannyContrastBrightness", canny);

    // gray->blur->canny
    cv.cvtColor(canny, canny, cv.COLOR_BGR2GRAY);
    cv.GaussianBlur(canny, canny, { width: 9, height: 9 }, 0);
    cv.Canny(canny, canny, 100, 200);
    cv.imshow("cannyEdge", canny);

    // find contours (and sort by area?)
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(
      canny,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE
    );

    // mask: flood fill
    const mask = cv.Mat.zeros(canny.rows, canny.cols, canny.type());
    for (let i = 0; i < contours.size(); ++i) {
      const contour = contours.get(i);
      cv.fillConvexPoly(mask, contour, [255, 255, 255, 1]);
      contour.delete();
    }
    // smooth mask and blur
    const tempMat = new cv.Mat();
    cv.dilate(mask, mask, tempMat, { x: -1, y: -1 }, 10);
    cv.erode(mask, mask, tempMat, { x: -1, y: -1 }, 10);
    cv.GaussianBlur(mask, mask, { width: 9, height: 9 }, 0);
    tempMat.delete();
    cv.imshow("cannyMask", mask);

    // blend result
    const foreground = new cv.Mat();
    // Convert Mat to float data type
    orgImg.convertTo(foreground, cv.CV_32FC4, 1 / 255);
    // Normalize the alpha mask to keep intensity between 0 and 1
    const newMask = new cv.Mat();
    const maskStack = new cv.MatVector();
    mask.convertTo(mask, cv.CV_32FC4, 1.0 / 255);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    maskStack.push_back(mask);
    cv.merge(maskStack, newMask);
    // console.log(newMask.type(), foreground.type(), orgImg.type());
    cv.multiply(newMask, foreground, foreground);
    foreground.convertTo(foreground, cv.CV_8UC3, 255);
    cv.imshow(inCanvas?.id, foreground);

    // cleanup
    foreground.delete();
    mask.delete();
    contours.delete();
    hierarchy.delete();
    canny.delete();
    orgImg.delete();

  };
  uploadIt() {

  }
}
