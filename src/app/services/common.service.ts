import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, Inject, ElementRef } from '@angular/core';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  private keyOfInAppUserAgent = 'app-in-webview'
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private _snackbar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private title: Title,
  ) {
  }
  isBrowser() {
    return isPlatformBrowser(this.platformId)
  }

  isGooglebot() {
    if (this.isBrowser()) {
      if (window && document && navigator && navigator.userAgent) {
        return navigator.userAgent.includes('ooglebot')
      }
    }
    return false
  }

  isHeadlessChrome() {
    if (this.isBrowser()) {
      if (window && document && navigator && navigator.userAgent) {
        return navigator.userAgent.includes('HeadlessChrome/')
      }
    }
    return false
  }

  setTitle(newTitle: string) {
    return this.title.setTitle(newTitle)
  }

  getTitle() {
    return this.title.getTitle()
  }

  openSnackBarDefault(message: string, action?: string, duration?: number) {
    return this._snackbar.open(message, action, {
      duration: duration ?? 3500,
    })
  }
  reverseNegativeOrPositiveNumber(n: number) {
    return n - (n * 2)
  }

  unsubAllSubscription(sub: Subscription[]) {
    if (sub && sub.length > 0)
      for (const s of sub) {
        if (s) {
          try {
            s.unsubscribe()
          } catch (e) {

          }
        }
      }
  }
  invertColor(hex: string) {
    if (hex.indexOf('#') === 0) {
      hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
      throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
      g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
      b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + this.padZero(r) + this.padZero(g) + this.padZero(b);
  }

  private padZero(str: string, len?: number) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
  }

  exportTableToCSVAndDownloadIt(tableId: string, filename: string, ingoreColFromLast: number) {
    if (!this.isBrowser()) return
    var csv = [];
    const date = new Date()
    // const filename = `exported+${date.toISOString()}.csv`
    var rows = document?.getElementById(tableId)?.querySelectorAll("tr");
    if (rows && rows?.length > 0) {
      for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td");
        for (var j = 0; j < cols.length - ingoreColFromLast; j++) {
          const toAddText = `"${cols[j].innerText.replace(/\"/, `''`).replace(/,/, '，')}"`;

          row.push(toAddText);
        }
        csv.push(row.join(","));
      }
    }
    // Download CSV file
    this.downloadCSV(csv.join("\n"), filename);
  }
  downloadCSV(csv: string, filename: string) {
    if (!this.isBrowser()) return
    var csvFile;
    var downloadLink;
    // CSV file
    csvFile = new Blob([csv], { type: "text/csv" });
    // Download link
    downloadLink = document.createElement("a");
    // File name
    downloadLink.download = filename;
    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);
    // Hide download link
    downloadLink.style.display = "none";
    // Add the link to DOM
    document.body.appendChild(downloadLink);
    // Click download link
    downloadLink.click();
  }

  domOpenAuthDialog() {
    if (this.isBrowser()) {
      const button = document.getElementById('openAuthDialogButton')
      if (button) {
        button.click()
      }
    }
  }

  get canOpenShare() {
    if (this.isBrowser() && navigator) {
      return true
    }
    return false
  }
  async shareContent(shareData: { title?: string, text?: string, url?: string }) {
    const n = window?.navigator || navigator
    if (this.canOpenShare) {
      try {

        const result = await n.share(shareData)
        return result
      } catch (e: any) {
        console.error(e)
        const ignoreError = ["AbortError"]
        if (e && shareData && !ignoreError.includes(e?.name)) {
          this.openSnackBarDefault(`${'share_content_copy_to_clipboard'} (E:${e?.name})`)
          this.copyToClipboard(shareData?.text || '')
        }
      }
    }
    return false
  }

  get beginTodayInUTC() {
    return new Date(new Date().toISOString().split('T')[0])
  }
  private fallbackCopyTextToClipboard(text: string) {
    if (!this.isBrowser()) return;
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
  }

  copyToClipboard(content: string) {
    if (!this.isBrowser()) return;
    if (!navigator.clipboard) {
      this.fallbackCopyTextToClipboard(content);
      return;
    }
    navigator.clipboard.writeText(content).then(function () {
      console.log('Async: Copying to clipboard was successful!');
    }, function (err) {
      console.error('Async: Could not copy text: ', err);
    });
  }
  checkIsInWebviewApp() {
    if (this.isBrowser() && window && window.navigator && window.navigator.userAgent) {
      const userAgent = window.navigator.userAgent

      return (userAgent.includes(this.keyOfInAppUserAgent))

    }
    return false;
  }

  spiltAndJoinEach(rawStr: string, joinStr: string, i: number) {
    const it = parseInt(i.toString())

    let numbers = rawStr.match(/.{1,4}/g)
    return numbers?.join(joinStr)
  }

  tryPrerenderThatPage(url: string) {
    // no long require.
    // const prefix = '/api/prerender/'
    // console.log('caching new', url)
    // if (url && !this.isHeadlessChrome() && !url.includes('localhost')) {
    //   return this.http.get(prefix + url).subscribe(res => {
    //if(this.commonService.isBrowser()) console.log('caching success', res)
    //   }, e => {
    //     console.error('caching failed', e)
    //   })
    // }
    return null;
  }
  updateHistory(routeArray: string[]) {
    if (this.isBrowser() && history) {
      history.pushState(null, '', `/${routeArray.join('/')}`)
    }
  }

  shuffle(array: any[]) {
    return array.sort(() => Math.random() - 0.5);
  }
  showHideSleekflowChatroom(shouldShow: boolean) {
    if (this.isBrowser()) {
      const item = this.document.getElementById('travischatwidget')
      if (item) {
        if (!shouldShow) item.style.display = 'none'
        else item.style.display = ''
      }
    }
  }
  get currentDomain() {
    if (this.isBrowser()) {
      return location.origin
    }
    return ''
  }

  get isInStandaloneMode(): boolean {
    if (!this.isBrowser()) return false;
    return (window.matchMedia('(display-mode: standalone)').matches) || ((<any>window.navigator).standalone) || document.referrer.includes('android-app://');
  }

  csvLineToString(s: string[]) {
    const y: string[] = []
    for (const i of s) {
      y.push(`"${i ? i.replace(/"/, "“") : ''}"`)
    }
    return y.join(", ");
  }
  datetimeToShorterDateTimeString(datetime: Date) {
    const currDateTime = new Date()

    if (currDateTime.getFullYear() > datetime.getFullYear()) {
      // mismatch year
      return `${currDateTime.getFullYear() - datetime.getFullYear()} years ago`
    } else if (currDateTime.getMonth() - datetime.getMonth()) {
      return null;
    }

    return null;

  }
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  getOrderdNumberArray(n: number) {

    return Array(n).fill(null).map((_, i) => i);

  }

  drawPieChart(canvasRef: ElementRef<HTMLCanvasElement>, inData: IChartHtmlData[]) {
    console.log('drawPieChart', canvasRef)
    if (canvasRef && canvasRef.nativeElement && this.isBrowser()) {
      console.log('drawPieChart')
      const canvas = canvasRef.nativeElement;
      var ctx = canvas.getContext("2d");
      var lastend = 0;
      var data = inData.map((v => v.count))
      var myTotal = 0;
      var myColor = inData.map(v => v.color);
      var labels = inData.map(v => v.label)

      for (var e = 0; e < data.length; e++) {
        myTotal += data[e];
      }

      // make the chart 10 px smaller to fit on canvas
      var off = 10
      var w = (canvas.width - off) / 2
      var h = (canvas.height - off) / 2
      if (ctx) {
        for (var i = 0; i < data.length; i++) {
          ctx.fillStyle = myColor[i];
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(w, h);
          var len = (data[i] / myTotal) * 2 * Math.PI
          var r = h - off / 2
          ctx.arc(w, h, r, lastend, lastend + len, false);
          ctx.lineTo(w, h);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = 'white';
          ctx.font = "20px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          var mid = lastend + len / 2
          ctx.fillText(labels[i], w + Math.cos(mid) * (r / 2), h + Math.sin(mid) * (r / 2));
          lastend += Math.PI * 2 * (data[i] / myTotal);
        }
      }
    }
  }

  get randomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
  }
  isAndroidOrIOS(): 'android' | 'ios' | '' {
    if (this.isBrowser()) {
      const userAgent = navigator.userAgent;
      if (/android/i.test(userAgent)) {
        return 'android';
      }
      if (/iPad|iPhone|iPod/i.test(userAgent)) {
        return 'ios';
      }
    }
    return ''
  }

}


export interface GetFcmTokenResult {

  isAppToken: boolean,
  token: string

}

export interface IChartHtmlData {
  count: number,
  label: string,
  color: string
}