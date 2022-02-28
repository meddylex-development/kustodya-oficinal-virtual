import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

import { UtilitiesService } from 'app/shared/api/services/utilities.service';
import { MenuService } from 'app/shared/api/services/menu.service';
import { StateService } from 'app/shared/api/services/state.service';

@Component({
  selector: 'edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {

  @Input() data: any;
  public token: string = '';
  public userData: any = null; 
  public submitted: boolean = false;
  public menu: any = {
    'name': '',
    'description': '', 
    'idState': '',
  };

  public DATA_LANG: any = null;
  public DATA_LANG_GENERAL: any = null;
  public language: string = '';
  public nameComponent: string = 'menuComponent';
  public collectionStatesList: any = [];
  public collectionStatesListOriginal: any = [];
  
  constructor(
    protected ref: NbDialogRef<EditComponent>,
    private utilitiesService: UtilitiesService,
    private menuService: MenuService,
    private stateService: StateService,
  ) { }

  ngOnInit(): void {
    this.language = (this.utilitiesService.fnGetBrowserLocales().length > 1) ? (this.utilitiesService.fnGetBrowserLocales()[1]).toUpperCase() : 'ES';
    // this.language = 'EN';
    this.utilitiesService.fnSetLocalStorage("lang", this.language);
    this.fnGetDataLanguages(this.language, this.nameComponent);
    this.fnGetDataGeneralLanguages(this.language);
    this.utilitiesService.fnAuthValidUser().then(response => {
      this.token = response['token'];
      this.userData = response['user'];
      this.menu = JSON.parse(JSON.stringify(this.data));

      this.fnGetList(this.token).then((responseState) => {
        if(responseState['body']['stateRequest']) {
          this.collectionStatesList = responseState['body']['state'];
          this.collectionStatesListOriginal = responseState['body']['state'];

          let idState = this.data['idState'];
          if (idState) {
            this.fnGetStates(this.token, idState).then((response) => {
              if (response) {
                this.menu['state'] =  response['body']['state'][0];
              }
            });
          }

        } else {
          this.collectionStatesList = []
          this.collectionStatesListOriginal = [];
        }
      });

    }).catch(error => {
      this.utilitiesService.fnSignOutUser().then(resp => {
        this.utilitiesService.fnNavigateByUrl('auth/login');
      })
    });
  }

  fnGetDataLanguages(language, nameComponent) {
    let urlCollection = 'Languages/' + language + '/' + nameComponent;
    this.utilitiesService.fnGetDataFBCallback(urlCollection, (response) => {
      this.DATA_LANG = response;
    });
  }
  
  fnGetDataGeneralLanguages(language) {
    let urlCollection = 'GeneralLanguages/' + language;
    this.utilitiesService.fnGetDataFBCallback(urlCollection, (response) => {
      this.DATA_LANG_GENERAL = response;
    });
  }

  fnGetStates(token, idState) {
    return new Promise((resolve, reject) => {
      this.stateService.fnHttpGetStateListById(token, idState).subscribe(response => {
        const data = response['body']['state'];
        if (data.length > 0) {
          resolve(response);
        } else {
          reject(false);
        }
      });
    });
  }

  fnGetList(token) {
    return new Promise((resolve, reject) => {
      this.stateService.fnHttpGetStateList(token).subscribe(response => {
        const data = response['body']['state'];
        if (data.length > 0) {
          resolve(response);
        } else {
          reject(false);
        }
      });
    });
  }

  fnSetStatusMenu(data_menu) {
    this.menu['idState'] = data_menu['_id'];
  }

  fnEditData(data) {
    this.submitted = true;
    this.menuService.fnHttpSetEditMenu(this.token, this.menu, this.menu['_id']).subscribe(response => {
      const data = response;
      if (data['status'] == 200) {
        this.submitted = false;
        this.utilitiesService.showToast('top-right', 'success', this.DATA_LANG['msgLblUpdateSuccess']['text'], 'nb-alert');
        this.dismiss(true);
      } else {
        this.submitted = false;
        this.utilitiesService.showToast('top-right', 'danger', this.DATA_LANG['msgLblDeleteError']['text'], 'nb-alert');
        this.dismiss(false);
      }
    });
  }

  dismiss(res?) {
    this.ref.close(res);
  }

  fnCancelAddData() {
    this.dismiss();
  }

  fnCloseModal() {
    this.dismiss();
  }

}
