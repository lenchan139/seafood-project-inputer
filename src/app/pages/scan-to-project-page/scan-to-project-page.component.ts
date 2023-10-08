import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CameraDialogComponent } from 'src/app/dialogs/camera-dialog/camera-dialog.component';
import { CropDialogComponent } from 'src/app/dialogs/crop-dialog/crop-dialog.component';
import { UploadDialogComponent } from 'src/app/dialogs/upload-dialog/upload-dialog.component';
import { CommonService } from 'src/app/services/common.service';
import { environment } from 'src/environments/environment';
declare var jscanify: any
declare var cv: any

@Component({
  selector: 'app-scan-to-project-page',
  templateUrl: './scan-to-project-page.component.html',
  styleUrls: ['./scan-to-project-page.component.less']
})
export class ScanToProjectPageComponent implements OnInit {
  @ViewChild('uploadInputElement') uploadImageInput: ElementRef<HTMLInputElement> | undefined
  @ViewChild('selectedImage') selectedImage: ElementRef<HTMLImageElement> | undefined
  @ViewChild('resultCanvas') resultCanvas: ElementRef<HTMLDivElement> | undefined
  @ViewChild('uploadCanvas') uploadCanvas: ElementRef<HTMLCanvasElement> | undefined
  @ViewChild('outputCanvas') outputCanvas: ElementRef<HTMLCanvasElement> | undefined
  constructor(
    private commonService: CommonService,
    private dialog: MatDialog,
  ) {

  }

  isProductionEnv = environment.production

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

  }


  async onUploadImage(e: Event) {
    console.log(e)
    console.log(e.target)
    const t = <HTMLInputElement>e.target

    console.log(t.files)
    if (t?.files && t?.files?.length > 0) {
      const tfile1 = t.files[0]
      const fileReader = new FileReader()
      if (this.selectedImage && this.selectedImage?.nativeElement && tfile1) {
        try {

          // const buffer = await tfile1.arrayBuffer()

          // this.selectedImage!.nativeElement!.onload = (e) => {
          //   this.convertImgToDocumentCanvas()
          // }
          // this.selectedImage!.nativeElement!.src = URL.createObjectURL(tfile1)
          this.openCameraDialog(URL.createObjectURL(tfile1))



        } catch (e: any) {
          console.log('got file have error', e)
          this.commonService.openSnackBarDefault("Converting file have erorr: ", `${e?.toString()}`)
        }

      }
    }

  }
  isFromSteaming = false;
  openCameraCaputureDocument() {

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
              canvasCtx.clearRect(0, 0, this.uploadCanvas!.nativeElement.width, this.uploadCanvas!.nativeElement.height);  // Clear the canvas
              canvasCtx.drawImage(resultCanvas, 0, 0);  // Draw the highlighted paper'
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
  caputureSteamingAndToImage() {
    const canvasImg = this.uploadCanvas?.nativeElement.toDataURL()
    this.isFromSteaming = false;
    if (canvasImg) {
      this.selectedImage!.nativeElement!.onload = (e) => {
        this.convertImgToDocumentCanvas()
      }
      this.selectedImage!.nativeElement.src = canvasImg
    }

  }
  clickInputUploadImage() {
    if (this.uploadImageInput?.nativeElement) {
      console.log('1')
      this.uploadImageInput.nativeElement.value = ""
      this.uploadImageInput.nativeElement.click()
    }
  }

  rotateControl(rotate: -1 | 1) {
    let src = cv.imread('generatedCanvas');
    let dst = new cv.Mat();
    cv.rotate(src, dst, rotate == -1 ? cv.ROTATE_90_CLOCKWISE : cv.ROTATE_90_COUNTERCLOCKWISE);
    cv.imshow('generatedCanvas', dst);
    src.delete()
    dst.delete()
  }

  convertImgToDocumentCanvas() {
    if (this.selectedImage?.nativeElement?.src && this.resultCanvas?.nativeElement) {
      const scanner = new jscanify();
      const paperWidth = 768;
      const paperHeight = 1024;
      const generatedCanvas = scanner.extractPaper(this.uploadCanvas!.nativeElement, paperWidth, paperHeight);
      console.log('canvas', generatedCanvas)
      this.resultCanvas.nativeElement.innerHTML = ''
      this.resultCanvas.nativeElement.appendChild(generatedCanvas);
      const f = <HTMLCanvasElement>this.resultCanvas!.nativeElement.firstChild
      if (f) f.id = 'generatedCanvas'
    };

  }

  openCameraDialog(dataURL?:string) {
    const dialogRef = this.dialog.open(CameraDialogComponent, {
      data: {
        dataURL:dataURL||''
      }
    })
    dialogRef.afterClosed().subscribe(dataURL => {
      if (dataURL) {
        console.log(dataURL)
        this.openCropDialog(dataURL)
      }
    })
  }
  openCropDialog(dataURL: string) {
    const dialogRef = this.dialog.open(CropDialogComponent, {
      data: {
        dataURL: dataURL,
      }
    })
    dialogRef.afterClosed().subscribe(dataURL => {
      if (dataURL) {
        console.log(dataURL)
        this.openFinalUploadDialog(dataURL)
      }
    })
  }

  openFinalUploadDialog(dataURL: string) {
    const dialogRef = this.dialog.open(UploadDialogComponent, {
      data: {
        dataURL: dataURL,
      }
    })
    dialogRef.afterClosed().subscribe(dataURL => {
      if (dataURL) {
        console.log(dataURL)
      }
    })
  }
}
