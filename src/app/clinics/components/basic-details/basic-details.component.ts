import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidationService } from 'projects/validation-message/src/lib/validation.service';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { Router, ActivatedRoute, NavigationEnd, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import * as moment from 'moment';
import { ClinicService } from '../clinic.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { AlertService } from 'src/app/components/alert-modal/alert.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';


@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.scss']
})
export class BasicDetailsComponent implements OnInit {
  displayURLField: boolean = false;
  addClinicForm: FormGroup;
  submitFlag: boolean = false;
  editFlag: boolean = false;
  editId: any;
  statusArr: { name: string; id: string; }[];
  mobileArr: any;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private tabservice: TabserviceService,
    private route: ActivatedRoute,
    private clinicService: ClinicService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private alertService: AlertService
  ) {

    this.addClinicForm = this.fb.group({
      'clinicName': ['', [Validators.required, ValidationService.whiteSpaceValidator]],
      'start_date': ['', [Validators.required]],
      'end_date': ['', [Validators.required]],
      'description': [''],
      'pinv': [''],
      'status': [1, [Validators.required]],
      'disable': false,
      'isNotificationEnable': [1],
      'isExternalFlag': [1],
      'externalDisable': false,
      'externalLink': ['']
    })
  }

  async ngOnInit() {

    this.checkIsExternal();
    if (this.router.url.indexOf('/edit-clinic') > -1) {
      console.log("this.router.url", this.router.url);
      let str = this.router.url;
      let id = str.split("edit-clinic/")[1].split("/")[0];

      this.editFlag = true;
      this.editId = id;

      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if (Object.keys(data).length == 0) {
        await this.getMenuItems();
        this.spinner.show();
        this.clinicService.getStudy(`/api/study/${id}`, '').subscribe(res => {
          console.log("study", res);
          this.spinner.show();
          if (res.status.success == true) {
            let studyDetails = res.response.rows;

            let editData1 = Object.assign({});
            editData1["clinicName"] = studyDetails.studyName ? studyDetails.studyName : '';
            editData1["start_date"] = studyDetails.startDate ? this.customDatePipe.transform(studyDetails.startDate, 'MM-dd-yyyy') : '';
            editData1["end_date"] = studyDetails.endDate ? this.customDatePipe.transform(studyDetails.endDate, 'MM-dd-yyyy') : '';
            editData1["pinv"] = studyDetails.principleInvestigator ? studyDetails.principleInvestigator : '';
            editData1["status"] = studyDetails.status;
            editData1["description"] = studyDetails.description ? studyDetails.description : '';
            editData1["externalLink"] = studyDetails.preludeUrl;
            editData1["isExternalFlag"] = studyDetails.isExternal;
            if (studyDetails.status == 0) {
              editData1["disable"] = true;
              editData1["isNotificationEnable"] = 0;
              this.addClinicForm.controls['isNotificationEnable'].disable();
            }
            else {
              editData1["disable"] = false;
              editData1["isNotificationEnable"] = studyDetails.isNotificationEnable;
              this.addClinicForm.controls['isNotificationEnable'].enable();
            }
            console.log(editData1["isExternalFlag"]);
            if (studyDetails.isExternal == 1) {
              editData1["externalDisable"] = true;
            }
            else {
              editData1["externalDisable"] = false;
            }

            this.tabservice.setModelData(editData1, 'basicDetails');

            let editData2 = Object.assign({});
            let editData2Arr = [];
            studyDetails.plansSubscribed.forEach(ele => {
              editData2Arr.push(
                {
                  disabled: true,
                  planName: { "planName": ele.planName ? ele.planName : '', "planId": ele.planId ? ele.planId : '' },
                  dateSubscribed: ele.subscribedDate ? this.customDatePipe.transform(ele.subscribedDate, 'MM-dd-yyyy') : ''
                }
              );
            })
            editData2["arr"] = editData2Arr;
            this.tabservice.setModelData(editData2, 'addPlan');


            let editData4 = Object.assign({});
            let editData4Arr = [];

            this.mobileArr.forEach((rele, i) => {
              studyDetails.mobileAppConfigs.forEach((ele, j) => {
                if (rele.mobileAppConfigId == ele) {
                  editData4Arr.push({
                    'menuName': { mobileAppConfigName: rele.mobileAppConfigName, mobileAppConfigId: ele },
                    'menuCheck': true
                  });
                }
              });
            });
            editData4["permissionMap"] = editData4Arr;
            this.tabservice.setModelData(editData4, 'mobileApp');

            let editData5 = Object.assign({});
            let editData5Arr = [];
            studyDetails.questionnairesAssociated.forEach(ele => {
              editData5Arr.push(
                {
                  questionnaireName: {
                    questionnaireName: ele.questionnaireName ? ele.questionnaireName : '',
                    questionnaireId: ele.questionnaireId ? ele.questionnaireId : '',
                  },
                  startDate: ele.startDate ? ele.startDate : '',
                  endDate: ele.endDate ? ele.endDate : '',
                  disabled: true
                }
              );
            })
            editData5["arr"] = editData5Arr;
            this.tabservice.setModelData(editData5, 'questionnaire');

            //prelude data
            let editData6 = Object.assign({});
            let editData6Arr = [];
            studyDetails.preludeAssociated && studyDetails.preludeAssociated.forEach(ele => {
              editData6Arr.push(
                {
                  // questionnaireName: {
                  //   questionnaireName: ele.questionnaireName ? ele.questionnaireName : '',
                  //   questionnaireId: ele.questionnaireId ? ele.questionnaireId : '',
                  // },
                  formName: ele.formName ? ele.formName : '',
                  category: ele.category ? ele.category : '',
                  preludeGroup: ele.preludeGroup ? ele.preludeGroup : '',
                  fieldName: ele.fieldName ? ele.fieldName : '',
                  extractDefId: ele.extractDefId ? ele.extractDefId : '',
                  disabled: true
                }
              );
            })
            editData6["arr"] = editData6Arr;
            editData6["preludeMandatory"] = studyDetails.preludeMandatory;
            this.tabservice.setModelData(editData6, 'preludeConfig');

          }
          else {
            this.toastr.error(res.errors[0].message);
          }
          this.spinner.hide();
        }, err => {

          console.log(err);
          if (err.status == 500) {
            this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
          }
          else {
            this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
          }
          this.spinner.hide();
        }
        );
      }
    }

  }

  checkIsExternal() {
    if (this.addClinicForm.value.isExternalFlag == true || this.addClinicForm.value.isExternalFlag == 1) {
      console.log("ddfdfdf")
      this.clinicService.setModelData({ external: true });
      localStorage.setItem('external', 'true');
      let evt = document.createEvent("Event");
      evt.initEvent("isAmCliniClicked", true, true);
      window.dispatchEvent(evt);

      this.displayURLField = true;
      this.addClinicForm.controls['start_date'].setValidators([]);
      this.addClinicForm.controls['end_date'].setValidators([]);
      this.addClinicForm.controls['start_date'].updateValueAndValidity();
      this.addClinicForm.controls['end_date'].updateValueAndValidity();
      this.addClinicForm.controls['externalLink'].enable();
      this.addClinicForm.controls['externalLink'].setValidators([Validators.required]);
      this.addClinicForm.controls['externalLink'].updateValueAndValidity();
    } else {
      this.clinicService.setModelData({ external: false });
      localStorage.setItem('external', 'false');
      let evt = document.createEvent("Event");
      evt.initEvent("isAmCliniClicked", true, true);
      window.dispatchEvent(evt);

      this.displayURLField = false;
      this.addClinicForm.controls['start_date'].setValidators([Validators.required]);
      this.addClinicForm.controls['end_date'].setValidators([Validators.required]);
      this.addClinicForm.controls['start_date'].updateValueAndValidity();
      this.addClinicForm.controls['end_date'].updateValueAndValidity();
      this.addClinicForm.controls['externalLink'].disable();
    }
  }

  private async getMenuItems() {
    this.spinner.show();
    let res: any = await (
      this.clinicService.getMobileConData(`/api/lookup/getMobileAppConfigs`, '').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res.status.success === true) {
      this.mobileArr = res.response.mobileAppConfigs;
      this.spinner.hide();
    }
  }

  startdateSelect() {
    console.log("sdsdsd");
    if (moment(this.addClinicForm.value.end_date) < moment(this.addClinicForm.value.start_date)) {
      this.addClinicForm.patchValue({
        'end_date': ''
      })
    }
  }

  statusChange() {
    console.log(this.addClinicForm.value.status);
    if (this.addClinicForm.value.status == '0') {
      this.addClinicForm.controls['isNotificationEnable'].disable();
      if (this.addClinicForm.controls['isNotificationEnable'].value == '1') {
        this.addClinicForm.patchValue({
          'isNotificationEnable': 0
        });
      }
    } else {
      this.addClinicForm.controls['isNotificationEnable'].enable();
    }
  }

  next() {

    this.addClinicForm.markAllAsTouched();
    if (this.addClinicForm.valid) {
      this.submitFlag = true;
      this.tabservice.setModelData(this.addClinicForm.value, 'basicDetails');
      let data = this.tabservice.getModelData();
      console.log("datadatadata", data);
      if (!this.editFlag) {
        this.router.navigate(['/user/clinics/add-new-clinic/add-plans']);
      }
      else {
        this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/add-plans`]);
      }
    }
    else {
      this.submitFlag = false;
    }
  }

  backToList() {
    this.router.navigate(['/user/clinics']);
  }

  ngAfterViewInit() {

    this.spinner.show();
    this.tabservice.dataModel$.subscribe(res => {
      console.log(res);
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {};
      console.log("dattaaaa", data);
      if (!(data.hasOwnProperty('basicDetails'))) {
        this.addClinicForm.patchValue({
          'status': 1
        })
      }
      else {
        res = res ? (res['basicDetails'] ? res['basicDetails'] : '') : '';
        this.addClinicForm.patchValue({
          'clinicName': res.clinicName ? res.clinicName : '',
          'start_date': res.start_date ? this.customDatePipe.transform(res.start_date, 'MM-dd-yyyy') : '',
          'end_date': res.end_date ? this.customDatePipe.transform(res.end_date, 'MM-dd-yyyy') : '',
          'pinv': res.pinv ? res.pinv : '',
          'status': res.status,
          'description': res.description,
          'isNotificationEnable': res.isNotificationEnable,
          'externalLink': res.externalLink,
          'isExternalFlag': res.isExternalFlag == 1 ? true : false,
          'disable': res.disable,
          'externalDisable': res.externalDisable
        })
      }
      this.checkIsExternal();
    });
    this.spinner.hide();
  }
  canDeactivate(component, route, state, next) {
    console.log('i am navigating away');
    console.log("routein basic", next.url);
    if (next.url.indexOf('/auth/login') > -1) {
      return true;
    }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
      this.addClinicForm.markAllAsTouched();
      if (this.addClinicForm.valid) {
        console.log("this.submitFlag", this.submitFlag);
        this.submitFlag = true;
        this.tabservice.setModelData(this.addClinicForm.value, 'basicDetails');
        let data = this.tabservice.getModelData();
        console.log("datadatadata", data);
      }
      else {
        this.submitFlag = false;
      }
    }
    else {
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      console.log("Data", data, data.length)
      if (this.addClinicForm.pristine == false || Object.keys(data).length > 0) {
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

}
