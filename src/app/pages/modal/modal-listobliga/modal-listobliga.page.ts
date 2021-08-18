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
import { ParEmpreService } from 'src/app/providers/par-empre.service';


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
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public _ubicacionService: UbicacionProvider,
    private camera: Camera,
    private file: File,
    public _parEmpre: ParEmpreService,
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
    this._cliente.cargaClienteNetsolin(this.cod_tercer).then(datoscargo =>{            
      console.log('En Carga cliente buscado cargo:', datoscargo);
      if (datoscargo) {
          this.cargo_clienteact = true;
          this.clienteAct = this._cliente.clienteActual;
          console.log('En Carga cliente buscado this.clienteAct:', this.clienteAct,this.clienteAct.cartera);
      } else {
          console.log('error en actualizarclientenetsolinFb guardarClienteFb');
      }
    })
    .catch(() => {
      console.log('error buscar cliente cargaClienteNetsolin');
    });
  
    // this._cliente.getClienteFb(this.cod_tercer).subscribe((datos: any) => {
    //   console.log('Suscribe a clientes fb ', datos);
    //   this.clienteAct = datos;
    //   this.cargo_clienteact = true;
    //   //encontrar ubicacion actual en arreglo
    //   this.ubicaAct = null;
      
    // });
  }

  colorxEstado(diasvenci) {
    // console.log('colorxEstado, estado');
    if (diasvenci>0) {
      return 'colorvencida';
      // return 'bg-red';
    } else {
        return 'coloraldia';
      }
  }
  
  cleanURL(oldURL: string) {
    return this.sanitizer.bypassSecurityTrustUrl(oldURL);
  }




  cerrarModal(){
    this.modalCtrl.dismiss();
  }



}
