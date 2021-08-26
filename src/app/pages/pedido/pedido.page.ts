import { Component, OnInit } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { ProdsService } from '../../providers/prods/prods.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { PickerController, ModalController } from "@ionic/angular";
import { PickerOptions } from "@ionic/core";
import { IonicComponentService } from '../../providers/ionic-component.service'
//MODAL DETALLE DE PEDIDO TEMPORAL
import { ModalDetallePedTempPage } from '../modal/modal-detallepedtemp/modal-detallepedtemp.page'


@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.page.html',
  styleUrls: ['./pedido.page.scss'],
})

export class PedidoPage implements OnInit {
  pedido: Array<any> = [];
  total_ped = 0;
  grabando_pedido = false;
  grabo_pedido = false;
  mostrandoresulado = false;
  itemprodaped: any;
  direcdespa:any;
  notaPed = '';
  // Ene 4 20 cambio solicitado por Cesar Dic 18 no pueden indicar que es obsequio
  pedir_obsequio = false;
  es_obsequio = false;
  inconsistencia = false;
  men_inconsisten = '';
  constructor(
    public navCtrl: NavController,
    public btCtrl: BluetoothSerial,
    public alertCtrl: AlertController,
    private translate: TranslateProvider,
    public _prods: ProdsService,
    public route: ActivatedRoute,
    public router: Router,
    public _DomSanitizer: DomSanitizer,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    private pickerController: PickerController,
    public modalCtrl: ModalController,
    private _ioncomponents: IonicComponentService

    ) { }
  ngOnInit() {
    this.getPedido();
    if (this._cliente.clienteActual.cod_tercer !== this._visitas.visita_activa_copvdet.cod_tercer){
      console.log('Inconsistencia el cliente de la visita no es el mismo del cliente del pedido');
      this.inconsistencia = true;
      this.men_inconsisten = 'Inconsistencia el cliente de la visita no es el mismo del cliente del pedido. Salga y reintente.';
      this.men_inconsisten += ' Cliente: '+this._cliente.clienteActual.cliente + ' Cliente visita a generar pedido: '+this._visitas.visita_activa_copvdet.nombre;
      return;
    }

  }

  deleteItem(item) {
    this._prods.borraritempedido(item)
      .then(() => {
        this.getPedido();
      })
      .catch(error => alert(JSON.stringify(error)));
  }
  changedirec(e) {
    console.log("changedirec e: ", e);
    console.log("e.detail.value", e.detail.value);
    console.log("this.direcdespa: ", this.direcdespa);
  }

