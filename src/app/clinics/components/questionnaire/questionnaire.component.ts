import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { LookupService } from 'src/app/services/util/lookup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClinicService } from '../clinic.service';
import { ToastrService } from 'ngx-toastr';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/components/alert-modal/alert.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { QuestionnaireService } from 'src/app/questionnaire/questionnaire.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
  addQuestionnaireForm: FormGroup
  editFlag: boolean = false;
  viewFlag: boolean = false;
  submitFlag: boolean = false;
  questionnairelist: any;
  startDate: any;
  editId: string;
  arr: FormArray;
  data: any;
  qList: any = [];
  studyStartDate: any = '';
  studyEndDate: any = '';
  isExternal: boolean = false;
  isExternalData: any;

  modalRef2: NgbModalRef;
  @ViewChild('confrimationPopup') confrimationPopup: ElementRef;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tabservice: TabserviceService,
    private lookupservie: LookupService,
    private spinnerService: NgxSpinnerService,
    private clinicservice: ClinicService,
    private questionnaireService: QuestionnaireService,
    private toastr: ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private modalService: NgbModal,
    private alertService: AlertService
  ) { }


  async ngOnInit() {

    let external = localStorage.getItem('external');
    this.isExternalData = external == 'true' ? true : false;
    console.log("this.isExternalDataaa", this.isExternalData)

    if (this.router.url.indexOf('/edit-clinic') > -1) {
      console.log("this.router.url", this.router.url);
      let str = this.router.url;
      let id = str.split("edit-clinic/")[1].split("/")[0]
      this.editFlag = true;
      this.editId = id;


      this.spinnerService.show();
      this.clinicservice.getStudy(`/api/study/associatedQuestionnaires/${id}`, '').subscribe(res => {
        if (res.status.success === true) {
          this.data = res.response.questionnaires;
          this.spinnerService.hide();
        }
        else {
          this.toastr.error(res.errors[0].message);
          this.spinnerService.hide();
        }
      },
        err => {
          if (err.status == 500) {
            this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
            this.spinnerService.hide();
          }
          else {
            this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
            this.spinnerService.hide();
          }
        }
      );
    }

    await this.getQuestionnaire();

    this.addQuestionnaireForm = this.fb.group({
      arr: this.fb.array([this.createItem()])
    });

    let res = this.tabservice.getModelData() ? this.tabservice.getModelData() : {};
    console.log(res);
    if (res.basicDetails.start_date && res.basicDetails.end_date) {
      this.studyStartDate = moment(new Date(res.basicDetails.start_date)).format("MM-DD-YYYY");
      this.studyEndDate = moment(new Date(res.basicDetails.end_date)).format("MM-DD-YYYY");
    }

    console.log("in edit plans on add");
    res = res ? (res['questionnaire'] ? res['questionnaire'] : '') : '';
    console.log("questionnaire", res);
    let rest = res ? res.arr : '';
    if (rest) {
      console.log("restrest", rest);
      rest.forEach((ele, i) => {
        this.addQuestionnaireForm.controls.arr['controls'][i].patchValue({
          questionnaireName: {
            questionnaireName: ele.questionnaireName.questionnaireName ? ele.questionnaireName.questionnaireName : '',
            questionnaireId: ele.questionnaireName.questionnaireId ? ele.questionnaireName.questionnaireId : ''
          },
          startDate: ele.startDate ? this.customDatePipe.transform(ele.startDate, 'MM-dd-yyyy') : '',
          endDate: ele.endDate ? this.customDatePipe.transform(ele.endDate, 'MM-dd-yyyy') : '',
          disabled: ele.disabled
        });

        if (i < (rest.length - 1)) {
          console.log(i, rest.length - 1)
          this.addItem();
        }

      })

    }
  }

  ngOnChanges() {
    let external = localStorage.getItem('external');
    this.isExternalData = external == 'true' ? true : false;
    console.log("this.isExternalDataaa", this.isExternalData)
  }

  getQuestionnaire() {
    this.clinicservice.getStudy(`/api/lookup/getQuestionnaires`, '').subscribe(res => {
      if (res.status.success === true) {
        this.qList = res.response.rows;
        this.spinnerService.hide();
      }
      else {
        this.toastr.error(res.errors[0].message);
        this.spinnerService.hide();
      }
    },
      err => {
        if (err.status == 500) {
          this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
          this.spinnerService.hide();
        }
        else {
          this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
          this.spinnerService.hide();
        }
      }
    );
  }

  addItem() {
    this.arr = this.addQuestionnaireForm.get('arr') as FormArray;
    this.arr.push(this.createItem());
  }

  removeItem(i: number) {
    this.arr = this.addQuestionnaireForm.get('arr') as FormArray;
    this.arr.removeAt(i);
    console.log(this.addQuestionnaireForm.value.arr[i]);

  }

  back() {
    if (!this.editFlag) {
      this.router.navigate(['/user/clinics/add-new-clinic/mobile-app-config']);
    }
    else {
      this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/mobile-app-config`]);
    }
  }

  createItem() {
    // moment().format("MM-DD-YYYY")
    return this.fb.group({
      questionnaireName: [''],
      startDate: ['', []],
      endDate: ['', []],
      disabled: false
    })
  }
  populate($event, formId) {
    console.log("event trgrd", $event);
    this.addQuestionnaireForm.controls.arr['controls'].forEach((ele, i) => {
      if (i == formId) {
        this.addQuestionnaireForm.get('arr')['controls'][i].controls.startDate.setValidators([Validators.required]);
        this.addQuestionnaireForm.get('arr')['controls'][i].controls.endDate.setValidators([Validators.required]);
        this.addQuestionnaireForm.get('arr')['controls'][i].controls.startDate.updateValueAndValidity();
        this.addQuestionnaireForm.get('arr')['controls'][i].controls.endDate.updateValueAndValidity();
      }
    })
  }
  onClear(i) {
    this.addQuestionnaireForm.get('arr')['controls'][i].controls.startDate.setValidators([]);
    this.addQuestionnaireForm.get('arr')['controls'][i].controls.endDate.setValidators([]);
    this.addQuestionnaireForm.get('arr')['controls'][i].controls.startDate.updateValueAndValidity();
    this.addQuestionnaireForm.get('arr')['controls'][i].controls.endDate.updateValueAndValidity();
  }

  next() {
    if (!this.addQuestionnaireForm.valid) {
      this.addQuestionnaireForm.markAllAsTouched();
      return false;
    } else {
      this.submitFlag = true;
      this.tabservice.setModelData(this.addQuestionnaireForm.value, 'questionnaire');
      if (!this.editFlag) {
        this.router.navigate(['/user/clinics/add-new-clinic/prelude-config']);
      }
      else {
        this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/prelude-config`]);
      }
    }
  }

  submit() {
    if (!this.addQuestionnaireForm.valid) {
      this.addQuestionnaireForm.markAllAsTouched();
      return false;
    } else {
      this.submitFlag = true;
      this.tabservice.setModelData(this.addQuestionnaireForm.value, 'questionnaire');

      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {};
      console.log("dattaaaa", data);
      let flag = false;
      if (this.editFlag) {
        flag = (!(data.hasOwnProperty('basicDetails')) || !(data.hasOwnProperty('addPlan')) || !(data.hasOwnProperty('mobileApp')));
      } else {
        flag = (!(data.hasOwnProperty('basicDetails')) || !(data.hasOwnProperty('addPlan')) || !(data.hasOwnProperty('addNotes')) || !(data.hasOwnProperty('mobileApp')));
      }
      if (flag) {
        if (!(data.hasOwnProperty('basicDetails'))) {
          this.toastr.error("Please select all mandatory fields in basic details tab");
        }
        if (!(data.hasOwnProperty('addPlan'))) {
          this.toastr.error("Please select all mandatory fields in plans tab");
        }
        if (!this.editFlag && !(data.hasOwnProperty('addNotes'))) {
          this.toastr.error("Please select all mandatory fields in Notes tab");
        }
        if (!(data.hasOwnProperty('mobileApp'))) {
          this.toastr.error("Please select all mandatory fields in Mobile app config tab");
        }
        return;
      }



      let res = Object.assign({});

      console.log("datadatadata", data);
      let questionnaireArr = [];
      data.questionnaire.arr && data.questionnaire.arr.forEach(ele => {
        if (ele.questionnaireName != "" && ele.questionnaireName.questionnaireName != "") {
          questionnaireArr.push({
            "questionnaireId": ele.questionnaireName ? ele.questionnaireName.questionnaireId : '',
            "questionnaireName": ele.questionnaireName ? ele.questionnaireName.questionnaireName : '',
            "startDate": ele.startDate ? this.customDatePipe.transform(ele.startDate, 'yyyy-MM-dd') : '',
            "endDate": ele.endDate ? this.customDatePipe.transform(ele.endDate, 'yyyy-MM-dd') : ''
          })
        }
      });
      res['questionnairesAssociated'] = questionnaireArr;

      if (this.editFlag) {
        res["studyId"] = this.editId;
      }
      let menu = [];
      res["mobileAppConfigs"] = [];
      if (data.mobileApp && data.mobileApp.permissionMap.length > 0) {
        data.mobileApp.permissionMap.forEach(ele => {
          let menucheck = ele.menuCheck == true ? ele.menuCheck : false;
          if (menucheck == true) {
            menu.push(ele.menuName.mobileAppConfigId);
          }
        });
        res["mobileAppConfigs"] = menu;
      }

      console.log(data.basicDetails.description);
      res["studyName"] = data.basicDetails.clinicName ? data.basicDetails.clinicName : '';
      res["principleInvestigator"] = data.basicDetails.pinv ? data.basicDetails.pinv : '';
      res["startDate"] = data.basicDetails.start_date ? this.customDatePipe.transform(data.basicDetails.start_date, 'yyyy-MM-dd') : '';
      res["endDate"] = data.basicDetails.end_date ? this.customDatePipe.transform(data.basicDetails.end_date, 'yyyy-MM-dd') : '';
      res["description"] = data.basicDetails.description ? data.basicDetails.description : '';
      res["status"] = data.basicDetails.status ? data.basicDetails.status : '';
      if (data.basicDetails.isNotificationEnable || data.basicDetails.isNotificationEnable == '1') {
        res["isNotificationEnable"] = 1;
      } else {
        res["isNotificationEnable"] = 0;
      }
      if (data.basicDetails.isExternalFlag || data.basicDetails.isExternalFlag == '1') {
        res["isExternal"] = 1;
      } else {
        res["isExternal"] = 0;
      }
      res["externalLink"] = data.basicDetails.externalLink ? data.basicDetails.externalLink : '';
      if (data.addNotes) {
        res["notes"] = data.addNotes.notes ? data.addNotes.notes : '';
      }

      let planArr = [];
      data.addPlan.arr && data.addPlan.arr.forEach(ele => {
        planArr.push({
          "planId": ele.planName.planId,
          "planName": ele.planName.planName,
          "subscribedDate": this.customDatePipe.transform(ele.dateSubscribed, 'yyyy-MM-dd')
        })
      });
      console.log("planArr", planArr);

      res["plansSubscribed"] = planArr;

      console.log("ress", res);


      //    if(res["studyName"] === '') {
      // this.toastr.error("Please select study name in basic details tab");
      //    }
      //    if(res["principleInvestigator"] === '') {
      //     this.toastr.error("Please select Principle Investigator in basic details tab");
      //        }
      //        if(res["startDate"] === '') {
      //         this.toastr.error("Please select start date in basic details tab");
      //            }


      if (!this.editFlag) {
        this.spinnerService.show();
        this.clinicservice.addStudy('/api/study/', res).subscribe(res => {
          if (res.status.success === true) {
           this.toastr.success('Study added successfully!');
            if (this.isExternalData) {
              this.openPopup(this.confrimationPopup, 'xs');
            }
            this.spinnerService.hide();
            this.tabservice.clearDataModel();
            this.spinnerService.hide();
            this.tabservice.clearDataModel();
            if (this.isExternalData) {
              setTimeout(() => {
                this.modalRef2.close();
                this.router.navigate(['/user/clinics']);
              }, 10000)
            } else {
              this.router.navigate(['/user/clinics']);
            }
            // this.tabservice.setModelData('');
          }
          else {
            this.toastr.error(res.errors[0].message);
            this.spinnerService.hide();
          }
        }, err => {
          console.log(err);
          this.errorMsg(err);
        });
      }
      else {
        this.spinnerService.show();
        this.clinicservice.updateStudy('/api/study/', res).subscribe(res => {
          if (res.status.success === true) {
            //    if (res.status == 1) {
            this.toastr.success('Study updated successfully!');
            this.spinnerService.hide();
            this.tabservice.clearDataModel();
            this.router.navigate(['/user/clinics']);
            // this.tabservice.setModelData('');
          }
          else {
            this.toastr.error(res.errors[0].message);
            this.spinnerService.hide();
          }
        }, err => {
          console.log(err);
          this.errorMsg(err);
        });

      }
    }
  }

  openPopup(div, size) {
    console.log('div :::: ', div);
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

  startdateSelect() {
    console.log("sdsdsd");
    this.addQuestionnaireForm.value.arr.forEach((ele, i) => {
      if (moment(ele.endDate) < moment(ele.startDate)) {
        this.addQuestionnaireForm.controls.arr['controls'][i].patchValue({
          'endDate': ''
        })
      }
    })

  }

  canDeactivate(component, route, state, next) {
    console.log('i am navigating away');
    console.log("routein basic", next.url);
    if (next.url.indexOf('/auth/login') > -1) {
      return true;
    }
    if (next.url.indexOf('/user/clinics') > -1 && this.submitFlag) {
      return true;
    }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
      this.addQuestionnaireForm.markAllAsTouched();
      if (this.addQuestionnaireForm.valid) {
        this.submitFlag = true;
        this.tabservice.setModelData(this.addQuestionnaireForm.value, 'questionnaire');
        let data = this.tabservice.getModelData();
        console.log("datadatadata", data);
      }
      else {
        this.submitFlag = false;
      }
    }
    else {
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if (this.addQuestionnaireForm.pristine == false || Object.keys(data).length > 0) {
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

  errorMsg(err) {
    if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
    this.spinnerService.hide();
  }

}
