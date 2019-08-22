import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { ParEmpreService } from '../../providers/par-empre.service';
import { NetsolinApp } from '../../shared/global';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ClienteProvider } from '../cliente.service';
import { AngularFireStorage, AngularFireStorageReference } from '@angular/fire/storage';
import { Observable } from 'rxjs';

// import { MessageService } from '../message/message.service';
// import { ConsoleReporter } from 'jasmine';

@Injectable({
  providedIn: 'root'
})

export class VisitasProvider {
    //AQUI CAMBIAR PARA QUE TRAIGA LA BODEGA QUE LE PERTENECE A LA RUTA
    bodega = 'VEH';
    id_ruta: number = 0;
    // visitaclienteactual: AngularFirestoreDocument<any>;
    // visitaclienteactual: any;
    visitas: any;
    room: any;
    facturaCounter: number = 0;
    factura: Array<any> = [];
    profileUrl: Observable<string | null>;
    clienteFb: any;
    
    public cargo_ruta = false;
    public visitaTodas: any;
    public visitasProximas: any;
    public visitasCumplidas: any;
    public visitasUltimas: any;
    public error_cargarruta = false;
    public men_errorcargarruta = "";
    visitas_cumplidas: any[] = [];
    visitas_pendientes: any[] = [];
    visitas_xllamada: any[] = [];
    visitas_incumplidas: any[] = [];
    visita_activa_copvdet: any;
    visita_activa: any;
    cargoInventarioNetsolin = false;
    inventario: Array<any> = [];
    public userId: string;
    public cargoidperiodo = false;
    public id_periodo: string;
    public cargo_clienteact = false;
    public direc_actual: any;
    public id_visita_activa: any;
    public visitaabierta: any;
    public error_cierrevisnetsolin = false;
    public men_errocierrevisnetsolin = '';

    
    constructor(private fbDb: AngularFirestore,
        private firestore: AngularFirestore,
        private afStorage: AngularFireStorage,
        private http: HttpClient,
        public _cliente: ClienteProvider,
        // public _message: MessageService,
        public _parempre: ParEmpreService) {
          this.visitaabierta = null;
    }

    // inicializarVisitaActual(id){
    //     console.log('inicializarVisitaActual id',id);
    //     this.getVisitaActual(id).subscribe((datos: any) => {
    //         console.log('inicializarVisitaActual getVisitaActual datos:', datos);                
    //         this.visitaclienteactual = datos;
    //         console.log('inicializarVisitaActual getVisitaActual this.visitaclienteactual:', this.visitaclienteactual);                
    //       });        
    //     console.log('visitaclienteactual: ', this.visitaclienteactual);
    //   }
      //trae de firebase la visita actual como obervable

      public getVisitaActual(id){
          return this.fbDb
          .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
          .doc(id).valueChanges();
      }
//   //Obtiene id de fecha referencia
//   public getIdFecha(fechaId: string) {
//     return this.fbDb.collection('manfechas').doc(fechaId).snapshotChanges();
//   }      
  //Obtiene todas las fechas
//   public getAllFechas() {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     return this.fbDb.collection('manfechas').valueChanges();
//   }      
  
  //Obtiene la fecha que corresponde a usuario actual y una fecha dada en timestamp
//   public getFechaUsaurio(fechats) {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     console.log('getFechaUsaurio');
//     console.log(fechats);
//     console.log(this._parempre.usuario.cod_usuar);
//     return this.fbDb.collection('manfechas', ref => ref.where('fecha', '==', fechats)).valueChanges();
//     //   .where('cod_person', '==', this._parempre.usuario.cod_usuar)).valueChanges();

// }

