import {
  Component,
  OnInit
} from '@angular/core';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, SingleDataSet, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip } from 'ng2-charts';

@Component({
  selector: 'tb-device-dashboard',
  templateUrl: './device-dashboard.component.html',
  styleUrls: ['./device-dashboard.component.scss']
})
export class DeviceDashboardComponent implements OnInit {
  doughnutChartLabels: Label[] = ['Kế hoạch', 'Thời gian'];
  doughnutChartData: MultiDataSet = [
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

  barChartData: ChartDataSets[] = [
    { data: [0.2, 0.3, 0.4, 0.5, 0.4, 0.2], label: 'Số lỗi công đoạn theo giờ' }
  ];

  public pieChartOptions: ChartOptions = {
    responsive: true,
  };
  public pieChartLabels: Label[] = [['CĐ1'], ['CĐ2'], 'CĐ3', 'CĐ4'];
  public pieChartData: SingleDataSet = [30, 50, 20, 10];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  constructor() {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit(): void {
    
  }

  

}
