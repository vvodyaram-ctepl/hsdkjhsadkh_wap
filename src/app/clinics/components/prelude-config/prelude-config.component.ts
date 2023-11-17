import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AlertService } from 'src/app/components/alert-modal/alert.service';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { ClinicService } from '../clinic.service';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-prelude-config',
  templateUrl: './prelude-config.component.html',
  styleUrls: ['./prelude-config.component.scss']
})
export class PreludeConfigComponent implements OnInit {
  editFlag: boolean;
  editId: string;
  submitFlag: boolean = false;
  disableFields: boolean = false;
  preludeForm: FormGroup;
  preludeList: any = [];
  formGroupArr: any = [];
  categoryGroupArr: any = [];
  extractGroupArr: any = [];
  fieldGroupArr: any = [];
  preludeConfigData: any = [];
  arr: FormArray;
  formListGroup: any = [];
  categoryList: any = [];
  preludeGroupList: any = [];
  modalRef2: NgbModalRef;
  @ViewChild('studySubmitPopup') studySubmitPopup: ElementRef;
  mandatoryFieldNames = ["External Patient ID", "Pet Name", "Pet Parent Last Name", "Pet Parent Email", "Baseline Start Date", "Baseline End Date", "Treatment Start Date", "Treatment End Date", "Study Group"];
  studyName: any;
  formFiledList: any[];
  isExternalData: boolean;
  constructor(
    private router: Router,
    private tabservice: TabserviceService,
    private spinnerService: NgxSpinnerService,
    private clinicservice: ClinicService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    public customDatePipe: CustomDateFormatPipe,
    private alertService: AlertService
  ) { }