  getPedido() {
    this._prods.getPedido()
      .then(data => {
        console.log('getPedido data', data);
        console.log('getPedido _cliente.clienteActual', this._cliente.clienteActual);
        console.log('getPedido this._visitas.visita_activa_copvdet', this._visitas.visita_activa_copvdet);
         this.direcdespa = this._visitas.visita_activa_copvdet.id_dir;
         this.pedido = data; 
         this.actualizar_totalped();
        });
  }
  total(item, i, ev: any){
    // console.log('en total item llega:', i, item, this.pedido);
    this.itemprodaped = this._prods.getProdPed(this.pedido[i].item.cod_ref);
    if (this.pedido[i].item.cantidad < 0)
    {
      this.pedido[i].item.cantidad = 0;
      ev.target.value = 0;
    } else {
      this.pedido[i].item.total = this.pedido[i].item.cantidad * this.pedido[i].item.precio;
    }
    this.actualizar_totalped();
    this._prods.guardar_storage_pedido();
    // this.total_t = 0;
    // this.total_t = this.cantidad_sol * this.prodshop.precio_ven;    
    // return this.total_t;
  }  
  actualizar_totalped(){
    this.total_ped = 0;
    for( let itemp of this.pedido ){
      this.total_ped += Number(itemp.item.total)
    ;
      // console.log("SUMA")
      // console.log (this.total_ped)
    }
  }
  realizar_pedido(){
    if (this._prods.generando_pedido){
      console.log('Ya se esta generando un pedido. Espere');
      this.inconsistencia = true;
      this.men_inconsisten = 'Ya se esta generando un pedido. Espere';
      return;
    }
    if (this._cliente.clienteActual.cod_tercer !== this._visitas.visita_activa_copvdet.cod_tercer){
      console.log('Inconsistencia el cliente de la visita no es el mismo del cliente del pedido');
      this.inconsistencia = true;
      this.men_inconsisten = 'Inconsistencia el cliente de la visita no es el mismo del cliente del pedido. Salga y reintente.';
      this.men_inconsisten += ' Cliente: '+this._cliente.clienteActual.cliente + ' Cliente visita a generar pedido: '+this._visitas.visita_activa_copvdet.nombre;
      return;
    }
    this.grabando_pedido = true;
    this._prods.genera_pedido_netsolin(this.direcdespa, this.notaPed, this.es_obsequio)
    .then(res => {
      if (res){
        console.log('retorna genera_pedido_netsolin por si res:', res);
        this.mostrandoresulado = true;
        this.grabo_pedido = true;
        //Actualizar existencias de referencias restando valores
        this._prods.restaExistenciasprodxpedido();
        this._prods.borrar_storage_pedido();
      } else {
        this.mostrandoresulado = true;
        this.grabo_pedido = false;
        this.grabando_pedido = true;
        console.log('retorna genera_pedido_netsolin por no ');  
      }
    })
    .catch(error => {
      this.mostrandoresulado = true;
      this.grabo_pedido = false;
      this.grabando_pedido = true;
      console.error('retorna genera_pedido_netsolin por error: ', error);
    });
  }
  quitar_resuladograboped(){
    if (this.grabo_pedido){
      this.pedido = [];
      this.grabo_pedido = false;
    }
    this.grabando_pedido = false;
    this.mostrandoresulado = false;    
  }

  guardar_pedido_temporal(){
    if (this._prods.generando_pedido){
      console.log('Ya se esta generando un pedido. Espere');
      this.inconsistencia = true;
      this.men_inconsisten = 'Ya se esta generando un pedido. Espere';
      return;
    }
    if (this._cliente.clienteActual.cod_tercer !== this._visitas.visita_activa_copvdet.cod_tercer){
      console.log('Inconsistencia el cliente de la visita no es el mismo del cliente del pedido');
      this.inconsistencia = true;
      this.men_inconsisten = 'Inconsistencia el cliente de la visita no es el mismo del cliente del pedido. Salga y reintente.';
      this.men_inconsisten += ' Cliente: '+this._cliente.clienteActual.cliente + ' Cliente visita a generar pedido: '+this._visitas.visita_activa_copvdet.nombre;
      return;
    }
    this.grabando_pedido = true;
    this._prods.genera_pedido_temporal(this.direcdespa, this.notaPed, this.es_obsequio)
    .then(res => {
      if (res){
        console.log('retorna genera_pedido_netsolin por si res:', res);
        this.mostrandoresulado = true;
        this.grabo_pedido = true;
        //Actualizar existencias de referencias restando valores
        // this._prods.restaExistenciasprodxpedido();
        this._prods.borrar_storage_pedido();
      } else {
        this.mostrandoresulado = true;
        this.grabo_pedido = false;
        this.grabando_pedido = true;
        console.log('retorna genera_pedido_netsolin por no ');  
      }
    })
    .catch(error => {
      this.mostrandoresulado = true;
      this.grabo_pedido = false;
      this.grabando_pedido = true;
      console.error('retorna genera_pedido_netsolin por error: ', error);
    });

  }


