import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

import { UtilitiesService } from 'app/shared/api/services/utilities.service';
import { DocumentTypeService } from 'app/shared/api/services/document-type.service';

@Component({
  selector: 'delete-all',
  templateUrl: './delete-all.component.html',
  styleUrls: ['./delete-all.component.scss']
})
export class DeleteAllComponent implements OnInit {

  @Input() data: any;
  public token: string = '';
  public userData: any = null; 
  public submitted: boolean = false;
  public documentType: any = {};

  public DATA_LANG: any = null;
  public DATA_LANG_GENERAL: any = null;
  public language: string = '';
  public nameComponent: string = 'documentTypeComponent';

  constructor(
    protected ref: NbDialogRef<DeleteAllComponent>,
    private utilitiesService: UtilitiesService,
    private documentTypeService: DocumentTypeService,
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
      this.documentType = JSON.parse(JSON.stringify(this.data));
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

  fnDeleteAllData(data) {
    this.submitted = true;
    this.documentTypeService.fnHttpSetDeleteAllDocumentType(this.token, this.documentType['_id']).subscribe(response => {
      const data = response;
      if (data['status'] == 200) {
        this.submitted = false;
        this.utilitiesService.showToast('top-right', 'success', this.DATA_LANG['msgLblDeleteAllSuccess']['text'], 'nb-alert');
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

  fnCancelDeleteAllData() {
    this.dismiss();
  }

  fnCloseModal() {
    this.dismiss();
  }

}
