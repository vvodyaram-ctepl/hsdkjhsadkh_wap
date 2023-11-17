import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PetService } from '../../pet.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-patient-observations',
  templateUrl: './patient-observations.component.html',
  styleUrls: ['./patient-observations.component.scss']
})
export class PatientObservationsComponent implements OnInit {
  petId: any;
  studyId: any;
  petObservations: any = [];
  constructor(
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
    // Get pet observations
    this.petService.getPet(`/api/pets/${this.petId}/${this.studyId}/getPetObservations`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petObservations = res.response.petObservations;
        this.spinner.hide();
      }
      else {
        this.toastr.error(res.errors[0].message);
        this.spinner.hide();
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error(err.error.errors[0] ?.message || 'Something went wrong. Please try after sometime or contact administrator.');
    });
  }

  patientObservationsList() {
    this.router.navigate([`/user/patients/patient-observations-info/${this.petId}/${this.studyId}`]);
  }

}
