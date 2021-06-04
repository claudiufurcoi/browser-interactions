import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {BrowserComponent} from './browser/browser.component';
import { StatsComponent } from './stats/stats.component';

const routes: Routes = [
	{ path: '', component: BrowserComponent },
  { path: 'statistics', component: StatsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

}
