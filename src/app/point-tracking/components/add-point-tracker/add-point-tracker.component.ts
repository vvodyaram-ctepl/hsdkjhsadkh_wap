import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LookupService } from 'src/app/services/util/lookup.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as moment from 'moment';
import { AddUserService } from 'src/app/clinical-users/components/add-user.service';
import { PointTrackerService } from '../../point-tracker.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { AlertService } from 'src/app/components/alert-modal/alert.service';

@Component({
  selector: 'app-add-point-tracker',
  templateUrl: './add-point-tracker.component.html',
  styleUrls: ['./add-point-tracker.component.scss']
})
export class AddPointTrackerComponent implements OnInit {

  pointForm: FormGroup;
  pointTrackerSubscribed: FormArray;
  activities: any;
  studyArr: any;
  editId: any;
  editFlag: boolean = false;
  viewFlag: boolean;
  submitFlag: boolean = false;
  responseData: any = [];
  studyStartDate: string;
  studyEndDate: string;
  arr: FormArray;
  behaviorArr: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private modalService: NgbModal,
    private lookup: LookupService,
    private adduserservice: AddUserService,
    private point: PointTrackerService,
    private router: Router,
    private userService: UserDataService,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService
  ) {
    this.pointForm = this.fb.group({
      'study': ['', [Validators.required]],
      'start_date': ['', [Validators.required]],
      'end_date': ['', [Validators.required]],
      'tracker': ['', [Validators.required]],
      'status': ['', [Validators.required]],
      'pointTrackerSubscribed': this.fb.array([])
    })
  }

  ngAfterViewInit() {
    this.pointForm.patchValue({
      'status': 1
    });
  }

  async ngOnInit() {
    this.spinner.show();


    this.activatedRoute.params.subscribe(async params => {
      console.log("paramas", params);
      this.editId = params.id;
      console.log("editId", this.editId);
      const path = this.activatedRoute.snapshot.url[0].path;
      console.log("path", path);

      if (path === 'add') {
        this.editFlag = false;
        await this.getMenuItems();
        await this.addItem();
        await this.getStudyList();
        await this.getActivities();
        this.spinner.hide();
      }
      if (path === 'edit') {
        this.editFlag = true;
        await this.getMenuItems();
        await this.addItem();
        await this.getStudyList();
        await this.getActivities();
      }
      
      if (path === 'edit') {
       
        this.spinner.show();
        this.point.getPointById(`/api/pointTrackers/${this.editId}`, '').subscribe(res => {
          console.log("resss", res);
          if (res.status.success === true) {
            let resObj = res.response.pointTracker;
            this.pointForm.patchValue({
              'study': { "studyId": resObj.studyId ? resObj.studyId : '', "studyName": resObj.studyName ? resObj.studyName : '' },
              'start_date': resObj.startDate ? this.customDatePipe.transform(resObj.startDate, 'MM-dd-yyyy') : '',
              'end_date': resObj.endDate ? this.customDatePipe.transform(resObj.endDate, 'MM-dd-yyyy') : '',
              'tracker': resObj.trackerName ? resObj.trackerName : '',
              "status": resObj.status
            });

            this.activities.forEach((ele, i) => {
              resObj.pointTrackerAssociatedObject.forEach((resEle, j) => {
                if (ele.activityId == resEle.id) {
                  this.pointForm.controls.pointTrackerSubscribed['controls'][i].patchValue({
                    "points": resEle.points
                  });
                }
              })

              resObj.pointTrackerMetricAssociatedObject && resObj.pointTrackerMetricAssociatedObject.forEach((resEle, j) => {
                if (ele.activityId == 4) {
                  this.addSub(i);
                  console.log("this.pointForm", this.pointForm.controls.pointTrackerSubscribed['controls'][i].controls.arr['controls'][j]);
                  this.pointForm.controls.pointTrackerSubscribed['controls'][i].controls.arr['controls'][j].patchValue({
                    "actvtyName": resEle.metricIds,
                    "actPoints": resEle.metricPoints
                  });
                }

              })

            });

          }
          else {
            this.toastr.error(res.errors[0].message);
          }
          this.spinner.hide();
        }, err => {
          this.spinner.hide();
          console.log(err);
          this.errorMsg(err);
        }
        )
      }
    });
    
  }
  createSub() {
    return this.fb.group({
      actvtyName: [''],
      actPoints: ['', [Validators.pattern("^[0-9]*$"),
      Validators.min(1), Validators.max(10)]]
    })
  }

  addSub(index) {
    // this.arr = this.pointForm.get('arr') as FormArray;
    this.activities.forEach((ele, i) => {
      if (index == i) {
        this.arr = this.pointForm.get('pointTrackerSubscribed')['controls'][i].get('arr') as FormArray;
        this.arr.push(this.createSub());
      }
    })
  }
  removeItem(i, j) {
    this.arr = this.pointForm.get('pointTrackerSubscribed')['controls'][i].get('arr') as FormArray;
    this.arr.removeAt(j);
  }
  private async getMenuItems() {
    let res: any = await (
      this.lookup.getPointTrackerActivities('/api/lookup/getPointTrackerActivities/').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res.status.success === true) {
      this.activities = res.response.pointTrackerActivities;
      this.spinner.hide();
    }
  }
  private async getStudyList() {
    let res2: any = await (
      this.adduserservice.getStudy('/api/study/getStudyList', '').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res2.status.success === true) {
      this.studyArr = res2.response.studyList;
      this.spinner.hide();
    }
  }
  private async getActivities() {
    let res3: any = await (
      this.lookup.getFeedbackpageList(`/api/lookup/getPointTrackerMetrics`).pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res3.status.success === true) {
      this.behaviorArr = res3.response.pointTrackerMetrics;
      this.spinner.hide();
    }

  }
  createItem() {
    return this.fb.group({
      activitiesId: [''],
      points: ['', [Validators.pattern("^[0-9]*$"),
      Validators.min(1), Validators.max(10)]],
      arr: this.fb.array([])
    })
  }
  addItem() {
    this.spinner.show();
    this.activities && this.activities.forEach((ele, i) => {
      this.pointTrackerSubscribed = this.pointForm.get('pointTrackerSubscribed') as FormArray;
      this.pointTrackerSubscribed.push(this.createItem());
      this.pointForm.controls.pointTrackerSubscribed['controls'][i].patchValue({
        'activitiesId': { activityName: ele.activityName, activityId: ele.activityId }
      });
    });
    this.spinner.hide();

  }

  selectedStudy($event) {
    console.log($event);
    this.studyStartDate = moment(new Date($event.startDate)).format("MM-DD-YYYY");
    this.studyEndDate = moment(new Date($event.endDate)).format("MM-DD-YYYY");
  }

  startdateSelect() {
    console.log("sdsdsd");
    if (moment(this.pointForm.value.end_date) < moment(this.pointForm.value.start_date)) {
      this.pointForm.patchValue({
        'end_date': ''
      })
    }
  }
  submit() {
    this.pointForm.markAllAsTouched();
    console.log("this.pointForm",this.pointForm.value);
    // if (this.pointForm.invalid) {
    //   this.toastr.error('Please select all the mandatory fields', 'Error!');
    //   return false;
    // }
    if (this.pointForm.valid) {
      let tempArr = this.pointForm.value.pointTrackerSubscribed;
      //removing activity 4 because empty points in it
      let formArr =  tempArr.filter(item => item.activitiesId.activityId != 4)
      console.log("formArr",formArr);
      //filter array
      let result = formArr.filter(item => item.points === "");
      console.log("resu", result);
      
      //removing activity 4 because empty points in it
     let filtrActivities =  this.activities.filter(item => item.activityId != 4)
      console.log("filtrActivities",filtrActivities);

      //if videos sub array is filled
      let subvideoarr = [];
      console.log("tempArr",tempArr);
      tempArr && tempArr.forEach((ele,i) => {
        if(ele.activitiesId.activityId == 4) {
          if(ele.arr.length > 0) {
                ele.arr.forEach((res, j) => {
                  let points = res.actPoints != '' ? res.actPoints : '';
                  if (points && res.actvtyName != '') {
                    // pointTrackerMetricRequest.push({ "metricId": res.actvtyName, "points": points });
                    console.log("subvideoarr",res);
                    subvideoarr.push(res);
                  }
                })
              }
        }
      })
    
      if (result.length == filtrActivities.length && subvideoarr.length == 0) {
        this.toastr.error('Please select at least one promotion', 'Error!');
      }
      else {
        this.submitFlag = true;
        this.spinner.show();

        // creating for videos sub menu arr
        let pointTrackerMetricRequest = [];
        this.pointForm.value.pointTrackerSubscribed && this.pointForm.value.pointTrackerSubscribed.forEach((ele, i) => {

          if (ele.activitiesId.activityId == 4) {
            if (ele.arr.length > 0) {
              ele.arr.forEach((res, j) => {
                let points = res.actPoints != '' ? res.actPoints : '';
                if (points && res.actvtyName != '') {
                  pointTrackerMetricRequest.push({ "metricId": res.actvtyName, "points": points });
                }
              })

            }
          }


        })
        // creating for videos sub menu arr

        let pointTrackerSubscribed = [];
        this.pointForm.value.pointTrackerSubscribed && this.pointForm.value.pointTrackerSubscribed.forEach(ele => {
          if (ele.activitiesId.activityId == 4) {
            // let points = ele.points != '' ? ele.points : '';
            // if (points) {
              pointTrackerSubscribed.push({ "activitiesId": ele.activitiesId.activityId, "points": '', "pointTrackerMetricRequest": pointTrackerMetricRequest });
            // }
          }
          else {
            let points = ele.points != '' ? ele.points : '';
            if (points) {
              pointTrackerSubscribed.push({ "activitiesId": ele.activitiesId.activityId, "points": ele.points });
            }
          }
        })

        let form = this.pointForm.value;
        let res = Object.assign({});
        res["trackerName"] = form.tracker;
        res["studyId"] = form.study.studyId;
        res["startDate"] = this.customDatePipe.transform(form.start_date, 'yyyy-MM-dd');
        res["endDate"] = this.customDatePipe.transform(form.end_date, 'yyyy-MM-dd');
        res["status"] = form.status;
        res["pointTrackerSubscribed"] = pointTrackerSubscribed;
        // res["createdBy"] = this.userService.getUserId();
        if (this.editFlag) {
          res["pointTrackerId"] = this.editId;
        }
        console.log("resres", res);

        if (!this.editFlag) {
          this.point.addPromotion('/api/pointTrackers/', res).subscribe(res => {
            if (res.status.success === true) {
              this.toastr.success(`Campaign added successfully!`);
              this.spinner.hide();
              this.router.navigate(['/user/point-tracking']);
            }
            else {
              this.toastr.error(res.errors[0].message);
              this.spinner.hide();
            }
          }, err => {
            console.log(err);
            this.errorMsg(err);
          });
        }
        else {
          this.point.updatePromotion('/api/pointTrackers/', res).subscribe(res => {
            if (res.status.success === true) {
              this.toastr.success(`Campaign updated successfully!`);
              this.spinner.hide();
              this.router.navigate(['/user/point-tracking']);
            }
            else {
              this.toastr.error(res.errors[0].message);
              this.spinner.hide();
            }
          }, err => {
            console.log(err);
            this.errorMsg(err);
          });
        }
      }
    }
  }

  errorMsg(err) {
    if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
    this.spinner.hide();
  }

  backToList() {
    this.router.navigate(['/user/point-tracking']);
  }
  canDeactivate(component, route, state, next) {
    if (next.url.indexOf('/auth/login') > -1) {
      return true;
    }
    if (next.url.indexOf('/user/point-tracking') > -1 && this.submitFlag) {
      return true;
    }
    if (this.pointForm.pristine == false || this.pointForm.dirty == false) {
      return this.alertService.confirm();
    }
    else {
      return true;
    }
  }
}
