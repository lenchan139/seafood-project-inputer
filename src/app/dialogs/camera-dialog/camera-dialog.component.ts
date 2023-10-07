import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild, } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonService } from 'src/app/services/common.service';
declare var jscanify: any
declare var cv: any
@Component({
  selector: 'app-camera-dialog',
  templateUrl: './camera-dialog.component.html',
  styleUrls: ['./camera-dialog.component.less']
})
export class CameraDialogComponent implements AfterViewInit {
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('displayImg') displayImg :ElementRef<HTMLImageElement> | undefined
  @ViewChild('uploadImg') uploadImg :ElementRef<HTMLImageElement> | undefined
  constructor(
    private commonService: CommonService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CameraDialogComponent>
  ) {
    // this.openCameraCaputureDocument()
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
    this.openCameraCaputureDocument()
  }


  isFromSteaming = false;
  openCameraCaputureDocument() {
    console.log('uploadCanvas', this.uploadCanvas?.nativeElement)
    if (this.uploadCanvas?.nativeElement) {
      const scanner = new jscanify();
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {

        const video = document.createElement('video');
        video.srcObject = stream;
        const canvasCtx = this.uploadCanvas!.nativeElement.getContext("2d");
        video.onloadedmetadata = () => {

          this.uploadCanvas!.nativeElement.width = video.videoWidth;
          this.uploadCanvas!.nativeElement.height = video.videoHeight;

          video.play();
          if (canvasCtx) {
            setInterval(() => {
              // Draw the video frame on the canvas
              canvasCtx.drawImage(video, 0, 0);

              // Highlight the paper and draw it on the same canvas
              const resultCanvas = scanner.highlightPaper(this.uploadCanvas!.nativeElement);
              // canvasCtx.clearRect(0, 0, this.uploadCanvas!.nativeElement.width, this.uploadCanvas!.nativeElement.height);  // Clear the canvas
              // canvasCtx.drawImage(resultCanvas, 0, 0);  // Draw the highlighted paper'
              canvasCtx
              .drawImage(video, 0, 0, resultCanvas.width, resultCanvas.height);
              if(this.displayImg?.nativeElement){
                this.displayImg!.nativeElement!.src = resultCanvas.toDataURL()
              }
              // console.log('vv',scanner.getCornerPoints())
              // this.selectedImage!.nativeElement.src = ca
            }, 10);
          }
        };
      }).finally(() => {
        this.isFromSteaming = false;
      });
    } else {

      // this.isFromSteaming = false;
    }
  }

  convertImgToDocumentCanvas() {
    if (this.displayImg?.nativeElement?.src && this.uploadCanvas?.nativeElement) {
      const scanner = new jscanify();
      const c = cv.imread(this.uploadCanvas!.nativeElement)
      const vxq =  scanner.findPaperContour(c)
      const vx = scanner.getCornerPoints(vxq)
      const selectedActualSize = {
        bottomWidth: vx.bottomRightCorner.x - vx.bottomLeftCorner.x,
        leftHeight: vx.bottomLeftCorner.y - vx.topLeftCorner.x,
        rightHeight: vx.bottomRightCorner.y - vx.topRightCorner.y,
        topWidth: vx.topRightCorner.x - vx.topLeftCorner.x,
      }
      console.log('corner ',vx)
      console.log('corner size ',selectedActualSize)



      const paperWidth = selectedActualSize.bottomWidth > selectedActualSize.topWidth ? selectedActualSize.bottomWidth : selectedActualSize.topWidth;
      const paperHeight = selectedActualSize.leftHeight > selectedActualSize.rightHeight ? selectedActualSize.leftHeight : selectedActualSize.rightHeight;

      const generatedCanvas = scanner.extractPaper(this.uploadCanvas!.nativeElement, paperWidth, paperHeight);
      console.log('canvas', generatedCanvas)
      this.uploadImg!.nativeElement.src = generatedCanvas.toDataURL()
      this.dialogRef.close(generatedCanvas.toDataURL())
      // this.resultCanvas.nativeElement.innerHTML = ''
      // this.resultCanvas.nativeElement.appendChild(generatedCanvas);
      // const f = <HTMLCanvasElement>this.resultCanvas!.nativeElement.firstChild
      // if (f) f.id = 'generatedCanvas'
    };

  }
  takeIt() {
    if (this.uploadCanvas!.nativeElement.toDataURL()) {
      this.dialogRef.close(this.uploadCanvas!.nativeElement.toDataURL())
    }
  }
}
