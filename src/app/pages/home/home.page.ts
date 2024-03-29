import { Component, OnInit } from "@angular/core";
import {
  NavController,
  MenuController,
  LoadingController,
  Platform,
  AlertController,
  ModalController,
  ActionSheetController
} from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { ParEmpreService } from '../../providers/par-empre.service';
// import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
// import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation/ngx';
// import { VisitanService } from "../../providers/visitan.service";
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ProdsService } from '../../providers/prods/prods.service';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion.service';
import { ActividadesService } from '../../providers/actividades/actividades.service';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { MessageService } from '../../providers/message/message.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { HomeMapModalPage } from '../home-map-modal/home-map-modal.page';


@Injectable({
  providedIn: "root"
})

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {
  public visitnanList: Observable<any>;

  openMenu: Boolean = false;
  searchQuery: String = "";
  items: string[];
  showItems: Boolean = false;
  rooms: any;
  adults: any;

  childs: any = 0;
  children: number;
  // hotellocation: string;
  visitas: any;
  cargovisitas = false;
  visitalocation: string;
  clientelocation: string;
  cargocoordenadas = false;
  messagesrec: Array<any> = [];
  menerror ='';


  agmStyles: any[] = environment.agmStyles;
  user: any = {};
  // search conditions
  public checkin = {
    name: this.translate.get("app.pages.home.label.checkin"),
    date: new Date().toISOString()
  };

  public checkout = {
    name: this.translate.get("app.pages.home.label.checkout"),
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
  };
  coords: any = { lat: 0, lng: 0 };

  constructor(
    private actionSheetCtrl: ActionSheetController,
    public messageService: MessageService,
    private router: Router,
    public _parEmpre: ParEmpreService,
    public platform: Platform,
    public modalCtrl: ModalController,
    public geolocation: Geolocation,
    // private backgroundGeolocation: BackgroundGeolocation,
    public backgroundMode: BackgroundMode,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public menuCtrl: MenuController,
    public loadingCtrl: LoadingController,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _prods: ProdsService,
    public _actividades: ActividadesService,
    public _ubicacionService: UbicacionProvider
  ) {
    // this.visitas = this._visitas.cargaRutaActiva();
    // console.log("constructor home");
    // console.log(this._visitas.visitaTodas);
    this.startBackgroundGeolocation();
    platform.ready().then(() => {
      console.log("En constructor home usuario: " + _parEmpre.usuario.cod_usuar);
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      // this._parEmpre.reg_log('Home', 'Dispositivo listo');
      // this.obtenerPosicion();
      //inicializar 
      // this.cargovisitas = false;
      // this._visitas.visitaTodas = [];
      // this._visitas.visitas_cumplidas = [];
      // this._visitas.visitas_pendientes = [];
      // this._visitas.visitas_xllamada = [];
      // this._visitas.visitaabierta = null;
      // this._visitas.cargo_ruta = false;
      console.log('iniciando background and more');
      // this.backgroundMode.disableWebViewOptimizations();
      // this.backgroundMode.on('activate').subscribe((res)=>{
      //   console.log('respuesta de bacground on start tracking ->', res);
      //   this.backgroundMode.disableWebViewOptimizations();
      //   this.initTracking();
      // });
      // this.backgroundMode.on('deactivate').subscribe((res)=>{
      //   console.log('stoptracking ->', res);
      //   this.stopTracking();
      // });
      // this.backgroundMode.enable();
      this._ubicacionService.iniciarGeoLocalizacion();
      this._ubicacionService.inicializarUsuario()
        .then(()=>{
          this._ubicacionService.usuario.valueChanges()
            .subscribe( data => {
              this.user = data;
              this.coords.lat = data.latitud;
              this.coords.lng = data.longitud;
              this.cargocoordenadas = true;  
            });
        });
    });
  }

  async ngOnInit() {

    // console.log(this._visitas.visitaTodas);
    //Actualizar Inventario para factura y pedido a Firebase
    // const bodega = 'VEH';
    this.messageService.getdbDbmensajes()
      .subscribe((datosm: any)  => {
        console.log('ngOnInit cargar mensajes datosm:', datosm);
        if ( datosm.length > 0) {
              let itemdato = datosm[0];
              this.messagesrec = [];
              datosm.forEach((Mensaje: any) => {
                this.messagesrec.push({
                  id: Mensaje.payload.doc.id,
                  data: Mensaje.payload.doc.data()
                });
              });
          } else {
            this.messagesrec = [];
          }
      });
    console.log('a cargaActividadesNetsolin');
      //Cargar tipos de actividades a Firebase
      this._actividades.cargaActividadesNetsolin()
      .then(cargo => {
        console.log('a cargaActividadesNetsolin Cargo ', cargo);
        if (cargo) {
          console.log('a cargaActividadesNetsolin Cargo si ', cargo);
          this._actividades.guardarTiposactFB()
            .then(resul => {
                //cargar las actividades de firebase

            });
        } else {
          console.log("No pudo cargar cargaActividadesNetsolin");
        }
      })
      .catch(() => {
        console.log("error en homr cargaActividadesNetsolin ");
      });      

    // this._visitas.userId = '1014236804';
    // this._visitas.cargaPeriodoUsuar(this._visitas.userId).then(cargo => {
    console.log("home antes cargar visitas _parempre:",this._parEmpre,this._visitas);
    this._visitas.cargoidperiodo = false;
    await this._visitas
      .cargaPeriodoUsuar(this._parEmpre.usuario.cod_usuar)
      .then(cargo => {
        console.log('llega cargaPeriodoUsuar',cargo);
        if (cargo) {
          // console.log(
          //   "cargo periodo datos para cargar visitas: ",
          //   this._visitas.userId,
          //   this._visitas.id_ruta,
          //   this._visitas.id_periodo
          // );
          this._visitas
            .cargaVisitas()
            .then(cargo => {
              // console.log("ngOnInit home 2 luego de cargaVisitas");
              console.log('Todas las visitas',this._visitas.visitaTodas);
              console.log('Visitas x llamada ',this._visitas.visitas_xllamada);
              // console.log(cargo);
              if (cargo) {
                console.log("ngonit home cargo visitas verdadero");
                this.cargovisitas = true;
              } else {
                console.log("ngonit home cargo visitas falso");
                this.cargovisitas = false;
                // OP JULIO 23 20 SI TIENE VISITAS EN nETSOLIN Y NO EN FIREBASE INTENTA CREARLAS
                console.log('a crear visitas de netsolin en fb ',this._parEmpre.usuario.cod_usuar,this._visitas.id_ruta,this._visitas.id_periodo);
                this._visitas.cargaVisitasNetsolin(this._parEmpre.usuario.cod_usuar,this._visitas.id_ruta,this._visitas.id_periodo);
              }
            })
            .catch(() => {
              this.cargovisitas = false;
              this.menerror = this._visitas.men_errorcargarruta;              
                  console.error("error en homr ngoniti al cargar visitas",this.menerror);
              // OP JULIO 23 20 SI TIENE VISITAS EN nETSOLIN Y NO EN FIREBASE INTENTA CREARLAS
              this._visitas.cargaVisitasNetsolin(this._parEmpre.usuario.cod_usuar,this._visitas.id_ruta,this._visitas.id_periodo);
            });
          //Cargar el Inventario de Firebase suscribirse no por que sobreescribe el de otro usuario
          //se quita mayo 23 19 op
          // this._visitas.cargaInventariodFB(bodega);
          // this._prods.cargaInventariodFB(this._parEmpre.usuario.bod_factura);
          // this._prods.cargaInventariodFBpedido(this._parEmpre.usuario.bod_pedido);
        } else {
          this.cargovisitas = false;
          this.menerror = this._visitas.men_errorcargarruta;
          console.error("ngOnInit home NO CARGO cargaPeriodoUsuar",this.menerror);
        }
      })
      .catch(error => {
        console.error("error en cargaPeriodoUsuar ", error);
      });
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
  }


  itemSelected(item: string) {
    // op mayo 27 19 cambio para reg llamada 
    // this.visitalocation = item;
    this.clientelocation = item;
    this.showItems = false;
  }

  childrenArr(chil) {
    const child = Number(chil);
    this.childs = Array(child)
      .fill(0)
      .map((v, i) => i);
  }


  obtenerPosicion(): any {
    this.geolocation
      .getCurrentPosition()
      .then(res => {
        this.coords.lat = res.coords.latitude;
        this.coords.lng = res.coords.longitude;
        // this.loadMap();
      })
      .catch(error => {
        console.log(error.message);
        this.coords.lat = 4.625749001284896;
        this.coords.lng = -74.078441;
        // this.loadMap();
      });
  }

  // async nuevoRegistroVisita() {
  //   const modal = await this.modalCtrl.create({
  //     componentProps: { coords: this.coords }
  //   });
  //   return await modal.present();
  // }

  nuevoRegistroVisitssa() {
    // console.log("Mostrsr modal");
    //modal para añadir nuevo Visita
    // let mimodal = this.modalCtrl.create('ModalNuevoSitioPage',this.coords);
    // mimodal.present();
  }
  // togglePopupMenu() {
  //   return this.openMenu = !this.openMenu;
  // }
  // // //
  async viewClientes() {
    console.log('dato a buscar: ', this.clientelocation);
    if (this.clientelocation === undefined  || this.clientelocation ==='' || this.clientelocation === '*') {
      const alert2 = await this.alertCtrl.create({
        message: 'Debe ingresar parte del código o nombre del cliente',
        buttons: ['Enterado']
      });
       await alert2.present();
      
    } else {
    const loader = await this.loadingCtrl.create({
      duration: 1000
    });

    loader.present();
    loader.onWillDismiss().then(() => {
      this.navCtrl.navigateForward(
        `clientes-list/${this.clientelocation}/${this.checkin.date}/${
          this.checkout.date
        }`
      );
      // this.navCtrl.navigateForward(['visita-list', this.visitalocation,this.checkin.date, this.visitalocation, this.checkout.date]);
      // this.router.navigate(['visita-list', 'text buscar']);
      // this.router.navigate(['/bill-detail', billId]);
    });
  }
  }

  async viewVisitas() {
    // console.log("homepage visita-list home checkin", this.checkin);
    // console.log("homepage visita-list home ", this.checkin);
    // console.log(
    //   "homepage visita-list home visitalocation",
    //   this.visitalocation
    // );

    const loader = await this.loadingCtrl.create({
      duration: 1000
    });

    loader.present();
    loader.onWillDismiss().then(() => {
      this.navCtrl.navigateForward(
        `visita-list/${this.visitalocation}/${this.checkin.date}/${
          this.checkout.date
        }`
      );
      // this.navCtrl.navigateForward(['visita-list', this.visitalocation,this.checkin.date, this.visitalocation, this.checkout.date]);
      // this.router.navigate(['visita-list', 'text buscar']);
      // this.router.navigate(['/bill-detail', billId]);
    });
  }

  editprofile() {
    this.navCtrl.navigateForward("edit-profile");
  }

  settings() {
    this.navCtrl.navigateForward("settings");
  }

  goToWalk() {
    this.navCtrl.navigateRoot("walkthrough");
  }

  logout() {
    this.navCtrl.navigateRoot("login");
  }

  register() {
    this.navCtrl.navigateForward("register");
  }

  messages() {
    this.navCtrl.navigateForward("messages");
  }
  //convertir cadena "20181020" a una fecha
  convCadenaFecha(cadena) {
    let ano = cadena.substr(0, 4);
    let mes = cadena.substr(4, 2);
    let dia = cadena.substr(6, 2);
    let fecha = new Date(ano, mes, dia, 0, 0, 0, 0);
    return fecha;
  }

  async moreBillOptions(billId): Promise<void> {
    const action = await this.actionSheetCtrl.create({
      header: "Modify your bill",
      buttons: [
        {
          text: "Delete",
          role: "destructive",
          icon: "trash",
          handler: () => {
          }
        },
        {
          text: "More details",
          icon: "play",
          handler: () => {
          }
        },
        {
          text: "Mark as Paid!",
          icon: "checkmark",
          handler: () => {
          }
        },
        {
          text: "Cancel",
          role: "cancel",
          icon: "close",
          handler: () => {
            console.log("Cancel clicked");
          }
        }
      ]
    });
    action.present();
  }
  colorxEstado(estado) {
    // console.log('colorxEstado, estado');
    if (estado === 'C') {
      return 'colorviscerrada';
      // return 'bg-red';
    } else {
      if (estado === 'A') {
        return 'colorvisabierta';
        // console.log('retorna bg-verde');
        // return 'bg-verde';
      } else {
        // if (estado === 'L') {
          // return 'colorvisllamada';
        // } else {
          return 'colorvispend';
      // }
  
      }
  }
  }

  async openMap() {
    console.log("openModal");
    const modal = await this.modalCtrl.create({
      component: HomeMapModalPage,
      cssClass: '',
      componentProps: {
        llamadodesde: 'Home'
      }
    });
    return await modal.present();
  }



  //CONFIGURACION SEGUIMIENTO GPS 2 PLANO
  startBackgroundGeolocation() {
    // const config: BackgroundGeolocationConfig = {
    //   desiredAccuracy: 10,
    //   distanceFilter: 0, //Filtro de distancia para activar el seguimiento
    //   locationProvider:2,
    //   interval:3000,
    //   debug: true, //  enable this hear sounds for background-geolocation life-cycle.
    //   stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when app terminated.
    //   startOnBoot: true,        // <-- Auto start tracking when device is powered-up.

    //   //Envio de la localización por JSON
    //   url: 'http://190.85.93.218/RESTBOCCHE/netsolin_servirestgo.csvc?VRCod_obj=POSITIONENV',
    //   httpHeaders: {
    //     'Content-Type': 'application/json'
    //   },
    //   postTemplate: {
    //     lat: '@latitude',
    //     lng: '@longitude',
    //     test: '1'  //you can also add your own properties
    //   }
    // };

    // this.backgroundGeolocation.configure(config)
    // .then(() => {

    // this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
    //   console.log(location);

    //   // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
    //   // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
    //   // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
    //   this.backgroundGeolocation.finish(); // FOR IOS ONLY
    // });

    // });

    // // start recording location
    // this.backgroundGeolocation.start();
  }

  //Activa el seguimiento del GPS
  initTracking() {
    this.startBackgroundGeolocation();
  }

  //Desactiva el seguimiento del GPS
  stopTracking() {
    // If you wish to turn OFF background-tracking, call the #stop method.
    // this.backgroundGeolocation.stop();
  }





}
