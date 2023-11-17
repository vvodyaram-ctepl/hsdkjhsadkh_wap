import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { ChartType } from 'chart.js';
import { MultiDataSet, Label, Color } from 'ng2-charts';
import { ChartOptions, ChartDataSets } from 'chart.js';
import { PetService } from '../../pet.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import * as moment from 'moment';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from 'src/app/components/validation-message/validation.service';
import { TabserviceService } from 'src/app/shared/tabservice.service';
@Component({
  selector: 'app-patient-charts',
  templateUrl: './patient-charts.component.html',
  styleUrls: ['./patient-charts.component.scss']
})
export class PatientChartsComponent implements OnInit {
  petId: any;
  studyId: any;
  petCharts: any = [];
  weightArr: any = [];
  toDateMinDate: any;
  watchHistoryForm: FormGroup;
  public fromDate: any = moment().format('MM-DD-YYYY');
  public toDate: any = moment().format('MM-DD-YYYY');

  @ViewChild('archiveContent') archiveContent: ElementRef;
  modalRef2: NgbModalRef;

  //bar chart

  public barChartOptions: any;
  public barChartLabels: Label[] = [];
  // ['TUE SEP 01', 'TUE SEP 02', 'TUE SEP 03', 'TUE SEP 04', 'TUE SEP 05', 'TUE SEP 06', 'TUE SEP 07', 'TUE SEP 08'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    // { data: this.weightArr, label: 'Series A' },
    // { data: [28, 48, 40, 19, 86, 27, 90, 40], label: 'Weight' }
  ];

  public barChartColors: Color[] = [
    { backgroundColor: '#F9B805' },
    { backgroundColor: '#F9B805' },
  ]
  currentDate: string = '';


  constructor(
    private petService: PetService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public router: Router,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private customDatePipe: CustomDateFormatPipe,
    private modalService: NgbModal,
    private customDatepipe: CustomDateFormatPipe,
    private tabService:TabserviceService
  ) { 
    this.watchHistoryForm = this.fb.group({
      date: ['',Validators.required],
      weight: ['',[Validators.required,ValidationService.decimalValidatorWithValue]],
      weightUnits: ['']
    })
  }

  ngOnInit(): void {
    // this.spinner.show();
    this.currentDate = moment().format("MM-DD-YYYY");
    // this.buildForm();
    this.activatedRoute.params.subscribe(async params => {
      let str = this.router.url;
      this.petId = str.split("view/")[1].split("/")[0];
      this.studyId = str.split("view/")[1].split("/")[1];
    })

    this.getInitialData(this.fromDate, this.toDate);
    this.loadOptions();
    this.watchHistoryForm.patchValue({
      weightUnits: 'LBS',
    });
  }
  onDateSelect($event) {
    if (moment(this.toDate) < moment(this.fromDate)) {
      this.toDate = '';

    }
  }

  reset() {
    this.watchHistoryForm.reset();
    this.watchHistoryForm.patchValue({
      weightUnits: 'LBS',
    });
  }
 
  openWHPopup() {
    this.openPopup(this.archiveContent, 'xs');
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

  addWatchHistory() {
    if (!this.watchHistoryForm.valid) {
      this.watchHistoryForm.markAllAsTouched();
      return false;
    }
    let res = Object.assign({});
    //   res.date = this.watchHistoryForm.value.date;
    res.addDate = this.watchHistoryForm.value.date ?
      this.customDatepipe.transform(this.watchHistoryForm.value.date, 'yyyy-MM-dd') : '';
    res.petId = this.petId;
    res.weight = this.watchHistoryForm.value.weight;
    res.weightUnit = this.watchHistoryForm.value.weightUnits;

    this.petService.addPet('/api/pets/addWeight', res).subscribe(res => {
      if (res.status.success === true) {
        this.toastr.success('Weight History added successfully!');
        //get pet dteils service call
        let evt = document.createEvent("Event");
          evt.initEvent("isAmMedicationClicked", true, true);
          window.dispatchEvent(evt);
          
        this.ngOnInit();
        this.watchHistoryForm.markAsPristine();
        this.modalRef2.close();
        this.watchHistoryForm.reset();
        this.watchHistoryForm.patchValue({
          weightUnits: 'LBS',
        });
      }
      else {
        this.toastr.error(res.errors[0].message);
        this.modalRef2.close();
      }
    }, err => {
      this.modalRef2.close();
      this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
    });
  }

  loadOptions() {
    this.barChartOptions = {
      // responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: 'index',
        intersect: true,
        callbacks: {
          label: (tooltipItem, data) => {
            return 'Weight :' + ' ' + this.barChartData[0]['data'][tooltipItem.index] + " LBS";
          }
        }
      },
      scales: {
        yAxes: [{
          ticks: { min: 0 },
          scaleLabel: {
            display: true,
            labelString: 'Weight'
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Recorded Date'
          }
        }],
      }
    };
  }

  getInitialData(fromDate, toDate) {
    this.spinner.show();
    // this.petService.getPet(`/api/pets/weightHistory/${this.petId}`, '').subscribe
    fromDate = this.customDatePipe.transform(fromDate, 'yyyy-MM-dd');
    toDate = this.customDatePipe.transform(toDate, 'yyyy-MM-dd');
    this.petService.getViewBCScoreHistory(this.petId, fromDate, toDate).subscribe
      (res => {
        if (res.status.success === true) {
          this.petCharts = res.response.weightList;
          let dateArr = [];
          let weightArr = [];
          this.petCharts.forEach(ele => {
            dateArr.push(this.customDatePipe.transform(ele.addDate, 'MM/dd/yyyy'));
            weightArr.push(ele.weight);
          });
          this.barChartLabels = dateArr;
          // this.barChartData['data'] = weightArr;
          this.barChartData = [{ data: weightArr, label: 'Weight' }];
          console.log("this.barChartData['data']", this.barChartData[0]['data'])
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

}

