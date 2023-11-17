import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PetService } from '../../pet.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-patient-device-details',
  templateUrl: './patient-device-details.component.html',
  styleUrls: ['./patient-device-details.component.scss']
})
export class PatientDeviceDetailsComponent implements OnInit {
  petId: any;
  studyId: any;
  petDevices: any = [];

  constructor(
    private userDataService: UserDataService,
    private petService: PetService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.spinner.show();
    this.activatedRoute.params.subscribe(async params => {
      let str = this.router.url;
      this.petId = str.split("view/")[1].split("/")[0];
      this.studyId = str.split("view/")[1].split("/")[1];
    })

    this.getInitialData();
  }
  getInitialData() {
    this.petService.getPet(`/api/pets/getPetDevicesByStudy/${this.petId}/${this.studyId}`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petDevices = res.response.petDevices;
        this.spinner.hide();
      }
      else {
        this.toastr.error(res.errors[0].message);
        this.spinner.hide();
      }
    }, err => {
      this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    });
  }
}