  imprimir_pedido() {
    let printer;
    this.btCtrl.list().then(async datalist => {
      let sp = datalist;
      let input =[];
      sp.forEach(element => {
        let val = {name: element.id, type: 'radio', label: element.name, value: element};
        input.push(val);
      });
      const alert = await this.alertCtrl.create({
        header: 'Selecciona impresora',
        inputs: input,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            
            text: 'Ok',
            handler: (inpu) => {
              printer = inpu;
              console.log(inpu);
              const printing = this.btCtrl.connect(printer.id).subscribe(data => {
                this.btCtrl.connect(printer.id);
                this.btCtrl.write(this._visitas.visita_activa_copvdet.pedido_grabado.txt_imp).then(async msg => {
                  const alert2 = await this.alertCtrl.create({
                    message: 'Imprimiendo',
                    buttons: ['Cancel']
                  });
                   await alert2.present();
                }, async err => {
                   const alerter = await this.alertCtrl.create({
                    message: 'ERROR' + err,
                    buttons: ['Cancelar']
                  });
                   await alerter.present();
                });
              });              
            }
          }
        ]
      });
       await alert.present();
    }, async err => {
      console.log('No se pudo conectar', err);
       const alert = await this.alertCtrl.create({
        message: 'ERROR' + err,
        buttons: ['Cancelar']
      });
       await alert.present();
    });

  }

  //Adicionar pedido temporal desde apartado pedido
  selPedTemp() {
    this._cliente.getCliePedidoTemp(this._visitas.visita_activa_copvdet.cod_tercer).subscribe((res) => {
      console.log('Pedidos temporales de el cliente -> ', res);
      this.showPickerPedidos(res, this._visitas.visita_activa_copvdet.cod_tercer, "Retoma de visita");
    });
  }
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
                  this.sincroInvPedido(dcliente, busqueda[0]).then((respuestaPedAct) => {
                    if (respuestaPedAct != false) {
                      console.log('Sincronizo pedido resp ->', respuestaPedAct);
                      this.crearvisitaxllamadatipo(dcliente, tipollamada, respuestaPedAct, 0);
                      this._cliente.delPedidoTempClie(busqueda[0].datos_gen.cod_tercer, "" + busqueda[0].id_visita + "");
                    } else {
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

  getColumnOptions(datos, customtext: boolean, text: string) {
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
    this._prods.cargoInventarioNetsolinPed = false;
    return new Promise((resolve, reject) => {
      this._prods.cargaInventarioNetsolinPedido(cod_tercero).then(cargo => {
        if (cargo) {
          resolve(this._prods.inventarioPed);
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

  async crearvisitaxllamadatipo(dcliente, tipo, pedido, id_visita) {
    // console.log('crearvisita');
    console.log('datos para crear visita del cliente:', dcliente);
    console.log('datos para crear visita del cliente:', this._visitas);
    if (!this._visitas.visitaTodas) {
      console.log('No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas');
      const alert2 = await this.alertCtrl.create({
        message: 'No tienes visitas asginadas. Debe por lo menos tener una asignada para poder tomar llamadas',
        buttons: ['Enterado']
      });
      await alert2.present();
      return;
    }
    console.log('datos para crear visita del cliente:', this._visitas);
    const ldatvisi = this._visitas.visitaTodas[0].data;
    // tslint:disable-next-line: triple-equals
    if (typeof ldatvisi !== undefined) {
      const alert2 = await this.alertCtrl.create({
        message: 'Creando Visita por llamada',
        buttons: ['Enterado']
      });
      await alert2.present();
      this._visitas.crearVisitaxllamadaxTipo(dcliente, ldatvisi, tipo, id_visita)
        .then(async (res) => {
          if (tipo === "Retoma de visita") {
            this.cargarPedidoTemp(res, pedido);
          }
          this.navCtrl.navigateRoot('/home');
          // console.log('retorna de crear visita llamada',res);
        }
        );
    }
  }

  //guarda pedido temporal seleccionado
  cargarPedidoTemp(idvisita, pedidosel) {
    console.log('carga pedido temporal para visita -> ', idvisita, pedidosel);
    this._prods.cargar_fb_pedido(idvisita, pedidosel);
  };






  public encodestring(pstring){
    return encodeURIComponent(pstring);
  }
  
}


