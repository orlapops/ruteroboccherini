import { Component, Input, OnInit } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { DomSanitizer } from '@angular/platform-browser';
import { AngularFireStorage } from '@angular/fire/storage';

@Component({
  selector: 'app-image',
  templateUrl: './image.page.html',
  styleUrls: ['./image.page.scss'],
})
export class ImagePage implements OnInit {
  @Input() value: any;
  public image: any;

  constructor(
    private nav: NavController,
    private modalCtrl: ModalController,
    private storage: AngularFireStorage,        
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.image = this.sanitizer.bypassSecurityTrustStyle(this.value);
  }

  closeModal() {
    this.modalCtrl.dismiss();
  }
  public eliminarImagen(ifoto) {
    console.log('En eliminar imagen ', ifoto);
    return this.storage.storage.refFromURL(ifoto).delete();

  }


}
