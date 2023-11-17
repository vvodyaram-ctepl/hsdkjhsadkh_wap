import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicService } from '../clinic.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { RolesService } from 'src/app/roles/components/roles.service';
import { forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/components/alert-modal/alert.service';

@Component({
  selector: 'app-mobile-app-config',
  templateUrl: './mobile-app-config.component.html',
  styleUrls: ['./mobile-app-config.component.scss']
})
export class MobileAppConfigComponent implements OnInit {
  @ViewChild('archiveContent') archiveContent: ElementRef;
  modalRef2: NgbModalRef;
  submitFlag: boolean = false;
  mobileAppForm: FormGroup;
  mobileData: any;
  permssionArr: any;
  permissionMap: FormArray;
  public data: any = {
    menus: [],
    menuActions: [],
    checkArray: []
  }
  editFlag: boolean;
  editId: any;
  viewFlag: boolean;
  formIndex: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private clinicservice: ClinicService,
    private toastr: ToastrService,
    private spinnerService: NgxSpinnerService,
    private roleservice: RolesService,
    private tabservice: TabserviceService,
    public customDatepipe: CustomDateFormatPipe,
    private modalService: NgbModal,
    private alertService: AlertService
  ) {
    this.mobileAppForm = this.fb.group({
      permissionMap: this.fb.array([])
    })
  }
  private async getMenuItems() {
    this.spinnerService.show();
    let res: any = await (
      this.clinicservice.getMobileConData(`/api/lookup/getMobileAppConfigs`, '').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res.status.success === true) {
      this.data.menus = res.response.mobileAppConfigs;
      this.spinnerService.hide();
    }
  }
  private async getMenuActions() {
    let res: any = await (
      this.roleservice.getRoleDetails(`/api/lookup/getMenuActions`, '').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res.status.success === true) {
      this.data.menuActions = res.response.menuActions;
    }
  }
  async ngOnInit() {
    await this.getMenuItems();
    // await this.getMenuActions();
    await this.addItem();
    this.spinnerService.hide();
    if (this.router.url.indexOf('/edit-clinic') > -1 || this.router.url.indexOf('/view-clinic') > -1) {
      this.spinnerService.show();
      console.log("this.router.url", this.router.url);
      let str = this.router.url;
      if (this.router.url.indexOf('/edit-clinic') > -1) {
        let id = str.split("edit-clinic/")[1].split("/")[0];
        this.editFlag = true;
        this.editId = id;
      }
      if (this.router.url.indexOf('/view-clinic') > -1) {
        let id = str.split("view-clinic/")[1].split("/")[0];
        this.viewFlag = true;
        this.editId = id;

        this.mobileAppForm.controls.permissionMap['controls'].forEach((ele, index) => {
          this.mobileAppForm.controls.permissionMap['controls'][index].controls['menuCheck'].disable();
        })

        this.clinicservice.getStudy(`/api/study/${id}`, '').subscribe(res => {
          console.log("res", res);
          if (res.status.success == true) {
            let study = res.response.rows;

            console.log("study.mobileAppConfigs", study.mobileAppConfigs)
            this.mobileAppForm.value.permissionMap.forEach((rele, i) => {
              study.mobileAppConfigs.forEach((ele, j) => {
                if (rele.menuName.mobileAppConfigId == ele) {
                  this.mobileAppForm.controls.permissionMap['controls'][i].patchValue({
                    'menuName': { mobileAppConfigName: rele.menuName.mobileAppConfigName, mobileAppConfigId: ele },
                    'menuCheck': true
                  });

                }
              });
            });

          }
          this.spinnerService.hide();
        },
          err => {
            this.spinnerService.hide();
            this.toastr.error('Something went wrong. Please try after sometime or contact administrator.');
          }
        );


      }
      this.spinnerService.hide();

    }
    console.log("this.mobileAppForm", this.mobileAppForm.value);

    //data model observable
    // let res = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
    this.tabservice.dataModel$.subscribe(res => {
      console.log(res);
      res = res ? (res['mobileApp'] ? res['mobileApp'] : '') : '';
      let rest = res ? res.permissionMap : '';
      if (rest) {
        rest.forEach((ele, i) => {
          this.mobileAppForm.controls.permissionMap['controls'].forEach((res, j) => {
            if (ele.menuCheck == true && ele.menuName.mobileAppConfigId == res.value.menuName.mobileAppConfigId) {
              console.log("enter inside")
              console.log("ele.menuName.mobileAppConfigId", ele.menuName.mobileAppConfigId)
              console.log("res.menuName.mobileAppConfigId", res.value.menuName.mobileAppConfigId)
              this.mobileAppForm.controls.permissionMap['controls'][j].patchValue({
                // 'menuName': { mobileAppConfigName: ele.menuName.mobileAppConfigName, mobileAppConfigId: ele.menuName.mobileAppConfigId },
                'menuCheck': true

              });
            }
          })

        })

      }
    })



  }
  createItem() {
    return this.fb.group({
      menuName: [''],
      menuActionName: [''],
      menuCheck: false
    })
  }

  addItem() {
    console.log("this.mobileData", this.data.menus);
    this.spinnerService.show();
    this.data.menus.forEach((ele, i) => {
      this.permissionMap = this.mobileAppForm.get('permissionMap') as FormArray;
      this.permissionMap.push(this.createItem());
      this.mobileAppForm.controls.permissionMap['controls'][i].patchValue({
        'menuName': { mobileAppConfigName: ele.mobileAppConfigName, mobileAppConfigId: ele.mobileAppConfigId }
      });
      // this.rolesForm.controls.permissionMap['controls'][i].patchValue({
      //   'menuCheck': false
      //         });
      this.mobileAppForm.controls.permissionMap['controls'][i].patchValue({
        'menuActionName': ""
      });
    });
    this.spinnerService.hide();

  }

  onCheckboxChange(e, i) {
    console.log(e)
    this.mobileAppForm.controls.permissionMap['controls'].forEach((ele, index) => {
      if (ele.value.menuCheck == true) {
        this.mobileAppForm.controls.permissionMap['controls'][index].controls['menuActionName'].enable();
      }
      else {
        this.mobileAppForm.controls.permissionMap['controls'][index].controls['menuActionName'].disable();
      }
    })
    if (e.target.checked == false) {
      console.log(i);
      if (this.editFlag) {
        this.openPopup(this.archiveContent, 'xs', i);
      }
    }

  }
  enableSelection() {
    this.mobileAppForm.controls.permissionMap['controls'][this.formIndex].patchValue({
      'menuCheck': true
    });
  }

  back() {
    if (this.viewFlag) {
      this.router.navigate([`/user/clinics/view-clinic/${this.editId}/view-notes`]);
    }
    else {
      if (this.editFlag) {
        this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/view-notes`]);
      }
      else {
        this.router.navigate(['/user/clinics/add-new-clinic/add-notes']);
      }
    }
  }

  isEmptyObject(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        return true;
      }
    }
    return false;
  }


  next() {
    console.log("formm", this.mobileAppForm);
    if (!this.viewFlag) {
      this.mobileAppForm.markAllAsTouched();

      if (this.mobileAppForm.valid) {
        let formArr = this.mobileAppForm.value.permissionMap;
        console.log(formArr);
        let result = formArr.filter(item => item.menuCheck === true);
        console.log("resu", result);

        if (result.length == 0) {
          this.toastr.error('Please select at least one menu', 'Error!');
          return false;
        }
        else {

          this.submitFlag = true;
          this.tabservice.setModelData(this.mobileAppForm.value, 'mobileApp');
          let data = this.tabservice.getModelData();
          console.log("mobileAppForm", this.mobileAppForm.value);
          if (!this.editFlag) {
            this.router.navigate(['/user/clinics/add-new-clinic/questionnaire']);
          }
          else {
            this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/questionnaire`]);
          }

          // let menu = Object.assign({});
          let menu = [];
          if (this.mobileAppForm.value.permissionMap) {
            this.mobileAppForm.value.permissionMap.forEach(ele => {
              //comented for premsion array
              // let menuObjVal = ele.menuActionName ? ele.menuActionName : '';
              // if (menuObjVal != '') {
              //   menu[ele.menuName.mobileAppConfigId] = ele.menuActionName;
              // }
              let menucheck = ele.menuCheck == true ? ele.menuCheck : false;
              if (menucheck == true) {
                menu.push(ele.menuName.mobileAppConfigId);
              }
            })
            //this.tabservice.setModelData(menu, 'mobileApp');
          }
        }
        if (!this.editFlag) {
          this.router.navigate(['/user/clinics/add-new-clinic/questionnaire']);
        }
        else {
          this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/questionnaire`]);
        }
      }
      else {
        this.submitFlag = false;
      }
    }
    else {
      this.router.navigate([`/user/clinics/view-clinic/${this.editId}/view-questionnaire`]);
    }

  }

  errorMsg(err) {
    if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
    this.spinnerService.hide();
  }

  canDeactivate(component, route, state, next) {
    let formArr = this.mobileAppForm.value.permissionMap;
    console.log(formArr);
    //filter array
    let result = formArr.filter(item => item.menuCheck === true);
    console.log("resu", result);
    console.log("routein basic", next.url);
    if (next.url.indexOf('/auth/login') > -1) {
      return true;
    }
    if (next.url.indexOf('/user/clinics') > -1 && this.submitFlag) {
      return true;
    }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
      if (result.length == 0) {
        this.toastr.error('Please select at least one menu', 'Error!');
      }
      else {
        this.submitFlag = true;
        this.tabservice.setModelData(this.mobileAppForm.value, 'mobileApp');
        let data = this.tabservice.getModelData();
        console.log("datadatadata", data);
      }
    }
    else {
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if (result.length > 0 || Object.keys(data).length > 0) {
        return this.alertService.confirm();
      }
      else {
        return true
      }
    }
    if (!this.submitFlag) {
      return false;
    }
    else {
      return true;
    }
  }

  openPopup(div, size, formIndex) {
    console.log('div :::: ', div);
    console.log('formIndex :::: ', formIndex);
    this.formIndex = formIndex;
    this.modalRef2 = this.modalService.open(div, {
      size: size,
      windowClass: 'smallModal',
      backdrop: 'static',
      keyboard: false
    });
    this.modalRef2.result.then((result) => {
      console.log(result);
    }, () => {
    });
  }

}
