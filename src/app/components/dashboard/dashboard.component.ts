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

/**
 * Polish month names array for displaying months in local language
 * @constant
 * @type {string[]}
 * @since 1.0.0
 */
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

/**
 * Interface representing monthly breakdown data for flat rate tax calculations
 * @interface MonthlyBreakdown
 * @since 1.0.0
 */
interface MonthlyBreakdown {
  /** Number of entries recorded in the month */
  entries: number;
  /** Whether the month is closed for further entries */
  isClosed: boolean;
  /** Month number (1-12) */
  month: number;
  /** Total revenue for the month */
  revenue: number;
}
/**
 * Dashboard component providing comprehensive financial reporting and data visualization
 * 
 * @description This component serves as the main dashboard for the tax application,
 * displaying yearly financial summaries, monthly breakdowns, and interactive charts.
 * It integrates with the VAT register system and flat rate tax calculations to provide
 * users with a complete overview of their financial data.
 * 
 * @component
 * @selector app-dashboard
 * @templateUrl ./dashboard.component.html
 * @styleUrls ./dashboard.component.scss
 * 
 * @dependencies
 * - DxScrollViewModule: DevExtreme scrollable container
 * - DateRangeComponent: Custom date range picker
 * - DxChartModule: DevExtreme chart visualization
 * - CommonModule: Angular common directives
 * - PriceFormatPipe: Custom currency formatting pipe
 * 
 * @uses
 * - AppServices: Main application service for API calls
 * - EventService: Event handling and notification service
 * 
 * @features
 * - Monthly and yearly financial reports
 * - Interactive charts for sales and purchase data
 * - VAT balance calculations
 * - Flat rate tax summaries
 * - Date range filtering
 * 
 * @since 1.0.0
 */
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
  /** Current selected month (1-12) as a signal */
  month = signal<number>(new Date().getMonth() + 1);
  
  /** Current selected year as a signal */
  year = signal<number>(new Date().getFullYear());
  
  /** Injected application services for API communication */
  appService = inject(AppServices);
  
  /** Injected event service for notifications and error handling */
  event = inject(EventService);
  
  /** Injected change detector reference for manual change detection */
  cdr = inject(ChangeDetectorRef);

  /** Chart data source containing monthly financial data */
  dataSource: any[] = [];

  /** 
   * Complete yearly financial summary containing purchase, sales, and balance data
   * @type {MonthlyData}
   */
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

  /** Total yearly revenue from flat rate tax calculations */
  yearSummaryFlateRate: number = 0;

  /** Monthly breakdown data for flat rate tax entries */
  monthlyBreakdown: MonthlyBreakdown[] = [];

  /**
   * Customizes chart tooltip display format
   * @description Formats the tooltip text to show series name and value with Polish currency symbol
   * @param {any} arg - Chart tooltip argument object containing series data
   * @returns {object} Formatted tooltip configuration object
   * @example
   * // Returns: { text: "Sprzedaż: 1,000.00 zł" }
   * @since 1.0.0
   */
  customizeTooltip = (arg: any) => {
    return {
      text: `${arg.seriesName}: ${arg.valueText} zł`,
    };
  };

  /**
   * Angular lifecycle hook called after component initialization
   * @description Initializes the dashboard by loading monthly report data and flat rate summary
   * @returns {void}
   * @lifecycle
   * @since 1.0.0
   */
  ngOnInit(): void {
    this.getMonthlyReport();
    this.getYearlySummaryFlateRate();
  }

  /**
   * Handles date range changes from the date picker component
   * @description Updates the selected month and year, then refreshes the monthly report data
   * @param {object} event - Date range change event object
   * @param {number} event.month - Selected month (1-12)
   * @param {number} event.year - Selected year
   * @returns {void}
   * @example
   * // When user selects March 2024
   * onDateRangeChange({ month: 3, year: 2024 })
   * @since 1.0.0
   */
  onDateRangeChange(event: { month: number; year: number }) {
    this.month.set(event.month);
    this.year.set(event.year);
    this.getMonthlyReport();
  }

  /**
   * Retrieves and processes monthly financial report data for the selected year
   * @description Fetches yearly report data from the API, processes monthly data,
   * and populates the chart data source with formatted information for visualization
   * @returns {void}
   * @throws {Error} HTTP error handled by EventService notification system
   * @example
   * // Fetches data for current year and updates charts
   * getMonthlyReport()
   * @since 1.0.0
   */
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

  /**
   * Calculates the total net sales amount across all months
   * @description Sums up all net sales values from the data source to provide
   * a comprehensive yearly total for net sales revenue
   * @returns {number} Total net sales amount in Polish Zloty
   * @example
   * // Returns total net sales for the year
   * const totalSales = getTotalNetSales(); // 125000.50
   * @since 1.0.0
   */
  getTotalNetSales(): number {
    return this.dataSource.reduce(
      (sum, item) => sum + (item.allNetSales || 0),
      0
    );
  }

  /**
   * Calculates the total net purchase amount across all months
   * @description Sums up all net purchase values from the data source to provide
   * a comprehensive yearly total for net purchase expenses
   * @returns {number} Total net purchase amount in Polish Zloty
   * @example
   * // Returns total net purchases for the year
   * const totalPurchases = getTotalNetPurchase(); // 85000.25
   * @since 1.0.0
   */
  getTotalNetPurchase(): number {
    return this.dataSource.reduce(
      (sum, item) => sum + (item.allNetPurchase || 0),
      0
    );
  }

  /**
   * Calculates the financial balance (difference between sales and purchases)
   * @description Computes the net financial result by subtracting total purchases
   * from total sales to show the business profitability
   * @returns {number} Financial balance in Polish Zloty (positive = profit, negative = loss)
   * @example
   * // Returns the balance: sales - purchases
   * const balance = getBalance(); // 40000.25 (profit)
   * @since 1.0.0
   */
  getBalance(): number {
    return this.getTotalNetSales() - this.getTotalNetPurchase();
  }

  /**
   * Retrieves yearly summary data based on flat rate tax calculations
   * @description Fetches annual flat rate tax summary including total revenue
   * and monthly breakdown data for the selected year. Updates component
   * properties with the received data for display purposes.
   * @returns {void}
   * @throws {Error} HTTP error handled by EventService notification system
   * @example
   * // Fetches flat rate summary for current year
   * getYearlySummaryFlateRate()
   * @since 1.0.0
   */
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
