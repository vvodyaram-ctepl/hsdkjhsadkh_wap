import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';
import { UserDataService } from 'src/app/services/util/user-data.service';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from 'src/app/services/util/login.service';
import { Router } from '@angular/router';
import { NgbModalRef, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';

declare var $: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  title = 'wearables';
  screenHeight: number;
  modalRef2: NgbModalRef;
  //public config: PerfectScrollbarConfigInterface = {};

  public innerWidth: any;
  public defaultSidebar: any;
  public showMobileMenu = true;
  public expandLogo = false;
  public sidebartype = 'full';
  userProfileData: any;
  @ViewChild('archiveContent') archiveContent: ElementRef;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private userDataService: UserDataService,
    private modalService: NgbModal,
    private spinner: NgxSpinnerService
  ) {
  }

  ngOnInit() {
    //  this.loadMenus();
    this.defaultSidebar = this.sidebartype;
    this.handleSidebar();
    this.userProfileData = this.userDataService.getUserDetails();
    console.log("userdataservice resss", this.userProfileData);

  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.handleSidebar();
  }

  myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
  }

  handleSidebar() {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1170) {
      this.sidebartype = 'mini-sidebar';
      $('#main-wrapper').addClass('smallMenu');
    } else {
      this.sidebartype = this.defaultSidebar;
      $('#main-wrapper').removeClass('smallMenu');
    }
  }


  toggleSidebarType() {
    switch (this.sidebartype) {
      case 'full':
        this.sidebartype = 'mini-sidebar';
        $('#main-wrapper').addClass('smallMenu');
        break;

      case 'mini-sidebar':
        this.sidebartype = 'full';
        $('#main-wrapper').removeClass('smallMenu');
        break;
      default:
    }
  }


  Logo() {
    this.expandLogo = !this.expandLogo;
  }

  openPopup(div, size) {
    console.log('div :::: ', div);
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

  enable() {
    this.spinner.show();
    if (this.userDataService.getUserId()) {
      this.loginService.userLogOut(`/api/users/logout?userId=${this.userDataService.getUserId()}`).subscribe(res => {
        if (res.status.success === true) {
          this.router.navigate(['/']);
          this.userDataService.unsetUserData();
          this.modalRef2.close();
        }
        else {
          this.toastr.error(res.errors[0].message);
        }
        this.modalRef2.close();
        this.spinner.hide();
      }, err => {
        this.toastr.error(err.error.errors[0]?.message || 'Something went wrong. Please try after sometime or contact administrator.!');
        this.modalRef2.close();
        this.spinner.hide();
      });
    }
    else {
      this.router.navigate(['/']);
      this.userDataService.unsetUserData();
    }
  }

  logout() {
    this.openPopup(this.archiveContent, 'xs');
  }
  changePwd() {
    document.getElementById("myDropdown").classList.remove("show");
    document.getElementById("myDropdown").classList.add("hide");
  }
}
