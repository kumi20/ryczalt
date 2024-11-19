import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, OnInit, input, Output, EventEmitter, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DxButtonModule, DxPopupModule, DxScrollViewModule, DxTooltipModule } from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';

@Component({
  selector: 'app-new-customer',
  standalone: true,
  imports: [DxPopupModule, DxButtonModule, DxTooltipModule, DxScrollViewModule, TranslateModule],
  templateUrl: './new-customer.component.html',
  styleUrl: './new-customer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewCustomerComponent implements OnInit, OnDestroy, AfterViewInit{
  @Output() onClosing = new EventEmitter();
  @Output() onSaving = new EventEmitter();

  event = inject(EventService)
  isVisible = input.required<boolean>();

  constructor(){

  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

  ngAfterViewInit(): void {

  }

  closeWindow() {
    this.onClosing.emit(true)
  }

  onVisibleChange(e: any) {
    if (!e) {
      this.onClosing.emit(true);
    }
  }

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }
}
