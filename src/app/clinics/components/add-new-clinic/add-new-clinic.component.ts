import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabserviceService } from 'src/app/shared/tabservice.service';
import { ClinicService } from '../clinic.service';
import * as $ from 'jquery';

@Component({
  selector: 'app-add-new-clinic',
  templateUrl: './add-new-clinic.component.html',
  styleUrls: ['./add-new-clinic.component.scss']
})
export class AddNewClinicComponent implements OnInit {

  @Input() editFlag: boolean = false;
  public flatTabs: any[];
  subscription: any;
  isExternal: string;
  // public permissions:any = {
  //   basicDetails : true,
  //   addPlan:true
  // };

  constructor(public route: ActivatedRoute,
    private tabService: TabserviceService,
    private clinicService:ClinicService) {
      let data1 = this.clinicService.getModelData() ? this.clinicService.getModelData() : {};
      console.log("data1",data1)
     }

  ngOnInit() {

    window.addEventListener("isAmCliniClicked", (event) => {
      console.log("deviiii");
     let external = localStorage.getItem('external');
     console.log("external",external);
     this.isExternal = external;
     });
     if (!this.editFlag) {
      this.flatTabs = [{ tabId: 1, name: 'Basic Details', link: 'basic-details', property: 'basicDetails',show:true },
      { tabId: 2, name: 'Plans', link: 'add-plans', property: 'addPlan',show:true },
      { tabId: 3, name: 'Notes', link: 'add-notes', property: 'addNotes',show:true },
      { tabId: 4, name: 'Mobile App Config', link: 'mobile-app-config', property: 'mobileApp',show:true },
      { tabId: 5, name: 'Questionnaire', link: 'questionnaire', property: 'questionnaire',show:true },
     /*  { tabId: 6, name: 'Prelude Config', link: 'prelude-config', property: 'preludeConfig',show:false } */
      ];
    }
    else {
      this.flatTabs = [{ tabId: 1, name: 'Basic Details', link: 'basic-details', property: 'addbasicDetails',show:true },
      { tabId: 2, name: 'Plans', link: 'add-plans', property: 'addPlans',show:true},
      { tabId: 3, name: 'Notes', link: 'view-notes', property: 'viewNotes',show:true },
      { tabId: 4, name: 'Mobile App Config', link: 'mobile-app-config', property: 'mobileApp',show:true },
      { tabId: 5, name: 'Questionnaire', link: 'questionnaire', property: 'questionnaire',show:true },
      { tabId: 6, name: 'Prelude Config', link: 'prelude-config', property: 'preludeConfig',show:false }
      ];
    }
    // this.activateTab({ tabId: 1, name: 'Basic Details', link: 'basic-details', property: 'addbasicDetails',show:true })
    
    // this.tabService.dataModel$.subscribe(res => {
    //   console.log(res);
    //   if(res) {
    //    Object.keys(res).forEach((ele,index) => {

    //   this.permissions[ele] = true;
    //   this.permissions[this.flatTabs[index + 2].property] = true;
    //   this.flatTabs.forEach(ele => {
    //     Object.keys(this.permissions).forEach(rEle => {
    //       if(ele.property == rEle) {
    //       ele.disable = true;
    //       } 
    //     })

    //   })
    //   console.log("this.flatTabs",this.flatTabs,index,index + 2,this.flatTabs[index + 2].property);

    //    })
    //   }
    // })

    window.addEventListener("isAmCliniClicked", (event) => {
     let external = localStorage.getItem('external');
     this.isExternal = external;
     this.flatTabs.forEach(ele => {
     
       if(ele.tabId == 6) { 
        if(this.isExternal == "true") {
          ele.show  = true;
          $("li:last").prev("li").removeClass("last-ele");
        }
        else {
          ele.show  = false
          $("li:last").prev("li").addClass("last-ele");
        }
       }
     })
     });
   
  }

  public activateTab(activeTab) {
    this.flatTabs.forEach(flatTag => {
      if (flatTag.tabId == activeTab.tabId) {
        flatTag.active = true;
      } else {
        flatTag.active = false;
      }
    });
    let data = this.clinicService.getModelData() ? this.clinicService.getModelData() : {}
    console.log("devv", data);
  }

  ngOnChanges() {
    console.log("ngOnChanges"); 

    window.addEventListener("isAmCliniClicked", (event) => {
      console.log("deviiii");
     let external = localStorage.getItem('external');
     console.log("external",external);
     this.isExternal = external;
     this.flatTabs.forEach(ele => {
     
       if(ele.tabId == 6) { 
        if(this.isExternal == "true") {
          ele.show  = true;
          $("li:last").prev("li").removeClass("last-ele");
        }
        else {
          ele.show  = false
          $("li:last").prev("li").addClass("last-ele");
        }
       }
     })
     });
     if (!this.editFlag) {
      this.flatTabs = [{ tabId: 1, name: 'Basic Details', link: 'basic-details', property: 'basicDetails',show:true },
      { tabId: 2, name: 'Plans', link: 'add-plans', property: 'addPlan',show:true },
      { tabId: 3, name: 'Notes', link: 'add-notes', property: 'addNotes',show:true },
      { tabId: 4, name: 'Mobile App Config', link: 'mobile-app-config', property: 'mobileApp',show:true },
      { tabId: 5, name: 'Questionnaire', link: 'questionnaire', property: 'questionnaire',show:true },
      /* { tabId: 6, name: 'Prelude Config', link: 'prelude-config', property: 'preludeConfig',show:false } */
      ];
    }
    else {
      this.flatTabs = [{ tabId: 1, name: 'Basic Details', link: 'basic-details', property: 'addbasicDetails',show:true },
      { tabId: 2, name: 'Plans', link: 'add-plans', property: 'addPlans',show:true},
      { tabId: 3, name: 'Notes', link: 'view-notes', property: 'viewNotes',show:true },
      { tabId: 4, name: 'Mobile App Config', link: 'mobile-app-config', property: 'mobileApp',show:true },
      { tabId: 5, name: 'Questionnaire', link: 'questionnaire', property: 'questionnaire',show:true },
      { tabId: 6, name: 'Prelude Config', link: 'prelude-config', property: 'preludeConfig',show:false }
      ];
    }
  //   document.addEventListener('storage', (e) => {  
  //     console.log("storageee",e)
  //     // if(e.key === 'theyKeyYouWant') {
  //     //    // Do whatever you want
  //     // }
  // });
  }
  NgbNavOutlet($event) {
    console.log("NgbNavOutlet");
  }
  navChange($event) {
    console.log("navChange");
  }

  notifyChild() {
    console.log("sdhjd");

  }
}
