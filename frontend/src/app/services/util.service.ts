import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  private previousUrl: BehaviorSubject<string> = new BehaviorSubject<string>("");
  public previousUrl$: Observable<string> = this.previousUrl.asObservable();

  constructor() { }

  setPreviousUrl(previousUrl: string) {
    this.previousUrl.next(previousUrl);
  }


  disconnectSwal() {
    return Swal.fire({
      icon: 'warning',
      title: 'Déconnexion',
      text: 'Votre connexion a expiré, vous allez être déconnecté.',
      timer: 5000,
      showConfirmButton: true,
      confirmButtonText: 'OK'
    })
  }


  showNotif(msg: string, typeNotif: 'success' | 'danger') {
    $.notify({
      icon: 'ti-gift',
      message: msg
    }, {
        type: typeNotif,
        autoHideDelay: 2000,
        showAnimation: 'fadeIn',
        hideAnimation: 'fadeOut',
        hideDuration: 700,
        placement: {
            from: 'top',
            align: 'center'
        }
    });
  }

}
