import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';
import { NavController, AlertController} from '@ionic/angular';
import { MessageService } from '../providers/message/message.service';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo de la push',
    //   body: 'Este es el body de la push',
    //   date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();



  constructor( private oneSignal: OneSignal,
              public navCtrl: NavController,
              public alertCtrl: AlertController,
              public messageService: MessageService,
              private storage: Storage ) {

    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  async configuracionInicial() {

    this.oneSignal.startInit(environment.oneSignal.appId, environment.oneSignal.pojNumber);

    this.oneSignal.inFocusDisplaying( this.oneSignal.OSInFocusDisplayOption.Notification );

    this.oneSignal.handleNotificationReceived().subscribe( ( noti ) => {
    // do something when notification is received
    console.log('Notificación recibida', noti );
    this.notificacionRecibida( noti );
    });

    this.oneSignal.handleNotificationOpened().subscribe( async( noti ) => {
      // do something when a notification is opened
      console.log('Notificación abierta', noti );
      await this.notificacionRecibida( noti.notification );
    });


    // Obtener ID del suscriptor
    this.oneSignal.getIds().then( info => {
      // || 'bb4c4088-3427-44ff-8380-570aa6c1ce1a'
      this.userId = info.userId;
      //actualizar en firebase el dato para enviar mensaje 
      console.log(this.userId);
    });

    this.oneSignal.endInit();

  }

  async getUserIdOneSignal() {
    console.log('Cargando userId');
    // Obtener ID del suscriptor
    const info = await this.oneSignal.getIds();
    this.userId = info.userId;
    console.log('a act Onesignalid userId this.userId:',this.userId);
    await this.messageService.act_onesignalid(this.userId);
    return info.userId;
  }

  async notificacionRecibida( noti: OSNotification ) {
console.log('notificacionRecibida this.mensajes 1: ',this.mensajes);
    await this.cargarMensajes();
    console.log('notificacionRecibida this.mensajes 2: ',this.mensajes);

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID );
    console.log('notificacionRecibida this.mensajes 3: ',this.mensajes);

    if ( existePush ) {
      console.log('notificacionRecibida this.mensajes 4: ',this.mensajes);
      return;
    }
    console.log('notificacionRecibida this.mensajes 5: ',this.mensajes);

    this.mensajes.unshift( payload );
    console.log('notificacionRecibida this.mensajes 6: ',this.mensajes);
    this.pushListener.emit( payload );
    console.log('notificacionRecibida this.mensajes 7 a getid: ',this.mensajes);
    await this.getUserIdOneSignal();
    console.log('notificacionRecibida this.mensajes 7.1 a getid: ',this.mensajes);
    await this.guardarMensajes();
    console.log('notificacionRecibida this.mensajes 8: ',this.mensajes);
    const alert2 = await this.alertCtrl.create({
      message: payload.body,
      subHeader: payload.title,
      buttons: ['Enterado']
    });
     await alert2.present();
    
    // this.navCtrl.navigateForward("messages");

  }

  guardarMensajes() {
    console.log('guardarMensajes this.mensajes 1: ',this.mensajes);
    this.storage.set('mensajes', this.mensajes );
    console.log('guardarMensajes this.mensajes 2: ',this.mensajes);
  }

  async cargarMensajes() {

    console.log('cargarMensajes this.mensajes 1: ',this.mensajes);
    this.mensajes =  await this.storage.get('mensajes') || [];
    console.log('cargarMensajes this.mensajes 2: ',this.mensajes);

    return this.mensajes;

  }

  async borrarMensajes() {
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }

}
