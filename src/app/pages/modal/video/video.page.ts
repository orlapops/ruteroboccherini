import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController,ToastController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/storage';
import { AngularFirestore} from '@angular/fire/firestore';

@Component({
  selector: 'app-video',
  templateUrl: './video.page.html',
  styleUrls: ['./video.page.scss'],
})
export class VideoPage implements OnInit {
  @Input() value: any;
  @Input() idvideo: any;
  @Input() rutafbi: any;

  public video: any;

  constructor(
    // private nav: NavController,
    public toastCtrl: ToastController,
    private modalCtrl: ModalController,
    private storage: AngularFireStorage,       
    private fbDb: AngularFirestore, 
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.video = this.sanitizer.bypassSecurityTrustStyle(this.value);
    console.log('Presentar Video this.value,this.idvideo,this.rutafbi: ',this.value,this.idvideo,this.rutafbi);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  public eliminarVideo() {
    console.log('En eliminar Video ',this.value,this.rutafbi,this.idvideo);
    // rutafb=`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this._visitas.visita_activa_copvdet.id_ruta}/periodos/${this._visitas.id_periodo}/visitas/${idvisita}/fotos`;
    this.eliminarFb().then(async lres =>{
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: 'Eliminando Video..',
        duration: 3000,
        position: 'bottom' 
      });
      toast.present();
      this.closeModal();
    });
  }

  public eliminarFb(){
    this.fbDb.collection(this.rutafbi).doc(this.idvideo).delete();
    return this.storage.storage.refFromURL(this.value).delete();

  }


}
