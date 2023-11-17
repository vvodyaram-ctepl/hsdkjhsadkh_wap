import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ClinicService } from '../clinic.service';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { AlertService } from 'src/app/components/alert-modal/alert.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.component.html',
  styleUrls: ['./add-notes.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class AddNotesComponent implements OnInit {

  addNotesForm: FormGroup;
  today = moment().format("MM-DD-YYYY");
  // today = moment('2019-08-12T17:52:00-00:00').format('MM/DD/YYYY')
  
  userProfileData: { userName: string; roleName: string; };
  submitFlag: boolean = false;
  editFlag: boolean;
  editId: string;
    
  constructor( private fb: FormBuilder,
    private router: Router,
    private userService: UserDataService,
    private tabservice:TabserviceService,
    private userDataService: UserDataService,
    private spinnerService:NgxSpinnerService,
    private clinicService:ClinicService,
    private toastr:ToastrService,
    public customDatePipe:CustomDateFormatPipe,
    private alertService:AlertService
    ) {
      let userId = this.userService.getUserId();
      console.log("userId",userId);
    this.addNotesForm = this.fb.group({
      'notes': ['', [Validators.required]],
      'date':this.today,
      'userName':['']
    })
  }

  ngOnInit() {
    if (this.router.url.indexOf('/edit-clinic') > -1) { 
      console.log("this.router.url",this.router.url);
      let str = this.router.url;
      let id = str.split("edit-clinic/")[1].split("/")[0]
      this.editFlag = true;
      this.editId = id;
      this.clinicService.getStudy(`/api/study/${id}`, '').subscribe(res => {
        console.log("study", res);
        if(res.status.success == true) {
          let plan = res.response.rows;
          this.addNotesForm.patchValue({
            'notes': plan.notes[0] ? plan.notes[0] :'',
        });
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
    this.userProfileData = this.userDataService.getUserDetails();
    console.log("this.userProfileData",this.userProfileData);
    this.addNotesForm.patchValue({'userName':this.userProfileData.userName})
    this.tabservice.dataModel$.subscribe(res => {
      console.log(res);
      res = res ? ( res['addNotes'] ? res['addNotes'] :'') :'';
      console.log("resres",res);
      this.addNotesForm.patchValue({
        'notes': res.notes ? res.notes :'',
        'date': this.today,
        'userName': this.userProfileData.userName
      })
    })
  }
 
  back() {
    if(!this.editFlag) {
    this.router.navigate(['/user/clinics/add-new-clinic/add-plans']);
    }
    else {
      this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/add-plans`]);
    }
  }
  next() {
    this.addNotesForm.markAllAsTouched();
    if(this.addNotesForm.valid) {
      this.submitFlag = true;
      this.tabservice.setModelData(this.addNotesForm.value,'addNotes');
     
      if(!this.editFlag) {
        this.router.navigate(['/user/clinics/add-new-clinic/mobile-app-config']);
         }
      else {
        this.router.navigate([`/user/clinics/edit-clinic/${this.editId}/mobile-app-config`]);
      }
    }
   
  }
  canDeactivate(component,route,state,next) {
    console.log('i am navigating away');
    console.log("routein basic",next.url);
    if(next.url.indexOf('/auth/login') > -1) {
      return true;
     }
    if (next.url.indexOf('/add-new-clinic') > -1 || next.url.indexOf('/edit-clinic') > -1) {
    this.addNotesForm.markAllAsTouched();
    if(this.addNotesForm.valid) {
      this.submitFlag = true;
      this.tabservice.setModelData(this.addNotesForm.value,'addNotes');
    }
    else {
      this.submitFlag = false;
    }
  }
  else {
    let data = this.tabservice.getModelData() ? this.tabservice.getModelData() : {}
      if(this.addNotesForm.pristine == false || Object.keys(data).length > 0 ) {
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
