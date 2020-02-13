import { Component, OnInit } from '@angular/core';
import { NavController, ActionSheetController, ToastController, ModalController, Platform, LoadingController, AlertController } from '@ionic/angular';
import { TranslateProvider } from '../../providers';
import { VisitasProvider } from '../../providers/visitas/visitas.service';
import { ParEmpreService } from '../../providers/par-empre.service';
import { ClienteProvider } from '../../providers/cliente.service';
import { DomSanitizer } from '@angular/platform-browser';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ConsignacionesService } from '../../providers/consignaciones/consignaciones.service';
import { ImagePage } from '../modal/image/image.page';
import { ModalActConsigPage } from '../modal/modal-actconsig/modal-actconsig.page';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-resumcaja',
  templateUrl: './resumcaja.page.html',
  styleUrls: ['./resumcaja.page.scss'],
})
export class ResumCajaPage implements OnInit {
  fecha_base = new Date().toISOString();
  cierrecajaresum: Array<any> = [];
  cierrecajaefe: Array<any> = [];
  cierrecajachd: Array<any> = [];
  cierrecajapbcs: Array<any> = [];
  cierrecajapbtr: Array<any> = [];
  cargo_cierrecajaresum = false;
  totefectivo = 0;
  totalcheques = 0;
  totalconsig = 0;
  totaltrasfer = 0;
  consignacionesresum: Array<any> = [];
  cargo_consignacionesresum = false;
  totalconsigerealizadas = 0;
  recibosresum: Array<any> = [];
  cargo_recibosresum = false;
/////

  mostrandoresulado = false;
  vistapagos: String = 'verresum';
  
  constructor(
    public _parEmpre: ParEmpreService,
    private db: AngularFirestore,
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public btCtrl: BluetoothSerial,
    private translate: TranslateProvider,
    public _visitas: VisitasProvider,
    public _cliente: ClienteProvider,
    public _consigna: ConsignacionesService,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public loadingCtrl: LoadingController,
    public _DomSanitizer: DomSanitizer,
    private imagePicker: ImagePicker,
    private camera: Camera,
    private file: File,
    private webview: WebView
  ) {
  }

  ngOnInit() {
    this.gen_resumen();
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



  gen_resumen(){
    const fechabase = new Date(this.fecha_base);
    this.cargo_cierrecajaresum = false;
    this.cargo_consignacionesresum = false;
    this.cargo_recibosresum = false;
    console.log('fecha_base',this.fecha_base,fechabase);
    const ano = fechabase.getFullYear();
    const mes = fechabase.getMonth() + 1;
    const dia = fechabase.getDate();
    const resumano = ano.toString();
    const resummes = mes.toString();
    const resumdia = dia.toString();    
    // this.getcierrecajaresumen("1014236804",resumano,resummes,resumdia)
    this.getcierrecajaresumen(this._parEmpre.usuario.cod_usuar,resumano,resummes,resumdia)
      .subscribe((datoshis: any) => {
      console.log('act cierre caja reco x ano', datoshis);
      this.cierrecajaresum = datoshis;
      this.clasificaCierre();
    });
    this.getrecibosresumen(this._parEmpre.usuario.cod_usuar,resumano,resummes,resumdia)
    .subscribe((datoshis: any) => {
      console.log('act recibos reco x ano', datoshis);
      this.recibosresum = datoshis;
      this.cargo_recibosresum = true;
    });
    // this.getconsignaresumen("1014236804",resumano,resummes,resumdia)
    this.getconsignaresumen(this._parEmpre.usuario.cod_usuar,resumano,resummes,resumdia)
      .subscribe((datoshis: any) => {
      console.log('act consignaciones', datoshis);
      this.consignacionesresum = datoshis;
      this.cargo_consignacionesresum = true;
      this.totalconsigerealizadas=0;
      this.consignacionesresum.forEach(item=>{ this.totalconsigerealizadas += item.valor});
    });    
  }
  clienterecibo(pcod_docume,pnum_docume){
    const lrecibof =this.recibosresum.filter(
      (item: any) =>
      item.cod_docume.toLowerCase().indexOf(pcod_docume.toLowerCase()) > -1 &&
      item.num_docume.toLowerCase().indexOf(pnum_docume.toLowerCase()) > -1
    )
    // console.log('de busqueda clienterecibo ',pcod_docume,pnum_docume,lrecibof);
    // console.log('Retorna:',lrecibof[0].detalle[0].cliente);
    if (lrecibof.length>0){
      return lrecibof[0].detalle[0].cliente;
    } else {
      // console.log('en busqueda clienterecibo no esta todavia detalle');
      return '';
    }
    
  }

  //Trae cierrecaja resumen peronal
  public getcierrecajaresumen(
    ppersona: string,
    ano: string,
    mes: string,
    dia: string
  ) {
    return this.db
      .collection(
        `/personal/${ppersona}/resumdiario/${ano}/meses/${mes}/dias/${dia}/cierrecaja`
      ).valueChanges();
  }
      //Trae recibos resumen peronal
      public getrecibosresumen(ppersona: string,ano: string,mes: string,dia: string) 
      {
        return this.db
          .collection(
            `/personal/${ppersona}/resumdiario/${ano}/meses/${mes}/dias/${dia}/recibos`
          ).valueChanges();
        }
  //Trae un  recibo del resumen 
      public getunreciboresumen(ppersona: string,ano: string,mes: string,dia: string,doc:string) 
      {
        return this.db
          .collection(
            `/personal/${ppersona}/resumdiario/${ano}/meses/${mes}/dias/${dia}/recibos`
          ).doc(doc).valueChanges();
        }
        
  clasificaCierre() {
        this.cierrecajaefe = this.cierrecajaresum.filter(reg => reg.formpago === 'EFE');
        this.cierrecajachd = this.cierrecajaresum.filter(reg => reg.formpago === 'CHD');
        this.cierrecajapbcs = this.cierrecajaresum.filter(reg => reg.formpago === 'PBCS');
        this.cierrecajapbtr = this.cierrecajaresum.filter(reg => reg.formpago === 'PBTR');
        this.totefectivo = 0;
        this.totalcheques = 0;
        this.totalconsig = 0;
        this.totaltrasfer = 0;

        this.cierrecajaefe.forEach(item=>{ this.totefectivo += item.valor});
        this.cierrecajachd.forEach(item=>{ this.totalcheques += item.valor});
        this.cierrecajapbcs.forEach(item=>{ this.totalconsig += item.valor});
        this.cierrecajapbtr.forEach(item=>{ this.totaltrasfer += item.valor});
        console.log('this.cierrecajaefe',this.cierrecajaefe);
        console.log('this.cierrecajachd',this.cierrecajachd);
        console.log('this.cierrecajapbcs',this.cierrecajapbcs);
        console.log('this.cierrecajapbtr',this.cierrecajapbtr);
        this.cargo_cierrecajaresum = true;
  }

  ///Trae consignaciones
   public getconsignaresumen(ppersona: string,ano: string,mes: string,dia: string) 
   {
    return this.db
      .collection(
        `/personal/${ppersona}/resumdiario/${ano}/meses/${mes}/dias/${dia}/consignaciones`
      ).valueChanges();
   }



}

