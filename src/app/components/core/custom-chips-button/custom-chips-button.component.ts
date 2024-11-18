import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ChangeDetectorRef,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  DxListComponent,
  DxListModule,
  DxTooltipModule,
} from 'devextreme-angular';
import { ItemClickEvent } from 'devextreme/ui/list';
import { EventService } from '../../../services/event-services.service';

import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

interface ListItem {
  [key: string]: any;
  label: string;
  value: any;
}

@Component({
  selector: 'app-custom-chips-button',
  templateUrl: './custom-chips-button.component.html',
  styleUrls: ['./custom-chips-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [DxListModule, DxTooltipModule, CommonModule, TranslateModule],
})
export class CustomChipsButtonComponent implements OnInit, OnChanges {
  @ViewChild('listRef') listRef: DxListComponent = {} as DxListComponent;

  @Input() name: string | null = null;
  @Input() list: ListItem[] = [];
  @Input() width: number | string | null = null;
  @Input() maxHeight: number | string | null = null;
  @Input() customDisplayValue: string | null = null;
  @Input() selectedValueInput: string | boolean | null = null;
  @Input() disabledClear = false;
  @Input() positionTop = '-2px';
  @Input() labelExpr = 'label';
  @Input() valueExpr = 'value';
  @Input() deleteFilter = false;
  @Input() appDateRangeChips = false;

  @Output() onValueChanged = new EventEmitter<any>();

  unicalGuid = `${Date.now()}_${Math.round(Math.random() * 10000)}`;
  isChipsList: WritableSignal<boolean> = signal(false);
  selectedValue = '';
  listHeight: number | string | null = null;

  constructor(
    private eRef: ElementRef,
    public event: EventService,
    private cd: ChangeDetectorRef
  ) {}

  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isChipsList.set(false);
    }
  }

  ngOnInit(): void {
    this.checkSelectedValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedValueInput'] &&
      !changes['selectedValueInput'].currentValue
    ) {
      this.selectedValue = '';
    }

    if (changes['deleteFilter']?.currentValue) {
      this.clearValue();
    }

    this.checkSelectedValue();

    if (changes['list'] || changes['maxHeight']) {
      this.updateListHeight();
    }
  }

  private checkSelectedValue(): void {
    if (this.selectedValueInput) {
      const selectedItem = this.list.find(
        (item) => item[this.labelExpr] === this.selectedValueInput
      );

      if (selectedItem) {
        this.selectedValue = selectedItem[this.labelExpr];
      } else if (this.customDisplayValue) {
        const customItem = this.list.find(
          (item) => item[this.valueExpr] === 'custom'
        );
        if (customItem) {
          this.selectedValue = customItem[this.labelExpr];
        }
      } else if (this.selectedValueInput === 'Niezapisany filtr') {
        this.selectedValue = 'Niezapisany filtr';
      }
    }
  }

  private updateListHeight(): void {
    if (this.list.length && this.maxHeight) {
      const maxHeight = parseInt(this.maxHeight.toString(), 10);
      this.listHeight = this.list.length * 30 > maxHeight ? maxHeight : 'auto';
    }
  }

  clearValue = (): void => {
    this.selectedValue = '';
    this.onValueChanged.emit('');
    this.isChipsList.set(false);
  };

  onItemClick = (e: ItemClickEvent): void => {
    if (e.itemData[this.valueExpr] === null) {
      this.clearValue();
      return;
    }

    this.selectedValue = e.itemData[this.labelExpr];
    this.cd.detectChanges();

    this.onValueChanged.emit(e.itemData[this.valueExpr]);
    this.isChipsList.set(false);
  };

  swapChipsList(): void {
    this.isChipsList.update((value) => !value);
    // Removed setTimeout as it's not necessary for the commented-out code
  }
}
