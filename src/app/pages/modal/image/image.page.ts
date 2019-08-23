import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController,ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit {
  @Input() value: any;
  @Input() idimg: any;
  @Input() rutafbi: any;

  public image: any;

  constructor(
    // private nav: NavController,
    public toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storage: AngularFireStorage,       
    private fbDb: AngularFirestore, 
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.image = this.sanitizer.bypassSecurityTrustStyle(this.value);
    console.log('Presentar imagen this.value,this.idimg,this.rutafbi: ',this.value,this.idimg,this.rutafbi);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  public eliminarImagen() {
    console.log('En eliminar imagen ',this.value,this.rutafbi,this.idimg);
    // rutafb=`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`;
    this.eliminarFb().then(async lres =>{
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Eliminando imagen..',
        duration: 2000,
        position: 'bottom' 
      });
      toast.present();
      this.closeModal();
    });
  }

  public eliminarFb(){
    this.fbDb.collection(this.rutafbi).doc(this.idimg).delete();
    return this.storage.storage.refFromURL(this.value).delete();

  }


}
