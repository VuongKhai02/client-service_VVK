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

import {
  AfterViewInit,
  Component,
  ElementRef,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  StaticProvider,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { PageComponent } from '@shared/components/page.component';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { WidgetAction, WidgetContext } from '@home/models/widget-component.models';
import {
  DataKey,
  Datasource,
  DatasourceData,
  WidgetActionDescriptor,
  WidgetConfig
} from '@shared/models/widget.models';
import { IWidgetSubscription } from '@core/api/widget-api.models';
import { UtilsService } from '@core/services/utils.service';
import { TranslateService } from '@ngx-translate/core';
import {
  createLabelFromDatasource,
  deepClone,
  hashCode,
  isDefined,
  isNumber,
  isObject,
  isUndefined
} from '@core/utils';
import cssjs from '@core/css/css';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { DataKeyType } from '@shared/models/telemetry/telemetry.models';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { emptyPageData, PageData } from '@shared/models/page/page-data';
import { EntityId } from '@shared/models/id/entity-id';
import { entityTypeTranslations } from '@shared/models/entity-type.models';
import { debounceTime, distinctUntilChanged, map, tap, timeout } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  CellContentInfo,
  CellStyleInfo,
  constructTableCssString,
  DisplayColumn,
  EntityColumn,
  EntityData,
  entityDataSortOrderFromString,
  findColumnByEntityKey,
  findEntityKeyByColumnDef,
  fromEntityColumnDef,
  getCellContentInfo,
  getCellStyleInfo,
  getColumnDefaultVisibility,
  getColumnSelectionAvailability,
  getColumnWidth,
  getEntityValue,
  getRowStyleInfo,
  RowStyleInfo,
  TableWidgetDataKeySettings,
  TableWidgetSettings,
  widthStyle
} from '@home/components/widget/lib/table-widget.models';
import { ConnectedPosition, Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  DISPLAY_COLUMNS_PANEL_DATA,
  DisplayColumnsPanelComponent,
  DisplayColumnsPanelData
} from '@home/components/widget/lib/display-columns-panel.component';
import {
  dataKeyToEntityKey,
  Direction,
  EntityDataPageLink,
  entityDataPageLinkSortDirection,
  EntityKey,
  EntityKeyType,
  EntityKeyValueType,
  FilterPredicateType,
  FilterPredicateValue,
  KeyFilter,
  KeyFilterPredicate,
  NumericOperation,
  StringOperation
} from '@shared/models/query/query.models';
import { sortItems } from '@shared/models/page/page-link';
import { entityFields } from '@shared/models/entity.models';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { WidgetService } from '@app/core/http/widget.service';
import { R } from '@angular/cdk/keycodes';

interface EntitiesTableWidgetSettings extends TableWidgetSettings {
  entitiesTitle: string;
  enableSelectColumnDisplay: boolean;
  defaultSortOrder: string;
  displayEntityName: boolean;
  entityNameColumnTitle: string;
  displayEntityLabel: boolean;
  entityLabelColumnTitle: string;
  displayEntityType: boolean;
}

