import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/util/login.service';
import { ToastrService } from 'ngx-toastr';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { HttpParams } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loginService: LoginService,
    private toastr: ToastrService,
    private userDataService: UserDataService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.userDataService.unsetUserData();
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  public login(): void {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      this.spinner.show();
      console.log("this.loginForm.value", this.loginForm.value);
      const body = new HttpParams()
        .set('username', this.loginForm.value.username)
        .set('password', this.loginForm.value.password)
        .set('grant_type', 'password');
      this.loginService.userAuthentication('/oauth/token', body).subscribe(res => {
        if (res.access_token) {
          this.spinner.hide();
          this.userDataService.setToken(res.access_token, res.refresh_token, res.userId);
          this.userDataService.setUserData({ userId: res.userId, userName: res.username });
          this.userDataService.setUserDetails(res.userName, res.roleName, res.email, res.fullName);
          this.userDataService.setRoleDetails(res.rolePermissions);
          // firstName: res.firstName, lastName: res.lastName, status: res.status
        }
        if (res.needChangePwd)
          this.router.navigate(['/auth/updatePassword']);
        else {
          /* Hardcoded to show only analytical reports --start */
          // this.router.navigate(['/user/dashboard']);
          this.router.navigate(['user/reports']);
          /* Hardcoded to show only analytical reports --end */
        }
        this.loginService.loginAuditLog().subscribe();

        // if (res.roleId === 5) {
        //   this.logout();
        //   this.toastr.error('Invalid username or password');
        //   return;
        // }
        // if (res.status === 1) {
        //   this.router.navigate(['/user/dashboard']);
        // }
        // else {
        //   this.router.navigate(['/auth/updatePassword']);
        // }
      }, err => {
        this.spinner.hide();
        console.log(err);
        this.toastr.error(err.error?.error_description || err.error?.error || 'Something went wrong. Please try after sometime or contact administrator.!');
      });
    }
  }

  public logout(): void {
    if (this.userDataService.getUserId()) {
      this.loginService.userLogOut(`/api/users/logout?userId=${this.userDataService.getUserId()}`).subscribe(res => {
        if (res.status.success === true) {
          this.router.navigate(['/']);
          this.userDataService.unsetUserData();
        }
        else {
          this.toastr.error(res.errors[0].message);
        }
      }, err => {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
      });
    }
    else {
      this.router.navigate(['/']);
      this.userDataService.unsetUserData();
    }
  }

}
