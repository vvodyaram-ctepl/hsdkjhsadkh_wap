import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { PetService } from '../../pet.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbCarousel, NgbSlideEvent, NgbSlideEventSource, NgbCarouselConfig, NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LookupService } from 'src/app/services/util/lookup.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import * as moment from 'moment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AddUserService } from 'src/app/clinical-users/components/add-user.service';

@Component({
  selector: 'app-view-patient',
  templateUrl: './view-patient.component.html',
  styleUrls: ['./view-patient.component.scss'],
  providers: [NgbCarouselConfig]
})

export class ViewPatientComponent implements OnInit {
  @ViewChild('archiveContent') archiveContent: ElementRef;
  @ViewChild('archiveContent2') archiveContent2: ElementRef;
  selectedRecordPet: any;
  selectedRecordStudy: any;
  showTabsPage: boolean;
  addStudyForm: FormGroup;
  activeTab: any;
  patientInfo: boolean = false;
  selectInfo: boolean = false;
  RWFlag: boolean;
  petId: any;
  studyId: any;
  petDetails: any;
  data: any = [];
  dataArchive: any = [];
  pets: any = [];
  list: any = [];
  archList: any = [];
  showPanelist: boolean = true;
  searchText;

  @ViewChild('carousel', { static: true }) carousel: NgbCarousel;
  selectedRow1: any;
  modalRef2: NgbModalRef;
  studyDeName: any;
  studyArr: any;
  isExternalPet: boolean;

  // private list = [
  //   {
  //     "studyName": "Hill's Team Marvin1",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019",
  //     "currentstudy": "true"
  //   },
  //   {
  //     "studyName": "Hill's Team Marvin2",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019"
  //   },
  //   {
  //     "studyName": "Hill's Team Marvin3",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019"
  //   },
  //   {
  //     "studyName": "Hill's Team Marvin4",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019"
  //   },
  //   {
  //     "studyName": "Hill's Team Marvin5",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019"
  //   },
  //   {
  //     "studyName": "Hill's Team Marvin6",
  //     "startDate": "08/28/2019",
  //     "endDate": "09/28/2019"
  //   }
  // ];

