import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClinicsRoutingModule } from './clinics-routing.module';
import { ListClinicComponent } from './components/list-clinic/list-clinic.component';
import { AddNewClinicComponent } from './components/add-new-clinic/add-new-clinic.component';
import { ViewClinicComponent } from './components/view-clinic/view-clinic.component';
import { ClinicalNotificationsComponent } from './components/clinical-notifications/clinical-notifications.component';
import { SharedModule } from '../shared/shared.module';
import { NgbModule, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { BasicDetailsComponent } from './components/basic-details/basic-details.component';
import { AddPlansComponent } from './components/add-plans/add-plans.component';
import { AddSubClinicsComponent } from './components/add-sub-clinics/add-sub-clinics.component';
import { AddContactsComponent } from './components/add-contacts/add-contacts.component';
import { AddNotesComponent } from './components/add-notes/add-notes.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ViewPlansComponent } from './components/view-plans/view-plans.component';
import { ViewActivityComponent } from './components/view-activity/view-activity.component';
import { EditClinicComponent } from './components/edit-clinic/edit-clinic.component';
import { MobileAppConfigComponent } from './components/mobile-app-config/mobile-app-config.component';
import { ValidationMessageComponent } from 'projects/validation-message/src/public-api';
import { ViewAssociatedPetsComponent } from './components/view-associated-pets/view-associated-pets.component';
import { ViewNotesComponent } from './components/view-notes/view-notes.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { ViewStudyQuestionnaireComponent } from './components/view-study-questionnaire/view-study-questionnaire.component';
import { PreludeConfigComponent } from './components/prelude-config/prelude-config.component';
import { ViewPreludeConfigComponent } from './components/view-prelude-config/view-prelude-config.component';

@NgModule({
  declarations: [ListClinicComponent, AddNewClinicComponent, ViewClinicComponent, ClinicalNotificationsComponent, BasicDetailsComponent, AddPlansComponent, AddSubClinicsComponent, AddContactsComponent, AddNotesComponent, ViewPlansComponent, ViewActivityComponent, EditClinicComponent, MobileAppConfigComponent, ViewAssociatedPetsComponent, ViewNotesComponent, QuestionnaireComponent, ViewStudyQuestionnaireComponent, PreludeConfigComponent, ViewPreludeConfigComponent],
  imports: [
    CommonModule,
    ClinicsRoutingModule,
    SharedModule,
    NgbModule,
    NgbNavModule,
    NgMultiSelectDropDownModule.forRoot(),

  ],
  exports: [
    CommonModule,
    SharedModule,
    NgbModule,
    NgbNavModule
  ]
})
export class ClinicsModule { }
