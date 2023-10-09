import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { SubLevelNavItem } from '../interface/NavigationItems';
import { CommonService } from '../services/common.service';
import { Observable, map, shareReplay, startWith } from 'rxjs';
import { environment } from 'src/environments/environment';

declare const $: any
@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.less']
})
export class NavigationBarComponent {
  onlyInHomepage = false;
  @ViewChild('toolbar') toolbar: ElementRef | undefined

  @ViewChild('drawer') public sidenav: MatSidenav | undefined
  get appTitle(){
    return environment.appTitle
  }
  topNavItems: Array<SubLevelNavItem> = [];
  constructor(

    private breakpointObserver: BreakpointObserver,
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute,
    private router: Router,

  ) {

    this.topNavItems = this._topNavItems;

    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          console.log('current url', event.url);
          // Prints the current route
          // Eg.- /products
          this.onlyInHomepage = event.url == '/'
        }
      }
    )
  }

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay(),
      startWith(false)
    );

  get isHeadlessChrome() {
    return this.commonService.isHeadlessChrome()
  }

  updateScroll(c:any) {
    console.log("oh", c);
  }

  private ishandSet: boolean = false
  async onSidenavOpnedUpdate(opened: boolean) {
    if (this.commonService.isBrowser() && document) {
      console.log('sivde opened change', opened)
      console.log('sivde opened handset', this.ishandSet)
      if (opened && this.ishandSet) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }
  }

  closeNavBar() {
    if ($ && document && this.sidenav) {
      const isSwitchButtonVisible = $('#sidenav-toggle-button').is(':visible');
      if (isSwitchButtonVisible) {
        this.sidenav.close();
      }
    }
  }


  get canGoBack() {
    return this.commonService.isBrowser() && window.history && window.history.length > 0;
  }
  tryGoBack() {
    if (this.canGoBack) {
      window.history.go(-1);
    } else {
      this.commonService.openSnackBarDefault("no page to go back.");
    }
  }


  isForceHideSideBar = false;
  get displayForceHideSideBar() {
    return '';
    if (this.isForceHideSideBar) {
      return 'none';
    } else {
      return '';
    }
  }

  get _topNavItems(): SubLevelNavItem[] {
    const arr: SubLevelNavItem[] = []
    return [
      {
        icon: 'home icon',
        displayName: 'Scan2Project',
        path: '/scan2project',
        // requireLogin: false,
      },
      {
        icon :'home icon',
        displayName:'touchNtest',
        path:'/touchNtest'
      }

   
      // {
      //   icon: 'setting icon',
      //   displayName: 'Player(client)',
      //   path: '/player/client',

      //   // shouldHide: this.commonService.checkIsInWebviewApp(),
      // },
    ]
  }

}