@Component({
  selector: 'tb-giamsat-entities-table-widget',
  templateUrl: './giamsat-entities-table-widget.component.html',
  styleUrls: ['./giamsat-entities-table-widget.component.scss', './table-widget.scss']
})
export class GiamsatEntitiesTableWidgetComponent extends PageComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  ctx: WidgetContext;

  @ViewChild('searchInput') searchInputField: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('el') loadingEl: ElementRef;

  public displayPagination = true;
  public enableStickyHeader = true;
  public enableStickyAction = true;
  public pageSizeOptions;
  public pageLink: EntityDataPageLink;
  public sortOrderProperty: string;
  public textSearchMode = false;
  public columns: Array<EntityColumn> = [];
  public displayedColumns: string[] = [];
  public actionCellDescriptors: WidgetActionDescriptor[];
  public entityDatasource: EntityDatasource;
  // public valueColumnSearch = "";
  public fillterArr = [];
  public checkFillter = false;
  public statusArr = [
    { value: 0, viewValue: 'Stop' },
    { value: 1, viewValue: 'Running' },
    { value: 2, viewValue: 'Finish' },
    { value: 3, viewValue: 'Pause' },
    { value: 4, viewValue: 'Resume' },
    { value: 5, viewValue: 'Start_PLC' },
    { value: 99, viewValue: 'Plan' },
    { value: 10, viewValue: 'Waiting' }
  ];
  public columnCustomWidth = ['Planning_Code', 'Po_Id', 'BRANCH', 'group', 'Sap_Wo', 'Lot_Number', 'Product_Code', 'Number_Of_Planning', 'Line_Name', 'dash_dau_vao', 'dash_dau_ra', 'ti_le_hoan_thanh', 'Cycle_Time_trung_binh', 'Running_Time', 'Stopping_Time'];
  public columnFullWidth = ['Product_Name', 'Line_Id', 'Line_Type'];
  public columnMinWidth = ['dash_dau_vao', 'dash_dau_ra', 'ti_le_hoan_thanh', 'Cycle_Time_trung_binh'];

  public listError;
  public listErrorHMI;

  private cellContentCache: Array<any> = [];
  private cellStyleCache: Array<any> = [];
  private rowStyleCache: Array<any> = [];

  private settings: EntitiesTableWidgetSettings;
  private widgetConfig: WidgetConfig;
  private subscription: IWidgetSubscription;

  private entitiesTitlePattern: string;

  private defaultPageSize = 10;
  private defaultSortOrder = 'entityName';

  private contentsInfo: { [key: string]: CellContentInfo } = {};
  private stylesInfo: { [key: string]: CellStyleInfo } = {};
  private columnWidth: { [key: string]: string } = {};
  private columnDefaultVisibility: { [key: string]: boolean } = {};
  private columnSelectionAvailability: { [key: string]: boolean } = {};

  private rowStylesInfo: RowStyleInfo;

  public isLoading: boolean = false;
  public myClassBinding: any;

  handleLoading(_isLoading: boolean) {
    this.isLoading = _isLoading;
  }


  private searchAction: WidgetAction = {
    name: 'Export Excel',
    show: true,
    icon: 'import_export',
    onAction: () => {
      // this.enterFilterMode();
      // this.updateData();
      // this.handleLoading(true);
      this.loadingEl.nativeElement.classList.remove("hide");
      this.loadingEl.nativeElement.classList.add("spinner");
      var getListAllErrorObservable = this.widgetService.getListAllError();
      var getReportDataObservable = this.widgetService.getReportData();
      var getListErrInCommonObservable = this.widgetService.getListErrInCommon();
      getListAllErrorObservable.pipe(timeout(120000)).subscribe((dataError: any[]) => {
        getListErrInCommonObservable.pipe(timeout(120000)).subscribe((dataListErrInCommon: any[]) => {
          
          getReportDataObservable.pipe(timeout(120000)).subscribe((data: any[]) => {
            console.log("---------- PHD Raw Data Arr---------", data);
            var exportArr: any[] = [];
            var StageDetailWoArr: any[] = [];
            var WO_ERR_ARR: any[] = [];
            var entity_dashDauRa, entity_dashDauVao;
            if (this.checkFillter == true) {
              let getArrFillterValue = JSON.parse(
                JSON.stringify(
                  this.fillterArr.filter(item => {
                    return item.value.toString().length > 0;
                  })
                )
              )
              getArrFillterValue.forEach(item2 => {
                switch (item2.columnName) {
                  case "Planning_Code":
                    item2.columnName = "planning_Code";
                    break;
                  case "name":
                    item2.columnName = "name";
                    break;
                  case "Po_Id":
                    item2.columnName = "po_Id";
                    break;
                  case "BRANCH":
                    item2.columnName = "branch";
                    break;
                  case "group":
                    item2.columnName = "group";
                    break;
                  case "STATUS":
                    item2.columnName = "status";
                    break;
                  case "Line_Name":
                    item2.columnName = "line_Name";
                    break;
                  case "Sap_Wo":
                    item2.columnName = "sap_Wo";
                    break;
                  case "Lot_Number":
                    item2.columnName = "lot_Number";
                    break;
                  case "Product_Code":
                    item2.columnName = "product_Code";
                    break;
                  case "Product_Name":
                    item2.columnName = "product_Name";
                    break;
                  case "Number_Of_Planning":
                    item2.columnName = "number_Of_Planning";
                    break;
                  case "Line_Id":
                    item2.columnName = "line_Id";
                    break;
                  case "Line_Type":
                    item2.columnName = "line_Type";
                    break;
                  default:
                    break;
                }
              });

              let dataFillter = {};
              getArrFillterValue.forEach(item3 => {
                dataFillter[item3.columnName] = item3.value;
              })
              
              console.log("-------------- PHD on Export Fillter --------------", getArrFillterValue);
              console.log("-------------- PHD on dataFillter --------------", dataFillter);

              console.log("----------PHD DATA -----------", data);
              let result = this.filterData(data, dataFillter);
              console.log("---------------PHD fillter result----------", result);
              data = [...result];

            }

            var oee_nsObj: any;
            var timeBatDauSX: any;
            data.forEach(item => {
              try {
                if (typeof (item.list_stage) == "string") {
                  var str = item.list_stage.replaceAll("\\", "");
                  var jsonStr;
                  try {
                    jsonStr = JSON.parse(str);
                  } catch (error) {
                    jsonStr = [];
                    WO_ERR_ARR.push(item.name);
                  }
                  item.list_stage = jsonStr;
                }

                if (typeof (item.his_list_stage) == "string") {
                  var str = item.his_list_stage.replaceAll("\\", "");
                  var jsonStr;
                  try {
                    jsonStr = JSON.parse(str);
                  } catch (error) {
                    jsonStr = [];
                    WO_ERR_ARR.push(item.name);
                  }
                  item.his_list_stage = jsonStr;
                }
                entity_dashDauVao = this.handleDashDauVao(item.list_stage, item.his_list_stage)
                item.dash_dau_vao = entity_dashDauVao;
                entity_dashDauRa = this.handleDashDauRa(item.list_stage, item.his_list_stage);
                item.dash_dau_ra = entity_dashDauRa;
                item.ti_le_hoan_thanh = this.handleTiLeHoanThanh(item.number_Of_Planning, entity_dashDauRa);
                item.Cycle_Time_trung_binh = this.handleCycleTimeHoanThanh(entity_dashDauRa, item.status, item.start_Time, item.running_Time)
                item.ThoiGianChay = this.formartRunning_Time(item.status, item.start_Time, item.running_Time);
                item.ThoiGianDung = this.formartStoping_Time(item.status, item.stop_Time, item.stopping_Time);
                item.TrangThai = this.formnatStatus(parseInt(item.status));
                // item.NgayTiepNhan = this.formatDate(new Date(parseInt(item.createdTime)));
                item.NgayTiepNhan = this.timeConverter(Number(item.createdTime));
                timeBatDauSX = this.timeConverter(Number(item.first_Time_Start_Line));
                item.ThoiGianBatDauSX = timeBatDauSX.toString() == "1/01/1970/ 8:0:0" ? "" : timeBatDauSX;
                oee_nsObj = this.handleOEE_NangSuatThucTinh(item.status, item.start_Time, item.stop_Time, item.running_Time,
                  item.stopping_Time, item.list_stage, item.his_list_stage, item.cycle_Time, item.planning_Time, item.number_Of_Planning);
                item.oee = oee_nsObj.oeeValue;
                item.NangSuatThucTinh = oee_nsObj.nsthuctinhValue.toString() == "NaN" ? "" : oee_nsObj.nsthuctinhValue;
                item.TongLoi = oee_nsObj.tongLoi;
                item.DoTinCay = this.handleDoTinCay(item.list_stage, item.his_list_stage, dataListErrInCommon, entity_dashDauVao);
                item.ppm = this.handlePPM(item.list_stage, item.his_list_stage, item.quota);
                item.realStage = this.handleGetInfoStageByWO(item.list_stage, item.his_list_stage);
                item.sumErrByStage = this.handleDataError(item.list_stage, item.his_list_stage);
              } catch (error) {

              }
            })
            console.log("---------- PHD Handled Data Arr---------", data);
            var StageDetailWoItem: any;
            data.forEach(item => {
              try {
                item.realStage.forEach(stageItem => {
                  StageDetailWoItem = {};
                  StageDetailWoItem.planning_Code = item.planning_Code;
                  StageDetailWoItem.name = item.name;
                  StageDetailWoItem.po_Id = item.po_Id;
                  StageDetailWoItem.branch = item.branch;
                  StageDetailWoItem.group = item.group;
                  StageDetailWoItem.sap_Wo = item.sap_Wo;
                  StageDetailWoItem.lot_Number = item.lot_Number;
                  StageDetailWoItem.StageMachine = stageItem.stage_name;
                  StageDetailWoItem.StageInput = stageItem.number_of_input;
                  StageDetailWoItem.StageOutput = stageItem.number_of_output;
                  StageDetailWoItem.ThoiGianChay = item.ThoiGianChay;
                  StageDetailWoItem.ThoiGianDung = item.ThoiGianDung;
                  StageDetailWoItem.oee = item.oee;
                  StageDetailWoItem.ppm = item.ppm;
                  item.sumErrByStage.forEach(sumErrByStageItem => {
                    if (stageItem.stage_name == sumErrByStageItem.stage_name) {
                      StageDetailWoItem.TongLoi = sumErrByStageItem.Number_Of_Error_new;
                    }
                  })
                  StageDetailWoArr.push(StageDetailWoItem);
                });
              } catch (error) {

              }

            })
            console.log("--------PHD StageDetailWoArr-------", StageDetailWoArr);
            var ListErrStage: any[] = [];
            var ListErrStageItem;
            data.forEach(item => {
              try {
                ListErrStageItem = this.handleDetailError(item.list_stage, item.his_list_stage, dataError);
                ListErrStageItem.forEach(item2 => {
                  item2.planning_Code = item.planning_Code;
                  item2.name = item.name;
                  item2.po_Id = item.po_Id;
                  item2.branch = item.branch;
                  item2.group = item.group;
                  item2.sap_Wo = item.sap_Wo;
                  item2.lot_Number = item.lot_Number;
                });
                ListErrStage.push(...ListErrStageItem);
              } catch (error) {

              }
            });
            console.log("--------PHD ListErrStage-------", ListErrStage);

            var ListSerial: any[] = [];
            var ListSerialItem: any = {};
            var serial_stageObj: any;
            data.forEach(item => {
              try {
                if (item.serial_stage != null) {
                  if (typeof item.serial_stage == 'string') {
                    serial_stageObj = JSON.parse(item.serial_stage.replaceAll("\'", '\"'));
                  } else {
                    serial_stageObj = item.serial_stage;
                  }

                  console.log("---------------- PHD serial_stageObj -------------", serial_stageObj);
                  for (var key in serial_stageObj) {
                    serial_stageObj[key].forEach(item2 => {
                      ListSerialItem.planning_Code = item.planning_Code;
                      ListSerialItem.name = item.name;
                      ListSerialItem.po_Id = item.po_Id;
                      ListSerialItem.stage = key.toString();
                      ListSerialItem.serialBoard = item2.serialBoard;
                      ListSerialItem.serial = item2.serial;
                      ListSerialItem.lastUpdateTs = this.timeConverter(Number(new Date(item2.lastUpdateTs)));
                      ListSerial.push(ListSerialItem);
                      ListSerialItem = {};
                    })
                  }

                }
              } catch (error) {

              }
            })

            console.log("--------PHD ListSerial-------", ListSerial);

            data.forEach(item => {
              let { createdTime, his_list_stage, list_stage, running_Time, start_Time, status, stop_Time, stopping_Time,
                cycle_Time, computing_Productivity, line_Id, first_Time_Start_Line, oldstatus, planning_Time, quota, resume_Time, speed_02, TrangThai, serial_stage, ...restPro } = item;
              exportArr.push(restPro);
            });


            console.log("---------- PHD EXPORT Data Arr---------", exportArr);

            this.exportToExcel(exportArr, "WO_Info", "Report_SCADA", StageDetailWoArr, ListErrStage, ListSerial);
            // this.handleLoading(false);
            // console.log("_____________this.isLoading_________________", this.isLoading);
          }, (error) => {
            // this.handleLoading(false);
            this.loadingEl.nativeElement.classList.remove("spinner");
            this.loadingEl.nativeElement.classList.add("hide");
            this.ctx.showErrorToast("Xuất excel thất bại", "top", "left");
          })
        }, (error) => {
          this.loadingEl.nativeElement.classList.remove("spinner");
          this.loadingEl.nativeElement.classList.add("hide");
          this.ctx.showErrorToast("Xuất excel thất bại", "top", "left");
        })

      }, (error) => {
        // this.handleLoading(false);
        this.loadingEl.nativeElement.classList.remove("spinner");
        this.loadingEl.nativeElement.classList.add("hide");
        this.ctx.showErrorToast("Xuất excel thất bại", "top", "left");
      })
        

      // this.widgetService.getListAllError().subscribe((dataError: any[]) => {
      //   this.widgetService.getReportData().subscribe((data: any[]) => {
      //     console.log("---------- PHD Raw Data Arr---------", data);
      //     var exportArr: any[] = [];
      //     var StageDetailWoArr: any[] = [];
      //     var WO_ERR_ARR: any[] = [];
      //     var entity_dashDauRa;
      //     if (this.checkFillter == true) {
      //       let getArrFillterValue = JSON.parse(
      //         JSON.stringify(
      //           this.fillterArr.filter(item => {
      //             return item.value.toString().length > 0;
      //           })
      //         )
      //       )
      //       getArrFillterValue.forEach(item2 => {
      //         switch (item2.columnName) {
      //           case "Planning_Code":
      //             item2.columnName = "planning_Code";
      //             break;
      //           case "name":
      //             item2.columnName = "name";
      //             break;
      //           case "Po_Id":
      //             item2.columnName = "po_Id";
      //             break;
      //           case "BRANCH":
      //             item2.columnName = "branch";
      //             break;
      //           case "group":
      //             item2.columnName = "group";
      //             break;
      //           case "STATUS":
      //             item2.columnName = "status";
      //             break;
      //           case "Line_Name":
      //             item2.columnName = "line_Name";
      //             break;
      //           case "Sap_Wo":
      //             item2.columnName = "sap_Wo";
      //             break;
      //           case "Lot_Number":
      //             item2.columnName = "lot_Number";
      //             break;
      //           case "Product_Code":
      //             item2.columnName = "product_Code";
      //             break;
      //           case "Product_Name":
      //             item2.columnName = "product_Name";
      //             break;
      //           case "Number_Of_Planning":
      //             item2.columnName = "number_Of_Planning";
      //             break;
      //           case "Line_Id":
      //             item2.columnName = "line_Id";
      //             break;
      //           case "Line_Type":
      //             item2.columnName = "line_Type";
      //             break;
      //           default:
      //             break;
      //         }
      //       });

      //       let dataFillter = {};
      //       getArrFillterValue.forEach(item3 => {
      //         dataFillter[item3.columnName] = item3.value;
      //       })
      //       console.log("-------------- PHD on Export Fillter --------------", getArrFillterValue);
      //       console.log("-------------- PHD on dataFillter --------------", dataFillter);

      //       console.log("----------PHD DATA -----------", data);
      //       let result = this.filterData(data, dataFillter);
      //       console.log("---------------PHD fillter result----------", result);
      //       data = [...result];

      //     }

      //     var oee_nsObj: any;
      //     data.forEach(item => {
      //       try {
      //         if (typeof (item.list_stage) == "string") {
      //           var str = item.list_stage.replaceAll("\\", "");
      //           var jsonStr;
      //           try {
      //             jsonStr = JSON.parse(str);
      //           } catch (error) {
      //             jsonStr = [];
      //             WO_ERR_ARR.push(item.name);
      //           }
      //           item.list_stage = jsonStr;
      //         }

      //         if (typeof (item.his_list_stage) == "string") {
      //           var str = item.his_list_stage.replaceAll("\\", "");
      //           var jsonStr;
      //           try {
      //             jsonStr = JSON.parse(str);
      //           } catch (error) {
      //             jsonStr = [];
      //             WO_ERR_ARR.push(item.name);
      //           }
      //           item.his_list_stage = jsonStr;
      //         }
      //         item.dash_dau_vao = this.handleDashDauVao(item.list_stage, item.his_list_stage);
      //         entity_dashDauRa = this.handleDashDauRa(item.list_stage, item.his_list_stage);
      //         item.dash_dau_ra = entity_dashDauRa;
      //         item.ti_le_hoan_thanh = this.handleTiLeHoanThanh(item.number_Of_Planning, entity_dashDauRa);
      //         item.Cycle_Time_trung_binh = this.handleCycleTimeHoanThanh(entity_dashDauRa, item.status, item.start_Time, item.running_Time)
      //         item.ThoiGianChay = this.formartRunning_Time(item.status, item.start_Time, item.running_Time);
      //         item.ThoiGianDung = this.formartStoping_Time(item.status, item.stop_Time, item.stopping_Time);
      //         item.TrangThai = this.formnatStatus(parseInt(item.status));
      //         item.NgayTiepNhan = this.formatDate(new Date(parseInt(item.createdTime)));
      //         item.ThoiGianBatDauSX = this.timeConverter(Number(item.first_Time_Start_Line));
      //         oee_nsObj = this.handleOEE_NangSuatThucTinh(item.status, item.start_Time, item.stop_Time, item.running_Time,
      //           item.stopping_Time, item.list_stage, item.his_list_stage, item.cycle_Time, item.planning_Time, item.number_Of_Planning);
      //         item.oee = oee_nsObj.oeeValue;
      //         item.NangSuatThucTinh = oee_nsObj.nsthuctinhValue;
      //         item.TongLoi = oee_nsObj.tongLoi;
      //         item.DoTinCay = "";
      //         item.ppm = this.handlePPM(item.list_stage, item.his_list_stage, item.quota);
      //         item.realStage = this.handleGetInfoStageByWO(item.list_stage, item.his_list_stage);
      //       } catch (error) {

      //       }
      //     })
      //     console.log("---------- PHD Handled Data Arr---------", data);
      //     var StageDetailWoItem: any;
      //     data.forEach(item => {
      //       try {
      //         item.realStage.forEach(stageItem => {
      //           StageDetailWoItem = {};
      //           StageDetailWoItem.planning_Code = item.planning_Code;
      //           StageDetailWoItem.name = item.name;
      //           StageDetailWoItem.po_Id = item.po_Id;
      //           StageDetailWoItem.branch = item.branch;
      //           StageDetailWoItem.group = item.group;
      //           StageDetailWoItem.sap_Wo = item.sap_Wo;
      //           StageDetailWoItem.lot_Number = item.lot_Number;
      //           StageDetailWoItem.StageMachine = stageItem.stage_name;
      //           StageDetailWoItem.StageInput = stageItem.number_of_input;
      //           StageDetailWoItem.StageOutput = stageItem.number_of_output;
      //           StageDetailWoItem.ThoiGianChay = item.ThoiGianChay;
      //           StageDetailWoItem.ThoiGianDung = item.ThoiGianDung;
      //           StageDetailWoItem.oee = item.oee;
      //           StageDetailWoItem.ppm = item.ppm;
      //           StageDetailWoItem.TongLoi = item.TongLoi;
      //           StageDetailWoArr.push(StageDetailWoItem);
      //         });
      //       } catch (error) {

      //       }

      //     })
      //     console.log("--------PHD StageDetailWoArr-------", StageDetailWoArr);
      //     var ListErrStage: any[] = [];
      //     var ListErrStageItem;
      //     data.forEach(item => {
      //       try {
      //         ListErrStageItem = this.handleDetailError(item.list_stage, item.his_list_stage, dataError);
      //         ListErrStageItem.forEach(item2 => {
      //           item2.planning_Code = item.planning_Code;
      //           item2.name = item.name;
      //           item2.po_Id = item.po_Id;
      //           item2.branch = item.branch;
      //           item2.group = item.group;
      //           item2.sap_Wo = item.sap_Wo;
      //           item2.lot_Number = item.lot_Number;
      //         });
      //         ListErrStage.push(...ListErrStageItem);
      //       } catch (error) {

      //       }
      //     });
      //     console.log("--------PHD ListErrStage-------", ListErrStage);

      //     data.forEach(item => {
      //       let { createdTime, his_list_stage, list_stage, running_Time, start_Time, status, stop_Time, stopping_Time,
      //         cycle_Time, computing_Productivity, line_Id, first_Time_Start_Line, oldstatus, planning_Time, quota, resume_Time, speed_02, TrangThai, ...restPro } = item;
      //       exportArr.push(restPro);
      //     });


      //     console.log("---------- PHD EXPORT Data Arr---------", exportArr);

      //     this.exportToExcel(exportArr, "WO_Info", "DS WO", StageDetailWoArr, ListErrStage);
      //   }, (error) => {
      //     this.handleLoading(false);
      //     this.ctx.showErrorToast("Xuất excel thất bại", "top", "left");
      //   });
      // }, (error) => {
      //   this.handleLoading(false);
      //   this.ctx.showErrorToast("Xuất excel thất bại", "top", "left");
      // })


    }
  };

  private columnDisplayAction: WidgetAction = {
    name: 'entity.columns-to-display',
    show: true,
    icon: 'view_column',
    onAction: ($event) => {
      this.editColumnsToDisplay($event);
    }
  };

  constructor(protected store: Store<AppState>,
    private elementRef: ElementRef,
    private ngZone: NgZone,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private utils: UtilsService,
    private datePipe: DatePipe,
    private translate: TranslateService,
    private domSanitizer: DomSanitizer,
    private widgetService: WidgetService) {
    super(store);
    this.pageLink = {
      page: 0,
      pageSize: this.defaultPageSize,
      textSearch: null,
      dynamic: true
    };
  }

  ngOnInit(): void {
    this.ctx.$scope.entitiesTableWidget = this;
    this.settings = this.ctx.settings;
    this.widgetConfig = this.ctx.widgetConfig;
    this.subscription = this.ctx.defaultSubscription;
    this.initializeConfig();
    this.updateDatasources();
    this.ctx.updateWidgetParams();
    // ------------- Code Start ----------------
    this.columns.forEach(item => {
      this.fillterArr.push({
        value: "",
        columnName: item.name
      })
    });
    // ------------- Code End -------------------
  }

  ngAfterViewInit(): void {
    // fromEvent(this.searchInputField.nativeElement, 'keyup')
    //   .pipe(
    //     debounceTime(150),
    //     distinctUntilChanged(),
    //     tap(() => {
    //       if (this.displayPagination) {
    //         this.paginator.pageIndex = 0;
    //       }
    //       this.updateData();
    //     })
    //   )
    //   .subscribe();

    if (this.displayPagination) {
      this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    }
    ((this.displayPagination ? merge(this.sort.sortChange, this.paginator.page) : this.sort.sortChange) as Observable<any>)
      .pipe(
        tap(() => { this.updateData(); console.log("PHD datasource update 2: ", this.entityDatasource); })
      )
      .subscribe();
    this.updateData();
    // -------------------- Code Start -----------------
    var localCheckFilter = JSON.parse(sessionStorage.getItem("checkFillter"));
    console.log("----------localCheckFilter------------", localCheckFilter);
    var localFillterArr = JSON.parse(sessionStorage.getItem("fillterArr"));
    console.log("----------localFillterArr------------", localFillterArr);
    var giamsatPageIndex = JSON.parse(sessionStorage.getItem("giamsatPageIndex"));
    this.paginator.pageIndex = giamsatPageIndex;
    var giamsatPageSize = JSON.parse(sessionStorage.getItem("giamsatPageSize"));
    this.paginator.pageSize = giamsatPageSize;
    if (localCheckFilter == true) {
      this.checkFillter = true;
      this.fillterArr = localFillterArr;
      this.updateData();
    } else {

    }
    // -------------------- Code End ------------------------
  }
  ngOnDestroy() {
    sessionStorage.setItem("giamsatPageIndex", JSON.stringify(this.paginator.pageIndex));
    sessionStorage.setItem("giamsatPageSize", JSON.stringify(this.paginator.pageSize));
  }

  public onDataUpdated() {
    this.updateTitle(true);
    this.entityDatasource.dataUpdated();
    this.clearCache();
    this.ctx.detectChanges();
  }

  public pageLinkSortDirection(): SortDirection {
    return entityDataPageLinkSortDirection(this.pageLink);
  }

  private initializeConfig() {
    this.ctx.widgetActions = [this.searchAction, this.columnDisplayAction];

    this.actionCellDescriptors = this.ctx.actionsApi.getActionDescriptors('actionCellButton');

    if (this.settings.entitiesTitle && this.settings.entitiesTitle.length) {
      this.entitiesTitlePattern = this.utils.customTranslation(this.settings.entitiesTitle, this.settings.entitiesTitle);
    } else {
      this.entitiesTitlePattern = this.translate.instant('entity.entities');
    }

    this.updateTitle(false);

    this.searchAction.show = isDefined(this.settings.enableSearch) ? this.settings.enableSearch : true;
    this.displayPagination = isDefined(this.settings.displayPagination) ? this.settings.displayPagination : true;
    this.enableStickyHeader = isDefined(this.settings.enableStickyHeader) ? this.settings.enableStickyHeader : true;
    this.enableStickyAction = isDefined(this.settings.enableStickyAction) ? this.settings.enableStickyAction : true;
    this.columnDisplayAction.show = isDefined(this.settings.enableSelectColumnDisplay) ? this.settings.enableSelectColumnDisplay : true;

    this.rowStylesInfo = getRowStyleInfo(this.settings, 'entity, ctx');

    const pageSize = this.settings.defaultPageSize;
    if (isDefined(pageSize) && isNumber(pageSize) && pageSize > 0) {
      this.defaultPageSize = pageSize;
    }
    this.pageSizeOptions = [this.defaultPageSize, this.defaultPageSize * 2, this.defaultPageSize * 3];
    this.pageLink.pageSize = this.displayPagination ? this.defaultPageSize : 1024;

    const cssString = constructTableCssString(this.widgetConfig);
    const cssParser = new cssjs();
    cssParser.testMode = false;
    const namespace = 'entities-table-' + hashCode(cssString);
    cssParser.cssPreviewNamespace = namespace;
    cssParser.createStyleElement(namespace, cssString);
    $(this.elementRef.nativeElement).addClass(namespace);
  }

  private updateTitle(updateWidgetParams = false) {
    const newTitle = createLabelFromDatasource(this.subscription.datasources[0], this.entitiesTitlePattern);
    if (this.ctx.widgetTitle !== newTitle) {
      this.ctx.widgetTitle = newTitle;
      if (updateWidgetParams) {
        this.ctx.updateWidgetParams();
      }
    }
  }

  private updateDatasources() {

    const displayEntityName = isDefined(this.settings.displayEntityName) ? this.settings.displayEntityName : true;
    const displayEntityLabel = isDefined(this.settings.displayEntityLabel) ? this.settings.displayEntityLabel : false;
    let entityNameColumnTitle: string;
    let entityLabelColumnTitle: string;
    if (this.settings.entityNameColumnTitle && this.settings.entityNameColumnTitle.length) {
      entityNameColumnTitle = this.utils.customTranslation(this.settings.entityNameColumnTitle, this.settings.entityNameColumnTitle);
    } else {
      entityNameColumnTitle = this.translate.instant('entity.entity-name');
    }
    if (this.settings.entityLabelColumnTitle && this.settings.entityLabelColumnTitle.length) {
      entityLabelColumnTitle = this.utils.customTranslation(this.settings.entityLabelColumnTitle, this.settings.entityLabelColumnTitle);
    } else {
      entityLabelColumnTitle = this.translate.instant('entity.entity-label');
    }
    const displayEntityType = isDefined(this.settings.displayEntityType) ? this.settings.displayEntityType : true;

    if (displayEntityName) {
      this.columns.push(
        {
          name: 'entityName',
          label: 'entityName',
          def: 'entityName',
          title: entityNameColumnTitle,
          entityKey: {
            key: 'name',
            type: EntityKeyType.ENTITY_FIELD
          }
        } as EntityColumn
      );
      this.contentsInfo.entityName = {
        useCellContentFunction: false
      };
      this.stylesInfo.entityName = {
        useCellStyleFunction: false
      };
      this.columnWidth.entityName = '0px';
      this.columnDefaultVisibility.entityName = true;
      this.columnSelectionAvailability.entityName = true;
    }
    if (displayEntityLabel) {
      this.columns.push(
        {
          name: 'entityLabel',
          label: 'entityLabel',
          def: 'entityLabel',
          title: entityLabelColumnTitle,
          entityKey: {
            key: 'label',
            type: EntityKeyType.ENTITY_FIELD
          }
        } as EntityColumn
      );
      this.contentsInfo.entityLabel = {
        useCellContentFunction: false
      };
      this.stylesInfo.entityLabel = {
        useCellStyleFunction: false
      };
      this.columnWidth.entityLabel = '0px';
      this.columnDefaultVisibility.entityLabel = true;
      this.columnSelectionAvailability.entityLabel = true;
    }
    if (displayEntityType) {
      this.columns.push(
        {
          name: 'entityType',
          label: 'entityType',
          def: 'entityType',
          title: this.translate.instant('entity.entity-type'),
          entityKey: {
            key: 'entityType',
            type: EntityKeyType.ENTITY_FIELD
          }
        } as EntityColumn
      );
      this.contentsInfo.entityType = {
        useCellContentFunction: false
      };
      this.stylesInfo.entityType = {
        useCellStyleFunction: false
      };
      this.columnWidth.entityType = '0px';
      this.columnDefaultVisibility.entityType = true;
      this.columnSelectionAvailability.entityType = true;
    }

    const dataKeys: Array<DataKey> = [];

    const datasource = this.subscription.options.datasources ? this.subscription.options.datasources[0] : null;

    if (datasource && datasource.dataKeys) {
      datasource.dataKeys.forEach((entityDataKey) => {
        const dataKey: EntityColumn = deepClone(entityDataKey) as EntityColumn;
        dataKey.entityKey = dataKeyToEntityKey(entityDataKey);
        if (dataKey.type === DataKeyType.function) {
          dataKey.name = dataKey.label;
        }
        dataKeys.push(dataKey);

        dataKey.label = this.utils.customTranslation(dataKey.label, dataKey.label);
        dataKey.title = dataKey.label;
        dataKey.def = 'def' + this.columns.length;
        const keySettings: TableWidgetDataKeySettings = dataKey.settings;
        if (dataKey.type === DataKeyType.entityField &&
          !isDefined(keySettings.columnWidth) || keySettings.columnWidth === '0px') {
          const entityField = entityFields[dataKey.name];
          if (entityField && entityField.time) {
            keySettings.columnWidth = '120px';
          }
        }

        this.stylesInfo[dataKey.def] = getCellStyleInfo(keySettings, 'value, entity, ctx');
        this.contentsInfo[dataKey.def] = getCellContentInfo(keySettings, 'value, entity, ctx');
        this.contentsInfo[dataKey.def].units = dataKey.units;
        this.contentsInfo[dataKey.def].decimals = dataKey.decimals;
        this.columnWidth[dataKey.def] = getColumnWidth(keySettings);
        this.columnDefaultVisibility[dataKey.def] = getColumnDefaultVisibility(keySettings);
        this.columnSelectionAvailability[dataKey.def] = getColumnSelectionAvailability(keySettings);
        this.columns.push(dataKey);
      });
      this.displayedColumns.push(...this.columns.filter(column => this.columnDefaultVisibility[column.def])
        .map(column => column.def));
    }

    if (this.settings.defaultSortOrder && this.settings.defaultSortOrder.length) {
      this.defaultSortOrder = this.utils.customTranslation(this.settings.defaultSortOrder, this.settings.defaultSortOrder);
    }

    this.pageLink.sortOrder = entityDataSortOrderFromString(this.defaultSortOrder, this.columns);
    let sortColumn: EntityColumn;
    if (this.pageLink.sortOrder) {
      sortColumn = findColumnByEntityKey(this.pageLink.sortOrder.key, this.columns);
    }
    this.sortOrderProperty = sortColumn ? sortColumn.def : null;

    if (this.actionCellDescriptors.length) {
      this.displayedColumns.push('actions');
    }
    this.entityDatasource = new EntityDatasource(this.translate, dataKeys, this.subscription, this.ngZone);
  }

  private editColumnsToDisplay($event: Event) {
    if ($event) {
      $event.stopPropagation();
    }
    const target = $event.target || $event.currentTarget;
    const config = new OverlayConfig();
    config.backdropClass = 'cdk-overlay-transparent-backdrop';
    config.hasBackdrop = true;
    const connectedPosition: ConnectedPosition = {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top'
    };
    config.positionStrategy = this.overlay.position().flexibleConnectedTo(target as HTMLElement)
      .withPositions([connectedPosition]);

    const overlayRef = this.overlay.create(config);
    overlayRef.backdropClick().subscribe(() => {
      overlayRef.dispose();
    });

    const columns: DisplayColumn[] = this.columns.map(column => {
      return {
        title: column.title,
        def: column.def,
        display: this.displayedColumns.indexOf(column.def) > -1,
        selectable: this.columnSelectionAvailability[column.def]
      };
    });

    const providers: StaticProvider[] = [
      {
        provide: DISPLAY_COLUMNS_PANEL_DATA,
        useValue: {
          columns,
          columnsUpdated: (newColumns) => {
            this.displayedColumns = newColumns.filter(column => column.display).map(column => column.def);
            if (this.actionCellDescriptors.length) {
              this.displayedColumns.push('actions');
            }
            this.clearCache();
          }
        } as DisplayColumnsPanelData
      },
      {
        provide: OverlayRef,
        useValue: overlayRef
      }
    ];
    const injector = Injector.create({ parent: this.viewContainerRef.injector, providers });
    overlayRef.attach(new ComponentPortal(DisplayColumnsPanelComponent,
      this.viewContainerRef, injector));
    this.ctx.detectChanges();
  }

  private enterFilterMode() {
    this.textSearchMode = true;
    this.pageLink.textSearch = '';
    this.ctx.hideTitlePanel = true;
    this.ctx.detectChanges(true);
    setTimeout(() => {
      this.searchInputField.nativeElement.focus();
      this.searchInputField.nativeElement.setSelectionRange(0, 0);
    }, 10);
  }

  exitFilterMode() {
    this.textSearchMode = false;
    this.pageLink.textSearch = null;
    if (this.displayPagination) {
      this.paginator.pageIndex = 0;
    }
    this.updateData();
    this.ctx.hideTitlePanel = false;
    this.ctx.detectChanges(true);
  }

  private updateData() {
    if (this.displayPagination) {
      this.pageLink.page = this.paginator.pageIndex;
      this.pageLink.pageSize = this.paginator.pageSize;
    } else {
      this.pageLink.page = 0;
    }
    const key = findEntityKeyByColumnDef(this.sort.active, this.columns);
    if (key) {
      this.pageLink.sortOrder = {
        key,
        direction: Direction[this.sort.direction.toUpperCase()]
      };
    } else {
      this.pageLink.sortOrder = null;
    }
    const sortOrderLabel = fromEntityColumnDef(this.sort.active, this.columns);
    let keyFilters: KeyFilter[] = []; // TODO:
    if (this.checkFillter == true) {
      keyFilters = this.handleSearchByColumn();
    } else {
      keyFilters = [];
    }
    this.entityDatasource.loadEntities(this.pageLink, sortOrderLabel, keyFilters);
    this.ctx.detectChanges();
  }

  public trackByColumnDef(column: EntityColumn) {
    return column.def;
  }

  public trackByEntityId(index: number, entity: EntityData) {
    return entity.id.id;
  }

  public trackByActionCellDescriptionId(action: WidgetActionDescriptor) {
    return action.id;
  }

  public headerStyle(key: EntityColumn): any {
    const columnWidth = this.columnWidth[key.def];
    return widthStyle(columnWidth);
  }

  public rowStyle(entity: EntityData, row: number): any {
    let res = this.rowStyleCache[row];
    if (!res) {
      res = {};
      if (entity && this.rowStylesInfo.useRowStyleFunction && this.rowStylesInfo.rowStyleFunction) {
        try {
          res = this.rowStylesInfo.rowStyleFunction(entity, this.ctx);
          if (!isObject(res)) {
            throw new TypeError(`${res === null ? 'null' : typeof res} instead of style object`);
          }
          if (Array.isArray(res)) {
            throw new TypeError(`Array instead of style object`);
          }
        } catch (e) {
          res = {};
          console.warn(`Row style function in widget '${this.ctx.widgetTitle}' ` +
            `returns '${e}'. Please check your row style function.`);
        }
      }
      this.rowStyleCache[row] = res;
    }
    return res;
  }

  public cellStyle(entity: EntityData, key: EntityColumn, row: number): any {
    const col = this.columns.indexOf(key);
    const index = row * this.columns.length + col;
    let res = this.cellStyleCache[index];
    if (!res) {
      res = {};
      if (entity && key) {
        const styleInfo = this.stylesInfo[key.def];
        const value = getEntityValue(entity, key);
        if (styleInfo.useCellStyleFunction && styleInfo.cellStyleFunction) {
          try {
            res = styleInfo.cellStyleFunction(value, entity, this.ctx);
            if (!isObject(res)) {
              throw new TypeError(`${res === null ? 'null' : typeof res} instead of style object`);
            }
            if (Array.isArray(res)) {
              throw new TypeError(`Array instead of style object`);
            }
          } catch (e) {
            res = {};
            console.warn(`Cell style function for data key '${key.label}' in widget '${this.ctx.widgetTitle}' ` +
              `returns '${e}'. Please check your cell style function.`);
          }
        }
        this.cellStyleCache[index] = res;
      }
    }
    if (!res.width) {
      const columnWidth = this.columnWidth[key.def];
      res = Object.assign(res, widthStyle(columnWidth));
    }
    return res;
  }

  public cellContent(entity: EntityData, key: EntityColumn, row: number): SafeHtml {
    const col = this.columns.indexOf(key);
    const index = row * this.columns.length + col;
    let res = this.cellContentCache[index];
    if (isUndefined(res)) {
      res = '';
      if (entity && key) {
        const contentInfo = this.contentsInfo[key.def];
        const value = getEntityValue(entity, key);
        let content: string;
        if (contentInfo.useCellContentFunction && contentInfo.cellContentFunction) {
          try {
            content = contentInfo.cellContentFunction(value, entity, this.ctx);
          } catch (e) {
            content = '' + value;
          }
        } else {
          content = this.defaultContent(key, contentInfo, value);
        }

        if (isDefined(content)) {
          content = this.utils.customTranslation(content, content);
          switch (typeof content) {
            case 'string':
              res = this.domSanitizer.bypassSecurityTrustHtml(content);
              break;
            default:
              res = content;
          }
        }
      }
      this.cellContentCache[index] = res;
    }
    return res;
  }

  private defaultContent(key: EntityColumn, contentInfo: CellContentInfo, value: any): any {
    if (isDefined(value)) {
      const entityField = entityFields[key.name];
      if (entityField) {
        if (entityField.time) {
          return this.datePipe.transform(value, 'yyyy-MM-dd HH:mm:ss');
        }
      }
      const decimals = (contentInfo.decimals || contentInfo.decimals === 0) ? contentInfo.decimals : this.ctx.widgetConfig.decimals;
      const units = contentInfo.units || this.ctx.widgetConfig.units;
      return this.ctx.utils.formatValue(value, decimals, units, true);
    } else {
      return '';
    }
  }

  public onRowClick($event: Event, entity: EntityData, isDouble?: boolean) {
    if ($event) {
      $event.stopPropagation();
    }
    this.entityDatasource.toggleCurrentEntity(entity);
    const actionSourceId = isDouble ? 'rowDoubleClick' : 'rowClick';
    const descriptors = this.ctx.actionsApi.getActionDescriptors(actionSourceId);
    if (descriptors.length) {
      let entityId;
      let entityName;
      let entityLabel;
      if (entity) {
        entityId = entity.id;
        entityName = entity.entityName;
        entityLabel = entity.entityLabel;
      }
      this.ctx.actionsApi.handleWidgetAction($event, descriptors[0], entityId, entityName, { entity }, entityLabel);
    }
  }

  public onActionButtonClick($event: Event, entity: EntityData, actionDescriptor: WidgetActionDescriptor) {
    if ($event) {
      $event.stopPropagation();
    }
    let entityId;
    let entityName;
    let entityLabel;
    if (entity) {
      entityId = entity.id;
      entityName = entity.entityName;
      entityLabel = entity.entityLabel;
    }
    this.ctx.actionsApi.handleWidgetAction($event, actionDescriptor, entityId, entityName, { entity }, entityLabel);
  }

  private clearCache() {
    this.cellContentCache.length = 0;
    this.cellStyleCache.length = 0;
    this.rowStyleCache.length = 0;
  }

  // -------------- Code Start ----------------
  handleSearchByColumn() {
    console.log("---------checkFillter--------", this.checkFillter);
    if (this.checkFillter == true) {
      console.log("-------------fillterArr------------", this.fillterArr);
      sessionStorage.setItem("checkFillter", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArr", JSON.stringify(this.fillterArr));
      let arrFillterValue = this.fillterArr.filter(item => {
        return item.value.toString().length > 0;
      })
      console.log("----------realFillterValue---------", arrFillterValue);
      const keyFilters: KeyFilter[] = []; // TODO:
      let initKeyFilter: KeyFilter;
      arrFillterValue.forEach(item => {
        if (item.columnName == "group" || item.columnName == "Line_Type" || item.columnName == "Line_Name" || item.columnName == "Product_Code") {
          initKeyFilter = {
            key: {
              type: EntityKeyType.TIME_SERIES,
              key: item.columnName,
            },
            valueType: EntityKeyValueType.STRING,
            value: undefined,
            predicate: {
              type: FilterPredicateType.STRING,
              operation: StringOperation.CONTAINS,
              value: {
                defaultValue: item.value,
                dynamicValue: null
              },
              ignoreCase: true,
            }
          }
        } else if (item.columnName == "STATUS") {
          initKeyFilter = {
            key: {
              type: EntityKeyType.TIME_SERIES,
              key: item.columnName,
            },
            valueType: EntityKeyValueType.NUMERIC,
            value: undefined,
            predicate: {
              type: FilterPredicateType.NUMERIC,
              operation: NumericOperation.EQUAL,
              value: {
                defaultValue: item.value,
                dynamicValue: null
              },
            }
          }
        } else if (item.columnName == "name") {
          initKeyFilter = {
            key: {
              type: EntityKeyType.ENTITY_FIELD,
              key: item.columnName,
            },
            valueType: EntityKeyValueType.STRING,
            value: undefined,
            predicate: {
              type: FilterPredicateType.STRING,
              operation: StringOperation.CONTAINS,
              value: {
                defaultValue: item.value,
                dynamicValue: null
              },
              ignoreCase: true,
            }
          }
        } else {
          initKeyFilter = {
            key: {
              type: EntityKeyType.ATTRIBUTE,
              key: item.columnName,
            },
            valueType: EntityKeyValueType.STRING,
            value: undefined,
            predicate: {
              type: FilterPredicateType.STRING,
              operation: StringOperation.CONTAINS,
              value: {
                defaultValue: item.value,
                dynamicValue: null
              },
              ignoreCase: true,
            }
          }
        }
        keyFilters.push(initKeyFilter);
      })
      console.log("---------keyFilters PHD---------", keyFilters);
      return keyFilters;
    }
  }
  handleEnter() {
    this.updateData();
  }
  handleKeyUp() {
    this.checkFillter = this.fillterArr.some(item => {
      return item.value.toString().length > 0;
    });
    if (this.checkFillter == false) {
      this.updateData();
      sessionStorage.setItem("checkFillter", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArr", JSON.stringify(this.fillterArr));
    } else {

    }
  }
  handleChangeStatus() {
    this.checkFillter = this.fillterArr.some(item => {
      return item.value.toString().length > 0;
    });
    console.log("----------------handleChangeStatus---------------", this.checkFillter);
    if (this.checkFillter == false) {
      this.updateData();
      sessionStorage.setItem("checkFillter", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArr", JSON.stringify(this.fillterArr));
    } else {
      this.updateData();
    }
  }
  // convertStatus(value){
  //   switch (value) {
  //     case "Stop":
  //       // code
  //       return 0;
  //     case "Running":
  //       return 1;
  //     case "Finish":
  //       return 2;
  //     case "Pause":
  //       return 3;
  //     case "Resume":
  //       return 4;
  //     case "Start_PLC":
  //       return 5;
  //     case "Finish":
  //       return 6;
  //     case "Plan":
  //       return 99
  //     default:
  //       return 10;
  //     // code
  //   }
  // }

  //---------------------------------START HANDLE FILTER EXPORT-----------------------------------------------------
  filterData = (data, query) => {
    var arrKeyItem;
    const filteredData = data.filter((item) => {
      for (let key in query) {
        arrKeyItem = Object.keys(item);
        if (arrKeyItem.includes(key)) {
          if (item[key] != null) {
            if (!item[key].includes(query[key])) {
              return false;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      }
      return true;
    });
    return filteredData;
  };
  //-----------------------------------END HANDLE FILTER EXPORT---------------------------------------------------
  getErrorLabel(codeErr, listErr) {
    var errLabel = "";
    listErr.forEach(item => {
      if (item.name == codeErr) {
        errLabel = item.label;
      }
    })
    return errLabel;
  }
  handleDetailError(listStage, hisliststage, listErr) {
    let detailErrors = [];
    if (listStage == null || listStage == undefined || listStage.length == 0) {
      console.log("detail_error 1: ", detailErrors)
      return detailErrors;
    }

    for (let i = 0; i < listStage.length; i++) {
      let itemList = listStage[i];
      let itemHis;
      if (hisliststage == null || hisliststage == undefined || hisliststage.length == 0) {
        itemHis = [];
        console.log("itemHis detail 1: ", itemHis);
      } else {
        itemHis = hisliststage[i];
        console.log("itemHis detail 2: ", itemHis);
      }

      if (itemList.Error_Detail) {
        for (let j = 0; j < itemList.Error_Detail.length; j++) {
          detailErrors.push({
            err_key: itemList.Error_Detail[j].err_key,
            value: itemList.Error_Detail[j].value,
            stage: itemList.stage_name,
            label: this.getErrorLabel(itemList.Error_Detail[j].err_key.toString(), listErr)
          })
        }
      } else {
        console.log("itemList.Error_Detail null")
      }

      if (itemList.Error_Detail_HMI) {
        for (const property in itemList.Error_Detail_HMI) {
          detailErrors.push({
            err_key: property,
            value: itemList.Error_Detail_HMI[property],
            stage: itemList.stage_name,
            label: this.getErrorLabel(String(property), listErr)
          })
        }
      } else {
        console.log("itemList.Error_Detail_HMI null")
      }

      if (itemHis.Error_Detail) {
        console.log("itemHis.Error_Detail not null")
        for (let j = 0; j < itemHis.Error_Detail.length; j++) {
          detailErrors.push({
            err_key: itemHis.Error_Detail[j].err_key,
            value: itemHis.Error_Detail[j].value,
            stage: itemList.stage_name,
            label: this.getErrorLabel(itemHis.Error_Detail[j].err_key.toString(), listErr)
          })
        }
      } else {
        console.log("itemHis.Error_Detail null")
      }

      if (itemHis.Error_Detail_HMI) {
        console.log("itemHis.Error_Detail_HMI not null")
        for (const property in itemHis.Error_Detail_HMI) {
          detailErrors.push({
            err_key: property,
            value: itemHis.Error_Detail_HMI[property],
            stage: itemList.stage_name,
            label: this.getErrorLabel(String(property), listErr)
          })
        }
      } else {
        console.log("itemHis.Error_Detail_HMI null")
      }
    }
    console.log("detail_error befoce: ", detailErrors);
    if (detailErrors) {
      for (let i = 0; i < detailErrors.length - 1; i++) {
        for (let j = i + 1; j < detailErrors.length; j++) {
          if (detailErrors[i].err_key == detailErrors[j].err_key) {
            console.log("error duplicate: ", detailErrors[i]);
            console.log("error duplicate: ", detailErrors[j]);
            detailErrors[i].value = (parseInt(detailErrors[i].value) + parseInt(detailErrors[j].value)).toString();
            detailErrors.splice(j, 1);
          }
        }
      }
    }
    console.log("detail_error after: ", detailErrors);
    return detailErrors;
  }
  handleGetInfoStageByWO(liststage, hisliststage) {
    console.log("liststage: ", liststage);
    console.log("hisliststage: ", hisliststage);
    let real_stage = [];
    if (liststage == null || liststage == undefined || liststage.length == 0) {
      real_stage = [];
    } else {
      for (let i = 0; i < liststage.length; i++) {
        let itemList = liststage[i];
        real_stage.push({
          stage_name: itemList.stage_name,
          number_of_input: Number(itemList.Number_Of_Input),
          number_of_output: Number(itemList.Number_Of_Output)
        })
      }
    }

    if (hisliststage == null || hisliststage == undefined || hisliststage.length == 0) {
      return real_stage;
    } else {
      if (real_stage.length == 0) {
        for (let i = 0; i < hisliststage.length; i++) {
          let itemHis = hisliststage[i];
          real_stage.push({
            stage_name: itemHis.stage_name,
            number_of_input: Number(itemHis.Number_Of_Input),
            number_of_output: Number(itemHis.Number_Of_Output)
          })
        }
      } else {
        for (let i = 0; i < hisliststage.length; i++) {
          for (let j = 0; j < real_stage.length; j++) {
            if (hisliststage[i].stage_name == real_stage[j].stage_name) {
              real_stage[j].number_of_input = real_stage[j].number_of_input + Number(hisliststage[i].Number_Of_Input);
              real_stage[j].number_of_output = real_stage[j].number_of_output + Number(hisliststage[i].Number_Of_Output);
            }
          }
        }
      }
    }
    console.log("real_stage: ", real_stage);
    return real_stage;
  }
  handlePPM(entity_list_stage,
    entity_his_list_stage, entity_quota) {
    var value: any = 0;
    var sum_err: any = 0;
    if (entity_list_stage.length > 0) {
      sum_err = this.totalError(entity_list_stage, entity_his_list_stage);
      var quota: any = entity_quota ? entity_quota : 0;
      var input: any = entity_list_stage[0]?.Number_Of_Input;
      var hisInput: any;
      if (entity_his_list_stage != null) {
        hisInput = entity_his_list_stage[0]?.Number_Of_Input;
      } else {
        hisInput = 0;
      }
      input += hisInput;
      if (input && input > 0 && quota > 0) {
        var ppm: any = parseFloat((1000000 * parseInt(sum_err) / parseInt(input) / parseFloat(quota)).toString()).toFixed(2);
        value = ppm;
      } else {
        value = 0;
      }

    }
    return value;
  }

  handleOEE_NangSuatThucTinh(entity_STATUS, entity_startTime, entity_stopTime, entity_runningTime, entity_stoppingTime, entity_list_stage,
    entity_his_list_stage, entity_cycle_time, entity_Planning_Time, entity_Number_Of_Planning) {
    var countRunning;
    var countStoping;
    const RUNNING = 1;//Start
    const FINISH = 2;
    const STOP = 0;
    const RESUME = 4;
    const PAUSE = 3;
    const CLEAR = 5; //don't send command
    var STATUS = parseInt(entity_STATUS);
    switch (STATUS) {
      case RUNNING:
        countRunning = Math.floor((Date.now() - parseInt(entity_startTime) + parseInt(entity_runningTime)) / 1000);
        countStoping = parseInt(entity_stoppingTime) / 1000;
        break;
      case STOP:
        countRunning = parseInt(entity_runningTime) / 1000;
        countStoping = Math.floor((Date.now() - parseInt(entity_stopTime) + parseInt(entity_stoppingTime)) / 1000);
        break;
      case PAUSE:
        countRunning = parseInt(entity_runningTime) / 1000;
        countStoping = parseInt(entity_stoppingTime) / 1000;
        break;
      case FINISH:
        countRunning = parseInt(entity_runningTime) / 1000;
        countStoping = parseInt(entity_stoppingTime) / 1000;
        break;
      case CLEAR:
        countRunning = 0;
        countStoping = 0;
        break;
    }

    var output: any = 0;
    var input: any = 0;
    var sum_err = 0;
    if (entity_list_stage) {
      let current_stage = this.get_real_current_stage(entity_list_stage, entity_his_list_stage);
      output = parseInt(current_stage[current_stage.length - 1]?.Number_Of_Output || 0);
      input = parseInt(current_stage[0]?.Number_Of_Input || 0);
      sum_err = this.totalError(entity_list_stage, entity_his_list_stage);
    }
    var nsthuctinh = output / (countRunning / 3600)
    var OEE;
    if ((countRunning > 0) && (input > 0) && (entity_cycle_time > 0) && (entity_Planning_Time > 0) && (entity_Number_Of_Planning > 0)) {
      var OEE1 = parseInt(countRunning) / parseInt(entity_Planning_Time)
      //fix: parseFloat -> parseInt
      var OEE2 = parseInt(entity_cycle_time) * (parseInt(input) / parseInt(countRunning))
      var OEE3 = parseInt(output) / parseInt(entity_Number_Of_Planning)
      console.log("OEE1 ", OEE1);
      console.log("OEE2 ", OEE2);
      console.log("OEE3: ", OEE3);
      OEE = OEE1 * OEE2 * OEE3;
      var OEE_ex =  parseFloat(OEE).toFixed(2);
      console.log("OEE: ", OEE_ex);
    
    } else {
      OEE = 0;
    }
    return {
      oeeValue: OEE_ex,
      nsthuctinhValue: nsthuctinh,
      tongLoi: sum_err
    }
  }
  totalError(list_stage, his_list_stage): any {
    var sum_err = 0;
    var sum_list_err_detail = 0, sum_list_err_detail_hmi = 0;
    var sum_his_err_detail = 0, sum_his_err_detail_hmi = 0;
    if (list_stage.length > 0) {
      for (var i = 0; i < list_stage.length; i++) {
        if (list_stage[i].hasOwnProperty("Error_Detail")) {
          if (list_stage[i]["Error_Detail"].length > 0) {
            var list_err_detail = list_stage[i]["Error_Detail"];
            for (var x = 0; x < list_err_detail.length; x++) {
              if (list_err_detail[x].value != null) {
                sum_list_err_detail += parseInt(list_err_detail[x].value);
              }
            }
          }
        }
        if (list_stage[i].hasOwnProperty("Error_Detail_HMI")) {
          if (!jQuery.isEmptyObject(list_stage[i]["Error_Detail_HMI"])) {
            var list_err_detail_hmi = list_stage[i]["Error_Detail_HMI"];
            for (const property in list_err_detail_hmi) {
              sum_list_err_detail_hmi += parseInt(list_err_detail_hmi[property]);
            }
          }
        }
      }
    }
    console.log("--------sum_list_err_detail---------", sum_list_err_detail);
    console.log("--------sum_list_err_detail_hmi-------", sum_list_err_detail_hmi);

    if (his_list_stage != null) {
      if (his_list_stage.length > 0) {
        for (var i = 0; i < his_list_stage.length; i++) {
          if (his_list_stage[i].hasOwnProperty("Error_Detail")) {
            if (his_list_stage[i]["Error_Detail"].length > 0) {
              var his_err_detail = his_list_stage[i]["Error_Detail"];
              for (var x = 0; x < his_err_detail.length; x++) {
                if (his_err_detail[x].value != null) {
                  sum_his_err_detail += parseInt(his_err_detail[x].value);
                }
              }
            }
          }
          if (his_list_stage[i].hasOwnProperty("Error_Detail_HMI")) {
            if (!jQuery.isEmptyObject(his_list_stage[i]["Error_Detail_HMI"])) {
              var his_err_detail_hmi = his_list_stage[i]["Error_Detail_HMI"];
              for (const property in his_err_detail_hmi) {
                sum_his_err_detail_hmi += parseInt(his_err_detail_hmi[property]);
              }
            }
          }
        }
      }
    }
    console.log("------------sum_his_err_detail------------------", sum_his_err_detail);
    console.log("------------sum_his_err_detail_hmi--------------", sum_his_err_detail_hmi);
    sum_err = sum_list_err_detail + sum_list_err_detail_hmi + sum_his_err_detail + sum_his_err_detail_hmi;
    console.log("===========SUM=============", sum_err);
    return sum_err;
  }
  get_real_current_stage(list_stage, his_list_stage) {
    let real_stage = [];
    if (list_stage == null || list_stage == undefined || list_stage.length == 0) {
      return real_stage;
    }
    if (his_list_stage == null || his_list_stage == undefined || his_list_stage.length == 0) {
      return list_stage;
    }
    var item_list = null;
    var item_his = null;
    for (var i = 0; i < list_stage.length; i++) {
      let item_real: any = {};
      item_list = list_stage[i];
      item_his = his_list_stage[i] || [];
      let Error_Detail_HMI = {};
      let Error_Detail = [];
      let Number_Of_Error = 0;
      let Number_Of_Hmi_Error = 0;
      //xu ly detail va detail HMI
      if (item_list.Error_Detail) {
        for (var j = 0; j < item_list.Error_Detail.length; j++) {
          Error_Detail.push({
            err_key: item_list.Error_Detail[j].err_key,
            value: parseFloat(item_list.Error_Detail[j].value || 0) + parseFloat(item_his.Error_Detail ? (item_his.Error_Detail[j] ? (item_his.Error_Detail[j].value || 0) : 0) : 0)
          });
          Number_Of_Error += parseFloat(item_list.Error_Detail[j].value || 0) + parseFloat(item_his.Error_Detail ? (item_his.Error_Detail[j] ? (item_his.Error_Detail[j].value || 0) : 0) : 0);
        }
      }
      if (item_list.Error_Detail_HMI) {
        for (var key in item_list.Error_Detail_HMI) {
          Error_Detail_HMI[key] = parseFloat(item_list.Error_Detail_HMI[key] || 0) + parseFloat(item_his.Error_Detail_HMI ? (item_his.Error_Detail_HMI[key] || 0) : 0);
          Number_Of_Hmi_Error += parseFloat(item_list.Error_Detail_HMI[key] || 0) + parseFloat(item_his.Error_Detail_HMI ? (item_his.Error_Detail_HMI[key] || 0) : 0);
        }
      }
      //xu ly tham so con lai
      item_real.Error_Detail_HMI = Error_Detail_HMI;
      item_real.Error_Detail = Error_Detail;
      item_real.stage_name = item_list.stage_name;
      item_real.asset_Id = item_list.asset_Id;
      item_real.Number_Of_Error = Number_Of_Error;
      item_real.Number_Of_Hmi_Error = Number_Of_Hmi_Error;
      item_real.Number_Of_Input = parseFloat(item_list.Number_Of_Input || 0) + parseFloat(item_his.Number_Of_Input || 0);
      item_real.Number_Of_Output = parseFloat(item_list.Number_Of_Output || 0) + parseFloat(item_his.Number_Of_Output || 0);
      //push vao real_stage
      real_stage.push(item_real);
    }
    return real_stage;
  }
  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp);
    var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + '/' + month + '/' + year + '/ ' + hour + ':' + min + ':' + sec;
    return time;
  }

  padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }

  formatDate(date) {
    return (
      [
        date.getFullYear(),
        this.padTo2Digits(date.getMonth() + 1),
        this.padTo2Digits(date.getDate()),
      ].join('-') +
      ' ' +
      [
        this.padTo2Digits(date.getHours()),
        this.padTo2Digits(date.getMinutes()),
        this.padTo2Digits(date.getSeconds()),
      ].join(':')
    );
  }
  formartRunning_Time(entity_STATUS, entity_Start_Time, entity_Running_Time) {
    var STATUS = parseInt(entity_STATUS);
    var startTime = entity_Start_Time;
    var countRunning = entity_Running_Time;
    var runningTime = entity_Running_Time;
    // console.log('x1------>', STATUS);
    // console.log('x2------>', startTime);
    // console.log('x3------>', runningTime);

    switch (STATUS) {
      case 1:
        countRunning = Math.floor((Date.now() - parseInt(
          startTime) + parseInt(runningTime)) /
          1000);
        break;
      case 0:
        countRunning = parseInt(runningTime) / 1000;
        break;
      case 3:
        countRunning = parseInt(runningTime) / 1000;
        break;
      case 2:
        countRunning = parseInt(runningTime) / 1000;
        break;

    }
    return this.secondsToHms(countRunning);
  }
  formartStoping_Time(entity_STATUS, entity_Stop_Time, entity_Stopping_Time) {
    var STATUS = parseInt(entity_STATUS);
    var stopTime = entity_Stop_Time;
    var stoppingTime = entity_Stopping_Time;
    var countStoping = entity_Stopping_Time;
    switch (STATUS) {
      case 1:
        countStoping = parseInt(stoppingTime) / 1000;
        break;
      case 0:
        countStoping = Math.floor((Date.now() - parseInt(stopTime) + parseInt(stoppingTime)) / 1000);
        break;
      case 3:
        countStoping = parseInt(stoppingTime) / 1000;
        break;
      case 2:
        countStoping = parseInt(stoppingTime) / 1000;
        break;

    }
    return this.secondsToHms(countStoping);
  }
  secondsToHms(secs: any) {
    var time = new Date();
    time.setHours(parseInt((secs / 3600).toString()) % 24);
    time.setMinutes(parseInt((secs / 60).toString()) % 60);
    time.setSeconds(parseInt((secs % 60).toString()));
    var timeFormart = time.toTimeString().split(" ")[0];
    return timeFormart;
  }
  formnatStatus(status) {
    switch (status) {
      case 0:
        return "Stop";
      case 1:
        return "Running";
      case 2:
        return "Finish";
      case 3:
        return "Pause";
      case 4:
        return "Resume";
      case 5:
        return "Start_PLC";
      case 6:
        return "Finish";
      case 99:
        return "Plan"
      default:
        return "Waiting";
    }
  }
  handleDashDauVao(entity_list_stage, entity_his_list_stage): any {
    var list_stage = entity_list_stage;
    var his_list_stage = entity_his_list_stage;
    var rs = 0;
    if (list_stage && list_stage.length > 0) {
      rs += list_stage[0]?.Number_Of_Input || 0;
    }
    if (his_list_stage && his_list_stage.length > 0) {
      rs += his_list_stage[0]?.Number_Of_Input || 0;
    }
    return rs;
  }
  handleDashDauRa(entity_list_stage, entity_his_list_stage): any {
    // var list_stage = JSON.parse(entity_list_stage);
    // var his_list_stage = JSON.parse(entity_his_list_stage);
    var list_stage = entity_list_stage;
    var his_list_stage = entity_his_list_stage;
    var output = 0;
    if (list_stage && list_stage.length > 0) {
      output += list_stage[list_stage.length - 1].Number_Of_Output || 0;
    }
    if (his_list_stage && his_list_stage.length > 0) {
      output += his_list_stage[his_list_stage.length - 1].Number_Of_Output || 0;
    }

    return output;
  }
  handleTiLeHoanThanh(entity_Number_Of_Planning, entity_dashDauRa) {
    var number = parseFloat(entity_dashDauRa) / parseFloat(entity_Number_Of_Planning) * 100;
    // var number_float = parseFloat(number).toFixed(2);

    return Math.round(number * 100) / 100 + "%";
  }
  handleCycleTimeHoanThanh(entity_dashDauRa, entity_STATUS, entity_startTime, entity_runningTime) {
    var num = parseFloat(entity_dashDauRa) / parseFloat(this.handleRunningTime(entity_STATUS, entity_startTime, entity_runningTime));
    // console.log("--------- PHD CycleTimeHoanThanh ----------------", Math.round(num * 1000000) / 1000000);
    var cycle_TimeHoanThanh = Math.round(num * 1000000) / 1000000;
    return cycle_TimeHoanThanh.toString() == 'NaN' ? '' : cycle_TimeHoanThanh;
  }
  handleRunningTime(entity_STATUS, entity_startTime, entity_runningTime): any {
    var countRunning = entity_runningTime;
    var STATUS = parseInt(entity_STATUS);
    switch (STATUS) {
      case 1:
        countRunning = Math.floor((Date.now() - parseInt(
          entity_startTime) + parseInt(entity_runningTime)) /
          1000);
        break;
      case 0:
        countRunning = parseInt(entity_runningTime) / 1000;
        break;
      case 3:
        countRunning = parseInt(entity_runningTime) / 1000;
        break;
    }
    return countRunning;
  }
  handleDataError(liststage, hisliststage) {
    let real_error = [];
    if (liststage == null || liststage == undefined || liststage.length == 0) {
      console.log("real_error 1: ", real_error)
      return real_error;
    }

    let Error_detail = [];
    for (let i = 0; i < liststage.length; i++) {
      let itemList = liststage[i];
      let itemHis;
      if (hisliststage == null || hisliststage == undefined || hisliststage.length == 0) {
        itemHis = [];
        console.log("itemHis 1: ", itemHis);
      } else {
        itemHis = hisliststage[i];
        console.log("itemHis 2: ", itemHis);
      }

      let sumError = 0;
      if (itemList.Error_Detail) {
        console.log("itemList.Error_Detail not null")
        for (let j = 0; j < itemList.Error_Detail.length; j++) {
          sumError += parseInt(itemList.Error_Detail[j].value);
        }
      } else {
        console.log("itemList.Error_Detail null")
      }

      if (itemList.Error_Detail_HMI) {
        console.log("itemList.Error_Detail not null")
        for (const property in itemList.Error_Detail_HMI) {
          sumError += parseInt(itemList.Error_Detail_HMI[property]);
        }
      } else {
        console.log("itemList.Error_Detail null")
      }

      if (itemHis.Error_Detail) {
        console.log("itemHis.Error_Detail not null")
        for (let j = 0; j < itemHis.Error_Detail.length; j++) {
          sumError += parseInt(itemHis.Error_Detail[j].value);
        }
      } else {
        console.log("itemHis.Error_Detail null")
      }

      if (itemHis.Error_Detail_HMI) {
        console.log("itemHis.Error_Detail not null")
        for (const property in itemHis.Error_Detail_HMI) {
          sumError += parseInt(itemHis.Error_Detail_HMI[property]);
        }
      } else {
        console.log("itemHis.Error_Detail null")
      }

      console.log("sumError: ", sumError);
      real_error.push({
        stage_name: itemList.stage_name,
        asset_Id: itemList.asset_Id,
        Number_Of_Error_new: sumError,
        Number_Of_Error: itemList.Number_Of_Error
      })
    }
    console.log("real_error 2: ", real_error);
    return real_error;
  }

  handleDoTinCay(liststage, hisliststage, listErrInCommon, inputStages) {

    let detailErrorsGroup = [];
    if (liststage == null || liststage == undefined || liststage.length == 0) {
      // console.log("detail_error 1: ", detailErrorsGroup)
      detailErrorsGroup = [];
    }

    for (let i = 0; i < liststage.length; i++) {
      let itemList = liststage[i];

      if (itemList.Error_Detail) {
        for (let j = 0; j < itemList.Error_Detail.length; j++) {
          detailErrorsGroup.push({
            err_key: itemList.Error_Detail[j].err_key,
            value: itemList.Error_Detail[j].value
          })
        }
      }

      if (itemList.Error_Detail_HMI) {
        for (const property in itemList.Error_Detail_HMI) {
          detailErrorsGroup.push({
            err_key: property,
            value: itemList.Error_Detail_HMI[property]
          })
        }
      }

    }

    if (hisliststage == null || hisliststage == undefined || hisliststage.length == 0) {
      hisliststage = [];
    }

    for (let i = 0; i < hisliststage.length; i++) {
      let itemHis = hisliststage[i];

      if (itemHis.Error_Detail) {
        for (let j = 0; j < itemHis.Error_Detail.length; j++) {
          detailErrorsGroup.push({
            err_key: itemHis.Error_Detail[j].err_key,
            value: itemHis.Error_Detail[j].value
          })
        }
      }

      if (itemHis.Error_Detail_HMI) {
        for (const property in itemHis.Error_Detail_HMI) {
          detailErrorsGroup.push({
            err_key: property,
            value: itemHis.Error_Detail_HMI[property]
          })
        }
      }
    }

    if (detailErrorsGroup) {
      for (let i = 0; i < detailErrorsGroup.length - 1; i++) {
        for (let j = i + 1; j < detailErrorsGroup.length; j++) {
          if (detailErrorsGroup[i].err_key == detailErrorsGroup[j].err_key) {
            detailErrorsGroup[i].value = (parseInt(detailErrorsGroup[i].value) + parseInt(detailErrorsGroup[j].value)).toString();
            detailErrorsGroup.splice(j, 1);
            j = j - 1;
          }
        }
      }
    }

    let totalErrorNC = 0;
    let totalErrorLY = 0;
    for (let i = 0; i < listErrInCommon.length; i++) {
      for (let j = 0; j < detailErrorsGroup.length; j++) {
        if (listErrInCommon[i].key == detailErrorsGroup[j].err_key) {
          if (listErrInCommon[i].value[0].hasOwnProperty("type_error")) {
            if (listErrInCommon[i].value[0].type_error == "Lỗi LY") {
              totalErrorLY = totalErrorLY + parseInt(detailErrorsGroup[j].value);
            } else if (listErrInCommon[i].value[0].type_error == "Lỗi NC") {
              totalErrorNC = totalErrorNC + parseInt(detailErrorsGroup[j].value);
            }
          }
        }
      }
    }
    // console.log("totalErrorNC: ", totalErrorNC);
    // console.log("ttotalErrorLY: ", totalErrorLY);

    var valueDoTinCay = 0;
    valueDoTinCay = 100 - ((((totalErrorNC * 2) + totalErrorLY) / inputStages) * 100);
    var convertValue = valueDoTinCay.toString() != "NaN" ? valueDoTinCay : "";
    return convertValue;
  }
  exportArrayToExcel(arr: any[], sheetName, fileName) {
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    console.log('-------PHD arr ------', arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  exportToExcel(arr: any[], sheetName, fileName, arrStageDetail: any[], arrListErrStage: any[], arrListSerial: any[]) {
    let Heading = [['PlanningWO', 'Tên WoLine', 'Mã PO', 'Đơn vị Sản xuất', 'Tổ', 'Mã WO', 'Số lô', 'Sản lượng kế hoạch',
      'Mã hàng hóa', 'Tên hàng hóa', 'Line_Name', 'Sản lượng đầu vào', 'Sản lượng hoàn thành', 'Tỉ lệ hoàn thành',
      'Cycle_Time trung bình', 'Thời gian bắt đâu sản xuất', 'Thời gian chạy', 'Thời gian dừng', 'Ngày tiếp nhận', 'Kiểu dây chuyền',
      'OEE', 'PPM', 'Tổng lỗi', 'Độ tin cậy', 'Năng suất thực tính']];
    //Had to create a new workbook and then add the header
    const wb = XLSX.utils.book_new();
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(ws, Heading);

    //Starting in the second row to avoid overriding and skipping headers
    XLSX.utils.sheet_add_json(ws, arr, {
      // header: ['planning_Code', 'name', 'po_Id', 'branch', 'group', 'TrangThai', 'line_Name', 'sap_Wo', 'lot_Number', 
      // 'product_Code', 'product_Name', 'number_Of_Planning', 'dash_dau_vao', 'dash_dau_ra', 'ti_le_hoan_thanh',
      // 'Cycle_Time_trung_binh', 'ThoiGianChay', 'ThoiGianDung', 'NgayTiepNhan', 'line_Id', 'line_Type'],
      header: ['planning_Code', 'name', 'po_Id', 'branch', 'group', 'sap_Wo', 'lot_Number', 'number_Of_Planning', 'product_Code',
        'product_Name', 'line_Name', 'dash_dau_vao', 'dash_dau_ra', 'ti_le_hoan_thanh', 'Cycle_Time_trung_binh', 'ThoiGianBatDauSX',
        'ThoiGianChay', 'ThoiGianDung', 'NgayTiepNhan', 'line_Type', 'oee', 'ppm', 'TongLoi', 'DoTinCay', 'NangSuatThucTinh'],
      origin: 'A2',
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(wb, ws, sheetName);


    let HeadingStageDetail = [['PlanningWO', 'Tên WoLine', 'Mã PO', 'Đơn vị Sản xuất', 'Tổ', 'Mã WO', 'Số lô',
      'StageMachine', 'Sản lượng đầu vào', 'Sản lượng hoàn thành', 'Thời gian chạy', 'Thời gian dừng', 'OEE', 'PPM', 'Tổng lỗi']];
    const wsStageDetail: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(wsStageDetail, HeadingStageDetail);
    XLSX.utils.sheet_add_json(wsStageDetail, arrStageDetail, {
      header: ['planning_Code', 'name', 'po_Id', 'branch', 'group', 'sap_Wo', 'lot_Number', 'StageMachine',
        'StageInput', 'StageOutput', 'ThoiGianChay', 'ThoiGianDung', 'oee', 'ppm', 'TongLoi'],
      origin: 'A2',
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(wb, wsStageDetail, "StageDetailWo");


    let HeadingListErrStage = [['PlanningWO', 'Tên WoLine', 'Mã PO', 'Đơn vị Sản xuất', 'Tổ', 'Mã WO', 'Số lô',
      'StageMachine', 'ErrorCode', 'ErrorName', 'Number Of Error']];

    const wsListErrStage: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(wsListErrStage, HeadingListErrStage);
    XLSX.utils.sheet_add_json(wsListErrStage, arrListErrStage, {
      header: ['planning_Code', 'name', 'po_Id', 'branch', 'group', 'sap_Wo', 'lot_Number', 'stage',
        'err_key', 'label', 'value'],
      origin: 'A2',
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(wb, wsListErrStage, "ListErrStage");

    let HeadingListSerial = [['PlanningWO', 'Tên WoLine', 'Mã PO', 'Stage', 'Serial board', 'Serial_Pcs', 'Time']];
    const wsListSerial: XLSX.WorkSheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.sheet_add_aoa(wsListSerial, HeadingListSerial);
    XLSX.utils.sheet_add_json(wsListSerial, arrListSerial, {
      header: ['planning_Code', 'name', 'po_Id', 'stage', 'serialBoard', 'serial', 'lastUpdateTs'],
      origin: 'A2',
      skipHeader: true,
    });

    XLSX.utils.book_append_sheet(wb, wsListSerial, "ListSerial");

    XLSX.writeFile(wb, `${fileName}.xlsx`);
    this.ctx.showSuccessToast("Xuất excel thành công", 2000, "top", "left");
    // this.handleLoading(false);
    this.loadingEl.nativeElement.classList.remove("spinner");
    this.loadingEl.nativeElement.classList.add("hide");
  }
  // ------------- Code End ------------------

}

class EntityDatasource implements DataSource<EntityData> {

  private entitiesSubject = new BehaviorSubject<EntityData[]>([]);
  private pageDataSubject = new BehaviorSubject<PageData<EntityData>>(emptyPageData<EntityData>());

  private currentEntity: EntityData = null;

  public dataLoading = true;

  private appliedPageLink: EntityDataPageLink;
  private appliedSortOrderLabel: string;

  constructor(
    private translate: TranslateService,
    private dataKeys: Array<DataKey>,
    private subscription: IWidgetSubscription,
    private ngZone: NgZone
  ) {
  }

  connect(collectionViewer: CollectionViewer): Observable<EntityData[] | ReadonlyArray<EntityData>> {
    return this.entitiesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.entitiesSubject.complete();
    this.pageDataSubject.complete();
  }

  loadEntities(pageLink: EntityDataPageLink, sortOrderLabel: string, keyFilters: KeyFilter[]) {
    this.dataLoading = true;
    // this.clear();
    this.appliedPageLink = pageLink;
    this.appliedSortOrderLabel = sortOrderLabel;
    this.subscription.subscribeForPaginatedData(0, pageLink, keyFilters);
  }


  dataUpdated() {
    const datasourcesPageData = this.subscription.datasourcePages[0];
    const dataPageData = this.subscription.dataPages[0];
    let entities = new Array<EntityData>();
    datasourcesPageData.data.forEach((datasource, index) => {
      entities.push(this.datasourceToEntityData(datasource, dataPageData.data[index]));
    });
    if (this.appliedSortOrderLabel && this.appliedSortOrderLabel.length) {
      const asc = this.appliedPageLink.sortOrder.direction === Direction.ASC;
      entities = entities.sort((a, b) => sortItems(a, b, this.appliedSortOrderLabel, asc));
    }
    const entitiesPageData: PageData<EntityData> = {
      data: entities,
      totalPages: datasourcesPageData.totalPages,
      totalElements: datasourcesPageData.totalElements,
      hasNext: datasourcesPageData.hasNext
    };
    this.ngZone.run(() => {
      this.entitiesSubject.next(entities);
      this.pageDataSubject.next(entitiesPageData);
      this.dataLoading = false;
    });
  }

  private datasourceToEntityData(datasource: Datasource, data: DatasourceData[]): EntityData {
    const entity: EntityData = {
      id: {} as EntityId,
      entityName: datasource.entityName,
      entityLabel: datasource.entityLabel ? datasource.entityLabel : datasource.entityName
    };
    if (datasource.entityId) {
      entity.id.id = datasource.entityId;
    }
    if (datasource.entityType) {
      entity.id.entityType = datasource.entityType;
      entity.entityType = this.translate.instant(entityTypeTranslations.get(datasource.entityType).type);
    } else {
      entity.entityType = '';
    }
    this.dataKeys.forEach((dataKey, index) => {
      const keyData = data[index].data;
      if (keyData && keyData.length && keyData[0].length > 1) {
        if (data[index].dataKey.type !== DataKeyType.entityField || !entity.hasOwnProperty(dataKey.label)) {
          entity[dataKey.label] = keyData[0][1];
        }
      } else {
        entity[dataKey.label] = '';
      }
    });
    return entity;
  }

  isEmpty(): Observable<boolean> {
    return this.entitiesSubject.pipe(
      map((entities) => !entities.length)
    );
  }

  total(): Observable<number> {
    return this.pageDataSubject.pipe(
      map((pageData) => pageData.totalElements)
    );
  }

  public toggleCurrentEntity(entity: EntityData): boolean {
    if (this.currentEntity !== entity) {
      this.currentEntity = entity;
      return true;
    } else {
      return false;
    }
  }

  public isCurrentEntity(entity: EntityData): boolean {
    return (this.currentEntity && entity && this.currentEntity.id && entity.id) &&
      (this.currentEntity.id.id === entity.id.id);
  }
}
