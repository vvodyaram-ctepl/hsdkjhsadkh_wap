import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-view-patient-tabs',
  templateUrl: './view-patient-tabs.component.html',
  styleUrls: ['./view-patient-tabs.component.scss']
})
export class ViewPatientTabsComponent implements OnInit {
  @Input() activeTab: any;
  @Input() petId: any;
  @Input() studyId: any;
  public flatTabs: any[];

  constructor(public route: ActivatedRoute) { }

  ngOnInit(): void {
    this.flatTabs = [
      { tabId: 1, name: 'Weight History', link: 'patient-charts', property: 'patientCharts' },
      { tabId: 2, name: 'Pet Parent Info', link: 'patient-client-info', property: 'patientClientInfo' },
      { tabId: 3, name: 'Asset Details', link: 'patient-device-details', property: 'patientDeviceDetails' },
      { tabId: 4, name: 'Notes', link: 'patient-notes', property: 'patientNotes' },
      { tabId: 5, name: 'Campaign Points', link: 'campaign-points', property: 'campaignPoints' },
      { tabId: 6, name: 'Observations', link: 'patient-observations', property: 'patientObservations' },
    ];

    this.activeTab = { tabId: 1, name: 'Weight History', link: 'patient-charts', property: 'patientCharts' };
    this.activateTab(this.activeTab);
  }

  public activateTab(activeTab) {
    console.log("activeTabb", activeTab)
    this.flatTabs.forEach(flatTag => {
      if (flatTag.tabId == activeTab.tabId) {
        flatTag.active = true;
      } else {
        flatTag.active = false;
      }
    });
  }

}