  //Obtiene la fecha que corresponde a usuario actual y una fecha dada en timestamp
//   public getVisitasidFecha(fechaid, idruta) {
//     // return this.fbDb.collection('manfechas').snapshotChanges();
//     console.log('getFechaUsaurio');
//     console.log(fechaid);
//     console.log(this._parempre.usuario.cod_usuar);
//     // return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid).orderBy('fecha_in')).valueChanges();
//     return this.fbDb.collection('rutas_d', ref => ref.where('id_reffecha', '==', fechaid)
//         .where('id_ruta','==',idruta).orderBy('fecha_in')).snapshotChanges();
//     //   .where('cod_person', '==', this._parempre.usuario.cod_usuar)).valueChanges();
    
//   }      
  
//Consulta en Netsolin el usuario con la fecha para saber que ruta y periodo le corresponde
cargaPeriodoUsuar(pcod_usuar){
    return new Promise((resolve,reject)=>{
      if (this.cargoidperiodo){
          resolve(true); 
       }
        NetsolinApp.objenvrest.filtro = pcod_usuar;
        let url= this._parempre.URL_SERVICIOS + "netsolin_servirestgo.csvc?VRCod_obj=IDRUTAPERAPP";
        this.http.post( url, NetsolinApp.objenvrest )   
         .subscribe( (data:any) =>{ 
           if (data){
             console.log('cargo periodo en netsolin', data);
          if( data.error){
              console.error(" cargaPeriodoUsuar ", data.error);
            //   this._parempre.reg_log('Error en cargaPeriodoUsuar por netsolin ', 'data.error');
             this.cargoidperiodo = false;
             this.cargo_ruta = false;
             this.error_cargarruta = true;
             this.men_errorcargarruta = data.men_error;
             resolve(false);
            } else{
                // this._parempre.reg_log('coer', 'cargaPeriodoUsuar por netsolin ');
                this.cargoidperiodo = true;
              this.id_ruta = data.datos_ruta[0].id_ruta;
              this.id_periodo = data.datos_periodo[0].id_per;
              resolve(true);
            }
          } 
          // else {
          //   this.cargoidperiodo = false;
          //   this.cargo_ruta = false;
          //   this.error_cargarruta = true;
          //   this.men_errorcargarruta = 'Error cargando Periodo. No se ha generado ruta.';
          //   resolve(false);
          // }
         });
       });
  }
  //Crea visita por llamada para tomar pedidos (no se encuentra en el sitio)
  public  crearVisitaxllamada(pdcliente,pdvisita) {
    console.log("crearVisitaxllamada pdcliente:", pdcliente,pdvisita);
    const now = new Date();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    const horaing = hora.toString()+minutos.toString()
    const idvisi = 90000000000000+now.getTime();
    const visicrear = {
      cod_tercer: pdcliente.cod_tercer,
      direccion: pdcliente.direccion,
      envio_email: false,
      error_envemail: '',
      errorgrb_factu: false,
      errorgrb_pedido:false,
      errorgrb_recibo:false,
      estado: '',
      fecha_fin: pdvisita.fecha_fin,
      fecha_in: pdvisita.fecha_in,
      fechahora_cierre: '',
      fechahora_ingreso: Date(),
      hora_in : parseInt(horaing),
      hora_sal : parseInt(horaing),
      grb_pedido : false,
      resgrb_pedido : '',
      pedido_grabado : null,
      grb_factu : false,
      resgrb_factu : '',
      pedido_factu : null,
      grb_recibo : false,
      resgrb_recibo : '',
      pedido_recibo : null,
      id_dir: pdcliente.id_dir, 
      id_reffecha: pdvisita.id_reffecha,
      id_ruta: pdvisita.id_ruta,
      id_visita: idvisi,
      nombre: pdcliente.nombre,
      llamada: true,
      notaing: '',
      notas: 'Llamada Cliente'
    };
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
    .doc(idvisi.toString()).set(visicrear);
  
  }
  //Obtiene las visitas que corresponde a la fecha y ruta tomada de carga anterior en netsolin
  public getVisitasidrutper() {

      const lruta = `/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`;
      console.log(lruta);
    //   this._parempre.reg_log('getVisitasidrutper lruta ', lruta);
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
    .snapshotChanges();
    
  }      
  
  public guardarVsita(id, visitaadd){
    //   console.log('guardarVsita id:' + id);
    //   console.log(visitaadd);
      return this.fbDb
      .collection('reg_visitas').doc(id).set(visitaadd);
    //   .collection('reg_visitas').doc(id).update({estado: 'e', otro: visitaadd});
    //   .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
    //   .doc(id).set(visitaadd);
    }
  
