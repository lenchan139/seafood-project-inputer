import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './pages/homepage/homepage.component';
import { ScanToProjectPageComponent } from './pages/scan-to-project-page/scan-to-project-page.component';

const routes: Routes = [
  {
path:'scan2project',
component:ScanToProjectPageComponent,
  },
  {
    path:'',
    component:HomepageComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
