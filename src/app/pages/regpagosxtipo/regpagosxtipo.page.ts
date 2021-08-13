import { Component, OnInit } from "@angular/core";
import { NavController, ToastController } from "@ionic/angular";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../providers/cliente.service";
import { VisitasProvider } from "../../providers/visitas/visitas.service";
import { RecibosService } from "../../providers/recibos/recibos.service";
import { ParEmpreService } from "../../providers/par-empre.service";

import { ActividadesService } from '../../providers/actividades/actividades.service';

import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { File, DirectoryEntry, FileEntry } from "@ionic-native/file/ngx";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: "app-regpagosxtiporeg",
  templateUrl: "./regpagosxtipo.page.html",
  styleUrls: ["./regpagosxtipo.page.scss"]
})
export class RegPagosxtipoPage implements OnInit {
  lfecha = new Date().toISOString();
  regpago = {
    tipopago: "EFE",
    banco: "",
    cta_banco: "",
    fecha: this.lfecha,
    referencia: "",
    nota: "",
    valor: 0,
    linkimg_pago:""
  };
  idregpago: any = this.route.snapshot.paramMap.get("id");
  tipocrud = "A";
  actividadAct: any;
  bancos: any;
  cargobancos = false;
  existefechabaseoitem = false;
  registro: any;

