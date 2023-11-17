import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { PetParentService } from '../../pet-parent.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { LookupService } from 'src/app/services/util/lookup.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { TabserviceService } from 'src/app/shared/tabservice.service';

@Component({
  selector: 'app-view-pet-parent',
  templateUrl: './view-pet-parent.component.html',
  styleUrls: ['./view-pet-parent.component.scss']
})
export class ViewPetParentComponent implements OnInit {
  petParentId: any = '';
  petParentDetails: any = {};
  existingPetArr: any = [];
  headers: any;
  menuId: any;
  RWFlag: boolean;
  isFav: boolean= false;

  constructor(
    private router: Router,
    private petParentService: PetParentService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private customDatePipe: CustomDateFormatPipe,
    private lookupService:LookupService,
    private userDataService:UserDataService,
    private tabService: TabserviceService
  ) { }
  ngOnInit() {

    let userProfileData = this.userDataService.getRoleDetails();
    console.log("userProfileData",userProfileData);
    let menuActionId ='';
    userProfileData.rolePermissions && userProfileData.rolePermissions.forEach(ele => {
      if (ele.menuId == "15") {
        menuActionId = ele.menuActionId;
        this.menuId = ele.menuId;
      }
    });

    if(menuActionId == "3") {
      this.RWFlag = true;
    }

    this.headers = this.getHeaders();

    if (this.router.url.indexOf('/view-pet-parent') > -1) {
      let str = this.router.url;
      let id = str.split("view-pet-parent/")[1].split("/")[0];
      this.petParentId = id;
    }

    this.spinner.show();
    this.petParentService.getPetParentService(`/api/petParents/${this.petParentId}`).subscribe(res => {
      console.log("petparent edit::", res);
      if (res.status.success == true) {
        this.petParentDetails = res.response.petParent;
        this.existingPetArr = res.response.petParent.petsAssociated;
      } else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.errorMsg(err);
    })
    this.checkFav();
  }

  getHeaders() {
    return [
      { label: "Pet Photo", key: "petPhoto", checked: true },
      { label: "Pets", key: "petName", checked: true },
      { label: "Breed", key: "breedName", checked: true },
      { label: "Weight (LBS)", key: "weight", checked: true },
      { label: "Gender", key: "gender", checked: true },
      { label: "Date of Birth", key: "dob", checked: true },
      { label: "Spayed/Neutered", key: "isNeutered", checked: true },
      { label: "Status", key: "petStatus", checked: true },
    ];
  }

  editPetParent() {
    this.tabService.clearDataModel();
    this.router.navigate(['user/petparent/edit-pet-parent/', this.petParentId]);
  }
  addPetParent() {
    this.router.navigate(['/user/petparent/add-pet-parent']);
  }
  backToList() {
    this.router.navigate(['/user/petparent']);
  }

  errorMsg(err) {
    this.spinner.hide();
    if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
  }
  checkFav() {
    //check favorite
    this.lookupService.getFavInfo(`/api/favourites/isFavourite/${this.menuId}/${this.petParentId}`).subscribe(res => {
     if (res.response.favourite.isFavourite)
       this.isFav = true;
   });
 }
 makeFav() {
   this.spinner.show();
   this.lookupService.addasFav(`/api/favourites/${this.menuId}/${this.petParentId}`, {}).subscribe(res => {
     if (res.status.success === true) {
       this.isFav = true;
       this.toastr.success('Added to Favorites');
       this.spinner.hide();
     }
     else {
       this.toastr.error(res.errors[0].message);
       this.spinner.hide();
     }
   },
     err => {
       this.errorMsg(err);
     }
   );
 }
 
 removeFav() {
   this.spinner.show();
   this.lookupService.removeFav(`/api/favourites/${this.menuId}/${this.petParentId}`, {}).subscribe(res => {
     if (res.status.success === true) {
       this.isFav = false;
       this.toastr.success('Removed from Favorites');
       this.spinner.hide();
     }
     else {
       this.toastr.error(res.errors[0].message);
       this.spinner.hide();
     }
   },
     err => {
       this.errorMsg(err);
     }
   );
 }
 

}
