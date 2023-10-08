import { Injectable } from '@angular/core';

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

}

export type IBoxType = 'nameBox' | 'firstBox' | 'lastBox'
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