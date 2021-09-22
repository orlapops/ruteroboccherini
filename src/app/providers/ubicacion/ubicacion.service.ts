import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
// import { Subscription } from 'rxjs/Subscription';
import { ParEmpreService } from '../par-empre.service';
import { Subscription } from 'rxjs';
@Injectable()
export class UbicacionProvider {

  usuario: AngularFirestoreDocument<any>;
  usuarioAP: AngularFirestoreDocument<any>;
  private watch: Subscription;
  lastUpdateTime = null;
  minFrequency = 60 * 5 * 1000 ;
  ultlatitud = 4.625749001284896;
  ultlongitud = -74.078441;

  constructor( private afDB: AngularFirestore,
               private geolocation: Geolocation,
               public _parEmpre: ParEmpreService) {
    
    // this.usuario = afDB.doc(`/usuarios/${ _usuarioProv.clave }`);
  }

  //apunta a firebase dato general personal usuario para cambio de ubicacion
  inicializarUsuario(){
    console.log('inicializarUsuario this._parEmpre.usuario.cod_usuar:',this._parEmpre.usuario.cod_usuar);
    return new Promise((resolve) => {
    this.usuario = this.afDB.collection(`/personal/`).doc(this._parEmpre.usuario.cod_usuar);
      if (this._parEmpre.usuario.venpersona != undefined && this._parEmpre.usuario.venpersona.length > 0) { //verifica asesorpersona
        this.usuarioAP = this.afDB.collection(`/asesorpersona/`).doc(this._parEmpre.usuario.venpersona[0].cod_venper);
      }
    console.log('suscrita ubicacion a usuario ',this._parEmpre.usuario.cod_usuar, this.usuario);
    resolve(true);
    });
  }
  public getUbicaUsuarFb(){
    return this.afDB.collection(`/personal/`).doc(this._parEmpre.usuario.cod_usuar).valueChanges();
}

  iniciarGeoLocalizacion() {
 console.log('inicia geoloca');
    this.geolocation.getCurrentPosition().then((resp) => {
        console.log('en geoloca  resp');
        console.log(resp.coords);
        // resp.coords.latitude
      // resp.coords.longitude

      // this.usuario.update({
      //   latitud: resp.coords.latitude,
      //   longitud: resp.coords.longitude
      // });
      //Actualizar o crear 
      this.usuario.set({
        cod_person: this._parEmpre.usuario.cod_usuar,
        nombre: this._parEmpre.usuario.nombre,
        latitud: resp.coords.latitude,
        longitud: resp.coords.longitude
      });

      this.watch = this.geolocation.watchPosition()
              .subscribe((data) => {
                  // data can be a set of coordinates, or an error (if an error occurred).
                  // data.coords.latitude
                  // data.coords.longitude
                  console.log('watch ubica');
                  // console.log(data);
                  this.usuario.update({
                    latitud: data.coords.latitude,
                    longitud: data.coords.longitude
                  });
                if (this._parEmpre.usuario.venpersona != undefined && this._parEmpre.usuario.venpersona.length > 0) { //Ultima posicion registrada Asesor persona
                  console.log('Entro a act usuarioAP ->', this._parEmpre.usuario.venpersona[0].cod_venper);
                  this.usuarioAP.update({
                    latitud: data.coords.latitude,
                    longitud: data.coords.longitude
                  });
                }
                  this.ultlatitud = data.coords.latitude;
                  this.ultlongitud = data.coords.longitude;
                  //Actualizar recorrido si han pasado 5 minutos
                  const now = new Date();
                  // console.log('watch ubica 2');
                  // console.log("Actualizar recorrido inicial", data.coords);                      
                  this.actualizarRecorrido(data, now);

                  if (this.lastUpdateTime == null) {
                    this.lastUpdateTime = now;
                    // console.log("Actualizar recorrido inicial", data.coords);                      
                    // this.actualizarRecorrido(data, now);
                  }
                // if (this.lastUpdateTime && now.getTime() - this.lastUpdateTime.getTime() > this.minFrequency){
                //     this.actualizarRecorrido(data, now);
                //   }

          console.log( this.usuario );

      });



     }).catch((error) => {
       console.log('Error getting location', error);
     });

  }

