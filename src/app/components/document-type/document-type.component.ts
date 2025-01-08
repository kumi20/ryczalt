import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  Output,
  EventEmitter,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  Input
} from '@angular/core';
import { DocumentTypeService } from '../../services/document-type.services';
import { DocumentType } from '../../interface/documentType';
import { EventService } from '../../services/event-services.service';
import { DxDataGridModule, DxDropDownBoxModule } from 'devextreme-angular';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-document-type',
  standalone: true,
  imports: [
    CommonModule,
    DxDataGridModule,
    TranslateModule,
    DxDropDownBoxModule,
  ],
  templateUrl: './document-type.component.html',
  styleUrl: './document-type.component.scss',
})
export class DocumentTypeComponent implements OnInit, OnChanges {
  @Output() onChoosed = new EventEmitter();
  @Output() setPLId = new EventEmitter();
  @Input() readOnly: boolean = false;
  @ViewChild('gridDropDown') gridDropDown: any;

  dropDownBoxMode = input<boolean>(false);
  className = input<boolean>(false);
  controlNameForm = input<string>('');

  documentTypeService = inject(DocumentTypeService);
  event = inject(EventService);

  documentList = signal<DocumentType[]>([]);
  heightGrid: number | string = 'calc(100vh - 100px)';
  focusedRowIndex: number = 0;
  pageSize: number = 300;
  isGridBoxOpened: boolean = false;
  cdr = inject(ChangeDetectorRef)

  chossingRecord: null | string = null;

  constructor() {}

  ngOnInit() {
    this.documentTypeService.get().subscribe({
      next: (data: DocumentType[]) => {
        this.documentList.set(data);
      },
      error: (error) => {
        this.event.httpErrorNotification(error);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['controlNameForm'] && this.dropDownBoxMode()) {
      this.chossingRecord = changes['controlNameForm'].currentValue;
      this.cdr.detectChanges(); 
    }
  }

  onKeyDown(event: any) {
    const BLOCKED_KEYS = ['F2', 'Escape', 'Delete', 'Enter'];

    if (BLOCKED_KEYS.includes(event.event.key)) {
      event.event.preventDefault();
    }
  }

  onValueChanged = (e: any) => {
    if (e.value == null) {
      this.onChoosed.emit(null);
    }
  };

  onRowDblClick(e: any) {
    if (this.dropDownBoxMode()) {
      this.onChoosingRecord(e.data);
    }
  }

  onChoosingRecord = (e: DocumentType) => {
    if (this.event.sessionData.isActive) {
      this.chossingRecord = e.name;
      this.onChoosed.emit(e);
      this.isGridBoxOpened = false;
    }
  };

  onOpenedChanged(e: any) {
    if (e) {
      try {
        setTimeout(() => {
          this.gridDropDown.instance.focus();
        }, 500);
      } catch {}
    } else {
      this.isGridBoxOpened = false;
    }
  }
}