  async ngOnInit() {
    let external = localStorage.getItem('external');
    this.isExternalData = external == 'true' ? true : false;
    
    if (this.router.url.indexOf('/edit-clinic') > -1) {
      let str = this.router.url;
      let id = str.split("edit-clinic/")[1].split("/")[0]
      this.editFlag = true;
      this.editId = id;
    }

    this.preludeForm = this.fb.group({
      arr: this.fb.array([this.createItem()]),
      preludeMandatory: this.fb.array([])
    });
    let res = this.tabservice.getModelData() ? this.tabservice.getModelData() : {};
    /*     this.preludeForm.patchValue({
          'ownerEmail': res.ownerEmail ? res.ownerEmail : '',
          'ownerLastName': res.ownerLastName ? res.ownerLastName : '',
          'patientId': res.patientId ? res.patientId : '',
          'petName': res.petName ? res.petName : '',
        }) */
    let sdName = res.basicDetails ?.clinicName;
    this.studyName = res.basicDetails ?.clinicName;

    if(res.basicDetails.isExternalFlag == true && res.basicDetails.externalDisable == true && res.basicDetails.status == 0){
        this.disableFields = true;
    }

    await this.getPreludeData();
    await this.getPeludeConfigData(sdName);


    res = res ? (res['preludeConfig'] ? res['preludeConfig'] : '') : '';
    let preludeMandatoryData = res ? res.preludeMandatory : '';
    let rest = res ? res.arr : '';
    if (rest) {
      rest.forEach((ele, i) => {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'formName': ele.formName.name ? ele.formName : (ele.formName ? { name: ele.formName } : ''),
          'category': ele.category.name ? ele.category : (ele.category ? { name: ele.category } : ''),
          'preludeGroup': ele.preludeGroup.name ? ele.preludeGroup : (ele.preludeGroup ? { name: ele.preludeGroup } : ''),
          'fieldName': ele.fieldName.name ? ele.fieldName : (ele.fieldName ? { name: ele.fieldName } : ''),
          'extractDefId': ele.extractDefId ? ele.extractDefId : '',
          'disabled': ele.disabled
        });

        if (i < (rest.length - 1)) {
          console.log(i, rest.length - 1)
          this.addItem();
        }

      })

    }
    this.addMulitpleItem(preludeMandatoryData);

  }

  getPeludeConfigData(studyname: any) {
    this.clinicservice.getStudy(`/api/study/getPreludeDataByStudy/${studyname}`, '').subscribe(res => {
      this.preludeConfigData = res.response.preludeDataByStudyList;
    });
  }

  getPreludeData() {
    this.spinner.show();
    this.clinicservice.getStudy('/api/study/getPreludeDataList/' + this.editId, '').subscribe(res => {
      this.spinner.hide();
      this.preludeList = res.response.preludeList;
      this.preludeList.forEach(element => {
        element["active"] = true
      });;
      console.log(this.preludeList);
      let formGroupArrList = [];
      let categoryGroupArrList = [];
      let extractGroupArrList = [];
      let fieldGroupArrList = [];

      this.preludeList.forEach(ele => {
        formGroupArrList.push(ele.form);
        formGroupArrList = this.removeDuplicates(formGroupArrList);
        /* 
                categoryGroupArrList.push(ele.category);
                categoryGroupArrList = this.removeDuplicates(categoryGroupArrList);
        
                extractGroupArrList.push(ele.extractGroup);
                extractGroupArrList = this.removeDuplicates(extractGroupArrList);
        
                fieldGroupArrList.push(ele.field);
                fieldGroupArrList = this.removeDuplicates(fieldGroupArrList); */

      });

      formGroupArrList.forEach(element => {
        this.formGroupArr.push({ 'name': element });
      });

      categoryGroupArrList.forEach(element => {
        this.categoryGroupArr.push({ 'name': element });
      });

      extractGroupArrList.forEach(element => {
        this.extractGroupArr.push({ 'name': element });
      });

      fieldGroupArrList.forEach(element => {
        this.fieldGroupArr.push({ 'name': element });
      });

      this.preludeForm.controls.arr['controls'].forEach((elem, index) => {
        this.preludeForm.controls.arr['controls'][index].patchValue({
          'formList': this.formGroupArr,
          'categoryList': this.categoryGroupArr,
          'preludeGroupList': this.extractGroupArr,
          'fieldNameList': this.fieldGroupArr,
        });
      });
      this.preludeForm.controls.preludeMandatory['controls'].forEach((elem, index) => {
        this.preludeForm.controls.preludeMandatory['controls'][index].patchValue({
          'formList': this.formGroupArr,
          'categoryList': this.categoryGroupArr,
          'preludeGroupList': this.extractGroupArr,
          'fieldNameList': this.fieldGroupArr,
        });
      });
    },
      err => {
        // this.spinner.hide();
        if (err.status == 500) {
          this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
          this.spinnerService.hide();
        }
        else {
          this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
          this.spinnerService.hide();
        }
      });
  }

  removeDuplicates(newArr) {
    newArr = newArr.filter(function (item, index, inputArray) {
      return inputArray.indexOf(item) == index;
    });
    return newArr
  }

  createItem() {
    return this.fb.group({
      'label': [''],
      'formName': [''],
      'category': [''],
      'preludeGroup': [''],
      'fieldName': [''],
      'formList': [''],
      'categoryList': [''],
      'preludeGroupList': [''],
      'fieldNameList': [''],
      'extractDefId': [''],
      'disabled': [false]
    })
  }


  formNameSelected($event, i, val) {
    // filter the category based on the selected form name
    let tempList = [];
    let tempCategoryList = [];
    let categoriesList = [];
    if ($event) {
      this.preludeList.length > 0 && this.preludeList.forEach(element => {
        if (element.active) {
          if (element.form && element.form == $event.name) {
            tempList.push(element);
            if (element.category) {
              tempCategoryList.push(element.category);
            }
          }
        }
      })
      tempCategoryList = this.removeDuplicates(tempCategoryList);

      tempCategoryList.forEach(element => {
        categoriesList.push({ 'name': element });
      });
      if (val === 1) {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          'categoryList': categoriesList
        });
      } else {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'categoryList': categoriesList
        });
      }

    }
  }

  onClearformName(i) {

  }

  clearForm(i, sec, val) {
    let formName, category, preludeGroup;

    if (sec === 2) {
      console.log("this.preludeForm.value if", this.preludeForm.value.arr);
      formName = this.preludeForm.controls.arr['controls'][i].controls.formName.value;
      category = this.preludeForm.controls.arr['controls'][i].controls.category.value;
      preludeGroup = this.preludeForm.controls.arr['controls'][i].controls.preludeGroup.value;
      if (val === 1 && formName === "") {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          category: '',
          preludeGroup: '',
          fieldName: ''
        })
        this.filterPreludeList(i, sec);
      }
      if (val === 2 && category === "") {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          preludeGroup: '',
          fieldName: '',
          fieldNameList: ''
        })
        this.filterPreludeList(i, sec);
      }
      if (val === 3 && preludeGroup === "") {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          fieldName: ''
        })
        this.filterPreludeList(i, sec);
      }
      console.log("this.preludeForm.value if", this.preludeForm.value.arr);
    } else {
      console.log("this.preludeForm.value else ", this.preludeForm.value.preludeMandatory[i]);
      formName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.formName.value;
      category = this.preludeForm.controls.preludeMandatory['controls'][i].controls.category.value;
      preludeGroup = this.preludeForm.controls.preludeMandatory['controls'][i].controls.preludeGroup.value;
      if (val === 1 && formName === "") {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          category: '',
          preludeGroup: '',
          fieldName: '',
          preludeGroupList: '',
          fieldNameList: ''
        })
        this.filterPreludeList(i, sec);
      }
      if (val === 2 && category === "") {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          preludeGroup: '',
          fieldName: '',
          fieldNameList: ''
        })
        this.filterPreludeList(i, sec);
      }
      if (val === 3 && preludeGroup === "") {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          fieldName: ''
        })
        this.filterPreludeList(i, sec);
      }
      console.log("this.preludeForm.value else ", this.preludeForm.value.preludeMandatory[i]);
    }

  }
  formCategorySelected($event, i, val) {
    let formName;
    if (val === 1) {
      formName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.formName.value;
    } else {
      formName = this.preludeForm.controls.arr['controls'][i].controls.formName.value;
    }
    console.log($event);
    console.log(i);
    // filter the preludeGroup based on the selected category
    let tempList = [];
    let tempGroup = [];
    let tempGroupList = [];
    if ($event && formName) {
      this.preludeList.length > 0 && this.preludeList.forEach(element => {
        if (element.active) {
          if ((element.form && element.form == formName.name) && (element.category && element.category == $event.name)) {
            tempList.push(element);
            //required value
            if (element.extractGroup) {
              tempGroup.push(element.extractGroup);
            }
          }
        }
      })
      tempGroup = this.removeDuplicates(tempGroup);

      tempGroup.forEach(element => {
        tempGroupList.push({ 'name': element });
      });
      if (val === 1) {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          'preludeGroupList': tempGroupList
        });
      } else {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'preludeGroupList': tempGroupList
        });
      }
    }

  }

  formExtractGroupSelected($event, i, val) {
    let formName, category;
    if (val === 1) {
      formName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.formName.value;
      category = this.preludeForm.controls.preludeMandatory['controls'][i].controls.category.value;
    } else {
      formName = this.preludeForm.controls.arr['controls'][i].controls.formName.value;
      category = this.preludeForm.controls.arr['controls'][i].controls.category.value;
    }
    console.log($event);
    console.log(i);
    // filter the  'field' based on the selected preludeGroup
    let tempList = [];
    let tempGroup = [];
    let tempGroupList = [];
    console.log(formName, category);
    if ($event && formName && category) {
      console.log($event, formName, category, this.preludeList);
      this.preludeList.length > 0 && this.preludeList.forEach(element => {
        if (element.active) {

          if ((element.form && element.form == formName.name) && (element.category && element.category == category.name) && (element.extractGroup && element.extractGroup == $event.name)) {
            tempList.push(element);
            //required value
            if (element.field) {
              tempGroup.push(element);
            }
          }
        }
      })
      tempGroup = this.removeDuplicates(tempGroup);

      tempGroup.forEach(element => {
        tempGroupList.push({ 'name': element.field, id: element.extractDefId });
      });
      this.formFiledList = tempGroupList;

      if (val === 1) {
        console.log('tempGroupList', tempGroupList);
        this.mandatoryFieldNames.forEach((mele, j) => {
          if (i === j) {
            this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
              'fieldNameList': tempGroupList
            });
          }
        })


      } else {
        console.log('tempGroupList', tempGroupList);
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'fieldNameList': tempGroupList
        });
      }
    }
    this.mandatoryFieldNames.forEach((mele, j) => {
      if (i === j) {

      } else {
        const passval = this.preludeForm.controls.preludeMandatory['controls'][j].controls.preludeGroup.value;
        this.forMandExtractGroupSelected(passval, j, val);
      }
    })
  }

  forMandExtractGroupSelected($event, i, val) {
    console.log("forMandExtractGroupSelected", i);
    let formName, category;
    formName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.formName.value;
    category = this.preludeForm.controls.preludeMandatory['controls'][i].controls.category.value;
    console.log($event);
    console.log(i);
    // filter the  'field' based on the selected preludeGroup
    let tempList = [];
    let tempGroup = [];
    let tempGroupList = [];
    console.log(formName, category);
    if ($event && formName && category) {
      console.log($event, formName, category, this.preludeList);
      this.preludeList.length > 0 && this.preludeList.forEach(element => {
        if (element.active) {

          if ((element.form && element.form == formName.name) && (element.category && element.category == category.name) && (element.extractGroup && element.extractGroup == $event.name)) {
            tempList.push(element);
            //required value
            if (element.field) {
              tempGroup.push(element);
            }
          }
        }
      })
      tempGroup = this.removeDuplicates(tempGroup);

      tempGroup.forEach(element => {
        tempGroupList.push({ 'name': element.field, id: element.extractDefId });
      });
      this.formFiledList = tempGroupList;

      console.log('tempGroupList', tempGroupList);
      this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
        'fieldNameList': tempGroupList
      })
    }
  }
  filterPreludeList(i, val) {
    let fieldName;
    if (val === 1)
      fieldName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.fieldName.value;
    if (val === 2)
      fieldName = this.preludeForm.controls.arr['controls'][i].controls.fieldName.value;
    console.log("fieldName", fieldName);
    if (fieldName === "") {
      console.log("fieldName if", fieldName, val);
      if (val === 1) {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          'extractDefId': ''
        });
      } else {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'extractDefId': ''
        });
      }
    } else {
      console.log("fieldName else", fieldName);
      if (val === 1) {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          'extractDefId': fieldName.id
        });
      } else {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'extractDefId': fieldName.id
        });
      }
    }
    const newArray = [];
    this.preludeForm.value.preludeMandatory.forEach(element => {
      newArray.push(element);
    });
    this.preludeForm.value.arr.forEach(element => {
      newArray.push(element);
    });
    console.log('newArray', newArray);
    const newArrayIds = [];
    newArray.forEach(ele => {
      newArrayIds.push(ele.extractDefId);
    })
    console.log('newArrayIds', newArrayIds);
    this.preludeList.forEach(element => {
      if (element.extractDefId === fieldName.id || newArrayIds.includes(element.extractDefId))
        element["active"] = false;
      else
        element["active"] = true;
    });
    console.log('this.preludeList', this.preludeList);
    const passval = this.preludeForm.controls.preludeMandatory['controls'][i].controls.preludeGroup.value;

    this.formExtractGroupSelected(passval, i, val);

  }

  filterPreludeFields(i, val) {
    const formName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.formName.value;
    const category = this.preludeForm.controls.preludeMandatory['controls'][i].controls.category.value;
    const preludeGroup = this.preludeForm.controls.preludeMandatory['controls'][i].controls.preludeGroup.value;
    const fieldName = this.preludeForm.controls.preludeMandatory['controls'][i].controls.fieldName.value;
    let tempList = [];
    let tempGroup = [];
    let tempGroupList = [];
    if (preludeGroup) {
      this.preludeList.length > 0 && this.preludeList.forEach(element => {
        if (element.active) {
          if (element.extractGroup && element.extractGroup == preludeGroup.name) {
            tempList.push(element);
            //required value
            if (element.field) {
              tempGroup.push(element);
            }
          }
        }
      })
      tempGroup = this.removeDuplicates(tempGroup);

      tempGroup.forEach(element => {
        tempGroupList.push({ 'name': element.field, id: element.extractDefId });
      });

      this.formFiledList = tempGroupList;

      if (val === 1) {
        this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
          'fieldNameList': tempGroupList
        });
      } else {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'fieldNameList': tempGroupList
        });
      }
    }

  }
  removeItem(i: number) {
    this.arr = this.preludeForm.get('arr') as FormArray;
    this.arr.removeAt(i);
  }

  addItem() {
    this.arr = this.preludeForm.get('arr') as FormArray;
    this.arr.push(this.createItem());
    this.addPreludeArray()
  }
  addMulitpleItem(val) {
    let controlArray = <FormArray>this.preludeForm.controls.preludeMandatory;
    this.mandatoryFieldNames.forEach(app => {
      const fb = this.createItem();
      fb.patchValue({
        'label': app
      });
      controlArray.push(fb);
    });
    if (val) {
      this.mandatoryFieldNames.forEach((app, i) => {
        val.forEach((ele) => {
          if (ele.label == app) {
            this.preludeForm.controls.preludeMandatory['controls'][i].patchValue({
              'label': ele.label ? ele.label : '',
              'formName': ele.formName.name ? ele.formName : (ele.formName ? { name: ele.formName } : ''),
              'category': ele.category.name ? ele.category : (ele.category ? { name: ele.category } : ''),
              'preludeGroup': ele.preludeGroup.name ? ele.preludeGroup : (ele.preludeGroup ? { name: ele.preludeGroup } : ''),
              'fieldName': ele.fieldName.name ? ele.fieldName : (ele.fieldName ? { name: ele.fieldName } : ''),
              'extractDefId': ele.extractDefId ? ele.extractDefId : '',
              'disabled': ele.formName.name ? true : ele.formName ? true : false,
            });
          }

        });
      })
      this.preludeForm.get('preludeMandatory')['controls'].forEach(element => {
        element.controls.fieldName.setValidators([Validators.required]);
        element.controls.fieldName.updateValueAndValidity();
        element.controls.preludeGroup.setValidators([Validators.required]);
        element.controls.preludeGroup.updateValueAndValidity();
        element.controls.category.setValidators([Validators.required]);
        element.controls.category.updateValueAndValidity();
        element.controls.formName.setValidators([Validators.required]);
        element.controls.formName.updateValueAndValidity();

      });
    }
  }

  addPreludeArray() {
    if (this.preludeList.length) {
      this.preludeForm.controls.arr['controls'].forEach((element, i) => {
        this.preludeForm.controls.arr['controls'][i].patchValue({
          'formList': this.formGroupArr,
          /*           'categoryList': this.categoryGroupArr,
                    'preludeGroupList': this.extractGroupArr,
                    'fieldNameList': this.fieldGroupArr, */
        });
      });
    }
  }

  back() {
    if (!this.editFlag) {
      this.router.navigate(['/user/clinics/add-new-clinic/questionnaire']);
    }
    else {
      this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/questionnaire`]);
    }
  }

  confrimSubmit() {
    if (this.preludeForm.value.preludeMandatory[0].disabled) {
      this.submit();
    } else {
      if (!this.preludeForm.valid && this.editFlag) {
        this.preludeForm.markAllAsTouched();
        this.toastr.error("Please select all mandatory fields");
        return false;
      } else {
        this.openPopup(this.studySubmitPopup, 'xs');
      }
    }
  }
  openPopup(div, size) {
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
  submit() {
    if(!this.preludeForm.value.preludeMandatory[0].disabled)
    this.modalRef2.close();
    if (!this.preludeForm.valid && this.editFlag) {
      this.preludeForm.markAllAsTouched();
      this.toastr.error("Please select all mandatory fields");
      return false;
    } else {
      this.submitFlag = true;
      if (this.editFlag) {
        this.tabservice.setModelData(this.preludeForm.value, 'preludeConfig');
      }
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {};
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

      //PRELUDE CONFIG DATA PREP
      if (this.editFlag) {
        let preludeAssociatedArr = [];
        data.preludeConfig.arr && data.preludeConfig.arr.forEach(ele => {
          if (ele.formName != "" && ele.formName.name != "") {
            preludeAssociatedArr.push({
              "formName": ele.formName ? ele.formName.name : '',
              "category": ele.category ? ele.category.name : '',
              "preludeGroup": ele.preludeGroup ? ele.preludeGroup.name : '',
              "fieldName": ele.fieldName ? ele.fieldName.name : '',
            })
          }
        });
        let preludeMandatoryArr = [];
        data.preludeConfig.preludeMandatory && data.preludeConfig.preludeMandatory.forEach(ele => {
          if (ele.formName != "" && ele.formName.name != "") {
            preludeMandatoryArr.push({
              "label": ele.label ? ele.label : '',
              "formName": ele.formName ? ele.formName.name : '',
              "category": ele.category ? ele.category.name : '',
              "preludeGroup": ele.preludeGroup ? ele.preludeGroup.name : '',
              "fieldName": ele.fieldName ? ele.fieldName.name : '',
            })
          }
        });
        res['preludeAssociated'] = preludeAssociatedArr;
        res['preludeMandatory'] = preludeMandatoryArr;
        res['patientId'] = "";
        res['petName'] = "";
        res['ownerLastName'] = "";
        res['ownerEmail'] = "";
      }
      //PRELUDE CONFIG DATA PREP

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

      res["plansSubscribed"] = planArr;


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

  canDeactivate(component, route, state, next) {
    if (next.url.indexOf('/auth/login') > -1) {
      return true;
    }
    if (next.url.indexOf('/user/clinics') > -1 && this.submitFlag) {
      return true;
    }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
      this.preludeForm.markAllAsTouched();
      if (this.editFlag) {
        if (this.preludeForm.valid) {
          this.submitFlag = true;
          this.tabservice.setModelData(this.preludeForm.value, 'preludeConfig');
          let data = this.tabservice.getModelData();
        }
        else {
          this.submitFlag = false;
        }
      }
      else {
        this.submitFlag = true;
      }
    }
    else {
      let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if (this.preludeForm.pristine == false || Object.keys(data).length > 0) {
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
