///
/// Copyright © 2016-2021 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AuthUser, User } from '@shared/models/user.model';
import { Authority } from '@shared/models/authority.enum';
import { select, Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { selectAuthUser, selectUserDetails } from '@core/auth/auth.selectors';
import { map } from 'rxjs/operators';
import { AuthService } from '@core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSettingsChangeLanguage } from '@app/core/settings/settings.actions';
import { environment as env } from '@env/environment';
import { getCurrentAuthUser } from '@core/auth/auth.selectors';
import { ActionAuthUpdateUserDetails } from '@core/auth/auth.actions';




import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@app/core/http/user.service';

// khai
interface Language {
  value:number;
  label: string;
}

@Component({
  selector: 'tb-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserMenuComponent implements OnInit, OnDestroy {
  constructor(private store: Store<AppState>,
    private router: Router,
    private authService: AuthService,private route: ActivatedRoute,private userService: UserService,
    public dialog: MatDialog) {
      
      this.authUser = getCurrentAuthUser(this.store);
      console.log("auth bên user",this.authUser)
}

private readonly authUser: AuthUser;
languageList = env.supportedLangs;
matBadgeCount:number = 15;
  user: User;
  // khai
  // defaultLang:string;
  @Input() displayUserInfo: boolean;
  
  
  @Input('defaultLang_Home') defaultLang: string;



  authorities = Authority;

  
  openDialog(templateRef) {
    let dialogRef = this.dialog.open(templateRef, {
     width: '30vw',
     data: { message: 'Bạn có chắc chắn muốn đăng xuất?' },
   });
  }

  cancel(){
    this.dialog.closeAll();
  }

  

  
  selectLangEvent(event :any){
    this.user = {...this.user};
    this.user.additionalInfo.lang = event.value;
       this.userService.saveUser(this.user).subscribe(
         (user) => {
           this.store.dispatch(new ActionAuthUpdateUserDetails({ userDetails: {
               additionalInfo: {...user.additionalInfo},
               authority: user.authority,
               createdTime: user.createdTime,
               tenantId: user.tenantId,
               customerId: user.customerId,
               email: user.email,
               firstName: user.firstName,
               id: user.id,
               lastName: user.lastName,
             } }));
           this.store.dispatch(new ActionSettingsChangeLanguage({ userLang: user.additionalInfo.lang }));
         }
       );
  }


  authority$ = this.store.pipe(
    select(selectAuthUser),
    map((authUser) => authUser ? authUser.authority : Authority.ANONYMOUS)
  );

  authorityName$ = this.store.pipe(
    select(selectUserDetails),
    map((user) => this.getAuthorityName(user))
  );

  userDisplayName$ = this.store.pipe(
    select(selectUserDetails),
    map((user) => this.getUserDisplayName(user))
  );

  

  ngOnInit(): void {
    console.log("user bên menu",this.user)
    console.log("route in user", this.route);
    console.log("id", this.authUser.customerId);
    console.log("info",this.userService.getUser(this.authUser.userId));
    this.userService.getUser(this.authUser.userId).subscribe((data) => {
      this.user = data;
      
      console.log("adđitional pro", this.user.additionalInfo );
       console.log("adđitional pro", this.user.authority );
       console.log("adđitional pro", this.user.createdTime );
       console.log("adđitional pro", this.user.tenantId );
       console.log("adđitional pro", this.user.customerId );
       console.log("adđitional pro", this.user.email );
       console.log("adđitional pro", this.user.firstName );
       console.log("adđitional pro", this.user.id );
       console.log("adđitional pro", this.user.lastName );
       console.log("default lang", this.defaultLang)

      //  this.defaultLang = this.user.additionalInfo.lang;
       console.log("default lang", this.defaultLang)
      });


  }

  ngOnDestroy(): void {
  }

  getAuthorityName(user: User): string {
    let name = null;
    if (user) {
      const authority = user.authority;
      switch (authority) {
        case Authority.SYS_ADMIN:
          name = 'user.sys-admin';
          break;
        case Authority.TENANT_ADMIN:
          name = 'user.tenant-admin';
          break;
        case Authority.CUSTOMER_USER:
          name = 'user.customer';
          break;
      }
    }
    return name;
  }

  getUserDisplayName(user: User): string {
    let name = '';
    if (user) {
      if ((user.firstName && user.firstName.length > 0) ||
        (user.lastName && user.lastName.length > 0)) {
        if (user.firstName) {
          name += user.firstName;
        }
        if (user.lastName) {
          if (name.length > 0) {
            name += ' ';
          }
          name += user.lastName;
        }
      } else {
        name = user.email;
      }
    }
    return name;
  }

  openProfile(): void {
    this.router.navigate(['profile']);
  }

  logout(): void {
    localStorage.removeItem('user');
    this.authService.logout();
    this.dialog.closeAll();

  }

}
