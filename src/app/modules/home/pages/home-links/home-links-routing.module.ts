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

import { Injectable, NgModule } from '@angular/core';
import { Resolve, RouterModule, Routes } from '@angular/router';

import { HomeLinksComponent } from './home-links.component';
import { Authority } from '@shared/models/authority.enum';
import { Observable } from 'rxjs';
import { HomeDashboard } from '@shared/models/dashboard.models';
import { DashboardService } from '@core/http/dashboard.service';
import { AppState } from '@app/core/core.state';
import { select, Store } from '@ngrx/store';
import { selectAuth, selectIsAuthenticated } from '../../../../core/auth/auth.selectors';
import { AuthState } from '@app/core/auth/auth.models';
import { take } from 'rxjs/operators';

@Injectable()
export class HomeDashboardResolver implements Resolve<HomeDashboard> {

  constructor(private store: Store<AppState>, private dashboardService: DashboardService) {
  }

  resolve(): Observable<HomeDashboard> {
    let auth: AuthState = null;
    this.store.pipe(select(selectAuth), take(1)).subscribe(
      (authState: AuthState) => {
        auth = authState;
      }
    );
    if (auth) {
      return this.dashboardService.getHomeDashboard(auth.userDetails?.email);
    }
  }
}

const routes: Routes = [
  {
    path: 'home',
    component: HomeLinksComponent,
    data: {
      auth: [Authority.SYS_ADMIN, Authority.TENANT_ADMIN, Authority.CUSTOMER_USER],
      title: 'home.home',
      breadcrumb: {
        label: 'home.home',
        icon: 'home'
      }
    },
    resolve: {
      homeDashboard: HomeDashboardResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    HomeDashboardResolver
  ]
})
export class HomeLinksRoutingModule { }
