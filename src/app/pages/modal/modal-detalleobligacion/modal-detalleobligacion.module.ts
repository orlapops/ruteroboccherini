import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';

import { ModalDetalleObligacionPage } from './modal-detalleobligacion.page';

const routes: Routes = [
  {
    path: '',
    component: ModalDetalleObligacionPage
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild(),
    RouterModule.forChild(routes)
  ],
  declarations: [ModalDetalleObligacionPage]
})
export class ModalDetalleObligacionPageModule {}
