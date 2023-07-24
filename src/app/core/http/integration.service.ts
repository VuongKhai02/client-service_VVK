///
/// Author huongnv75
///

import { Injectable } from '@angular/core';
import { defaultHttpOptionsFromConfig, RequestConfig } from './http-utils';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Asset, AssetInfo, PageData } from '@app/shared/models/integration.models';
import { ilink } from '@shared/models/constants';

@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

  constructor(
    private http: HttpClient
  ) { }

  public getProducts(config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(ilink.product,
      defaultHttpOptionsFromConfig(config));
  }

  public getGroupProducts(config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(ilink.groupProduct,
      defaultHttpOptionsFromConfig(config));
  }

  public getStages(config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(ilink.stage,
      defaultHttpOptionsFromConfig(config));
  }

  public getErrors(config?: RequestConfig): Observable<PageData<AssetInfo>> {
    return this.http.get<PageData<AssetInfo>>(ilink.error,
      defaultHttpOptionsFromConfig(config));
  }

  public getAsset(assetId: string, config?: RequestConfig): Observable<Asset> {
    return this.http.get<Asset>(`/api/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

  public saveAsset(asset: Asset, config?: RequestConfig): Observable<Asset> {
    return this.http.post<Asset>('/api/asset', asset, defaultHttpOptionsFromConfig(config));
  }

  public deleteAsset(assetId: string, config?: RequestConfig) {
    return this.http.delete(`/api/asset/${assetId}`, defaultHttpOptionsFromConfig(config));
  }

 

}
