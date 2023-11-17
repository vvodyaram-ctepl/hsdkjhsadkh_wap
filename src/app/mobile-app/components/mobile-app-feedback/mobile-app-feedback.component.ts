import { Component, OnInit } from '@angular/core';
import { CustomDateFormatPipe } from 'src/app/pipes/custom-date-format.pipe';

@Component({
  selector: 'app-mobile-app-feedback',
  templateUrl: './mobile-app-feedback.component.html',
  styleUrls: ['./mobile-app-feedback.component.scss']
})
export class MobileAppFeedbackComponent implements OnInit {

  headers: any;
  filterTypeArr: any[];
  constructor(
    public customDatePipe: CustomDateFormatPipe
  ) { }

  
ngOnInit() {
    this.headers = this.getHeaders();
    this.filterTypeArr =
      [ 
      {
        name: "Phone Model",
        id: "phoneModel"
      },
      {
        name: "Page",
        id: "feedbackPage"
      },
      {
        name: "Feedback Date Between",
        id: "dateType"
      }
    
      ];
  }


  getHeaders() {
    return [
      { key: "petName", label: "Pet Name", checked: true },
      { key: "petOwnerName", label: "Pet Parent Name", checked: true },      
      { key: "feedbackDate", label: "FeedBack Date", checked: true },
      { key: "pageName", label: "Page", checked: true },
      { key: "deviceType", label: "Phone Model", checked: true },
      { key: "feedback", label: "FeedBack", checked: true, width: 300 }
    ];
  }

  formatter($event) {
    $event.forEach(ele => {
      ele.feedbackDate = this.customDatePipe.transform(ele.feedbackDate, 'MM/dd/yyyy');
    })
  }

}
