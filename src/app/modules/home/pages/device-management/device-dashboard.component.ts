import {
  Component,
  OnInit,
  AfterViewInit
} from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';
import { TelemetryWebsocketService } from '@app/core/public-api';
import { NgZone } from '@angular/core';
import { EntityId } from '@app/shared/models/id/entity-id';
import {
  AttributeData,
  AttributeScope,
  isClientSideTelemetryType,
  TelemetrySubscriber,
  TelemetryType,
  LatestTelemetry
} from '@shared/models/telemetry/telemetry.models';
import { Observable, ReplaySubject, of, BehaviorSubject } from 'rxjs';
import { catchError, map, publishReplay, refCount, take, tap } from 'rxjs/operators';
import { CollectionViewer, DataSource, SelectionModel } from '@angular/cdk/collections';
import { AttributeService } from '@app/core/public-api';
import { DeviceDashboardMQTTData, EntityType } from '@app/shared/public-api';
import { PageLink } from '@shared/models/page/page-link';
import { emptyPageData, PageData } from '@shared/models/page/page-data';
import { TranslateService } from '@ngx-translate/core';
import { AttributeDatasource } from '@home/models/datasource/attribute-datasource';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Device } from '@shared/models/device.models';
import { DeviceService } from '@app/core/public-api';
@Component({
  selector: 'tb-device-dashboard',
  templateUrl: './device-dashboard.component.html',
  styleUrls: ['./device-dashboard.component.scss']
})
export class DeviceDashboardComponent implements OnInit, AfterViewInit {
  doughnutChartLabels: Label[] = ['Kế hoạch', 'Thời gian'];
  scheduleWithTimeDoughnutChart: MultiDataSet = [
    [112.15, 83.16]
  ];
  doughnutChartType: ChartType = 'doughnut';
  barChartOptions: ChartOptions = {
    responsive: true,
  };
  barChartLabels: Label[] = ['CĐ1', 'CĐ2', 'CĐ3', 'CĐ4', 'CĐ5', 'CĐ6'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  errorOfHourBarChart: ChartDataSets[] = [
    { data: [0.2, 0.3, 0.4, 0.5, 0.4, 0.2], label: 'Số lỗi công đoạn theo giờ' }
  ];

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['CĐ1'], ['CĐ2'], 'CĐ3', 'CĐ4'];
  public errorOfPartPieData: SingleDataSet = [10, 20, 30, 40];
  public errorOfDetailPieData: SingleDataSet = [10, 20, 30, 40];

  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  attributeScope = LatestTelemetry;
  pageLink: PageLink;
  public selection = new SelectionModel<AttributeData>(true, []);
  dataSource: AttributeDatasource;
  mainData = {
    "name": "Dung",
    "phone": "0917311594",
    "age": 32,
    "nameDevice": "Đèn LED Panel MQL 1046 2x2 CCT (Yankon-ENEREGETIC)",
    "codeDevice": "0202002",
    "commands": [
      {
        "command": "399393",
        "codeCommand": "858593dd",
        "order": "Khách hàng Yankon",
        "schechule": "2000"
      }
    ],
    "quantityErrors": [
      {
        "inputQuantity": "1037",
        "completeQuantity": "3233",
        "errorProduct": 20,
        "error": 30
      }
    ],
    "scheduleWithTime": [29, 50],
    "oee": "499429",
    "time": Date.now(),
    "status": [true, false, true],
    "timeStart": 1634800745613,
    "timeRunning": 1634811780085,
    "timeStop": 1634870140942,
    "averageProductivity": "100",
    "speed": "2000",
    "reliability": "oke",
    "totalError": "199"
  };
  dashboardForm = this.fb.group({
    timeStart: [{value: '', disabled: true}],
    timeRunning: [{value: '', disabled: true}],
    timeStop: [{value: '', disabled: true}],
    averageProductivity: [{value: '', disabled: true}],
    speed: [{value: '', disabled: true}],
    reliability: [{value: '', disabled: true}],
    totalError: [{value: '', disabled: true}]
  })
  commands: [];
  quantityErrors: [];
  status: [];
  devices: Device[] = [];
  constructor(
    private telemetryWsService: TelemetryWebsocketService,
    private zone: NgZone,
    private attributeService: AttributeService,
    private translate: TranslateService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private deviceService: DeviceService
  ) {
    this.dataSource = new AttributeDatasource(this.attributeService, this.telemetryWsService, this.zone, this.translate);
    this.dataSource.pageData$.subscribe((data: any) => {
      console.log("Device attributes: ", data);
      this.fetchData(data.data);
    })
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();

  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      console.log(params['id']);
      const id = params['id'];
      const entityId: EntityId = {
        entityType: EntityType.ASSET,
        id: id
      }
      const keys = ['deviceList'];
      this.attributeService.getEntityAttributes(entityId, AttributeScope.SERVER_SCOPE, keys).subscribe(data => {
        this.devices = data[0].value;
        this.updateData(true);
      })
    })
  }


  ngAfterViewInit(): void {
    this.updateData(true);
  }

  fetchData(data: AttributeData[]) {
    data.forEach((element: any) => {
      switch (element.key) {
        case "errorOfHour":
          this.errorOfHourBarChart[0].data = JSON.parse(element.value);
          break;
        case "errorOfPart":
          this.errorOfPartPieData = JSON.parse(element.value);
          break;
        case "errorOfDetail":
          this.errorOfDetailPieData = JSON.parse(element.value);
          break;
        case "scheduleWithTime":
          this.scheduleWithTimeDoughnutChart = JSON.parse(element.value);
          break;
        case "name":
          this.mainData.name = element.value;
          break;
        case "phone":
          this.mainData.phone = element.value;
          break;
        case 'age':
          this.mainData.age = element.value;
          break;
        case "nameDevice":
          this.mainData.nameDevice = element.value;
          break;
        case "codeDevice":
          this.mainData.codeDevice = element.value;
          break;
        case "commands":
          this.commands = JSON.parse(element.value);
          break;
        case "quantityErrors":
          this.quantityErrors = JSON.parse(element.value);
          break;
        case "oee":
          this.mainData.oee = element.value;
          break;
        case "status":
          console.log("Status: ", element.value);
          this.status = JSON.parse(element.value);
          break;
        case "timeStart":
          this.dashboardForm.controls['timeStart'].setValue(formatDate(element.value, "yyyy-MM-dd HH:mm:ss", 'en'));
          console.log("this.dashboardForm.value.timeStart: ", this.dashboardForm.value.timeStart);
          break;
        case "timeRunning":
          this.dashboardForm.controls['timeRunning'].setValue(formatDate(element.value, "yyyy-MM-dd HH:mm:ss", 'en'));
          break;
        case "timeStop":
          this.dashboardForm.controls['timeStop'].setValue(formatDate(element.value, "yyyy-MM-dd HH:mm:ss", 'en'));
          break;
        case "averageProductivity":
          this.dashboardForm.controls['averageProductivity'].setValue(element.value);
          break;
        case "speed":
          this.dashboardForm.controls['speed'].setValue(element.value);          
          break;
        case "reliability":
          this.dashboardForm.controls['reliability'].setValue(element.value);
          break;
        case "totalError":
          this.dashboardForm.controls['totalError'].setValue(element.value);          
          break;
      }
    })
  }

  updateData(reload: boolean = false) {
    this.pageLink = new PageLink(50, 0);

    this.devices.forEach((device: Device) => {
      console.log("Device id", device.id);
      this.dataSource.loadAttributes(device.id, this.attributeScope.LATEST_TELEMETRY, this.pageLink, reload);
    })
  }



}