    public actualizarVisita(id, datosact){
        // console.log('actualizarVisita id:' + id);
        // console.log(datosact);
        console.log(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`);
        console.log(id, datosact);
        return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
      .doc(id.toString()).update(datosact);
    }
      //Guardar para el vendedor o usuario datos para cierre, recibo y formas de pago
  guardarcierrevisitaFb(id, datosact) {
    console.log("guardarcierrevisitaFb id:", id);
    console.log("guardarcierrevisitaFb objrecibo:", datosact);
    //Actualizar
    const now = new Date();
    //extraemos el día mes y año
    const dia = now.getDate();
    const mes = now.getMonth() + 1;
    const ano = now.getFullYear();
    const hora = now.getHours();
    const minutos = now.getMinutes();
    console.log('1');
    //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario`)
      .doc(ano.toString())
      .set({ ano: ano.toString() });
    //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(
        `/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses`
      )
      .doc(mes.toString())
      .set({ mes: mes.toString() });
      console.log('2');
      //asegurarse que este creado el año, mes y dia
    this.fbDb
      .collection(
        `/personal/${
          this._parempre.usuario.cod_usuar
        }/resumdiario/${ano}/meses/${mes}/dias`
      )
      .doc(dia.toString())
      .set({ dia: dia.toString() });
      console.log('3');
  
