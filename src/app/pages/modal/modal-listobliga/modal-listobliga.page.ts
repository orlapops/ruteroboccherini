import { Component, Input, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { NavController, ModalController, ActionSheetController, Platform, LoadingController } from '@ionic/angular';
import { VisitasProvider } from '../../../providers/visitas/visitas.service';
import { AngularFireStorage } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ClienteProvider } from '../../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
// import { ImagePage } from '../../modal/image/image.page';
import { environment } from '../../../../environments/environment'
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UbicacionProvider } from '../../../providers/ubicacion/ubicacion.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";

import { ModalDetalleObligacionPage } from '../modal-detalleobligacion/modal-detalleobligacion.page'


declare var google: any;

@Component({
  selector: 'app-modal-listobliga',
  templateUrl: './modal-listobliga.page.html',
  styleUrls: ['./modal-listobliga.page.scss'],
})
export class ModalListObligaPage implements OnInit {
  @Input() cod_tercer: any;
  clienteAct: any;
  ubicaAct: any;
  cargo_clienteact = false;

  constructor(
    private modalCtrl: ModalController,
    public _visitas: VisitasProvider,
    public platform: Platform,
    public _cliente: ClienteProvider,
    public geolocation: Geolocation,
    private actionSheetCtrl: ActionSheetController,
    private storage: AngularFireStorage,
    public loadingCtrl: LoadingController,
    private imagePicker: ImagePicker,
    public _DomSanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public _ubicacionService: UbicacionProvider,
    private camera: Camera,
    private file: File,
    private webview: WebView
  ) {

    platform.ready().then(() => {

    });
  }

  ngOnInit() {
    this.cargarCliente();
  }


  cargarCliente() {
    console.log('codigo de cliente a buscar modal obliga -> ', this.cod_tercer);
    this._cliente.getClienteFb(this.cod_tercer).subscribe((datos: any) => {
      console.log('Suscribe a clientes fb ', datos);
      this.clienteAct = datos;
      this.cargo_clienteact = true;
      //encontrar ubicacion actual en arreglo
      this.ubicaAct = null;
      // this.cargo_ubicaact = false;
      // console.log('a buscar ubica act ',this.visita.data.cod_tercer, this.visita.data.id_dir);
      // for (var i = 0; i < this.clienteAct.direcciones.length; i++) {
      //   if (this.clienteAct.direcciones[i].id_dir === this.visita.data.id_dir) {
      //     // this.ubicaAct = this.clienteAct.direcciones[i];
      //     this._cliente.getUbicaActFb(this.cod_tercer, this.visita.data.id_dir).subscribe((datosc: any) => {
      //       console.log('susc datos cliente fb ', datosc);
      //       this.ubicaAct = datosc;
      //       this._visitas.direc_actual = this.ubicaAct;
      //       this.cargo_ubicaact = true;
      //       console.log('encontro ubica act; ', this.ubicaAct);
      //       this.segcartera = this._cliente.segcartera;
      //       console.log('segcartera cliente ', this.segcartera);
      //       // this._cliente.getSegCarFb(this.visita.data.cod_tercer).subscribe((datosseg: any) => {
      //       //   console.log('encontro ubica act; ', this.ubicaAct);                  
      //       //   this.segcartera = datosseg;
      //       //   console.log('encontro segcartera; ', this.segcartera);                  
      //       // });
      //     });
      //   }
      // }
    });
  }


  async detalleObligacion(numobliga) {
    console.log('numero de olbigacion para detalle:', numobliga);
    const modal = await this.modalCtrl.create({
      component: ModalDetalleObligacionPage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { num_obliga: numobliga, clie_cartera: this.clienteAct }
    });
    return await modal.present();
  }




  cerrarModal(){
    this.modalCtrl.dismiss();
  }



}
