import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';
import { QuesResponseService } from '../../ques-response.service';

@Component({
  selector: 'app-view-ques-reponse',
  templateUrl: './view-ques-reponse.component.html',
  styleUrls: ['./view-ques-reponse.component.scss']
})
export class ViewQuesReponseComponent implements OnInit {

  public questionnaireName:String ;
  public petParentName:String;
  public petName:String;
  public study:String;
  public submittedOn:String;
  public questionnaireResponseList:any;

  constructor(  public router: Router,
    private quesResponseService: QuesResponseService,
    private toastr: ToastrService,
    public customDatePipe: CustomDateFormatPipe,
    private activatedRoute: ActivatedRoute
    ) { }

  async ngOnInit() { 
     this.getViewData();
  }

  async getViewData() {

    await this.activatedRoute.params.subscribe(async params => {
      const questionnaireId = params.questionnaireId;
      const studyId = params.studyId;
      this.quesResponseService.getQuestionnaireVire(`/api/questionnaire/getViewQuestionnaireResponse?questionnaireId=${
        questionnaireId
      }&studyId=${
        studyId
      }`, ).subscribe(res => {
        if (res.status.success === true) {
          let questionnaireDetails = res.response.questionnaireDetails;
          this.questionnaireResponseList = res.response.questionnaireResponseList;
          console.log(res);
          this.questionnaireName = questionnaireDetails.questionnaireName
          this.petParentName =  questionnaireDetails.petParentName
          this.petName = questionnaireDetails.petName
          this.study = questionnaireDetails.studyName
          this.submittedOn = this.customDatePipe.transform(questionnaireDetails.submittedDate, 'MM/dd/yyyy'); 
        }
      });

    });
     // this.quesResponseService.getQuestionnaireVire();
  }

}
