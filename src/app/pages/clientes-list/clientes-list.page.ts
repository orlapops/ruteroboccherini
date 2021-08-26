import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { environment } from '../../../environments/environment';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { IonicComponentService } from '../../providers/ionic-component.service'
import { PickerController, ModalController } from "@ionic/angular";
import { PickerOptions } from "@ionic/core";


//MODAL DE CARTERA
import { ModalListObligaPage } from '../modal/modal-listobliga/modal-listobliga.page'
//MODAL DETALLE DE PEDIDO TEMPORAL
import { ModalDetallePedTempPage } from '../modal/modal-detallepedtemp/modal-detallepedtemp.page'

import {
  trigger,
  style,
  animate,
  transition,
  query,
  stagger
} from '@angular/animations';
// import { VisitasProvider } from '../../providers/s.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { HomePage } from '../home/home.page';
import { Router, ActivatedRoute } from '@angular/router';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ProdsService } from '../../providers/prods/prods.service';

@Component({
  selector: 'app-clientes-list',
  templateUrl: './clientes-list.page.html',
  styleUrls: ['./clientes-list.page.scss'],
  animations: [
    trigger('staggerIn', [
      transition('* => *', [
        query(':enter', style({ opacity: 0, transform: `translate3d(0,10px,0)` }), { optional: true }),
        query(':enter', stagger('300ms', [animate('600ms', style({ opacity: 1, transform: `translate3d(0,0,0)` }))]), { optional: true })
      ])
    ])
  ]
})
export class ClientesListPage implements OnInit {
  clientesLists: String = 'linelist';
  agmStyles: any[] = environment.agmStyles;
  clientes: any;
  textbus = '';
  fechainibus: any;
  fechafinbus: any;
  tipoLlamadas: string[] = ["Retoma de visita", "Añadir visita a la ruta", "Recaudo", "Pedido"];



  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public _parEmpre: ParEmpreService,
    public _visitas: VisitasProvider,
    public _clientes: ClienteProvider,
    public _pagehome: HomePage,
    private pickerController: PickerController,
    public modalCtrl: ModalController,
    private _prodserv: ProdsService,
    private _ioncomponents: IonicComponentService
    // public visitaService: VisitasProvider
  ) {
    // this.visitas = this.visitaService.getAll();
    this.textbus = this.route.snapshot.paramMap.get('textbus');
    this.fechainibus = this.route.snapshot.paramMap.get('fini');
    this.fechafinbus = this.route.snapshot.paramMap.get('ffin');
    console.log('param leido llega ', this.textbus, this.fechainibus, this.fechafinbus);
//op mayo 30 19 cambiado para cargar de fb se cargaron al logear los clientes del vendedor
        // this._clientes.cargaBusquedaClientesNetsolin(this.textbus)
        // .then(cargo =>{
        //   if (cargo) {
        //       this.clientes = this._clientes.clienbus;
        //   };
        // })
      this._clientes.getClientesvendFb().subscribe((datos: any) => {
        console.log("Cargo clientes  de firebase datos", datos);
        if (this.textbus === undefined || this.textbus ==='' ){
          this.clientes = datos;  
        } else {
          this.clientes = datos.filter(
            (item: any) =>
              item.cod_tercer.toLowerCase().indexOf(this.textbus.toLowerCase()) > -1 ||
              item.nombre.toLowerCase().indexOf(this.textbus.toLowerCase()) > -1
          )
          }  
      });
    // this.visitas = this._visitas.visitaTodas.filter((item: any) =>
    //         item.data.cod_tercer.toLowerCase().indexOf(this.textbus.toLowerCase()) > -1 
    //         || item.data.nombre.toLowerCase().indexOf(this.textbus.toLowerCase()) > -1 );  
  }

  ngOnInit() {
    console.log('ngOnInit clientes-list 1 a buscar' , HomePage);
    console.log('ngOnInit clientes-list home checkin', this._pagehome.checkin );
    console.log('ngOnInit clientes-list home ', this._pagehome.checkin  );
    console.log('ngOnInit clientes-list home clientelocation', this._pagehome.clientelocation  );
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    
  }
  async crearvisita(dcliente) {
    // console.log('crearvisita');
    console.log('datos para crear visita del cliente:',dcliente);
    console.log('datos para crear visita del cliente:',this._visitas);
    if (!this._visitas.visitaTodas){
      console.log('No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas');
      const alert2 = await this.alertCtrl.create({
        message: 'No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas',
        buttons: ['Enterado']
      });
       await alert2.present();
      return;
    }
    console.log('datos para crear visita del cliente:',this._visitas);
    const ldatvisi = this._visitas.visitaTodas[0].data;
// tslint:disable-next-line: triple-equals
    if (typeof ldatvisi !== undefined){
      const alert2 = await this.alertCtrl.create({
        message: 'Creando Visita por llamada',
        buttons: ['Enterado']
      });
       await alert2.present();
      this._visitas.crearVisitaxllamada(dcliente,ldatvisi)
      .then(async res => {        
        this.navCtrl.navigateRoot('/home');
        // console.log('retorna de crear visita llamada',res);
      }
      );      
    }
  }



  async crearvisitaxllamadatipo(dcliente, tipo, pedido, id_visita) {
    // console.log('crearvisita');
    console.log('datos para crear visita del cliente:',dcliente);
    console.log('datos para crear visita del cliente:',this._visitas);
    if (!this._visitas.visitaTodas){
      console.log('No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas');
      const alert2 = await this.alertCtrl.create({
        message: 'No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas',
        buttons: ['Enterado']
      });
       await alert2.present();
      return;
    }
    console.log('datos para crear visita del cliente:',this._visitas);
    const ldatvisi = this._visitas.visitaTodas[0].data;
// tslint:disable-next-line: triple-equals
    if (typeof ldatvisi !== undefined){
      const alert2 = await this.alertCtrl.create({
        message: 'Creando Visita por llamada',
        buttons: ['Enterado']
      });
       await alert2.present();
      this._visitas.crearVisitaxllamadaxTipo(dcliente,ldatvisi,tipo, id_visita)
      .then(async (res) => {  
        if(tipo==="Retoma de visita"){
          this.cargarPedidoTemp(res, pedido);
        }      
        this.navCtrl.navigateRoot('/home');
        // console.log('retorna de crear visita llamada',res);
      }
      );      
    }
  }


  //guarda pedido temporal seleccionado
  cargarPedidoTemp(idvisita, pedidosel){
    console.log('carga pedido temporal para visita -> ',idvisita, pedidosel);
    this._prodserv.cargar_fb_pedido(idvisita, pedidosel);

  };


  //CLASIFICACION DE LLAMADAS MEDIANTE PICKER
  async showPicker(cliente) {
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel'
        },
        {
          text: 'Seleccionar tipo de llamada',
          handler: (value: any) => {
            console.log(value);
            if (value.Llamadas.value === 'Retoma de visita') {
              console.log('Entro a retoma de visita para el cliente -> ', cliente);
              this._clientes.getCliePedidoTemp(cliente.cod_tercer).subscribe((res) => {
                console.log('Pedidos temporales de el cliente -> ', res);
                this.showPickerPedidos(res, cliente, value.Llamadas.value);
              });
            } else if (value.Llamadas.value === 'Añadir visita a la ruta') {
              console.log('Entro a Añadir visita a la ruta para el cliente -> ', cliente);
              var fechact = new Date();
              var hora = fechact.getHours() + ":" + fechact.getMinutes();
              var horaf = (fechact.getHours() + 1) + ":" + fechact.getMinutes();
              var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
              var visita = {
                cod_tercer: cliente.cod_tercer,
                id_dir: cliente.id_dir,
                cod_person: this._parEmpre.usuario.cod_usuar,
                id_ruta: this._visitas.id_ruta,
                id_per: this._visitas.id_periodo,
                fecha_ini: fechact.toLocaleDateString("es-ES"),
                fec_visita: fechact.toLocaleDateString("es-ES"),
                hora_in: hora,
                fecha_fin: fechact.toLocaleDateString("es-ES"),
                hora_fin: horaf
              }
              console.log('obj visita a enviar ->>>> ', visita);
              this._visitas.creaVisitaNetsolin(visita).then(async (res: any) => {
                console.log('respuesta serv netsolin -> ', res);
                if (res.error != undefined && res.error == false) {
                  console.log('entro a guardar visita en fb');
                  this.crearvisitaxllamadatipo(cliente, value.Llamadas.value, [], res.id_visita);
                } else {
                  if (res.isCallbackError == true) {
                    const alert2 = await this.alertCtrl.create({
                      message: res.messages[0].menerror,
                      buttons: ['Enterado']
                    });
                    await alert2.present()
                  }
                }
              });

            } else {
              this.crearvisitaxllamadatipo(cliente, value.Llamadas.value, [], 0);
            }

          }
        }
      ],
      columns: [{
        name: 'Llamadas',
        options: this.getColumnOptions(this.tipoLlamadas, false, "")
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }


//Picker para seleccionar pedidos

  async showPickerPedidos(pedidosTemporales, dcliente, tipollamada) {
    var pedidos = [];
    var busqueda = [];
    for (let i of pedidosTemporales) {
      var fecact = new Date();
      var fecped = new Date(i.datos_gen.fechahora_ingreso);
      var diff = fecact.getTime() - fecped.getTime();
      var dias_dif = Math.round(diff / (1000 * 60 * 60 * 24));
      console.log('diferencia de dias act y ped -> ', dias_dif);
      if (dias_dif < 8) {  //Arreglo pedido temporal no mas de 8 dias.
        pedidos.push(i.datos_gen.id_visita);
      }
    }
    let options: PickerOptions = {
      buttons: [
        {
          text: "Cancelar",
          role: 'cancel'
        },
        {
          text: 'Seleccionar pedido a retornar',
          handler: (value: any) => {
            console.log(value);
            busqueda = pedidosTemporales.filter(x => x.id_visita === value.pedidos.value);
            console.log('Valor de la busqueda ->  ', busqueda);
            if (busqueda != undefined) {
              this.verPedidoTemporal(busqueda[0]).then((res) => {
                console.log('respuesta en fin de picker -> ', res);
                if (res) {
                  this.sincroInvPedido(dcliente, busqueda[0]).then((respuestaPedAct)=>{
                    if(respuestaPedAct != false){
                      console.log('Sincronizo pedido resp ->', respuestaPedAct);
                      this.crearvisitaxllamadatipo(dcliente, tipollamada, respuestaPedAct, 0);
                      this._clientes.delPedidoTempClie(busqueda[0].datos_gen.cod_tercer, "" + busqueda[0].id_visita + "");
                    }else{
                      console.log('Error Sincronizando InvPed')
                    };
                  });
                }
              });
            };
          }
        }
      ],
      columns: [{
        name: 'pedidos',
        options: this.getColumnOptions(pedidos, true, "Pedido - ")
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present()
  }






  getColumnOptions(datos, customtext:boolean, text:string) {
    let options = [];
    if (customtext) {
      datos.forEach(x => {
        options.push({ text: text + x, value: x });
      });
    } else {
      datos.forEach(x => {
        options.push({ text: x, value: x });
      });
    }
    return options;
  }




  //Sincronizar existencias y precio items
  sincroInvPedido(cod_tercer, pedido) {
    console.log('Actualizar precio y stock pedido Temporal');
    this._ioncomponents.presentTimeoutMsjLoading(50000, true, 'Actualizando Pedido...');
    return new Promise((resolve, reject) => {
      this.cargarInventarioCliente(cod_tercer).then((resinventario) => {
        this._ioncomponents.dismissLoading();
        if (resinventario != false) {
          console.log('Inventario cargado -> ', resinventario);
          var pedTemp = this.actPreciosPedTemp(pedido, resinventario);
          console.log('Pedido Actualizado ->', pedTemp);
          resolve(pedTemp);
        } else {
          console.log('No se pudo cargar el inventario');
          resolve(false);
        }
      });
    });
  }



  //Cargar Inventario de Cliente para Act Ped Temporal
  async cargarInventarioCliente(cod_tercero) {
    this._prodserv.cargoInventarioNetsolinPed = false;
    return new Promise((resolve, reject) => {
      this._prodserv.cargaInventarioNetsolinPedido(cod_tercero).then(cargo => {
        if (cargo) {
          console.log('Inventario Cargado -> ', this._prodserv.inventario);
          resolve(this._prodserv.inventarioPed);
        } else {
          console.log("No pudo cargar inventario de Netsolin");
          resolve(false);
        }
      })
        .catch(() => {
          console.log("error en homE ngoniti al cargaInventarioNetsolin");
          resolve(false);
        });
    });
  }
  //Actualizar precio y existencias pedidos
  actPreciosPedTemp(pedidoTemp, inventario) {
    console.log('pedidoTemp que llega y inventariocliente -> ', pedidoTemp, inventario);
    var count = 0;
    for (let i of pedidoTemp.items_pedido) {
      var busqueda = inventario.filter(x => x.cod_refinv === i.item.cod_ref);
      if (busqueda != undefined) {
        console.log('Item de pedido en inventario comparativa (i,ptemp)->', i, busqueda[0]);
        if (i.item.total != busqueda[0].precio_ven) {
          pedidoTemp.items_pedido[0].item.precio = busqueda[0].precio_ven;
          pedidoTemp.items_pedido[0].item.total = busqueda[0].precio_ven * pedidoTemp.items_pedido[0].item.cantidad;
        }
      }
      count++;
    }
    return pedidoTemp;
  }

  //Open Modal Cartera
  async verCartera(pcod_tercer) {
    console.log('Codigo de tercero que llega a ver cartera:', pcod_tercer);
    const modal = await this.modalCtrl.create({
      component: ModalListObligaPage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { cod_tercer: pcod_tercer }
    });
    return await modal.present();
  }

  //Open Modal Pedido Temporal
  async verPedidoTemporal(pedidotemp) {
    console.log('pedido que llega para visualizar:', pedidotemp);
    const modal = await this.modalCtrl.create({
      component: ModalDetallePedTempPage,
      // componentProps: { fromto: fromto, search: this.search }
      componentProps: { pedido: pedidotemp }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    console.log('datos retornados por modal -> ', data);
    return data;
  }


}

