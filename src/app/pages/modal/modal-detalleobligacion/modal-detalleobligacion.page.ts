import { Component, Input, OnInit } from "@angular/core";
import { ModalController, NavController, ToastController } from "@ionic/angular";
import { TranslateProvider } from "../../../providers";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../../providers/cliente.service";
import { RecibosService } from "../../../providers/recibos/recibos.service";
import { DomSanitizer } from '@angular/platform-browser';
import { ParEmpreService } from '../../../providers/par-empre.service';

@Component({
  selector: "app-modal-detalleobligacion",
  templateUrl: "./modal-detalleobligacion.page.html",
  styleUrls: ["./modal-detalleobligacion.page.scss"]
})
export class ModalDetalleObligacionPage implements OnInit {
  @Input() clie_cartera: any;
  @Input() num_obliga: any;
  oblshop: any;
  // num_obliga: any = this.route.snapshot.paramMap.get("id");
  valor_abono = 0;
  dcto_dchef = 0;
  dcto_dchban = 0;
  dcto_otref = 0;
  dcto_otrban = 0;
  dcto_15dias = 0;
  dcto_30dias = 0;
  otros_desc = 0;
  retencion = 0;
  paga_efectivo = false;
  fecha_base = new Date().toISOString();
  abono_total = true;
  apli_desc = false;
  apli_des15 = false;
  apli_des30 = false;
  total_t: number;
  oblenRecibo: any;
  existefechabaseoitem = false;
  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    private translate: TranslateProvider,
    
    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    private sanitizer: DomSanitizer,
    public router: Router,
    private modalCtrl: ModalController,
  ) {
    // _recibo.inicializaRecibos();
  }
  ngOnInit() {
    console.log("ngonit recibo detalle num_obliga, recibo", this.num_obliga);
    this.oblshop = this.getOblCartera(this.num_obliga);
    console.log("ngonit recibo detalle ", this.oblshop);
    //traer el registro si esta en lista de lo que se va a recibir
    // this.oblenRecibo = this._recibo.getitemRecibo(this.num_obliga);
    //verficiar si tiene derecho a descuento
    const now = new Date();
    // let fbaseotiemrec = this._recibo.getfechabaseRecibo();
    // console.log('fecha base en recibo:', fbaseotiemrec);
    // if (fbaseotiemrec) {
    //   this.fecha_base = fbaseotiemrec;
    //   this.existefechabaseoitem = true;
    // } else {
    //   this.fecha_base = new Date().toISOString();
    //   this.existefechabaseoitem = false;
    // }
    const fechaobli = new Date(this.oblshop.fecha_obl);
    const fechabase = new Date(this.fecha_base);
    const diasdifechas = this._parEmpre.diferenciaEntreDiasEnDias(fechaobli, fechabase);
    console.log('Diferencia entre fechas:', diasdifechas, this.fecha_base, fechabase, fechaobli, this.oblshop.dias_desc);
    // if (diasdifechas <= this.oblshop.dias_desc) {
    //   this.apli_desc = true;
    // }

    if (diasdifechas <= 15) {
      this.apli_des15 = true;
      this.apli_des30 = false;
    } else if (diasdifechas <= 30) {
      this.apli_des15 = false;
      this.apli_des30 = true;
    }


    console.log('ngonit oblshop,oblenrecibo:', this.oblshop, this.oblenRecibo)
    if (this.oblenRecibo) {
      console.log('encontro en recibo');
      if (this.oblenRecibo.abono === 0) {
        this.valor_abono = this.oblenRecibo.saldo;

        if (this.apli_des15) {
          this.dcto_15dias = this.oblshop.tot_15dias;
        } else if (this.apli_des30) {
          this.dcto_30dias = this.oblshop.tot_30dias;
        }

        this.otros_desc = 0;
        this.retencion = 0;
      } else {
        this.paga_efectivo = this.oblenRecibo.paga_efectivo;
        this.valor_abono = this.oblenRecibo.abono;

        if (this.apli_des15) {
          this.dcto_15dias = this.oblshop.tot_15dias;
        } else if (this.apli_des30) {
          this.dcto_30dias = this.oblshop.tot_30dias;
        }
        this.otros_desc = this.oblenRecibo.otros_desc;
        this.retencion = this.oblenRecibo.retencion;
      }
      this.total_t = this.oblenRecibo.saldo;
    } else {
      this.valor_abono = this.oblshop.saldo;
      if (this.apli_desc) {

      }

      if (this.apli_des15) {
        this.dcto_15dias = this.oblshop.tot_15dias;
      } else if (this.apli_des30) {
        this.dcto_30dias = this.oblshop.tot_30dias;
      }
      console.log('this.dcto_15dias', this.dcto_15dias);
      console.log('this.dcto_30dias', this.dcto_30dias);
      this.otros_desc = 0;
      this.retencion = 0;
      // this.total_t = this.oblshop.saldo;
    }
  }

  checkout(oblshopID: number, obligID: number) {
    this.navCtrl.navigateForward(`recibo-checkout/${oblshopID}/${obligID}`);
  }

  async total() {
    this.total_t = 0;
    const fechaobli = new Date(this.oblshop.fecha_obl);
    if (this.paga_efectivo) {
      console.log('paga en efectivo');
      //si paga efectivo la fecha base es hoy
      this.fecha_base = new Date().toISOString();
    } else {
      console.log('total fecha base', this.fecha_base);
      //verificar que ha hoy no se den mas de 15 días de diferencia
      const fechahoy = new Date();
      const fechabase1 = new Date(this.fecha_base);
      console.log('fechahoy', fechabase1, fechahoy);
      console.log('fechaobli', fechaobli);
      const diasdifechas1 = this._parEmpre.diferenciaEntreDiasEnDias(fechahoy, fechabase1);
      console.log('abs diasdifechas:', Math.abs(diasdifechas1));
      if (Math.abs(diasdifechas1) > 15) {
        console.error('Fecha maximo 15 dias de diferencia con fecha actual');
        const toast = await this.toastCtrl.create({
          showCloseButton: true,
          message: "La fecha base es de maxímo 15 días con fecha actual.",
          duration: 2000,
          color: "danger",
          position: "bottom"
        });
        toast.present();
        this.fecha_base = new Date().toISOString();
      }
    }
    const fechabase = new Date(this.fecha_base);
    console.log('fecha_base', this.fecha_base, fechabase);
    console.log('fechaobli', fechaobli);
    const diasdifechas = this._parEmpre.diferenciaEntreDiasEnDias(fechaobli, fechabase);
    console.log('Diferencia entre fechas:', diasdifechas, this.fecha_base, fechabase, fechaobli, this.oblshop.dias_desc);

    if (diasdifechas <= 15) {
      this.apli_des15 = true;
      this.apli_des30 = false;
    } else if (diasdifechas <= 30) {
      this.apli_des15 = false;
      this.apli_des30 = true;
    }


    // if (diasdifechas <= this.oblshop.dias_desc) {
    //   this.apli_desc = true;
    // } else {
    // }
    if (this.otros_desc > 1000) {
      console.error('Descuento maximo 1000');
      const toast = await this.toastCtrl.create({
        showCloseButton: true,
        message: "El descuento maxímo es 1000 pesos.",
        color: "danger",
        duration: 2000,
        position: "bottom"
      });

      toast.present();
      this.otros_desc = 0;
    }

    console.log(this.apli_desc, this.abono_total, this.paga_efectivo);
    if (this.abono_total) {
      console.log('total paga  saldo total', this.oblshop.saldo)
      this.valor_abono = this.oblshop.saldo;

      if (this.paga_efectivo) {
        console.log('paga en efectivo');
        this.dcto_15dias = 0;
        this.dcto_30dias = 0;
        // this.apli_des15 
      } else {
        console.log('total abona pga en bancos');
        if (this.apli_des15) {
          this.dcto_30dias = 0;
          this.dcto_15dias = this.oblshop.tot_15dias;
        } else if (this.apli_des30) {
          this.dcto_15dias = 0;
          this.dcto_30dias = this.oblshop.tot_30dias;
        }
        console.log(this.dcto_15dias, this.dcto_30dias);

      }

    } else {
      console.log('abono no descuento');
  
      this.dcto_15dias = 0;
      this.dcto_30dias = 0;
    }

    this.total_t = this.valor_abono;
    return this.total_t;
  }

  async addrecibo(item) {

    console.log('addrecibo item', item);
    // this._recibo.addrecibocaja(item, this.fecha_base, this.paga_efectivo, this.valor_abono, this.dcto_15dias,
    //   this.dcto_30dias,
    //   this.otros_desc, this.retencion).then(async property => {
    //     const toast = await this.toastCtrl.create({
    //       showCloseButton: true,
    //       message: "Item adicionado a el recibo.",
    //       duration: 2000,
    //       position: "bottom"
    //     });

    //     toast.present();
    //   });
  }
  async deleterecibo(item) {
    // this._recibo.borraritemrecibo(item)
    //   .then(async property => {
    //     const toast = await this.toastCtrl.create({
    //       showCloseButton: true,
    //       message: "Item Eliminado a el recibo.",
    //       duration: 2000,
    //       position: "bottom"
    //     });
    //     toast.present();
    //   });
  }
  cleanURL(oldURL: string) {
    return this.sanitizer.bypassSecurityTrustUrl(oldURL);
  }

  getOblCartera(id) {
    console.log("getOblCartera id:", id, this.clie_cartera.cartera);
    for (let i = 0; i < this.clie_cartera.cartera.length; i++) {
      if (this.clie_cartera.cartera[i].num_obliga === id) {
        console.log("concontro");
        return this.clie_cartera.cartera;
      }
    }
    console.log("No concontro");
    return null;
  }

  
  cerrarModal(){
    this.modalCtrl.dismiss();
  }



}
