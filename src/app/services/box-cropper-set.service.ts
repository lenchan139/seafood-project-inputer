import { Injectable } from '@angular/core';
declare var cv :any
@Injectable({
  providedIn: 'root'
})
export class BoxCropperSetService {

  constructor() { }

  private boxCropDataset = new Map<IBoxType, IBoxDataset>([
    ["nameBox", {
      leftTop: { x: 0.112, y: 0.109170305676 },
      rightBottom: { x: 0.608, y: 0.17903930131 }
    },
    ],
    [
      "firstBox", {
        leftTop: { x: 0, y: 0.3173216885007278 },
        rightBottom: { x: 1, y: 0.5909752547307132 }
      },
    ],
    [
      "lastBox", {
        leftTop: { x: 0, y: 0.5909752547307132 },
        rightBottom: { x: 1, y: 0.8646288209606987 }
      }
    ],
    [
      "qrcodeBox",
      {
        // clicked x=70.8% y=24.308588064%
        leftTop: { x: 0.708, y: 0 },
        rightBottom: { x: 1, y: 0.24308588 }
      }
    ]
  ])
  getBoxCornerActualPosition(width: number, height: number, typeBox: IBoxType): IBoxCornerResult {
    const selectedbox = <IBoxDataset>this.boxCropDataset.get(typeBox)
    return {
      topLeft: {
        x: width * selectedbox.leftTop.x,
        y: height * selectedbox.leftTop.y,
      },
      topRight: {
        x: width * selectedbox.rightBottom.x,
        y: height * selectedbox.leftTop.y,
      },
      bottomLeft: {
        x: width * selectedbox.leftTop.x,
        y: height * selectedbox.rightBottom.y,
      },
      bottomRight: {
        x: width * selectedbox.rightBottom.x,
        y: height * selectedbox.rightBottom.y,
      }

    }
  }
  cropCanvas(sourceCanvas: HTMLCanvasElement, left: number, top: number, width: number, height: number) {
    let destCanvas = document.createElement('canvas');
    destCanvas.width = width;
    destCanvas.height = height;
    const ctx = destCanvas.getContext("2d")
    if (ctx) {
      ctx.drawImage(
        sourceCanvas,
        left, top, width, height,  // source rect with content to crop
        0, 0, width, height);      // newCanvas, same size as source rect
      return destCanvas;
    }
    return null;
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
    // cv.imshow("cannyContrastBrightness", canny);

    // gray->blur->canny
    cv.cvtColor(canny, canny, cv.COLOR_BGR2GRAY);
    cv.GaussianBlur(canny, canny, { width: 9, height: 9 }, 0);
    cv.Canny(canny, canny, 100, 200);
    // cv.imshow("cannyEdge", canny);

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
    // cv.imshow("cannyMask", mask);

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
}

export type IBoxType = 'nameBox' | 'firstBox' | 'lastBox' | 'qrcodeBox'
interface IXY {
  x: number,
  y: number,
}
interface IBoxDataset {
  leftTop: IXY,
  rightBottom: IXY
}
interface IBoxCornerResult {
  topLeft: IXY,
  topRight: IXY,
  bottomLeft: IXY,
  bottomRight: IXY,

}