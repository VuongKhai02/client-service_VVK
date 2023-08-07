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
  selector: 'tb-sanluong-entities-table',
  templateUrl: './sanluong-entities-table.component.html',
  styleUrls: ['./sanluong-entities-table.component.scss', './table-widget.scss']
})
export class SanluongEntitiesTableComponent extends PageComponent implements OnInit, AfterViewInit, OnDestroy {

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

  handleLoading(_isLoading: boolean) {
    this.isLoading = _isLoading;
  }


  private searchAction: WidgetAction = {
    name: 'action.search',
    show: true,
    icon: 'search',
    onAction: () => {
      this.enterFilterMode();
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
    
    // -------------------- Code Start -----------------
    var localCheckFilter = JSON.parse(sessionStorage.getItem("checkFillterSanLuong"));
    console.log("----------localCheckFilter------------", localCheckFilter);
    var localFillterArr = JSON.parse(sessionStorage.getItem("fillterArrSanLuong"));
    console.log("----------localFillterArr------------", localFillterArr);
    var giamsatPageIndex = JSON.parse(sessionStorage.getItem("sanluongPageIndex"));
    this.paginator.pageIndex = giamsatPageIndex;
    var giamsatPageSize = JSON.parse(sessionStorage.getItem("sanluongPageSize"));
    this.paginator.pageSize = giamsatPageSize;
    this.updateData();
    if (localCheckFilter == true) {
      this.checkFillter = true;
      this.fillterArr = localFillterArr;
      this.updateData();
    } else {

    }
    // -------------------- Code End ------------------------
  }
  ngOnDestroy() {
    sessionStorage.setItem("sanluongPageIndex", JSON.stringify(this.paginator.pageIndex));
    sessionStorage.setItem("sanluongPageSize", JSON.stringify(this.paginator.pageSize));
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
      sessionStorage.setItem("checkFillterSanLuong", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArrSanLuong", JSON.stringify(this.fillterArr));
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
      sessionStorage.setItem("checkFillterSanLuong", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArrSanLuong", JSON.stringify(this.fillterArr));
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
      sessionStorage.setItem("checkFillterSanLuong", JSON.stringify(this.checkFillter));
      sessionStorage.setItem("fillterArrSanLuong", JSON.stringify(this.fillterArr));
    } else {
      this.updateData();
    }
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

