import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ActivatedRoute, Router } from '@angular/router';
import { ImagePage } from './../modal/image/image.page';
import { environment } from '../../../environments/environment'
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { ProdsService } from '../../providers/prods/prods.service';
import { RecibosService } from '../../providers/recibos/recibos.service';
// import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalActClientePage } from '../modal/modal-actcliente/modal-actcliente.page';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ActividadesService } from '../../providers/actividades/actividades.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { UbicacionProvider } from '../../providers/ubicacion/ubicacion.service';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";


@Component({
  selector: 'app-visita-detail',
  templateUrl: './visita-detail.page.html',
  styleUrls: ['./visita-detail.page.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('300ms', [animate('600ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class VisitaDetailPage implements OnInit {
  visita: any;
  visitaID: any = this.route.snapshot.paramMap.get('id');
  visitaAct: any;
  clienteAct: any;
  ubicaAct: any;
  agmStyles: any[] = environment.agmStyles;
  visitaSegment: string = 'details';
  estadoVisita: string = '';
  cargoCartera = false;
  buscar_item: string = '';
  buscar_itemped: string = '';
  q: any;
  productos_bus: any;
  searching: any = false;
  qped: any;
  productos_busped: any;
  searchingped: any = false;
  // imagenmuest: string;
  // linkimgprod: string;
  coords: any = { lat: 0, lng: 0 };
  cargoVisitaActual = false;
  cargo_ubicaact = false;
  cargo_clienteact = false;
  listaactividades: any;
  imagenPreview: string;
  listafotos: any;
  cargo_posicion = false;

  constructor(
    public _parEmpre: ParEmpreService,
    public _cliente: ClienteProvider,
    public navCtrl: NavController,
    public asCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public platform: Platform,
    public geolocation: Geolocation,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    private imagePicker: ImagePicker,
    public _prods: ProdsService,
    public _recibos: RecibosService,
    public _actividad: ActividadesService,
    public route: ActivatedRoute,
    public _DomSanitizer: DomSanitizer,
    public router: Router,
    private camera: Camera,
    public loadingCtrl: LoadingController,
    public _ubicacionService: UbicacionProvider,
    public alertCtrl: AlertController,
    private impresora: BluetoothSerial,
    private file: File,
    private webview: WebView
  ) {
    platform.ready().then(() => {
      // La plataforma esta lista y ya tenemos acceso a los plugins.
      this.cargo_posicion = false;
      console.log('platfom lista');
      this._ubicacionService.getUbicaUsuarFb().subscribe((datosc: any) => {
        console.log('susc usuar para localiza fb ', datosc);
        this.coords.lat = datosc.latitud;
        this.coords.lng = datosc.longitud;
        this.cargo_posicion = true;
      });

      // this.obtenerPosicion();
    });
    // console.log('constructor detalle visita');
    console.log(this.visitaID);
    this.visita = this._visitas.getItem(this.visitaID);
    console.log('visita antes inv luego de getitem', this.visita);

    //se pasa del home a qui op mayo 23 19 cargar inventario
    //carga inventario para factura
    this._prods
      .cargaInventarioNetsolin(this.visita.data.cod_tercer)
      .then(cargo => {
        //Si carga el inventario lo actualiza en firebase
        if (cargo) {
          // console.log("Cargo Inventario de Netsolin");
          const reginv = {
            // inventario : this._visitas.inventario
            inventario: this._prods.inventario
          };
          // console.log('inventario en prods: ',reginv,this._prods.inventario);
          this._parEmpre.reg_logappusuario('Carga inv factura', 'this._prods.inventario', this._prods.inventario);
          //  this._visitas.guardarInvdFB(bodega, reginv).then(res => {
          //op mayo 23 19 no se guarda en firebase
          // this._prods
          //   .guardarInvdFB(this._parEmpre.usuario.bod_factura, reginv)
          //   .then(res => {
          //   });
        } else {
          console.log("No pudo cargar inventario de Netsolin");
        }
      })
      .catch(() => {
        console.log("error en homE ngoniti al cargaInventarioNetsolin");
      });
    //carga inventario para pedido
    this._prods.cargaInventarioNetsolinPedido(this.visita.data.cod_tercer)
      .then(cargo => {
        //Si carga el inventario lo actualiza en firebase
        if (cargo) {
          // console.log("Cargo cargaInventarioNetsolinPedido de Netsolin");
          const reginv = {
            // inventario : this._visitas.inventario
            inventario: this._prods.inventarioPed
          };
          //  this._visitas.guardarInvdFB(bodega, reginv).then(res => {
          //op mayo 23 19 se quita no guardar en firebase 
          // this._prods
          //   .guardarInvdFBpedido(this._parEmpre.usuario.bod_pedido, reginv)
          //   .then(res => {
          //   });
        } else {
          console.log(
            "No pudo cargar cargaInventarioNetsolinPedido de Netsolin"
          );
        }
      })
      .catch(() => {
        console.log(
          "error en home por catch al cargaInventarioNetsolinPedido"
        );
      });

    // console.log('constructor detalle visita 2 this.visita:', this.visita);    
    this.cargo_clienteact = false;
    this.cargo_clienteact = false;
    this.cargo_ubicaact = false;
    this._visitas.actualizarclientenetsolinFb(this.visita.data.cod_tercer).then(result => {
      // console.log('Actualizar cliente netsolin result:', result);
      if (result) {
        //Suscribirse a cliente actual fb
        this._cliente.getClienteFb(this.visita.data.cod_tercer).subscribe((datos: any) => {
          console.log('Suscribe a clientes fb ', datos);
          this.clienteAct = datos;
          this.cargo_clienteact = true;
          //encontrar ubicacion actual en arreglo
          this.ubicaAct = null;
          this.cargo_ubicaact = false;
          // console.log('a buscar ubica act ',this.visita.data.cod_tercer, this.visita.data.id_dir);
          for (var i = 0; i < this.clienteAct.direcciones.length; i++) {
            if (this.clienteAct.direcciones[i].id_dir === this.visita.data.id_dir) {
              // this.ubicaAct = this.clienteAct.direcciones[i];
              this._cliente.getUbicaActFb(this.visita.data.cod_tercer, this.visita.data.id_dir).subscribe((datosc: any) => {
                console.log('susc datos cliente fb ', datosc);
                this.ubicaAct = datosc;
                this._visitas.direc_actual = this.ubicaAct;
                console.log('encontro ubica act; ', this.ubicaAct);
                this.cargo_ubicaact = true;
              });
            }
          }
        });
        // //Suscribirse a direccion actual fb
        // this._cliente.getUbicaActFb(this.visita.data.cod_tercer, this.visita.data.id_dir).subscribe((datos: any) => {
        //   console.log('Suscribe a ubicacion actual fb ', datos);
        //   if (datos){
        //     this.ubicaAct = datos;
        //     this.cargo_ubicaact = true;
        //   }
        // });
        this._visitas.getVisitaActual(this.visitaID).subscribe((datos: any) => {
          console.log('constructor detalle visita getVisitaActual datos:', datos, this._visitas.visitaabierta);
          //si latitud esta en cero dejar la de boccherini para el mapa
          if (datos.latitud == 0) {
            datos.latitud = 4.6529392;
            datos.longitud = -74.1230245;
          }
          this.visitaAct = datos;
          this._visitas.visita_activa_copvdet = datos;
          if (this._visitas.visita_activa_copvdet.llamada){
            console.log('getVisitaActual es llamada ',this._visitas.visita_activa_copvdet);
          } else {
            console.log('getVisitaActual asigno llamada a falso ',this._visitas.visita_activa_copvdet);
            this._visitas.visita_activa_copvdet.llamada = false;
            console.log('getVisitaActual element',this._visitas.visita_activa_copvdet);
          }                              

          this.cargoVisitaActual = true;
          // console.log('constructor detalle visita 4 this.visitaAct: ', this.visitaAct);
          this._actividad.getActividadesVisitaActual(this.visitaAct).subscribe((datosa: any) => {
            console.log('actividades de la visita: ', datosa);
            this.listaactividades = datosa;
            // console.log(this.listaactividades.id);
            // console.log(this.listaactividades.payload.doc);
            // console.log(this.listaactividades.payload.doc.data());
            // console.log(this.listaactividades.payload.doc.id);
          });
          this._actividad.getFotosVisitaActual(this.visitaAct).subscribe((datosf: any) => {
            console.log('Fotos de la visita: ', datosf);
            this.listafotos = datosf;
            // console.log('Fotos de la visita listafotos: ', this.listafotos);
            // console.log(this.listaactividades.id);
            // console.log(this.listaactividades.payload.doc);
            // console.log(this.listaactividades.payload.doc.data());
            // console.log(this.listaactividades.payload.doc.id);
          });
        });
      }
    })
      .catch(error => {
        console.log('Error al actualizarclientenetsolinFb error.message:', error);
      });
    // console.log('constructor detalle visita 3');


    //     // if (datos) {
    //     //   console.log('constructor detalle visita getVisitaActual datos true:', datos);                
    //     //     this.visitaAct = datos;
    //     // } else {
    //     //   console.log('constructor detalle visita getVisitaActual datos false:', datos);                
    //     //   this.visitaAct = null;
    //     // }
    //   });
  }

  ngOnInit() {
    // console.log('ngoniit visita detalle');
    // console.log(this.visita);
    this._prods.cargar_storage_factura(this.visita.data.id_ruta, this.visita.id)
      .then(res => {
        this._prods.cargar_storage_pedido(this.visita.data.id_ruta, this.visita.id)
          .then(res1 => {
            this._recibos.cargar_storage_recibo(this.visita.data.id_ruta, this.visita.id)
              .then(res2 => {
                this._recibos.cargar_storage_formpago(this.visita.data.id_ruta, this.visita.id)
                  .then(res3 => {
                  })
              })
          })
      })
  }

  // obtenerPosicion(): any {
  //   console.log('en obtener posicion', this.coords);
  //   this.geolocation
  //     .getCurrentPosition()
  //     .then(res => {
  //       this.coords.lat = res.coords.latitude;
  //       this.coords.lng = res.coords.longitude;
  //       this.cargo_posicion = true;
  //       console.log('res ok obtener posicion', this.coords);
  //       // this.loadMap();
  //     })
  //     .catch(error => {
  //       console.log(error.message);
  //       this.coords.lat = 4.625749001284896;
  //       this.coords.lng = -74.078441;
  //       this.cargo_posicion = true;
  //       console.log('res error obtener posicion', this.coords);
  //       // this.loadMap();
  //     });
  // }

  async actualizarCliente() {
    console.log('a actualizar cliente modal coords:', this.coords);
    const modal = await this.modalCtrl.create({
      component: ModalActClientePage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { coords: this.coords }
    });
    return await modal.present();
  }


  async presentImage(image: any) {
    const modal = await this.modalCtrl.create({
      component: ImagePage,
      componentProps: { value: image }
    });
    return await modal.present();
  }

  async presentLoading(pmensaje) {
    const loading = await this.loadingCtrl.create({
      message: pmensaje,
      spinner: 'dots',
      duration: 3000
    });
    return await loading.present();
  }

  async presentError(pmensaje) {
    const alert2 = await this.alertCtrl.create({
      header: 'Error',
      message: pmensaje,
      buttons: ['Enterado'],
      cssClass: 'alerterror'
    });
    return await alert2.present();
  }

  registrarIngresoVisita() {
    const datactvisita = {
      fechahora_ingreso: Date(),
      estado: 'A',
      grb_pedido: false,
      resgrb_pedido: '',
      pedido_grabado: null,
      errorgrb_pedido: false,
      grb_factu: false,
      resgrb_factu: '',
      pedido_factu: null,
      errorgrb_factu: false,
      grb_recibo: false,
      resgrb_recibo: '',
      pedido_recibo: null,
      errorgrb_recibo: false
    };
    console.log('registrarIngresoVisita ', this._visitas.visitaabierta);
    if (this._visitas.visitaabierta) {
      console.error('No puede abrir otra visita si ya hay una abierta. Cierrela primero. Visita:' + this._visitas.visitaabierta.nombre, this._visitas.visitaabierta);
      this.presentError('No puede abrir otra visita si ya hay una abierta. Cierrela primero. Visita:' + this._visitas.visitaabierta.nombre);
    } else {
      console.log('No Hay visitas abiertas establece esta como abierta');
      //dejar como visita abierta esta
      this._visitas.visitaabierta = this.visita;
      this._visitas.actualizarVisita(this.visitaID, datactvisita);
    }
  }
  registrarReingresoVisita() {
    let esllamada = false;
    console.log('this._visitas.visita_activa_copvdet.llamada',this._visitas.visita_activa_copvdet.llamada);
    if (typeof this._visitas.visita_activa_copvdet.llamada !== undefined){
      esllamada =  this._visitas.visita_activa_copvdet.llamada;
    }
    // estado: esllamada ? 'L' : 'A'
    const datactvisita = {
      fechahora_reingreso: Date(),
      estado: 'A'
    };
    console.log('registrarIngresoVisita ', this._visitas.visitaabierta,datactvisita);
    if (this._visitas.visitaabierta) {
      console.error('No puede abrir otra visita si ya hay una abierta. Cierrela primero. Visita:' + this._visitas.visitaabierta.nombre, this._visitas.visitaabierta);
      this.presentError('No puede abrir otra visita si ya hay una abierta. Cierrela primero. Visita:' + this._visitas.visitaabierta.nombre);
    } else {
      console.log('No Hay visitas abiertas establece esta como abierta');
      //dejar como visita abierta esta
      this._visitas.visitaabierta = this.visita;
      this._visitas.actualizarVisita(this.visitaID, datactvisita);
    }
  }
  validaCierreVisita() {
    let retorna = false;
    //valida si puede cerrar visita
    console.log('this._visitas.visita_activa_copvdet.llamada:',this._visitas.visita_activa_copvdet.llamada);
    let esllamada = this._visitas.visita_activa_copvdet.llamada;
    let continua = false;
    // if (this._visitas.visita_activa_copvdet.estado === 'L') {
    if (esllamada) {
      console.log('3');
      continua = true;
    } else {
      if (this.ubicaAct.email && this.ubicaAct.contacto && this.ubicaAct.longitud && this.ubicaAct.latitud) {
        continua = true;
      }
    }
    // if (this.ubicaAct.email && this.ubicaAct.contacto && this.ubicaAct.longitud && this.ubicaAct.latitud) {
    if (continua) {
      //valida si tiene items de pedido en proceso
      if (this._prods.factura.length > 0 || this._prods.pedido.length > 0 || this._recibos.recibocaja.length > 0) {
        console.error('No puede tener items en proceso en pedidos, facturas o recibos. Elimine para cerrar o termine el proceso.', this._prods.factura, this._prods.pedido, this._recibos.recibocaja);
        this.presentError('No puede tener items en proceso en pedidos, facturas o recibos. Elimine para cerrar o termine el proceso.');
      } else {
        retorna = true;
      }
    } else {
      console.error('Debe ingresar a actualizar datos cliente. Email, contacto, Ubicación Gps', this.visitaAct, this.cargo_posicion, this.ubicaAct);
      this.presentError('Debe ingresar a actualizar datos cliente. Email, contacto, Ubicación Gps');
    }
    return retorna;
  }
  cerrarVisita() {
    // validar si puede cerrar
    console.log('cerrarVisita visita activa:', this._visitas.visita_activa_copvdet);
    // console.log('cerrarVisita visita',this.visitaAct, this._visitas.visita_activa);
    // const esllamada = this._visitas.visita_activa_copvdet.estado === 'L' ? true : false;
    let esllamada = false;
    if (!this._visitas.visita_activa_copvdet.llamada) {
      esllamada = false;
    } else {
      esllamada = this._visitas.visita_activa_copvdet.llamada;
    }
    // esllamada = this._visitas.visita_activa_copvdet.llamada;
    console.log('esllamada', esllamada);
    const fechCierre= new Date();
    const datactvisita = {
      fechahora_cierre: fechCierre.toString(),
      lat_cierre: this.coords.lat,
      long_cierre: this.coords.lng,
      envio_email: false,
      error_envemail: '',
      llamada: esllamada,
      estado: 'C'
    };
    if (this.validaCierreVisita()) {
      this.presentLoading('Cerrando visita y enviando Email');
      console.log('a cerrar visita');
      //Recaudar todos datos visita para al cerrar enviar resumen a netsolin, para que puede generar email
      //visita
      console.log('visita activa:', this._visitas.visita_activa_copvdet);
      console.log('Actividades visita:', this.listaactividades);
      this._visitas.getPedidosVisitaActual().subscribe((datosvp: any) => {
        console.log('Pedidos visita act: ', datosvp);
        this._visitas.getFacturasVisitaActual().subscribe((datosvf: any) => {
          console.log('Facturas visita act: ', datosvf);
          this._visitas.getRecibosVisitaActual().subscribe((datosvr: any) => {
            console.log('Recibos visita act: ', datosvr);
            console.log('a cerrar visita this._visitas.visita_activa_copvdet', this._visitas.visita_activa_copvdet);
            const act = new Date(this._visitas.visita_activa_copvdet.fechahora_ingreso);
            console.log(act);
            const dvis_act = {
              cod_tercer: this._visitas.visita_activa_copvdet.cod_tercer,
              nombre: this._visitas.visita_activa_copvdet.nombre,
              direccion: this._visitas.visita_activa_copvdet.direccion,
              id_dir: this._visitas.visita_activa_copvdet.id_dir,
              id_visita: this._visitas.visita_activa_copvdet.id_visita,
              id_ruta: this._visitas.visita_activa_copvdet.id_ruta,
              id_reffecha: this._visitas.visita_activa_copvdet.id_reffecha,
              llamada: esllamada,
              fechaingreso:act,
              fechaingY: act.getFullYear(),
              fechaingM: act.getMonth() + 1,
              fechaingD: act.getDate(),
              fechaingH: act.getHours(),
              fechaingMin: act.getMinutes(),
              fechacierreY: fechCierre.getFullYear(),
              fechacierreM: fechCierre.getMonth() + 1,
              fechacierreD: fechCierre.getDate(),
              fechacierreH: fechCierre.getHours(),
              fechacierreMin: fechCierre.getMinutes(),
              fechacierre: fechCierre
            };
            this._visitas.genera_cierrevisita_netsolin(dvis_act, this.listaactividades, datosvp, datosvf, datosvr)
              .then(result => {
                console.log(result);
                if (result) {
                  console.log("sirvio envio");
                  datactvisita.envio_email = true;
                  this._visitas.actualizarVisita(this.visitaID, datactvisita);
                  const dvis_cierre = {
                    cod_tercer: this._visitas.visita_activa_copvdet.cod_tercer,
                    nombre: this._visitas.visita_activa_copvdet.nombre,
                    direccion: this._visitas.visita_activa_copvdet.direccion,
                    id_dir: this._visitas.visita_activa_copvdet.id_dir,
                    id_visita: this._visitas.visita_activa_copvdet.id_visita,
                    id_ruta: this._visitas.visita_activa_copvdet.id_ruta,
                    id_reffecha: this._visitas.visita_activa_copvdet.id_reffecha,
                    llamada: esllamada,
                    fechaing: this._visitas.visita_activa_copvdet.fechahora_ingreso,
                    fechacierre: fechCierre.toString()
                  };
                  console.log('guardar cierre ',this.visitaID, dvis_cierre);
                  this._visitas.guardarcierrevisitaFb(this.visitaID, dvis_cierre);
                  this._visitas.visitaabierta = null;
                } else {
                  datactvisita.envio_email = false;
                  datactvisita.error_envemail = this._visitas.men_errocierrevisnetsolin;
                  console.log('Error al cerrar visita en Netsolin no pudo enviar email', this._visitas.men_errocierrevisnetsolin);
                  this.presentError('Error enviando email visita. Se cierra pero no se envia email. ' + datactvisita.error_envemail);
                }
              })
              .catch(error => {
                datactvisita.envio_email = false;
                datactvisita.error_envemail = error;
                console.log('Error al genera_cierrevisita_netsolin error.message:', error);
                this.presentError('Error enviando email visita. Se cierra pero no se envia email. ' + datactvisita.error_envemail);
              });
          });


        });
      });
    }
  }

  actualizarGps() {

  }

  colorxEstado(estado) {
    if (estado === 'C') {
      return 'bg-red';
    } else {
      if (estado === 'A') {
        return 'bg-verde';
      } else {
        if (estado === 'L') {
          return 'bg-warning';
        } else {
          return 'bg-white';
        }
      }
    }
  }

  range(n) {
    return new Array(n);
  }

  avgRating() {
    let average: number = 0;

    this.visita.reviews.forEach((val: any, key: any) => {
      average += val.rating;
    });

    return average / this.visita.reviews.length;
  }

  buscar_productos($event) {
    console.log('a buscar producto factura');
    this.q = $event.target.value;
    console.log('a buscar producto ', this.q, this._prods.inventario);
    if (this.q == '') {
      console.log('no buscar por vacio');
    } else {
      // console.log('buscar_productos: ', this.q );
      this.searching = true;
      // this._visitas.buscarProducto(this.q).then(lbusq => {
      this._prods.buscarProducto(this.q).then(lbusq => {
        // console.log('lo buscado por producto: ' , lbusq);
        this.productos_bus = lbusq;
        console.log('resultado busqueda ', this.productos_bus);
        this.searching = false;
        // console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_bus);

      });
    }
  }
  buscar_productosped($event) {
    this.qped = $event.target.value;
    console.log('a buscar producto ', this.qped, this._prods.inventarioPed);
    if (this.qped == '') {
      console.log('no buscar por vacio');
    } else {
      console.log('buscar_productos ped: ', this.qped);
      this.searchingped = true;
      // this._visitas.buscarProducto(this.q).then(lbusq => {
      this._prods.buscarProductoPed(this.qped).then(lbusq => {
        // console.log('lo buscado por producto: ' , lbusq);
        this.productos_busped = lbusq;
        console.log('resultado busqueda ', this.productos_busped);
        this.searchingped = false;
        // console.log('lo buscado por producto  this.productos_bus: ' ,  this.productos_busped);

      });
    }
    //     if (this.q != '') {
    //       this.startAt.next(this.q);
    //       this.endAt.next(this.q + "\uf8ff");
    //     }
    //     else {
    //       this.items = this.all_items;
    //     }
  }
  tomafoto() {
    console.log('en mostrar camara1');
    const optionscam: CameraOptions = {
      quality: 30,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    };
    this._parEmpre.reg_logappusuario('tomafoto', 'Ingreso', {});
    this.camera.getPicture(optionscam).then((imageData) => {
      this.presentLoading('Guardando Imagen');
      this.imagenPreview = this.webview.convertFileSrc(imageData);
      this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa_copvdet.cod_tercer,
        this.visitaID, imageData).then(() => {
          this.file.resolveLocalFilesystemUrl(imageData).then((fe: FileEntry) => {
            fe.remove(function () { console.log("se elimino la foto") }, function () { console.log("error al eliminar") });
          });
        });
    }, (err) => {
      console.log('Error en camara', JSON.stringify(err));
      this._parEmpre.reg_logappusuario('tomafoto', 'Tomo foto Error ', { error: JSON.stringify(err) });
    });
  }
  seleccionarFoto() {
    const options = {
      quality: 100,
      outputType: 0
    };
    this.imagePicker.getPictures(options).then((image) => {
      this.presentLoading('Guardando Imagen');
      for (var i = 0; i < image.length; i++) {
        this.imagenPreview = this.webview.convertFileSrc(image[i]);
        this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa_copvdet.cod_tercer,
          this.visitaID, image[i]).then(() => {
            this.file.resolveLocalFilesystemUrl(image[i]).then((fe: FileEntry) => {
              fe.remove(function () { console.log("se elimino la foto") }, function () { console.log("error al eliminar") });
            });
          });
      }
    }, (err) => { console.log("error cargando imagenes", JSON.stringify(err)); });
  }

  public eliminarFoto(ifoto) {
    console.log('En eliminar foto ', ifoto);

  }
  public encodestring(pstring) {
    return encodeURIComponent(pstring);
  }
}
