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

declare var google:any;

@Component({
  selector: 'app-modal-regsegcart',
  templateUrl: './modal-regsegcart.page.html',
  styleUrls: ['./modal-regsegcart.page.scss'],
})
export class ModalRegSegCartPage implements OnInit {
  @Input() coords: any;
  address: string;
  description: string = '';
  foto: any = '';
  imagenPreview: string;
  agmStyles: any[] = environment.agmStyles;
  cargo_posicion = false;
  // Op Agosto 15 19 se deshabilita actualización dirección
  activaract_direccion = true;
  private photo: string = 'assets/img/logo.png';
  private userId: string;

  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  title = 'app';
  public onActclieForm: FormGroup;

  constructor(private modalCtrl: ModalController,
    public _visitas: VisitasProvider,
    public platform: Platform,
    public _clientes: ClienteProvider,
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
    private webview: WebView) { 
      console.log('llega coords:',  this.coords);
      platform.ready().then(() => {
        // La plataforma esta lista y ya tenemos acceso a los plugins.
        this.cargo_posicion = true;
        // this.coords.lat = this._ubicacionService.ultlatitud;
        // this.coords.lng = this._ubicacionService.ultlongitud;
          console.log('platfom lista');
        // this.obtenerPosicion();

      });
    }  

  ngOnInit() {
    console.log('ngOnInit ModalRegSegCartPage this._visitas.visita_activa: ', this._visitas.visita_activa);
    console.log('ngOnInit ModalRegSegCartPage _clientes.clienteActual:', this._clientes.clienteActual);
    console.log('ngOnInit ModalRegSegCartPage _visitas.direc_actual:', this._visitas.direc_actual);
    this.onActclieForm = this.formBuilder.group({
      'notas': [null, Validators.compose([
        Validators.required
      ])],
      'num_obliga': [null, Validators.compose([
        Validators.required
      ])]

    });
    // asignar valores al formulario
    this.onActclieForm.controls['num_obliga'].setValue(this._clientes.clienteActual.cartera[0].num_obliga);

  }
  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 2000
    });
    return await loading.present();
  }

  uploadFile(event) {
    const file = event.target.files[0];
    const filePath = 'demo126';
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    
    // observe percentage changes
    this.uploadPercent = task.percentageChanges();
    this.uploadPercent = task.percentageChanges();
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
        finalize(() => this.downloadURL = fileRef.getDownloadURL() )
     )
    .subscribe()
  // }    
  //   // get notified when the download URL is available
  //   this.downloadURL = task.downloadURL();
  }



  actualiza_seg(){
    console.log('registra seguimiento');
    const anotasseg = this.onActclieForm.controls['notas'].value;
    const num_obligaseg = this.onActclieForm.controls['num_obliga'].value;
    console.log('Datos act:', anotasseg,num_obligaseg);
    this._clientes.regseguimiento(this._visitas.visita_activa_copvdet.cod_tercer, anotasseg,num_obligaseg);
    this.presentLoading('Actualizando Seguimiento. Recargue el cliente para ver el seguimiento.');
    this.cerrarModal();
  }


  cerrarModal(){
    this.modalCtrl.dismiss();
  }
  
}
