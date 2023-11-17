import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService extends BaseService {

  public userAuthentication(url: string, data): Observable<any> {
    return this.post(url, data);
  }

  public refreshToken(url: string, data): Observable<any> {
    return this.post(url, data);
  }

  public userLogOut(url: string): Observable<any> {
    return this.post(url, {});
  }

  public forgotPwd(url: string): Observable<any> {
    return this.put(url, {});
  }

  public updatePassword(url: string, data): Observable<any> {
    return this.put(url, data);
  }

  public getUserDetails(url: string): Observable<any> {
    return this.get(url);
  }

  public loginAuditLog(): Observable<any> {
    return this.post('/api/users/loginSuccess', {});
  }
}
