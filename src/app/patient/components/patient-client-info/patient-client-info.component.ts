import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../pet.service';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-patient-client-info',
  templateUrl: './patient-client-info.component.html',
  styleUrls: ['./patient-client-info.component.scss']
})
export class PatientClientInfoComponent implements OnInit {

  petId: any;
  studyId: any;
  petParents: any = [];

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
    //  Get Pet Parents
    this.petService.getPet(`/api/pets/${this.petId}/getPetParents`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petParents = res.response.rows;
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
