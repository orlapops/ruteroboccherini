import { Component, Input, OnInit } from "@angular/core";
import { ModalController, NavController, ToastController } from "@ionic/angular";
import { TranslateProvider } from "../../../providers";
import { ActivatedRoute, Router } from "@angular/router";
import { ClienteProvider } from "../../../providers/cliente.service";
import { RecibosService } from "../../../providers/recibos/recibos.service";
import { DomSanitizer } from '@angular/platform-browser';
import { ParEmpreService } from '../../../providers/par-empre.service';

@Component({
  selector: "app-modal-detallepedtemp",
  templateUrl: "./modal-detallepedtemp.page.html",
  styleUrls: ["./modal-detallepedtemp.page.scss"]
})
export class ModalDetallePedTempPage implements OnInit {
  @Input() pedido: any;
  items_pedido: Array<any> = [];
  cargoitems = false;
  total_ped = 0;

  constructor(
    public _parEmpre: ParEmpreService,
    public navCtrl: NavController,
    public toastCtrl: ToastController,
    private translate: TranslateProvider,

    public route: ActivatedRoute,
    public _cliente: ClienteProvider,
    public _DomSanitizer: DomSanitizer,
    public router: Router,
    private modalCtrl: ModalController,
  ) {
    // _recibo.inicializaRecibos();
  }
  ngOnInit() {
    console.log('pedido que llega a modal ->  ', this.pedido);
    this.cargardatosped();
  }



  cargardatosped() {
    this.items_pedido = this.pedido.items_pedido;
    this.cargoitems = true;
    this.actualizar_totalped();
  }



  actualizar_totalped() {
    this.total_ped = 0;
    for (let itemp of this.items_pedido) {
      this.total_ped += Number(itemp.item.total)
        ;
    }
  }


  public encodestring(pstring) {
    return encodeURIComponent(pstring);
  }

  confirmar_pedido() {
    this.modalCtrl.dismiss(true);
  }

  cerrarModal() {
    this.modalCtrl.dismiss(false);
  }





}
