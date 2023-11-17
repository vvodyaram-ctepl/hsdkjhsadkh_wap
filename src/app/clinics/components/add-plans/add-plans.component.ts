import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { Router } from '@angular/router';
import { LookupService } from 'src/app/services/util/lookup.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClinicService } from '../clinic.service';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/components/alert-modal/alert.service';

@Component({
  selector: 'app-add-plans',
  templateUrl: './add-plans.component.html',
  styleUrls: ['./add-plans.component.scss']
})
export class AddPlansComponent implements OnInit {

  addPlanForm: FormGroup;
  arr: FormArray;
  dataFromB: string;
  planlist: any;
  startDate: any;
  submitFlag: boolean = false;
  editFlag: boolean = false;
  editId: string;
  private modalRef: NgbModalRef;
  modalRef2: NgbModalRef;

  constructor( private router: Router,
    private fb: FormBuilder,
    private tabservice:TabserviceService,
    private lookupservie:LookupService,
    private spinnerService: NgxSpinnerService,
    private clinicService:ClinicService,
    private toastr:ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private modalService: NgbModal,
    private alertService:AlertService
    ) { 
    
}

getStudyById() {
  this.spinnerService.show();
  this.clinicService.getStudy(`/api/study/${this.editId}`, '').subscribe(res => {
    console.log("study", res);
    if(res.status.success == true) {
      let plan = res.response.rows.plansSubscribed;
     
      let editData2 = Object.assign({});
      let editData2Arr = [];
      plan.forEach(ele => {
       editData2Arr.push({
        planName:{"planName": ele.planName ? ele.planName : '',"planId":ele.planId ? ele.planId :''},
          dateSubscribed: ele.subscribedDate ?  this.customDatePipe.transform(ele.subscribedDate, 'MM-dd-yyyy') :''
        });
      })
      editData2["arr"] = editData2Arr;
      this.tabservice.setModelData(editData2,'addPlan');

    this.spinnerService.hide();
  }
}, err => {

  console.log(err);
  if (err.status == 500) {
    this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
  }
  else {
    this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
  }
  this.spinnerService.hide();
}
)
}
  async ngOnInit() {
    if (this.router.url.indexOf('/edit-clinic') > -1) { 
      console.log("this.router.url",this.router.url);
      let str = this.router.url;
      let id = str.split("edit-clinic/")[1].split("/")[0]
      this.editFlag = true;
      this.editId = id;

      //  await this.getStudyById();
    }
    this.startDate = moment().format("MM-DD-YYYY");
   
    this.addPlanForm = this.fb.group({
      arr: this.fb.array([this.createItem()])
  });

  
  await this.getPlans();
  // this.tabservice.dataModel$.subscribe(res => {
    let res = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
    console.log("in edit plans on add");
    res = res ? ( res['addPlan'] ? res['addPlan'] :'') :'';
    console.log("addPlan",res);
   let rest = res ? res.arr  :'';
  if(rest) {
    console.log("restrest",rest);
  rest.forEach((ele,i) => {
    this.addPlanForm.controls.arr['controls'][i].patchValue({
      planName: ele.planName ? ele.planName :'',
      dateSubscribed: ele.dateSubscribed ? ele.dateSubscribed :'',
      disabled:ele.disabled
    });
  
    if(i < (rest.length - 1) ) {
    console.log( i,rest.length - 1)
    this.addItem();
  }

  })
   
  }
  // })
}

  getPlans() {
    this.spinnerService.show();
    this.lookupservie.getPlans('/api/plans/getPlans').subscribe(res => {
      console.log("ress",res);
      this.planlist = res.response.rows;
      this.spinnerService.hide();
    })
   }
  createItem() {
    return this.fb.group({
      planName: ['',[Validators.required]],
      dateSubscribed: [moment().format("MM-DD-YYYY"),[Validators.required]],
      disabled:false
    })
  }

  addItem() {
    this.arr = this.addPlanForm.get('arr') as FormArray;
    this.arr.push(this.createItem());
  }

   removeItem(i: number) {
    this.arr = this.addPlanForm.get('arr') as FormArray;
    this.arr.removeAt(i);
    console.log(this.addPlanForm.value.arr[i]);
   
  }

  // onSubmit($event) {
  //   console.log("addPlan",$event);

  // }
  next() {
    console.log("dsd")
    console.log("formm",this.addPlanForm)
    this.addPlanForm.markAllAsTouched();
    if( this.addPlanForm.valid) {
      this.submitFlag= true;
      this.tabservice.setModelData(this.addPlanForm.value,'addPlan');
      let data = this.tabservice.getModelData();
      console.log("datadatadata",data);   
      if(!this.editFlag) {
        this.router.navigate(['/user/clinics/add-new-clinic/add-notes']);
         }
      else {
        this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/view-notes`]);
      } 
    }
    else {
      this.submitFlag = false;
    }
    

  }
  back() {
    if(!this.editFlag) {
    this.router.navigate(['/user/clinics/add-new-clinic/basic-details']);
    }
    else {
      this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/basic-details`]);
    }
  }
  canDeactivate(component,route,state,next) {
    console.log('i am navigating away');
    console.log("routein basic",next.url);
    if(next.url.indexOf('/auth/login') > -1) {
      return true;
     }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
    this.addPlanForm.markAllAsTouched();
    if( this.addPlanForm.valid) {
      this.submitFlag= true;
      this.tabservice.setModelData(this.addPlanForm.value,'addPlan');
      let data = this.tabservice.getModelData();
      console.log("datadatadata",data);   
    }
    else {
      this.submitFlag = false;
    }
  }
  else {
    let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if(this.addPlanForm.pristine == false || Object.keys(data).length > 0 ) {
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

updateStudy() {
  if(this.editFlag) {
  this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/add-plans`]).then(() => {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  });
}
  // this.spinnerService.show();
//   this.clinicService.getStudy(`/api/study/${this.editId}`, '').subscribe(res => {
//     console.log("study", res);
//     if(res.status.success == true) {
//       let plan = res.response.rows.plansSubscribed;
//       plan.forEach((ele,i) => {
//       this.addPlanForm.controls.arr['controls'][i].patchValue({
//         planName:{"planName": ele.planName ? ele.planName : '',"planId":ele.planId ? ele.planId :''},
//         dateSubscribed: ele.subscribedDate ?  this.customDatePipe.transform(ele.subscribedDate, 'MM-dd-yyyy') :''
//       });
//     });
//     this.spinnerService.hide();
//   }
// }, err => {

//   console.log(err);
//   if (err.status == 500) {
//     this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
//   }
//   else {
//     this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
//   }
//   this.spinnerService.hide();
// }
// )
}


}
