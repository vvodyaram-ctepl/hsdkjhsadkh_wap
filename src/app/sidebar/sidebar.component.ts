import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ROUTES } from './menu-items';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { UserDataService } from '../services/util/user-data.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']

})
export class SidebarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() closeMobileMenu = new EventEmitter<void>();
  showMenu = '';
  showSubMenu = '';
  menus: { rolePermissions: any; };
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userDataService: UserDataService
  ) {

  }
  public sidebarnavItems: any[];
  // this is for the open close
  addExpandClass(element: any, sub) {
    this.sidebarnavItems.forEach(ele => {
      // ele.showMenu = false;
      if (ele.title == element && ele.showMenu) {
        ele.showMenu = false;
      }
      else if (ele.title == element && !ele.showMenu) {
        ele.showMenu = true;
      }
      else {
        ele.showMenu = false;
      }
    });
    if (window.innerWidth < 768 && !sub)
      this.closeMobileMenu.emit();
  }



  // End open close
  ngOnInit() {
    let newArr: any = [];
    this.menus = this.userDataService.getRoleDetails();
    this.menus.rolePermissions.forEach((ele, index) => {
      if (index === 0) {
        let subItems = this.menus.rolePermissions.filter(menu => {
          if (menu.parentMenuId === ele.parentMenuId) {
            return {
              menuId: ele.menuId,
              menuName: ele.menuName,
              menuActionName: '',
              menuCheck: false
            }
          }
        });
        newArr.push({ parentMenuId: ele.parentMenuId, parentMenuName: ele.parentMenuName, subMenu: subItems });
        return;
      }
      let isDup = false;
      newArr.forEach((ele1, i) => {
        if (ele.parentMenuId === ele1.parentMenuId)
          isDup = true;
        if (i === newArr.length - 1 && !isDup) {
          let subItems = this.menus.rolePermissions.filter(menu => {
            if (menu.parentMenuId === ele.parentMenuId) {
              return {
                menuId: ele.menuId,
                menuName: ele.menuName,
                menuActionName: '',
                menuCheck: false
              }
            }
          });
          newArr.push({ parentMenuId: ele.parentMenuId, parentMenuName: ele.parentMenuName, subMenu: subItems });
        }
      });
    });

    this.sidebarnavItems = newArr.filter(sidebarnavItem => sidebarnavItem);

    /* Hardcoded to show only analytical reports, menu id 18 is portal reports which shouldn't be shown  --start */
    this.sidebarnavItems = (newArr.filter(sidebarnavItem => sidebarnavItem.parentMenuId === 28)[0].subMenu).filter(submenu => submenu.menuId != 18);
    /* Hardcoded to show only analytical reports, menu id 18 is portal reports which shouldn't be shown --end */

    this.sidebarnavItems.forEach(ele => {
      ele['showMenu'] = false
      ele['title'] = ele.parentMenuName;
      ele['class'] = '';

      if (ele.parentMenuId == 1) {
        ele['path'] = "/user/dashboard";
        ele['icon'] = "favourites";
        ele['class'] = ''
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
        })
      }
      if (ele.parentMenuId == 2) {
        ele['icon'] = "studyManagement"
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 10) {
              res['path'] = "/user/plans";
              res['icon'] = "plans1";
              res['class'] = ''
            }
            if (res.menuId == 11) {
              res['path'] = "/user/clinics";
              res['icon'] = "study";
              res['class'] = ''
            }
            if (res.menuId == 12) {
              res['path'] = "/user/clinical-notification";
              res['icon'] = "studyNotification";
              res['class'] = ''
            }
            if (res.menuId == 13) {
              res['path'] = "/user/mobile-app/onboarding";
              res['icon'] = "selfOnBoarding";
              res['class'] = ''
            }
          }
        })
      }
      if (ele.parentMenuId == 3) {
        ele['icon'] = "petManagement";
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 14) {
              res['path'] = "/user/patients";
              res['icon'] = "pets";
              res['class'] = ''
            }
            if (res.menuId == 15) {
              res['path'] = "/user/petparent";
              res['icon'] = "petParents";
              res['class'] = ''
            }
            if (res.menuId == 27) {
              res['path'] = "/user/observations/patient-observations-info";
              res['icon'] = "media-player";
              res['class'] = ''
            }

          }
        })
      }
      if (ele.parentMenuId == 4) {
        ele['icon'] = "assets1";
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 16) {
              res['path'] = "/user/assets/dashboard";
              res['icon'] = "assetDashboard";
              res['class'] = ''
            }
            if (res.menuId == 17) {
              res['path'] = "/user/assets/management";
              res['icon'] = "assetManagement";
              res['class'] = ''
            }
            if (res.menuId == 18) {
              res['path'] = "/user/assets/reports";
              res['icon'] = "assetReports";
              res['class'] = ''
            }
            if (res.menuId == 19) {
              res['path'] = "/user/assets/device-information";
              res['icon'] = "assetDeviceInfo2";
              res['class'] = ''
            }
            if (res.menuId == 20) {
              res['path'] = "/user/assets/firmware-version";
              res['icon'] = "assetManageFw";
              res['class'] = ''
            }
          }
        })
      }
      if (ele.parentMenuId == 5) {
        ele['icon'] = "mobileApp";
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 21) {
              res['path'] = "/user/point-tracking";
              res['icon'] = "pointTracker";
              res['class'] = ''
            }
            if (res.menuId == 22) {
              res['path'] = "/user/mobile-app/feedback";
              res['icon'] = "feedback";
              res['class'] = ''
            }
            if (res.menuId == 33) {
              res['path'] = "/user/mobile-app/timer";
              res['icon'] = "timerNew";
              res['class'] = ''
            }
          }
        })
      }
      if (ele.parentMenuId == 6) {
        ele['icon'] = "userManagemnt";
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 23) {
              res['path'] = "/user/roles";
              res['icon'] = "roleMenu";
              res['class'] = ''
            }
            if (res.menuId == 24) {
              res['path'] = "/user/clinical-user";
              res['icon'] = "users";
              res['class'] = ''
            }
          }
        })
      }
      if (ele.parentMenuId == 7) {
        ele['path'] = "";
        ele['icon'] = "support";
        ele['class'] = ''
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
        })
      }
      if (ele.parentMenuId == 8) {
        ele['icon'] = "questionnaire";
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 26) {
              res['path'] = "/user/questionnaire";
              res['icon'] = "questionnaire";
              res['class'] = '';
            }
            if (res.menuId == 25) {
              res['path'] = "/user/responses";
              res['icon'] = "qResponse";
              res['class'] = '';
            }
          }
        })
      }
      if (ele.parentMenuId == 9) {
        ele['path'] = "/user/audit";
        ele['icon'] = "audit";
        ele['class'] = '';
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
        })
      }
      if (ele.parentMenuId == 18) {
        ele['path'] = "/user/assets/reports";
        ele['icon'] = "assetReports";
        ele['class'] = '';
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
        })
      }
      if (ele.parentMenuId == 28) {
        ele['icon'] = "analytical-report";
        /* Hardcoded to show only analytical reports --start */
        /* 
        ele.subMenu.forEach(res => {
          res['title'] = res.menuName;
          if (res.menuId == ele.parentMenuId) {
            ele.subMenu = [];
          }
          else {
            if (res.menuId == 29) {
              res['path'] = "/user/reports/manage-reports";
              res['icon'] = "assetReports";
              res['class'] = '';
            }
            if (res.menuId == 30 || res.menuId == 31) {
              res['path'] = `/user/reports/analytics/${res.menuId}`;
              res['icon'] = "assetReports";
              res['class'] = '';
            }
            if (res.menuId == 32) {
              res['path'] = `/user/reports/prelude-report`;
              res['icon'] = "assetReports";
              res['class'] = '';
            }
          }
        }) */

        ele['title'] = ele.menuName;
        ele['subMenu'] = [];

        if (ele.menuId == ele.parentMenuId) {
          ele.subMenu = [];
        }
        else {
          if (ele.menuId == 29) {
            ele['path'] = "/user/reports/manage-reports";
            ele['icon'] = "manage-report";
            ele['class'] = '';
          }
          if (ele.menuId == 30) {
            ele['path'] = `/user/reports/analytics/${ele.menuId}`;
            ele['icon'] = "activeRepo";
            ele['class'] = '';
          }
          if (ele.menuId == 31) {
            ele['path'] = `/user/reports/analytics/${ele.menuId}`;
            ele['icon'] = "operationalRepo";
            ele['class'] = '';
          }
          if (ele.menuId == 32) {
            ele['path'] = `/user/reports/prelude-report`;
            ele['icon'] = "preludeRepo";
            ele['class'] = '';
          }
          if (ele.menuId == 41) {
            ele['path'] = `/user/reports/analytics/${ele.menuId}`;
            ele['icon'] = "activity-factor-repo";
            ele['class'] = '';
          }
        }

        /* Hardcoded to show only analytical reports --end */
      }
    });
    let siddee = ROUTES.filter(sidebarnavItem => sidebarnavItem);
    this.loadMenuSettings();
    this.router.events.subscribe((val) => {
      // see also 
      if (val instanceof NavigationEnd) {
        this.loadMenuSettings()
      }
    });

  }
  loadMenuSettings() {
    $('.page-wrapper').scrollTop(0);
    this.sidebarnavItems.forEach((ele, i) => {
      let roleDetails = this.userDataService.getRoleDetails();
      // console.log("roleDetails",roleDetails);
      roleDetails.rolePermissions && roleDetails.rolePermissions.forEach((roleEle, j) => {
        // if(roleEle.menuName == ele.title) {
        //   ele.display = true;
        // }
        ele.display = true;
      })

      if (ele.subMenu && ele.subMenu.length) {
        ele.subMenu.forEach(element => {
          // console.log(this.router.url.indexOf(element), this.router.url, element);
          if (this.router.url.indexOf(element.path) != -1) {
            ele.showMenu = true;
            if (window.innerWidth < 768) {
              this.closeMobileMenu.emit();
            }
          }
        });
      }
    });
  }
}
