import { Component, OnInit } from '@angular/core';
import { PetService } from '../../pet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-patient-notes',
  templateUrl: './patient-notes.component.html',
  styleUrls: ['./patient-notes.component.scss']
})
export class PatientNotesComponent implements OnInit {

  petId: any;
  studyId: any;
  petNotes: any = [];

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
    //   Get Notes
    this.petService.getPet(`/api/pets/${this.petId}/getPetNotes`, '').subscribe(res => {
      if (res.status.success === true) {
        this.petNotes = res.response.petNotes;
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

  addNotesPage() {
    this.router.navigate([`/user/patients/pet-notes-info/${this.petId}/${this.studyId}`]);
  }

}
