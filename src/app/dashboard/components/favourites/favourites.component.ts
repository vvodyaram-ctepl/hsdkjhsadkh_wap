import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { LookupService } from 'src/app/services/util/lookup.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { Router } from '@angular/router';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-favourites',
  templateUrl: './favourites.component.html',
  styleUrls: ['./favourites.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FavouritesComponent implements OnInit {
  headers: any;
  showDataTable: boolean = true;
  RWFlag: boolean;
  filterTypeArr: { name: string; id: string; }[];
  @ViewChild('archiveContent') archiveContent: ElementRef;
  modalRef2: NgbModalRef;
  menuId: any;
  entityId: any;
  recordName: any;


  constructor(private lookupService: LookupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private userDataService: UserDataService,
    private router: Router,
    private modalService: NgbModal) { }

  ngOnInit() {
    //permission for the module
    let userProfileData = this.userDataService.getRoleDetails();
    console.log("userProfileData", userProfileData);
    let menuActionId = '';
    userProfileData.rolePermissions && userProfileData.rolePermissions.forEach(ele => {
      if (ele.menuId == "1") {
        menuActionId = ele.menuActionId;
      }
    });
    if (menuActionId == "3") {
      this.RWFlag = true;
    }

    this.headers = [
      // { key: "slNumber", label: "S.NO", checked: true },
      { key: "recordName", label: "Record Name ", checked: true, clickable: true, width: 500 },
      // { key: "stateCode", label: "State/PR", checked: true, width: 150 },
      { key: "menuName", label: "Module", checked: true },
      // { key: "createdDate", label: "Created on", checked: true },
      // { key: "isActive", label: "Status", checked: true },
      { key: "static", label: "", checked: true, clickable: true, width: 90 }
    ];
    this.filterTypeArr =
      [{
        name: "Module",
        id: "Menu"
      }];
  }

  formatter($event) {
    $event.forEach(ele => {
      if (this.RWFlag) {
        ele.static = `<div class="card icon-card-list red-bg mb-2" title="Delete">
<span class="size-14" style="color:red;" title="Delete">-</span>
</div>`
      }
    });
  }
  getNode($event) {
    console.log("$event.item.menuId", $event.item.menuId)
    if ($event.header === 'recordName') {
      // this.router.navigate(['/user/clinics/view-clinic',$event.item.studyId]);
      if ($event.item.menuId == 24) {
        this.router.navigate(['/user/clinical-user/view-clinic-users/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 10) {
        //plans
        this.router.navigate(['/user/plans/view/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 14) {
        console.log($event.item)
        this.router.navigate([`/user/patients/view/${$event.item.entityId}/0`]);
      }
      else if ($event.item.menuId == 11) {
        this.router.navigate(['/user/clinics/view-clinic/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 23) {
        this.router.navigate(['/user/roles/view/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 15) {
        //pet parent
        this.router.navigate(['/user/petparent/view-pet-parent/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 17) {
        this.router.navigate(['/user/assets/management/view/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 26) {
        this.router.navigate(['/user/questionnaire/view/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 7) {
        this.router.navigate(['/user/support/view/', $event.item.entityId]);
      }
      else if ($event.item.menuId == 21) {
        this.router.navigate(['/user/point-tracking/view/', $event.item.entityId]);
      }

    }
    let action = $event.event.target.title;

    if (action === 'Delete') {
      this.menuId = $event.item.menuId;
      this.entityId = $event.item.entityId;
      this.recordName = $event.item.recordName;

      this.openPopup(this.archiveContent, 'xs');
      // this.spinner.show();
      // this.lookupService.removeFav(`/api/favourites/${$event.item.menuId}/${$event.item.entityId}`, {}).subscribe(res => {
      //   if (res.status.success === true) {
      //     this.toastr.success('Removed from Favourites successfully!');
      //     this.reloadDatatable();
      //   }
      //   this.spinner.hide();
      // },
      //   err => {
      //     if (err.status == 500) {
      //       this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      //     }
      //     else {
      //       this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      //     }
      //     this.spinner.hide();
      //   })
    }

  }
  public reloadDatatable() {
    this.showDataTable = false;
    setTimeout(() => {
      this.showDataTable = true;
    }, 1);
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

  deleteRecord() {
    this.spinner.show();
    this.lookupService.removeFav(`/api/favourites/${this.menuId}/${this.entityId}`, {}).subscribe(res => {
      if (res.status.success === true) {
        this.toastr.success('Removed from Favourites successfully!');
        this.reloadDatatable();
      }
      this.modalRef2.close();
      this.spinner.hide();
    },
      err => {
        if (err.status == 500) {
          this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
        }
        else {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
        }
        this.spinner.hide();
      })
  }
}