  actualizarRecorrido(data, fechat){
    // console.log("Actualizar recorrido");                      
                  //extraemos el día mes y año 
                  const dia = fechat.getDate();
                  // const mes = parseInt(now.getMonth()) + 1;
                  const mes = fechat.getMonth() + 1;
                  const ano = fechat.getFullYear();
                  const hora = fechat.getHours();
                  const minutos = fechat.getMinutes();
                  const segundos = fechat.getSeconds();
                  const horaformt = hora.toString().padStart(2,'0')
                  const minutosformt = minutos.toString().padStart(2,'0')
                  const segundosformt = segundos.toString().padStart(2,'0')
                  
                  //completar 0 izq para ordenar cadena
                  const id = horaformt + ':' + minutosformt+':' + segundosformt;
                  // const id = fechat.toLocaleString();

    const lruta = `/personal/${this._parEmpre.usuario.cod_usuar}/recorrido/${ano}/meses/${mes}/dias/${dia}/historial`;
                  // /personal/1014236804/recorrido/2019/meses/2/dias/22/historial/h1
                  // console.log("Actualizar recorrido", lruta);
    this.lastUpdateTime = fechat;
    const lfechahora = fechat.toLocaleString();
    const lif = lfechahora.replace('/' , '_');
    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/personal/${this._parEmpre.usuario.cod_usuar}/recorrido`).doc(ano.toString())
        .set({ano: ano.toString()});
    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/personal/${this._parEmpre.usuario.cod_usuar}/recorrido/${ano}/meses`).doc(mes.toString())
        .set({mes: mes.toString()});
    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/personal/${this._parEmpre.usuario.cod_usuar}/recorrido/${ano}/meses/${mes}/dias`).doc(dia.toString())
        .set({dia: dia.toString()});
    const usuariorecorrido = this.afDB.collection(lruta).doc(id);
    usuariorecorrido.set({
      latitud: data.coords.latitude,
      longitud: data.coords.longitude,
      hora: id,
      fecha: fechat,
      fechahora: lfechahora
    });
    //Evalua si esta asociado a un asesor principal (asesorpersona)
    if(this._parEmpre.usuario.venpersona != undefined && this._parEmpre.usuario.venpersona.length>0){
      this.actualizarRecorridoAsesorPersona(data, fechat);
    }
  }


  //ADICION ASESOR PERSONA

  actualizarRecorridoAsesorPersona(data, fechat) {
    // console.log("Actualizar recorrido");                      
    //extraemos el día mes y año 
    const dia = fechat.getDate();
    // const mes = parseInt(now.getMonth()) + 1;
    const mes = fechat.getMonth() + 1;
    const ano = fechat.getFullYear();
    const hora = fechat.getHours();
    const minutos = fechat.getMinutes();
    const segundos = fechat.getSeconds();
    const horaformt = hora.toString().padStart(2, '0')
    const minutosformt = minutos.toString().padStart(2, '0')
    const segundosformt = segundos.toString().padStart(2, '0')

    const id = horaformt + ':' + minutosformt + ':' + segundosformt;


    const lruta = `/asesorpersona/${this._parEmpre.usuario.venpersona[0].cod_venper}/recorrido/${ano}/meses/${mes}/dias/${dia}/historial`;

    this.lastUpdateTime = fechat;
    const lfechahora = fechat.toLocaleString();

    //asegurarse que este creada la descripcion de asesorpersona
    this.afDB.collection(`/asesorpersona/`).doc(this._parEmpre.usuario.venpersona[0].cod_venper)
      .set({ nombre: this._parEmpre.usuario.venpersona[0].nombre, cod_venper: this._parEmpre.usuario.venpersona[0].cod_venper, venpersona: this._parEmpre.usuario.venpersona,latitud: data.coords.latitude,
        longitud: data.coords.longitude });

    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/asesorpersona/${this._parEmpre.usuario.venpersona[0].cod_venper}/recorrido`).doc(ano.toString())
      .set({ ano: ano.toString() });
    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/asesorpersona/${this._parEmpre.usuario.venpersona[0].cod_venper}/recorrido/${ano}/meses`).doc(mes.toString())
      .set({ mes: mes.toString() });
    //asegurarse que este creado el año, mes y dia del recorrido
    this.afDB.collection(`/asesorpersona/${this._parEmpre.usuario.venpersona[0].cod_venper}/recorrido/${ano}/meses/${mes}/dias`).doc(dia.toString())
      .set({ dia: dia.toString() });
    const usuariorecorrido = this.afDB.collection(lruta).doc(id);
    usuariorecorrido.set({
      latitud: data.coords.latitude,
      longitud: data.coords.longitude,
      hora: id,
      fecha: fechat,
      fechahora: lfechahora
    });
  }
  detenerUbicacion() {

    try {
      this.watch.unsubscribe();
    } catch(e){
      console.log(JSON.stringify(e));
    }


  }

}
