import { Component, OnInit, Output, EventEmitter, Input, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { PetService } from '../../pet.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-patient-cards',
  templateUrl: './view-patient-cards.component.html',
  styleUrls: ['./view-patient-cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewPatientCardsComponent implements OnInit {
  @Output() showTabs = new EventEmitter();
  @Input() petId: any;
  @Input() studyId: any;
  petParents: any;
  petDevices: any;
  petNotes: any;
  petObservations: any;
  externalPetArr: any;
  // pagination: any = {
  //pagination for pet parent info
  parentPage = 1;
  parentpageSize = 1;
  //pagination for devices
  devPage = 1;
  devpageSize = 1;
  petCampaignPoints: any;
  // };
  constructor(
    public router: Router,
    private userDataService: UserDataService,
    private petService: PetService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getInitialData();
    this.spinner.hide();
  }

  addNotesPage() {
    this.router.navigate([`/user/patients/pet-notes-info/${this.petId}/${this.studyId}`]);
  }

  tabsView($event) {
    console.log("$event", $event);
    let res = Object.assign({});
    res.show = true;
    if ($event == 'petparentInfo') {
      res.tab = 'petparentInfo'
      res.tabId = 1;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-client-info`]);
    }
    else if ($event == 'devices') {
      res.tab = 'devices'
      res.tabId = 2;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-device-details`]);
    }
    else if ($event == 'reports') {
      res.tab = 'reports'
      res.tabId = 3;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-charts`]);
    }
    else if ($event == 'observations') {
      res.tab = 'observations'
      res.tabId = 3;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-observations`]);
    }
    else if ($event == 'notes') {
      res.tab = 'notes'
      res.tabId = 4;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/patient-notes`]);
    }
    else if ($event == 'campaign') {
      res.tab = 'campaign'
      res.tabId = 4;
      this.showTabs.emit(res);
      this.router.navigate([`/user/patients/view/${this.petId}/${this.studyId}/campaign-points`]);
    }
  }

  getInitialData() {
    this.spinner.show();
    //  Get Pet Parents
    this.petService.getPet(`/api/pets/getPetDetailsById/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        console.log(res);

        this.petParents = res.response.petDTO.petParents;
        // Get Notes
        this.petNotes = res.response.petDTO.petNotes;
        console.log("this.petParents", this.petParents);
        console.log("this.petNotes", this.petNotes);
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
    }, err => {
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });
    //  Get Asset details
    this.petService.getPet(`/api/pets/getPetDevicesByStudy/${this.petId}/${this.studyId}`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petDevices = res.response.petDevices;
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
    }, err => {
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });

    // Get pet observations
    this.petService.getPet(`/api/pets/${this.petId}/${this.studyId}/getPetObservations`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petObservations = res.response.petObservations;
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
    }, err => {
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });

    //get campaign points
    this.petService.getPet(`/api/pets/getPetCampaignPoints/${this.petId}`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petCampaignPoints = res.response;
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
    }, err => {
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });



    this.petService.getPet(`/api/pets/getExternalPetInfo?petId=${this.petId}&studyId=${this.studyId}`, '').subscribe(res => {
      if (res.status.success === true) {
        this.externalPetArr = res.response.externalPetInfoListDTOList;
      }
      else {
        this.toastr.error(res.errors[0].message);
      }
    }, err => {
      if (err.status == 500) {
        this.toastr.error(err.error.message + ". " + "Please try after sometime or contact administrator.");
      }
      else {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.');
      }
    });

  }

}