  backToList() {
    this.router.navigate(['/user/patients']);
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

  disassociate(studyId, studyName) {
    console.log(studyId, studyName);
    this.studyDeName = studyName;
    this.studyId = studyId;
    this.openPopup(this.archiveContent, 'xs');

  }
  deleteStudy() {
    this.spinner.show();
    this.petService.updatePet(`/api/pets/disassociateStudy/${this.petId}/${this.studyId}`, {}).subscribe(res => {
      if (res.status.success === true) {
        this.toastr.success('Study disassociated successfully!');
        // this.router.navigate(['/user/patients']);
        this.modalRef2.close();
        this.ngOnInit();
      }
      else {
        this.toastr.error(res.errors[0].message);
        this.modalRef2.close();
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      console.log(err);
      this.errorMsg(err);
      this.modalRef2.close();
    });
  }
  getListOfArchStudies() {
    this.spinner.show();
    //Get Pet details
    this.petService.getPet(`/api/pets/getArchiveStudies/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.archList = res.response.petStudy;
        console.log("this.archList", this.archList)
        if (this.archList) {
          this.archiveArray(4, this.archList);
        }
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }


  menuId: any;
  isFav: boolean = false;


  constructor(public router: Router,
    private userDataService: UserDataService,
    private petService: PetService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    config: NgbCarouselConfig,
    private lookupService: LookupService,
    private modalService: NgbModal,
    private tabService: TabserviceService,
    private customDatePipe: CustomDateFormatPipe,
    private adduserservice: AddUserService,
    private fb: FormBuilder
  ) {
    config.interval = 0;
    config.wrap = false;
  }


  async ngOnInit() {

    window.addEventListener("isAmMedicationClicked", (event) => {
      console.log("deviiii")
      this.getPetDetailsById();
     });


    //permission for the module
    this.activatedRoute.params.subscribe(async params => {
      let str = this.router.url;
      this.petId = str.split("view/")[1].split("/")[0];
      console.log("petId", str.split("view/")[1].split("/")[0])
      this.studyId = str.split("view/")[1].split("/")[1];
    })
    await this.getInitialData();
    await this.getStudy();
    this.addStudyForm = this.fb.group({
      'studyName': ['', [Validators.required]],
      'studyassDate': [''],
      'isExternalArr': '',
      'isExternal': '',
      'externalPet': '',
      'startDate': '',
      'endDate': '',
      'studyId': ''
    })

    console.log("this.data", this.data);
    let userProfileData = this.userDataService.getRoleDetails();
    console.log("userProfileData", userProfileData);
    let menuActionId = '';
    userProfileData.rolePermissions && userProfileData.rolePermissions.forEach(ele => {
      if (ele.menuId == "14") {
        menuActionId = ele.menuActionId;
        this.menuId = ele.menuId;
      }
    });
    if (menuActionId == "3") {
      this.RWFlag = true;
    }
    this.cardView();
    this.checkFav();
  }

  studyArray(numberOfChunks, inputList) {
    this.data = [];
    var result = inputList.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / numberOfChunks)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item);
      resultArray.forEach(ele => {
        console.log("eledaataa", ele);
        ele.forEach(res => {
          res.startDate = res.startDate ? this.customDatePipe.transform(res.startDate, 'MM-dd-yyyy') : '';
          res.endDate = res.endDate ? this.customDatePipe.transform(res.endDate, 'MM-dd-yyyy') : '';
        })
      })
      this.data = resultArray;
      return resultArray
    }, [])

  }
  archiveArray(numberOfChunks, inputList) {
    this.dataArchive = [];
    var result = inputList.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / numberOfChunks)

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [] // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      resultArray.forEach(ele => {
        console.log("eledaataa", ele);
        ele.forEach(res => {
          res.startDate = res.startDate ? this.customDatePipe.transform(res.startDate, 'MM-dd-yyyy') : '';
          res.endDate = res.endDate ? this.customDatePipe.transform(res.endDate, 'MM-dd-yyyy') : '';
        })
      })
      this.dataArchive = resultArray;
      return resultArray
    }, [])

  }

  async getInitialData() {
    this.spinner.show();
    // get pets pane
    this.petService.getPet(`/api/pets/getPetViewPane`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.pets = res.response.pets;
        // this.getPetDetails();
        this.getPetDetailsById();
        console.log(" this.petDetails ", this.petDetails)
        this.getListOfCurrStudies();
        this.getListOfArchStudies();
        this.selectedStudy(this.studyId);
        this.petSelected(this.petId, this.studyId);
        console.log("this.list", this.list);
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }
  studyCarousel() {

  }
  activeStudy(petStudyId) {
    this.selectedRow1 = petStudyId;
  }
  selectedStudy(studyId) {
    console.log("studyId", studyId);
    
    // this.router.navigate(['/user/patients/view', this.petId, studyId]);
    //@@@@@ router for pet charts
    this.router.navigate([`/user/patients/view/${this.petId}/${studyId}/patient-charts`]);
    // this.getPetDetails();
    this.spinner.show();
    // this.getPetDetailsById();
    this.petService.getPet(`/api/pets/getPetDetailsById/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.petDetails = res.response.petDTO;
        this.getListOfCurrStudies();
        this.getListOfArchStudies();
        // this.selectedStudy(this.studyId);
        this.reloadData();
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }

  getListOfCurrStudies() {
    this.spinner.show();
    //Get Pet details
    this.petService.getPet(`/api/pets/getCurrentStudies/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.list = res.response.petStudy;
        console.log("this.list", this.list)
        if (this.list) {
          this.studyArray(4, this.list);
        }
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }

  async getPetDetailsById() {
    this.spinner.show();
    //Get Pet details
    this.petService.getPet(`/api/pets/getPetDetailsById/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.petDetails = res.response.petDTO;
        this.isExternalPet = res.response.petDTO.isExternalPet;
        console.log("isExternalPet",this.isExternalPet);
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }
  getPetDetails() {
    this.spinner.show();
    //Get Pet details
    this.petService.getPet(`/api/pets/${this.petId}/${this.studyId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);
        this.petDetails = res.response.petDTO;
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
      this.spinner.hide();
    }, err => {
      this.spinner.hide();
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
  }

  petSelected(petId, studyId) {
    console.log("petId", petId, studyId);
    this.selectedRecordPet = petId;
    // this.selectedRecordStudy = studyId;
    this.petId = petId;
    this.studyId = studyId ? studyId : 0;
    // this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}`]);
    this.selectedStudy(this.studyId);
    this.activeStudy(this.studyId)

  }
  private async getStudy() {
    this.spinner.show();
    let res: any = await (
      this.petService.getPet('/api/study/getStudyListByUser', '').pipe(
        catchError(err => {
          this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
          return of(false);
        })
      )
    ).toPromise();
    if (res.status.success === true) {
      this.studyArr = res.response.studyList;
      this.spinner.hide();
    }
  }
  associatStudy() {
    this.addStudyForm.markAllAsTouched();
    if (this.addStudyForm.valid) {
      let form = this.addStudyForm.value;
      console.log("form",form);
      form.studyassDate = this.customDatePipe.transform(form.studyassDate, 'yyyy-MM-dd');

      let res = Object.assign({});
      res["studyId"] = form.studyId;
      res["petId"] = this.petId;
      res["externalPetInfoId"] = form.externalPet ? form.externalPet.externalPetId : '';
      res["assignedOnDate"] = form.studyassDate; 

      this.spinner.show();
      this.petService.addPet('/api/pets/associateNewStudy', res).subscribe(res => {
        if (res.status.success === true) {
          this.toastr.success('Study associated successfully!');
          this.modalRef2.close();
          this.ngOnInit();
          // this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-client-info`]);
        }
        else {
          this.toastr.error(res.errors[0].message);
        }
        this.spinner.hide();
      }, err => {
        this.spinner.hide();
        console.log(err);
        this.errorMsg(err);
      });
    }

  }
  clearStudy() {
    this.addStudyForm.controls.studyassDate.setValidators([]);
    this.addStudyForm.controls.studyassDate.updateValueAndValidity();
    this.addStudyForm.patchValue({
      'studyassDate': ''
    })
  }
  studySelected($event) {
    console.log('event', $event);
    console.log('event.isExternal', $event.isExternal);
    let selectedExternal = false;
    if($event.isExternal == 1) {
      selectedExternal = true;
    }
    console.log("isExternalPet",this.isExternalPet);
    this.addStudyForm.patchValue({
      'startDate': $event.startDate ? this.customDatePipe.transform($event.startDate, 'MM-dd-yyyy') : '',
      'endDate': $event.endDate ? this.customDatePipe.transform($event.endDate, 'MM-dd-yyyy') : '',
      'studyId': $event.studyId ? $event.studyId : ''
    })
    this.spinner.show();

    this.adduserservice.getStudy(`/api/pets/getExternalPetInfoList/${$event.studyId}`, '').subscribe(res => {
      console.log("res", res);

      let externalPetArr = [];
      let isExternal: boolean = false;
      if (res.response) {
        externalPetArr = res.response;
        isExternal = true
      }
      else {
        externalPetArr = [];
        isExternal = false
      }
      if (externalPetArr.length > 0) {
        this.addStudyForm.patchValue({
          "isExternalArr": externalPetArr,
          "isExternal": isExternal
        })
      }else{
        this.addStudyForm.patchValue({
          "isExternalArr": [],
          "isExternal": false
        })
      }

      let isExternalStudyExist = this.list.filter((v, i, a) => a.findIndex(t => (t.externalStudy === true)) === i);
        console.log("isExternalStudyExist",isExternalStudyExist);
       
      
        // && !this.isExternalPet
         // && !this.isExternalPet
        //if isExternalStudyExists length > 0 taht means externalStudy exists

        // console.log("this.isExternalPet",this.isExternalPet);
        console.log("selectedExternal",selectedExternal);
        
        if((!selectedExternal && isExternalStudyExist.length > 0 ) || (selectedExternal && isExternalStudyExist.length == 0 )) {
            this.toastr.error("A pet cannot be associated with internal and external studies simultaneously.");
            this.addStudyForm.patchValue({
              "studyName": '',
              "isExternalArr":'',
              "isExternal": false
            }); 
        }

      this.spinner.hide();
    },
      err => {
        this.spinner.hide();
        this.toastr.error('Something went wrong. Please try after sometime or contact administrator.');
      }
    );
  }
  addPet() {
    this.addStudyForm.patchValue({
      'studyName': '',
      'studyassDate': '',
      'isExternalArr': '',
      'isExternal': '',
      'externalPet': '',
      'startDate': '',
      'endDate': '',
      'studyId': ''
    });
    this.addStudyForm.markAsUntouched();
    if (this.petDetails.petStatus != "Deceased") {
      this.openPopup(this.archiveContent2, 'lg');
    }
    else {
      this.toastr.error("Cannot associate study for a deceased pet.");
    }
  }
  removeStudy() {
    this.tabService.clearDataModel();
    this.router.navigate([`/user/patients/edit-patient/${this.petId}/pet-study`]);
  }
  showTabs($event) {
    console.log("$event", $event);
    this.showTabsPage = $event.show;
    this.activeTab = $event.tabId;
  }
  back() {
    this.showTabsPage = false;
  }
  tabView() {
    this.showTabsPage = true;
  }
  cardView() {
    this.showTabsPage = false;
  }

  showPatientInfo() {
    if (this.patientInfo == true) {
      this.patientInfo = false;
    } else {
      this.patientInfo = true;
    }
  }

  showSelectPatient() {
    if (this.selectInfo == true) {
      this.selectInfo = false;
    } else {
      this.selectInfo = true;
    }
  }

  public reloadData() {
    this.showPanelist = false;
    setTimeout(() => {
      this.showPanelist = true;
    }, 1);
  }

  editPetPage() {
    this.tabService.clearDataModel();
    this.router.navigate([`/user/patients/edit-patient/${this.petId}/pet-info`]);
  }
  checkFav() {
    //check favorite
    this.lookupService.getFavInfo(`/api/favourites/isFavourite/${this.menuId}/${this.petId}`).subscribe(res => {
      if (res.response.favourite.isFavourite)
        this.isFav = true;
    });
  }
  makeFav() {
    this.spinner.show();
    this.lookupService.addasFav(`/api/favourites/${this.menuId}/${this.petId}`, {}).subscribe(res => {
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
    this.lookupService.removeFav(`/api/favourites/${this.menuId}/${this.petId}`, {}).subscribe(res => {
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
  errorMsg(err) {
    this.spinner.hide();
    if (err.status == 500) {
      this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
    }
    else {
      this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    }
  }
}
