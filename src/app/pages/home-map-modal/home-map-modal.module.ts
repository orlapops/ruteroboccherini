import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AgmCoreModule } from '@agm/core';

import { HomeMapModalPage } from './home-map-modal.page';

const routes: Routes = [
  {
    path: '',
    component: HomeMapModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    AgmCoreModule.forRoot({
      // apiKey: 'AIzaSyD9BxeSvt3u--Oj-_GD-qG2nPr1uODrR0Y'
      //Abril 25 2019 habilitada facturacion
      apiKey: 'AIzaSyBSC-DvlUcEskduxwr0LHzjTU_OS4Hea4g'      
    })

  ],
  declarations: [HomeMapModalPage]
})
export class HomeMapModalPageModule {}