    return this.fbDb
    .collection(`/personal/${this._parempre.usuario.cod_usuar}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrevisita`)
    .doc(id.toString()).set(datosact);

  }
  genera_cierrevisita_netsolin(objdvisiact,objlistact,objpedidos,objfacturas,objrecibos) {
    console.log(objdvisiact,objlistact,objpedidos,objfacturas,objrecibos);
    return new Promise((resolve, reject) => {
      let paramgrab = {
        // datos_gen: this._visitas.visita_activa_copvdet.datosgen,
        dvisita: objdvisiact,
        actividades: objlistact,
        pedidos: objpedidos,
        facturas: objfacturas,
        recibos: objrecibos,
        usuario: this._parempre.usuario
      };
      NetsolinApp.objenvrest.filtro = "";
      NetsolinApp.objenvrest.parametros = paramgrab;
      let url =this._parempre.URL_SERVICIOS +"netsolin_servirestgo.csvc?VRCod_obj=APPCIERREVISITA";
      this.http.post(url, NetsolinApp.objenvrest).subscribe((data: any) => {
        console.log(" genera_cierrevisita_netsolin data:", data);
        if (data.error) {
          this.error_cierrevisnetsolin = true;
          this.men_errocierrevisnetsolin = data.men_error;
          console.error(" genera_cierrevisita_netsolin ", data.men_error);
          resolve(false);
        } else {
          if (data.isCallbackError || data.error) {
            this.error_cierrevisnetsolin = true;
            this.men_errocierrevisnetsolin =data.messages[0].menerror;
            console.error(" Error genera_cierrevisita_netsolin ",data.messages[0].menerror);
            resolve(false);
          } else {
            this.error_cierrevisnetsolin = false;
            this.men_errocierrevisnetsolin ='';
            resolve(true);
          }
        }
        console.log(" genera_cierrevisita_netsolin 4");
      });
    });
  }    
    public actualizarUbicaVisitaAct(longitud, latitud){
        console.log('actualizarUbicaVisitaAct id_ruta, id_periodo, this.visita_activa_copvdet.id_visita ',
            this.id_ruta, this.id_periodo, this.visita_activa_copvdet.id_visita);
    console.log(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`);
    console.log(this.visita_activa_copvdet.id_visita);
        return this.fbDb
      .collection(`/personal/${this._parempre.usuario.cod_usuar}/rutas/${this.id_ruta}/periodos/${this.id_periodo}/visitas`)
      .doc(this.visita_activa_copvdet.id_visita).update({latitud: latitud, longitud: longitud});
    }

    //Obtiene visita por id de la visita
  public getIdRegVisita(visitaId: string) {
      console.log('en getIdRegVisita');
    return this.fbDb.collection('reg_visitas').doc(visitaId).valueChanges();
  }      

  //Actualiza en firebase el cliente
  actualizarclientenetsolinFb(cod_tercer){
    return new Promise((resolve,reject)=>{
        this.cargo_clienteact = false;
        this._cliente.cargaClienteNetsolin(cod_tercer).then(cargo =>{            
            console.log('En actualizarclientenetsolinFb cargo:', cargo);
            if (cargo) {
                this.cargo_clienteact = true;
                //Actualizar en fb
                this._cliente.guardarClienteFb(cod_tercer).then(res => {
                    // console.log('Guardoclientefb res', res, this._cliente.clienteActual.direcciones);
                    this._cliente.guardardireccionesClienteFb(cod_tercer, this._cliente.clienteActual.direcciones).then(() => {
                        resolve(true);
                    });
                })
                .catch(() => {
                    console.log('error en actualizarclientenetsolinFb guardarClienteFb');
                    resolve(false);
                });
            } else {
                console.log('error en actualizarclientenetsolinFb guardarClienteFb');
                resolve(false);
            }
        })
        .catch(() => {
            console.log('error actualizarclientenetsolinFb cargaClienteNetsolin');
            resolve(false);
        });
    });
  }

  //Carga la visita activa busca si esta creada en reg_visitas, si no la crea si esta la trae
  //recibe la visita activa con el id busca y carga cartera de netsolin si no lo ha echo
//   cargaVisitaActivaUlt(visitaAct: any){
//     this.visita_activa = null;
//     this.cargo_clienteact = false;
//     this.direc_actual = null;

//         this._cliente.cargaClienteNetsolin(visitaAct.data.cod_tercer).then(cargo =>{
//             console.log('En cargaVisitaActiva 14 cargaClienteNetsolin cargo:', cargo);
//             this.cargo_clienteact = true;
//             this.getIdRegVisita(visitaAct.id).subscribe((datos: any) => {
//                 console.log('En cargaVisitaActiva getIdRegVisita 1 datos:', datos);                
//                 if (datos) {
//                     datos.cartera = this._cliente.clienteActual.cartera;
//                     datos.datosgen = visitaAct.data;
//                     datos.grb_pedido = false;
//                     datos.resgrb_pedido = '';
//                     datos.pedido_grabado = null;
//                     datos.errorgrb_pedido = false;
//                     datos.menerrorgrb_pedido = '';
//                     datos.grb_factu = false;
//                     datos.resgrb_factu = '';
//                     datos.factura_grabada = null;
//                     datos.errorgrb_factu = false;
//                     datos.menerrorgrb_factu = '';
//                     datos.grb_recibo = false;
//                     datos.resgrb_recibo = '';
//                     datos.recibo_grabado = null;
//                     datos.errorgrb_recibo = false;

//                     this.visita_activa = datos;
//                     this._cliente.direcciones.forEach(itemdir => {
//                         if (datos.datosgen.id_dir === itemdir.id_dir){
//                             this.direc_actual = itemdir;
//                         }                        
//                     });
//                     this._cliente.guardarClienteFb(visitaAct.data.cod_tercer).then(res =>{
//                         this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
//                             console.log('susc datos cliente fb ', datosc);
//                             this.direc_actual = datosc;
//                         });
//                     });
//                     this._cliente.guardardireccionesCliente(visitaAct.data.cod_tercer);
//                    this.guardarVsita(visitaAct.id, this.visita_activa).then(res => {                       
//                         console.log('Visita guardada');
//                     });
//                 } else {
//                     const fh = Date.now();
//                     const visitaadd = {
//                         datosgen : visitaAct.data,
//                         estado : '',
//                         fechahora_ingreso : fh,
//                         cartera : null,
//                         grb_pedido: false,
//                         resgrb_pedido: '',
//                         pedido_grabado: null,
//                         errorgrb_pedido: false,
//                         menerrorgrb_pedido: '',
//                         grb_factu:false,
//                         resgrb_factu: '',
//                         factura_grabada: null,
//                         errorgrb_factu: false,
//                         menerrorgrb_factu: '',
//                         grb_recibo: false,
//                         resgrb_recibo: '',
//                         recibo_grabado: null,
//                         errorgrb_recibo: false
//                     };
//                     this._cliente.guardarClienteFb(visitaAct.data.cod_tercer).then(res =>{
//                         console.log('Cliente '+visitaAct.cod_tercer+' guardado en dbFB 2')
//                         this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
//                             console.log('susc datos cliente fb ', datosc);
//                             if (datosc.length >0){

//                             }
//                         });

//                    });
//                     this.guardarVsita(visitaAct.id, visitaadd).then(res => {
//                     });
//                 }
//             });
//         })
//         .catch(() => {
//             console.log('error en carga visita activa');
//         });
//   }

//   cargaVisitaActivaVersionAnterior(visitaAct: any){
//     this.visita_activa = null;
//     this.cargo_clienteact = false;
//     this.direc_actual = null;

//         this._cliente.cargaClienteNetsolin(visitaAct.data.cod_tercer).then(cargo =>{
//             console.log('En cargaVisitaActiva 14 cargaClienteNetsolin cargo:', cargo);
//             this.cargo_clienteact = true;
//             this.getIdRegVisita(visitaAct.id).subscribe((datos: any) => {
//                 console.log('En cargaVisitaActiva getIdRegVisita 1 datos:', datos);                
//                 if (datos) {
//                     datos.cartera = this._cliente.clienteActual.cartera;
//                     datos.datosgen = visitaAct.data;
//                     datos.grb_pedido = false;
//                     datos.resgrb_pedido = '';
//                     datos.pedido_grabado = null;
//                     datos.errorgrb_pedido = false;
//                     datos.menerrorgrb_pedido = '';
//                     datos.grb_factu = false;
//                     datos.resgrb_factu = '';
//                     datos.factura_grabada = null;
//                     datos.errorgrb_factu = false;
//                     datos.menerrorgrb_factu = '';
//                     datos.grb_recibo = false;
//                     datos.resgrb_recibo = '';
//                     datos.recibo_grabado = null;
//                     datos.errorgrb_recibo = false;

//                     this.visita_activa = datos;
//                     this._cliente.direcciones.forEach(itemdir => {
//                         if (datos.datosgen.id_dir === itemdir.id_dir){
//                             this.direc_actual = itemdir;
//                         }                        
//                     });
//                     this._cliente.guardarClienteFb(visitaAct.data.cod_tercer).then(res =>{
//                         this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
//                             console.log('susc datos cliente fb ', datosc);
//                             this.direc_actual = datosc;
//                         });
//                     });
//                     this._cliente.guardardireccionesCliente(visitaAct.data.cod_tercer);
//                    this.guardarVsita(visitaAct.id, this.visita_activa).then(res => {                       
//                         console.log('Visita guardada');
//                     });
//                 } else {
//                     const fh = Date.now();
//                     const visitaadd = {
//                         datosgen : visitaAct.data,
//                         estado : '',
//                         fechahora_ingreso : fh,
//                         cartera : null,
//                         grb_pedido: false,
//                         resgrb_pedido: '',
//                         pedido_grabado: null,
//                         errorgrb_pedido: false,
//                         menerrorgrb_pedido: '',
//                         grb_factu:false,
//                         resgrb_factu: '',
//                         factura_grabada: null,
//                         errorgrb_factu: false,
//                         menerrorgrb_factu: '',
//                         grb_recibo: false,
//                         resgrb_recibo: '',
//                         recibo_grabado: null,
//                         errorgrb_recibo: false
//                     };
//                     this._cliente.guardarClienteFb(visitaAct.data.cod_tercer).then(res =>{
//                         console.log('Cliente '+visitaAct.cod_tercer+' guardado en dbFB 2')
//                         this._cliente.getUbicaActFb(visitaAct.data.cod_tercer, this.direc_actual.id_dir).subscribe((datosc: any) => {
//                             console.log('susc datos cliente fb ', datosc);
//                             if (datosc.length >0){

//                             }
//                         });

//                    });
//                     this.guardarVsita(visitaAct.id, visitaadd).then(res => {
//                     });
//                 }
//             });
//         })
//         .catch(() => {
//             console.log('error en carga visita activa');
//         });
//   }
  cargaVisitas(){
    // console.log('Ingreso a cargo visitas');
    return new Promise( (resolve, reject) => {
        // console.log('cargaVisitas 1');
        this.getVisitasidrutper().subscribe((datosv: any) => {
                    //   console.log('lo que llega de visitas de un id de fecha');
                    //   console.log(datosv);
                    // this._parempre.reg_log('cargaVisitas 1 ', 'datosv');
                    if(datosv.length > 0) {
                        // this._parempre.reg_log('cargaVisitas 2 ', 'datosv1');
                        let itemdato = datosv[0];
                        // console.log(itemdato);
                        // console.log(itemdato.payload);
                        // console.log(itemdato.payload.doc);
                        // console.log(itemdato.payload.doc.data());
                        // console.log(itemdato.payload.doc.id);
  
                        // console.log('cambia a cargo ruta');
                          this.cargo_ruta = true;
                          this.error_cargarruta = false;
                        //   this.visitaTodas = datosv;
                        this.visitaTodas = [];
                        this.visitaabierta = null;
                        datosv.forEach((visiData: any) => {
                            this.visitaTodas.push({
                              id: visiData.payload.doc.id,
                              cargocartera: false,
                              data: visiData.payload.doc.data()
                            });
                            //su esta abierta y no hay abierta cargarla como abierta
                            const datos = visiData.payload.doc.data();
                            console.log('recorriendo visitas para verificar abierta', datos);
                            if (datos.estado === 'A' && !this.visitaabierta){
                              console.log('Esta visita esta abierta ',datos);
                              this.visitaabierta = datos;
                            }
                            console.log('datos.llamada:',datos.llamada);
                          });   
                            //recorrer visitas si latitud y longitud estan en 0 dejar la de boccherini
                            this.visitaTodas.map(function(dato){
                              if(dato.latitud == 0){
                                  dato.latitud = 4.6529392;
                                  dato.longitud = -74.1230245;
                              }  
                          });
                            //recorrer visitas si no tiene campo llamada incluirlo como falso
                            this.visitaTodas.forEach(element => {
                              if (element.data.llamada){
                                console.log('es llamada ',element);
                              } else {
                                console.log('asigno llamada a falso ',element);
                                element.data.llamada = false;
                                console.log('element',element);
                              }                              
                            });

                          console.log('Todas las visitas con id');
                          console.log(this.visitaTodas);                     
                          this.clasificaVisitas();
                          resolve(true);
                      } else {
                        // this._parempre.reg_log('cargaVisitas 3 falso no cargo ruta ', 'no tiene visitas');
                        console.log('no hay datos en este id');
                          this.cargo_ruta = false;
                          this.error_cargarruta = true;
                          this.visitaTodas = null;
                          this.men_errorcargarruta = "No tiene visitas asignadas para esta ruta";          
                          resolve(false);
                      }
                  });        
        }); 
  }

 
  clasificaVisitas() {
      console.log('clasificando visitas 1');
      // this.visitas_cumplidas = this.visitaTodas.filter(reg => reg.data.estado === 'C' );
      this.visitas_cumplidas = this.visitaTodas.filter(reg => reg.data.estado === 'C' && !reg.data.llamada);
      this.visitas_pendientes = this.visitaTodas.filter(regP => (regP.data.estado === 'P'
       || regP.data.estado === 'A' || regP.data.estado === '') && !regP.data.llamada );
      //  this.visitas_xllamada = this.visitaTodas.filter(reg => reg.data.estado === 'L');
       this.visitas_xllamada = this.visitaTodas.filter(regL => regL.data.llamada);
    console.log('clasificando visitas 5');
    console.log(this.visitas_pendientes);
    console.log(this.visitas_cumplidas);
    console.log(this.visitas_xllamada);
  }


//retorna el link valido de la imagen de una referencia almacenada en firestore
// genlinkimgProd(linkbase:string , cod_ref: string) {
//     let llinkimg: string;
//     llinkimg = linkbase.replace('0114', cod_ref.trim());
//     return llinkimg; 
// }
 getAll() {
        return this.visitas;
    }

    //Retorna una visita especidica para ser mostrada en detalle visitas
    getItem(id) {        
        // this.cargocarteraNetsolin = false;
        for (var i = 0; i < this.visitaTodas.length; i++) {
            if (this.visitaTodas[i].id === id) {
                //cargar visita activa
                // console.log('En getItem id:' + id);
                // console.log(this.visitaTodas[i]);

                //pendiente actuvar va en otro lado el cargar visita
                // this.cargaVisitaActiva(this.visitaTodas[i]);
                return this.visitaTodas[i];
            }
        }
        return null;
    }


    remove(item) {
        this.visitas.splice(this.visitas.indexOf(item), 1);
    }

    /////
    //For Search and factura
    ////
    findAll() {
        return Promise.resolve(this.visitas);
    }

    findById(id) {
        return Promise.resolve(this.visitas[id - 1]);
    }

    findByName(searchKey: string) {
        let key: string = searchKey.toUpperCase();
        return Promise.resolve(this.visitas.filter((property: any) =>
            (property.title + ' ' + property.address + ' ' + property.city + ' ' + property.description)
            .toUpperCase().indexOf(key) > -1));
    }

    buscarProducto(searchKey: string) {
        // console.log('buscarProducto searchKey:', searchKey);
        let key: string = searchKey.toUpperCase();
        // console.log('buscarProducto key:', key);
        console.log(this.inventario);
         return Promise.resolve(this.inventario.filter((item: any) =>
            item.cod_refinv.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 
            || item.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 ));
    }


    findByCliente(searchKey: string) {
        // console.log('findByCliente searchKey:', searchKey);
        // console.log(this.visitaTodas);
         return Promise.resolve(this.visitaTodas.filter((item: any) =>
            item.data.nombre.toLowerCase().indexOf(searchKey.toLowerCase()) > -1 
            || item.data.cod_tercer.toLowerCase().indexOf(searchKey.toLowerCase()) > -1));
    }

       //Obtiene pedidos del  clente de la visita actual
       public getPedidosVisitaActual() {
        // tslint:disable-next-line:max-line-length
        console.log('getedidosVisitaActual:', `/clientes/${this.visita_activa_copvdet.cod_tercer}/pedidos`);
        console.log(this.visita_activa_copvdet.id_visita)
            return this.fbDb.collection(`/clientes/${this.visita_activa_copvdet.cod_tercer}/pedidos`, ref => 
              ref.where('id_visita', '==', this.visita_activa_copvdet.id_visita))
              .valueChanges();      
          }
       //Obtiene facturas del  clente de la visita actual
       public getFacturasVisitaActual() {
        // tslint:disable-next-line:max-line-length
        console.log('getFacturasVisitaActual:', `/clientes/${this.visita_activa_copvdet.cod_tercer}/facturas`);
            return this.fbDb.collection(`/clientes/${this.visita_activa_copvdet.cod_tercer}/facturas`, ref => 
              ref.where('id_visita', '==', this.visita_activa_copvdet.id_visita))
              .valueChanges();      
          }
       //Obtiene facturas del  clente de la visita actual
       public getRecibosVisitaActual() {
        // tslint:disable-next-line:max-line-length
        console.log('getRecibosVisitaActual:', `/clientes/${this.visita_activa_copvdet.cod_tercer}/recibos`);
            return this.fbDb.collection(`/clientes/${this.visita_activa_copvdet.cod_tercer}/recibos`, ref => 
              ref.where('id_visita', '==', this.visita_activa_copvdet.id_visita))
              .valueChanges();      
          }


    // getFactura() {
    //     return Promise.resolve(this.factura);
    // }

    // //adiciona un item a factura
    // addfactura(item) {
    //     console.log('add item factura item llega:', item);
    //     this.facturaCounter = this.facturaCounter + 1;
    //     let exist = false;

    //     if (this.factura && this.factura.length > 0) {
    //         this.factura.forEach((val, i) => {
    //             if (val.item.cod_refinv === item.cod_refinv) {
    //                 exist = true;
    //             }
    //         });
    //     }

    //     if (!exist) {
    //         this.factura.push({ id: this.facturaCounter, item: item });
    //     }
    //     console.log('Factura lista :', this.factura);
        
    //     return Promise.resolve();
    // }


    // //saca un elemento de la factura
    // borraritemfactura(item) {
    //     let index = this.factura.indexOf(item);
    //     if (index > -1) {
    //         this.factura.splice(index, 1);
    //     }
    //     return Promise.resolve();
    // }


}