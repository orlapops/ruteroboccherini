import { Component, OnInit,ViewChild,ElementRef } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { IonContent ,ModalController,NavParams,NavController,Platform} from '@ionic/angular';
import { Observable, Subscription } from 'rxjs';
import { IonicComponentService } from '../../providers/ionic-component.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { environment } from '../../../environments/environment';

declare var google;

@Component({
  selector: 'app-home-map-modal',
  templateUrl: './home-map-modal.page.html',
  styleUrls: ['./home-map-modal.page.scss'],
})
export class HomeMapModalPage implements OnInit {
  @ViewChild('map', {static: false}) mapElement: ElementRef;

  coords: any = { lat: 0, lng: 0 };
  map: any;
  markerSelected: boolean = false;
  agmStyles: any[] = environment.agmStyles;
  visitaAct: any;
  infoWindows: any=[];
  user: any = {};
  cargocoordenadas = false;
  llamadodesde: any;
  iconmaquiestoy = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
  constructor(
    public _parEmpre: ParEmpreService,
    public _visitas: VisitasProvider,
    public platform: Platform,
    public geolocation: Geolocation,
    private ionicComponentService: IonicComponentService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public router: Router,
    public _ubicacionService: UbicacionProvider
  ) { 
    this.llamadodesde =  this.activatedRoute.snapshot.paramMap.get('llamadodesde');
    platform.ready().then(() => {
      console.log("En constructor home map usuario: " + _parEmpre.usuario.cod_usuar, this.llamadodesde);
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      // this._parEmpre.reg_log('Home', 'Dispositivo listo');
      // this.obtenerPosicion();
      this._ubicacionService.iniciarGeoLocalizacion();
      this._ubicacionService.inicializarUsuario()
        .then(()=>{
          this._ubicacionService.usuario.valueChanges()
            .subscribe( data => {
              this.user = data;
              this.coords.lat = data.latitud;
              this.coords.lng = data.longitud;
              console.log('trae coordenadas',this.user,this.coords);
              this.cargocoordenadas = true;  
            });
        });
        
    });    
  }


  ngOnInit() {
    this.visitaAct = this._visitas.visita_activa_copvdet;
    console.log(' ngOnInit visita ',this.coords,this._visitas.visitas_pendientes,this.llamadodesde, this.visitaAct);
  }

  async close(){
    await this.modalController.dismiss();
  }


 






doSomething(){
  console.log("doSomething");
}
closeAllInfoWindows() {
    for(let window of this.infoWindows) {
      window.close();
    }
}


}
