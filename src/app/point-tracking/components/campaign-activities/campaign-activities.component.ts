import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { LookupService } from 'src/app/services/util/lookup.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { PointTrackerService } from '../../point-tracker.service';

@Component({
  selector: 'app-campaign-activities',
  templateUrl: './campaign-activities.component.html',
  styleUrls: ['./campaign-activities.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CampaignActivitiesComponent implements OnInit {
  trackId: string;
  selectTypeList: { name: string; }[];
  public showDataTable: boolean = true;
  headers: any;
   modalRef2: NgbModalRef;
   @ViewChild('archiveContent') archiveContent: ElementRef;
  filterTypeArr: any[];
  behaviorArr: any;
  newArr: any[];
  petName: any;
  rejectObject: any;
  trackerRejectReasons: any;
  reasonRejected:any ='';
  newArr1: any[];
  behaviorArr1: any;
  constructor(
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private point: PointTrackerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userDataService:UserDataService,
    private lookupService:LookupService,
    private userService:UserDataService,
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.spinner.show();
     if (this.router.url.indexOf('/user/point-tracking/view/') > -1) {
      let str = this.router.url;
      this.trackId = str.split("/user/point-tracking/view/")[1].split("/")[0];
    }
    this.point.getPointById(`/api/pointTrackers/${this.trackId}`, '').subscribe(res => {
      console.log("resss", res);
      
      this.behaviorArr1 = res.response.pointTracker.pointTrackerMetricAssociatedObject;
      this.newArr1=[];
      this.behaviorArr1.forEach(ele => {
        ele['name'] = ele.metricName;
        ele['value'] = ele.metricId;
        this.newArr1.push(ele);
      })
      this.lookupService.getFeedbackpageList(`/api/lookup/getPointTrackerMetrics`).subscribe(res => {
        console.log("res", res);
        this.spinner.hide();
        // if(res.success == true) {
        this.behaviorArr = res.response.pointTrackerMetrics;
        this.newArr  = [];
        this.behaviorArr1.forEach(ele1 => {
        this.behaviorArr.forEach(ele => {
          if(ele.metricId===ele1.metricIds){
          ele['name'] = ele.metricName;
          ele['value'] = ele.metricId;
          this.newArr.push(ele);
          }
        })
        })
        console.log("this.newArr",this.newArr)
        this.reloadDatatable();
      // }
      },
        err => {
          this.spinner.hide();
          this.toastr.error('Something went wrong. Please try after sometime or contact administrator.');
        }
      );
    },
    
    
    err => {
      this.spinner.hide();
      this.toastr.error('Something went wrong. Please try after sometime or contact administrator.');
    }
    );
    

    this.headers = [
      { key: "petName", label: "Pet", clickable: true,checked: true,width:100},
      { key: "studyName", label: "Study", checked: true, width: 150 },
      { key: "createdDate", label: "Date", checked: true, width:100 },
      { key: "obseravattion", label: "Observation", checked: true },
      { key: "activity", label: "Activity", checked: true },
      { key: "behavior", label: "Behavior", checked: true ,width:150,
      editable: true,
      editableType: "select",
      editableSchema: this.newArr,
       defaultInline: true
    },
      { key: "media", label: "Media", checked: true },
      { key: "points", label: "Points", checked: true },
      { key: "status", label: "Status", checked: true },
      { key: "action", label: "Action", checked: true,clickable: true,width:150 },
    ];
 
   
    this.filterTypeArr =
    [
      {
        name: "Activity",
        id: "trackerActivity"
      },
      {
        name: "Behavior",
        id: "behavior"
      },
      {
        name: "Date",
        id: "dateType"
      },
      {
      name: "Study",
      id: "Study"
    },
    {
      name: "Status",
      id: "trackerStatus"
    }
    ];
    this.getRejectReasons();
  }
  public reloadDatatable() {
    this.showDataTable = false;
    setTimeout(() => {
      this.showDataTable = true;
    }, 1);
  }
  getRejectReasons() {
    // api/lookup/getTrackerRejectReasons
    this.spinner.show();
    this.lookupService.getFeedbackpageList(`/api/lookup/getTrackerRejectReasons`).subscribe(res => {
      if(res.response.trackerRejectReasons) {
        this.trackerRejectReasons = res.response.trackerRejectReasons;
      }
      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        this.toastr.error('Something went wrong. Please try after sometime or contact administrator.');
      }
    );

  }
  formatter(event) { 
    event.forEach(ele => {
      ele.inlineSelectOptions['behavior'] = this.newArr;
    //   ele.behavior = ele.behavior +  `<div class="card icon-card-list green-bg mb-2 mr-2" title="Edit">
    //   <span class="icon-tag size-20" title="Edit"></span>
    // </div>`;
    ele.media = ele.media ? `<span class="petImage"><img src= ` + ele.media + ` height="38" width="38"></span>` :'';
      ele.createdDate = this.customDatePipe.transform(ele.createdDate, 'MM/dd/yyyy');
      if(ele.status == 'Approved') {
        ele['columnCssClass']['status'] = "approve-status";
      }
      else if(ele.status == 'Rejected'){
        ele['columnCssClass']['status'] = "reject-status";
      }
      else {
        ele['columnCssClass']['status'] = "pending-status";
      }

      if(ele.status == 'Approved') {
        ele.points = ele.points;
      }
      else {
        ele.points = 'NA';
      }
      console.log("this.newArr",this.newArr);
     if(ele.status == 'Approved') {
      ele.action = `<div class="reject-button mb-2" title="Reject">
    <span style="color:red;" title="Reject">Reject</span>
    </div>`
     }
     if(ele.status == 'Rejected') {
      ele.action = `<div class="accept-button mb-2" title="Accept">
      <span style="color:#1CCF99;" title="Accept">Accept</span>
      </div>`
     }
     if(ele.status == 'Pending') {
      ele.action = `<div class="accept-button mb-2" title="Accept">
      <span style="color:#1CCF99;" title="Accept">Accept</span>
      </div>&nbsp;&nbsp;<div class="reject-button mb-2" title="Reject">
    <span style="color:red;" title="Reject">Reject</span>
    </div>`
     }
    })
  }
  getNode($event) {
  
    let action = $event.event.target.title;
    // let behavId = '';

    this.newArr.forEach(ele => {
      if(ele.name == $event.item.behavior) {
        $event.item.behaviorId = ele.value;
      }
    })
    console.log('behavId ::: ',  $event.item.behaviorId);
    console.log("action",action);
    let item = $event.item;
    let res = Object.assign({});
    res["trackerPetPointsId"] = item.trackerPetPointsId;
     res["behaviorId"] = item.behaviorId; //item.behaviorId
     res["modifiedBy"]= this.userService.getUserId();
     if (action === 'Accept') {
      res["statusId"] = 2;
      this.spinner.show();
       this.point.addPromotion('/api/pointTrackers/updateTrackerActStatus',res).subscribe(res => {
        console.log("res", res);
        if(res.status.success === true) {
          this.reloadDatatable();
          this.spinner.hide();
          this.toastr.success('Yay, the behavior is approved!!');
        }
       },
       err => {
         this.spinner.hide();
         if (err.status == 500) {
          this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
        }
        else {
          this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
        }
       }
       )
     }
     if (action === 'Reject') {
    this.petName = $event.item.petName;
     res["statusId"] = 3;
     res["rejectNotes"] = "";
     console.log(res);
     this.openPopup(this.archiveContent, 'xs',res);
    }
       
    
  }
  openPopup(div, size, res) {
    
    console.log('div :::: ', res);
    this.rejectObject = res;
    this.reasonRejected = '';
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
  rejectActivity() {
   console.log("rejectObject",this.rejectObject);
   this.rejectObject['rejectNotes']=this.reasonRejected;
   this.spinner.show();
   this.point.addPromotion('/api/pointTrackers/updateTrackerActStatus',this.rejectObject).subscribe(res => {
    console.log("res", res);
    if(res.status.success === true) {
      this.reloadDatatable();
      this.spinner.hide();
      this.toastr.success('Yay, the behavior is rejected!!');
    }
   },
   err => {
     this.spinner.hide();
     if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
   }
   )
  }

}
