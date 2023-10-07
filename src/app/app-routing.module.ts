import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { ScanToProjectPageComponent } from './pages/scan-to-project-page/scan-to-project-page.component';
import { TouchAndTestFormatPositionComponent } from './pages/touch-and-test-format-position/touch-and-test-format-position.component';

const routes: Routes = [
  {
    path: 'scan2project',
    component: ScanToProjectPageComponent,
  },
  {
    path: 'touchNtest',
    component: TouchAndTestFormatPositionComponent
  },
  {
    path: '',
    component: HomepageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
