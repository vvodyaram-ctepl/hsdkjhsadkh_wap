import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabserviceService {

  // private valueObs: BehaviorSubject < string > = new BehaviorSubject < string > (null);
   
  //   public setValue(value: string): void {
  //     this.valueObs.next(value);
  // }

  // public getValue(): Observable < string > {
  //     return this.valueObs;
  // }

  private dataModel: any;
  private dataModelOservable = new BehaviorSubject<any>(this.dataModel);
  public dataModel$ = this.dataModelOservable.asObservable();

  constructor() { }

async setModelData(data, key) {
  let obj: any = this.dataModel || {};
  obj[key] = data;
  this.dataModel = obj;
  this.dataModelOservable.next(obj);
}

getModelData() {
  return this.dataModel;
}

removeModel(key) {
  let obj: any = this.dataModel || {};
  delete obj[key];
}

clearDataModel() {
  this.dataModelOservable.next('');
  this.dataModel = '';
}

}
