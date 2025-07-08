import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from '@angular/core';
import { DxChartModule, DxScrollViewModule } from 'devextreme-angular';
import { DateRangeComponent } from '../date-range/date-range.component';
import { AppServices } from '../../services/app-services.service';
import { EventService } from '../../services/event-services.service';
import { MonthlyReport, MonthlyData } from '../../interface/monthly-report';
import { CommonModule } from '@angular/common';
import { PriceFormatPipe } from '../../pipe/currency';

const MONTHS_PL = [
  'Styczeń',
  'Luty',
  'Marzec',
  'Kwiecień',
  'Maj',
  'Czerwiec',
  'Lipiec',
  'Sierpień',
  'Wrzesień',
  'Październik',
  'Listopad',
  'Grudzień',
];

interface MonthlyBreakdown {
  entries: number;
  isClosed: boolean;
  month: number;
  revenue: number;
}
@Component({
  selector: 'app-dashboard',
  imports: [
    DxScrollViewModule,
    DateRangeComponent,
    DxChartModule,
    CommonModule,
    PriceFormatPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  month = signal<number>(new Date().getMonth() + 1);
  year = signal<number>(new Date().getFullYear());
  appService = inject(AppServices);
  event = inject(EventService);
  cdr = inject(ChangeDetectorRef);

  dataSource: any[] = [];

  yearSummary: MonthlyData = {
    purchase: {
      net23: 0,
      vat23: 0,
      net8: 0,
      vat8: 0,
      net5: 0,
      vat5: 0,
      zwNet23: 0,
      zwVat23: 0,
      zwNet8: 0,
      zwVat8: 0,
      zwNet5: 0,
      zwVat5: 0,
      netNotDeductible: 0,
      totalGrossPurchase: 0,
      totalNetDeductible: 0,
      totalVatDeductible: 0,
    },
    sales: {
      net23: 0,
      vat23: 0,
      net8: 0,
      vat8: 0,
      net5: 0,
      vat5: 0,
      net0: 0,
      export0: 0,
      wdt0: 0,
      wsu: 0,
      exemptSales: 0,
      reverseCharge: 0,
      totalNetSales: 0,
      totalVatSales: 0,
      totalGrossSales: 0,
    },
    summary: {
      vatBalance: 0,
      netBalance: 0,
      grossBalance: 0,
    },
    total: {
      allNetSales: 0,
      allVatSales: 0,
      allGrossSales: 0,
      allNetPurchase: 0,
      allVatPurchase: 0,
      allGrossPurchase: 0,
    },
  };

  yearSummaryFlateRate: number = 0;

  monthlyBreakdown: MonthlyBreakdown[] = [];

  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${arg.valueText} zł`,
    };
  };

  ngOnInit(): void {
    this.getMonthlyReport();
    this.getYearlySummaryFlateRate();
  }

  onDateRangeChange(event: { month: number; year: number }) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getMonthlyReport();
  }

  getMonthlyReport() {
    this.dataSource = [];
    this.appService
      .getAuth(`dashboard/year-report?year=${this.year()}`)
      .subscribe(
        (res) => {
          this.yearSummary = res.yearSummary;
          for (let i = 1; i <= 12; i++) {
            if (res.monthlyData[i]) {
              this.dataSource.push({
                month: MONTHS_PL[i - 1],
                argument: i,
                allNetPurchase: res.monthlyData[i].total.allNetPurchase,
                allNetSales: res.monthlyData[i].total.allNetSales,
                allVatSales: res.monthlyData[i].total.allVatSales,
                allVatPurchase: res.monthlyData[i].total.allVatPurchase,
                total: res.monthlyData[i].total,
              });
            }
          }
          console.log(this.dataSource);
          this.cdr.detectChanges();
        },
        (error) => {
          this.event.httpErrorNotification(error);
        }
      );
  }

  // Metoda obliczająca łączną sumę przychodów netto
  getTotalNetSales(): number {
    return this.dataSource.reduce(
      (sum, item) => sum + (item.allNetSales || 0),
      0
    );
  }

  // Metoda obliczająca łączną sumę zakupów netto
  getTotalNetPurchase(): number {
    return this.dataSource.reduce(
      (sum, item) => sum + (item.allNetPurchase || 0),
      0
    );
  }

  // Metoda obliczająca bilans (różnicę między przychodami a zakupami)
  getBalance(): number {
    return this.getTotalNetSales() - this.getTotalNetPurchase();
  }

  //pobiera podsumowanie roczne na podstawie tabeli ryczaltu
  getYearlySummaryFlateRate() {
    this.appService
      .getAuth(`flat-rate-summary/yearly?year=${this.year()}`)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.yearSummaryFlateRate = res.summary.totalRevenue;
          this.monthlyBreakdown = res.monthlyBreakdown;
        },
        error: (error) => {
          this.event.httpErrorNotification(error);
        },
      });
  }
}