  dataImagen:any;
  imagenPreview: string;
  cargoImagen = false;

  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    public _recibo: RecibosService,
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _visitas: VisitasProvider,
    public router: Router,
    //Adicion de fotos
    private imagePicker: ImagePicker,
    public _actividad: ActividadesService,
    private webview: WebView,
    private file: File,
    public _DomSanitizer: DomSanitizer
  ) {
    //cargar bancos de firebase
    this._parEmpre.getbancosFB().subscribe((datos: any) => {
      console.log("Cargo en bancos  de firebase datos", datos);
      this.bancos = datos;
      this.cargobancos = true;
    });

    console.log("repagosxtiporeg idregpago:", this.idregpago);
    if (this.idregpago === "0") {
      this.tipocrud = "A";
    } else {
      this.tipocrud = "E";
      this._recibo
        .getitemformpago(this.idregpago)
        .then(resultado => {
          console.log("repagosxtiporeg resultado :", resultado);
          this.regpago = resultado;
        })
        .catch(error => alert(JSON.stringify(error)));
      console.log("repagosxtiporeg editar regtraido:", this.regpago);
      //traer fecha base Ag 12 21
      let fbaseotiemrec = this._recibo.getfechabaseRecibo();
      console.log('fecha base para consignacion:',fbaseotiemrec);
      if (fbaseotiemrec){
        this.regpago.fecha = fbaseotiemrec;
        this.existefechabaseoitem = true;
      } else{
        this.regpago.fecha = new Date().toISOString();
        this.existefechabaseoitem = false;
      }
  
      // this._actividad.getIdRegActividad(this.idregpago).subscribe((datos:any) =>{
      //     console.log('Editar datos actividad ', datos);
      //     if (datos){
      //     this.cod_tipoact = datos.tipo_act;
      //     this.nom_tipoact = datos.nom_tipoact;
      //     this.notaAct = datos.notas;
      //     this.registro = datos.registro;
      //     }
      // });
    }
    //cargar pagosxtiporeg de firebase
    // this._actividad.gettiposactFB().subscribe((datos: any) =>{
    //   console.log('Cargo en regpagosxtiporeg los tipo de act de firebase datos', datos);
    //   this.tipos_act = datos;
    // });
    console.log("_visitas ", this._visitas);
    console.log("_cliente ", this._cliente);
  }

  ngOnInit() {}
  changeFormapago(e) {
    console.log("changeFormapago e: ", e);
    console.log("e.detail.value", e.detail.value);
    //  console.log('tipoact:', this.cod_tipoact);
    //  this.nom_tipoact = e.detail.text;
      //traer fecha base Ag 12 21
      let fbaseotiemrec = this._recibo.getfechabaseRecibo();
      console.log('fecha base para consignacion:',fbaseotiemrec);
      if (fbaseotiemrec){
        this.regpago.fecha = fbaseotiemrec;
        this.existefechabaseoitem = true;
      } else{
        this.regpago.fecha = new Date().toISOString();
        this.existefechabaseoitem = false;
      }
  }

  async addFormapago(item) {
    //validar campos minimos
    let validado = false;
    console.log("validando ", this.regpago);
    if (this.regpago.tipopago === "PBCS" || this.regpago.tipopago === "PBTR") {
      console.log("validando 1");
      if (this.regpago.cta_banco === "") {
        console.log("No lleno el ctabanco");
      } else {
        console.log("lleno la ctabanco");
      }

      if (this.regpago.cta_banco === "" || this.regpago.referencia === "") {
        console.log("validando 3");
        validado = false;
      } else {
        console.log("validando 3");
        validado = true;
      }
    } else {
      if (
        this.regpago.tipopago === "CHD" &&
        (this.regpago.banco === "" || this.regpago.referencia === "")
      ) {
        console.log("validando 4");
        validado = false;
      } else {
        console.log("validando 5");
        validado = true;
      }
    }
    if (validado && this.regpago.valor > 0) {
      console.log("validando 5.1");
      validado = true;
    } else {
      validado = false;
    }
    if (validado) {
      //subir imagen de forma de pago  13 Agosto 2021
      this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa_copvdet.cod_tercer,this._recibo.visitaID, this.dataImagen).then(() => {
          console.log('Respuesta de upload img -> ', this._actividad.linktempimg);
          console.log("validando 6", this.regpago);
          this.regpago.linkimg_pago = this._actividad.linktempimg;
          this._recibo.addFormapago(this.regpago).then(async property => {
            console.log('adiciono ', this._recibo.formpago);
            this.existefechabaseoitem = true;
            const toast = await this.toastCtrl.create({
              showCloseButton: true,
              message: "Item adicionado a forma de pago  del recibo.",
              color: "success",
              duration: 2000,
              position: "bottom"
            });
            toast.present();
            // this.regpago.valor = 0;
            // this.regpago.referencia = "";
          });
          this.file.resolveLocalFilesystemUrl(this.dataImagen).then((fe: FileEntry) => {
            fe.remove(function () { console.log("se elimino la foto") }, function () { console.log("error al eliminar") });
          });
      });
    } else {
      console.log("validando 7");
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message:
          "Error debe completar campos. Verifique banco, referencia, valor",
        duration: 2000,
        color: "danger",
        position: "top"
      });
      toast.present();
    }
  }

  async  modificarFormapago() {
    const fh = new Date();
    //validar campos minimos
    let validado = false;
    console.log("validando ", this.regpago);
    if (this.regpago.tipopago === "PBCS" || this.regpago.tipopago === "PBTR") {
      console.log("validando 1");
      if (this.regpago.cta_banco === "") {
        console.log("No lleno el ctabanco");
      } else {
        console.log("lleno la ctabanco");
      }

      if (this.regpago.cta_banco === "" || this.regpago.referencia === "") {
        console.log("validando 3");
        validado = false;
      } else {
        console.log("validando 3");
        validado = true;
      }
    } else {
      if (
        this.regpago.tipopago === "CHD" &&
        (this.regpago.banco === "" || this.regpago.referencia === "")
      ) {
        console.log("validando 4");
        validado = false;
      } else {
        console.log("validando 5");
        validado = true;
      }
    }
    if (validado && this.regpago.valor > 0) {
      console.log("validando 5.1");
      validado = true;
    } else {
      validado = false;
    }
    if (validado) {
      this._recibo
        .modificarFormapago(this.idregpago, this.regpago)
        .then(async result => {
          if (result) {
            const toast = await this.toastCtrl.create({
              showCloseButton: true,
              message: "Modificada forma de pago  del recibo.",
              color: "success",
              duration: 2000,
              position: "bottom"
            });
            toast.present();
          }
        });
    } else {
      console.log("validando 7");
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message:
          "Error debe completar campos. Verifique banco, referencia, valor",
          color: "danger",
          duration: 2000,
        position: "top"
      });
      toast.present();
    }
  }
  eliminarFormapago() {
    this._recibo
      .borraritemformpago(this.idregpago)
      .then(async result => {
        this.existefechabaseoitem = false;
        if (result) {
          const toast = await this.toastCtrl.create({
            showCloseButton: true,
            message: "Se elimino forma de pago  del recibo.",
            duration: 2000,
            position: "bottom"
          });
          toast.present();
          this.tipocrud = "A";
          this.regpago.valor = 0;
        }
      });
  }
  changeBanco(e) {
    console.log("changeBanco e: ", e);
    console.log("e.detail.value", e.detail.value);
  }





  
  //CAPTURA DE IMAGEN PARA REGISTRO DE TIPOS DE PAGO
  seleccionarFoto() {
    const options = {
      // quality: 100,
      // outputType: 0
      width: 200,
      //height: 200,
      // quality of resized image, defaults to 100
      quality: 25,      
      outputType: 0
    };
      console.log('seleccionarFoto 1 options:',options);
      this.imagePicker.getPictures(options).then((image) => {
        console.log('seleccionarFoto 2 image:',image);
      for (var i = 0; i < image.length; i++) {
        console.log('seleccionarFoto 3 i image[i]:',i,image[i]);
        this.imagenPreview = this.webview.convertFileSrc(image[i]);
        this.dataImagen = image[i];
        this.cargoImagen = true;
        // this._actividad.actualizafotosVisitafirebase(this._visitas.visita_activa_copvdet.cod_tercer,
        //   this._recibo.visitaID, image[i]).then(() => {
        //     this.file.resolveLocalFilesystemUrl(image[i]).then((fe: FileEntry) => {
        //       fe.remove(function () { console.log("se elimino la foto") }, function () { console.log("error al eliminar") });
        //     });
        //   });
      }
    }, (err) => { console.log("error cargando imagenes", JSON.stringify(err)); });
  }

}
