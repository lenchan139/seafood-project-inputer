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
  @ViewChild('thisVideoCamera') thisVideoCamera: ElementRef<HTMLVideoElement> | undefined
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('displayCanvas') displayCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('displayImg') displayImg: ElementRef<HTMLImageElement> | undefined
  
  @ViewChild('uploadImg') uploadImg: ElementRef<HTMLImageElement> | undefined
  @ViewChild('inputImg1') inputImg: ElementRef<HTMLImageElement> | undefined
  constructor(
    private commonService: CommonService,
    private dialogRef: MatDialogRef<CameraDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dataURL: string }
  ) {
  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.

    if (this.data?.dataURL && this.inputImg?.nativeElement) {
      console.log('incoming', this.data)
      this.inputImg!.nativeElement.addEventListener("load", () => {
        this.uploadCanvas!.nativeElement!.width = this.inputImg?.nativeElement.naturalWidth || 0
        this.uploadCanvas!.nativeElement!.height = this.inputImg?.nativeElement.naturalHeight || 0
        const ctx = this.uploadCanvas!.nativeElement!.getContext("2d")

        if (ctx) {
          ctx.drawImage(this.inputImg!.nativeElement, 0, 0);
          // this.uploadCanvas!.nativeElement!.width = this.inputImg?.nativeElement.naturalWidth || 0
          // this.uploadCanvas!.nativeElement!.height = this.inputImg?.nativeElement.naturalHeight || 0

          console.log('incoming', ctx)
          this.convertImgToDocumentCanvas()
        }
      })

      this.inputImg!.nativeElement.src = this.data.dataURL
      this.displayImg!.nativeElement.src = this.data.dataURL
    } else {
      this.openCameraCaputureDocument()

    }
  }


  isFromSteaming = false;
  openCameraCaputureDocument() {
    console.log('uploadCanvas', this.uploadCanvas?.nativeElement)
    if (this.uploadCanvas?.nativeElement) {
      const scanner = new jscanify();
      navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      }).then((stream) => {
        const scanner = new jscanify();
        // const video = document.createElement('video');
        const video = this.thisVideoCamera!.nativeElement
        video.srcObject = stream;
        const canvasCtx = this.displayCanvas!.nativeElement.getContext("2d");
        const uploadCanvasCtx = this.uploadCanvas!.nativeElement.getContext("2d");

        video.onloadedmetadata = () => {

          this.uploadCanvas!.nativeElement.width = video.videoWidth;
          this.uploadCanvas!.nativeElement.height = video.videoHeight;
          this.displayCanvas!.nativeElement.width = video.videoWidth;
          this.displayCanvas!.nativeElement.height = video.videoHeight;
          // stream.
          video.play();
          // video.onpl
          let t: any
          if (canvasCtx && uploadCanvasCtx) {
            const callback = () => {
              // clearTimeout(t)
              try {

                // Draw the video frame on the canvas
                // canvasCtx.drawImage(video, 0, 0);

                // // Highlight the paper and draw it on the same canvas
                // canvasCtx.clearRect(0, 0, this.uploadCanvas!.nativeElement.width, this.uploadCanvas!.nativeElement.height);  // Clear the canvas
                // canvasCtx.drawImage(resultCanvas, 0, 0);  // Draw the highlighted paper'

                canvasCtx.drawImage(video, 0, 0);
                uploadCanvasCtx.drawImage(video,0,0)
                const c = cv.imread(this.uploadCanvas!.nativeElement)
                const vxq = scanner.findPaperContour(c)
                const vx = scanner.getCornerPoints(vxq)
                // const selectedActualSize = {
                //   bottomWidth: vx.bottomRightCorner.x - vx.bottomLeftCorner.x,
                //   leftHeight: vx.bottomLeftCorner.y - vx.topLeftCorner.x,
                //   rightHeight: vx.bottomRightCorner.y - vx.topRightCorner.y,
                //   topWidth: vx.topRightCorner.x - vx.topLeftCorner.x,
                // }
                // console.log('corner ', vx)
                // console.log('corner size ', selectedActualSize)

                // const selectedActualSize = {
                //   bottomWidth: vx.bottomRightCorner.x - vx.bottomLeftCorner.x,
                //   leftHeight: vx.bottomLeftCorner.y - vx.topLeftCorner.x,
                //   rightHeight: vx.bottomRightCorner.y - vx.topRightCorner.y,
                //   topWidth: vx.topRightCorner.x - vx.topLeftCorner.x,
                // }
                // const resultCanvas = scanner.highlightPaper(this.uploadCanvas!.nativeElement);
                // canvasCtx.drawImage(video, 0, 0, resultCanvas.width, resultCanvas.height);
                // canvasCtx.clearRect(0, 0, this.uploadCanvas!.nativeElement.width, this.uploadCanvas!.nativeElement.height);  // Clear the canvas

                this.displayCanvas!.nativeElement.width = video.videoWidth;
                this.displayCanvas!.nativeElement.height = video.videoHeight;
                canvasCtx.moveTo(vx.topLeftCorner?.x||0, vx.topLeftCorner?.y||0)
                canvasCtx.lineTo(vx.topRightCorner?.x||0, vx.topRightCorner?.y||0)
                canvasCtx.lineTo(vx.bottomRightCorner?.x||0, vx.bottomRightCorner?.y||0)
                canvasCtx.lineTo(vx.bottomLeftCorner?.x||0, vx.bottomLeftCorner?.y||0)
                canvasCtx.lineTo(vx.topLeftCorner?.x||0, vx.topLeftCorner?.y||0)
                canvasCtx.lineWidth = 10
                canvasCtx.strokeStyle = "orange"
                canvasCtx.stroke()
                if (this.displayImg?.nativeElement) {
                  this.displayImg!.nativeElement!.src = this.displayCanvas!.nativeElement.toDataURL()
                }
                c.delete()
                // console.log('vv',scanner.getCornerPoints())
                // this.selectedImage!.nativeElement.src = ca
              } catch (e) {
                console.error('e', e)
              }
              // t=  setTimeout(()=>{requestAnimationFrame(callback)}, 100)
              // console.log('timeout no.', t)
              // callback()
            }
        async function f(){
          
              while (true) {

                await requestAnimationFrame(callback)
                 await sleep(100)
              }
            }
            f()
          }
        };

        // video.addEventListener("play", () => {
        //   const step = () => {
        //     const canvasCtx = this.uploadCanvas!.nativeElement.getContext("2d");
        //     if (canvasCtx) {
        //       const c = cv.imread(this.thisVideoCamera!.nativeElement)
        //       const vxq = scanner.findPaperContour(c)
        //       const vx = scanner.getCornerPoints(vxq)
        //       // const selectedActualSize = {
        //       //   bottomWidth: vx.bottomRightCorner.x - vx.bottomLeftCorner.x,
        //       //   leftHeight: vx.bottomLeftCorner.y - vx.topLeftCorner.x,
        //       //   rightHeight: vx.bottomRightCorner.y - vx.topRightCorner.y,
        //       //   topWidth: vx.topRightCorner.x - vx.topLeftCorner.x,
        //       // }
        //       // const resultCanvas = scanner.highlightPaper(this.uploadCanvas!.nativeElement);
        //       // canvasCtx.drawImage(video, 0, 0, resultCanvas.width, resultCanvas.height);
        //       canvasCtx.moveTo(vx.topLeftCorner.x,vx.topLeftCorner.y)
        //       canvasCtx.lineTo(vx.topRightCorner.x,vx.topRightCorner.y)
        //       canvasCtx.lineTo(vx.bottomRightCorner.x,vx.bottomRightCorner.y)
        //       canvasCtx.lineTo(vx.bottomLeftCorner.x,vx.bottomLeftCorner.y)
        //       canvasCtx.lineTo(vx.topLeftCorner.x,vx.topLeftCorner.y)
        //       canvasCtx.stroke()
        //       this.displayImg!.nativeElement!.src = this.uploadCanvas!.nativeElement.toDataURL()
        //       requestAnimationFrame(step);
        //     }
        //   }
        //   requestAnimationFrame(step);
        // });
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
      const vxq = scanner.findPaperContour(c)
      const vx = scanner.getCornerPoints(vxq)
      const selectedActualSize = {
        bottomWidth: vx.bottomRightCorner.x - vx.bottomLeftCorner.x,
        leftHeight: vx.bottomLeftCorner.y - vx.topLeftCorner.x,
        rightHeight: vx.bottomRightCorner.y - vx.topRightCorner.y,
        topWidth: vx.topRightCorner.x - vx.topLeftCorner.x,
      }
      console.log('corner ', vx)
      console.log('corner size ', selectedActualSize)



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
function sleep(ms:number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}