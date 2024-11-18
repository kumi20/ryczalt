import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { EventService } from '../../../services/event-services.service';
import {
  ShortcutInput,
  AllowIn,
  KeyboardShortcutsModule,
} from 'ng-keyboard-shortcuts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CheckBoxType,
  ConfirmButtonConfig,
  GroupMessage,
  KindDialog,
  RadioBoxType,
} from './confirm-dialog.model';
import {
  DxButtonComponent,
  DxButtonModule,
  DxPopupModule,
} from 'devextreme-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    DxPopupModule,
    TranslateModule,
    CommonModule,
    DxButtonModule,
    KeyboardShortcutsModule,
  ],
})
export class ConfirmDialogComponent implements OnInit, AfterViewInit {
  @Output() onRemoving = new EventEmitter<
    | true
    | CheckBoxType[]
    | RadioBoxType[]
    | GroupMessage
    | { checkBoxList: CheckBoxType[]; radioBoxList: RadioBoxType[] }
  >();
  @Output() onClosing = new EventEmitter();
  @Output() onCanceling = new EventEmitter();
  @ViewChild('nobtn') nobtn: DxButtonComponent | null = null;
  @ViewChild('yesbtn') yesbtn: DxButtonComponent | null = null;
  @ViewChild('cancelbtn') cancelbtn: DxButtonComponent | null = null;

  @Input() paramsMsg: { [key: string]: string } = {};
  @Input() isVisible = false;
  @Input() textAligne: string = '';
  @Input() showIcon: boolean = true;
  @Input() confirmHeader: string = '';
  @Input() confirmText: string = 'confirmDelete';
  @Input() kindDialog: KindDialog = 'question';
  @Input() btnConfig: ConfirmButtonConfig | null = null;
  @Input() width: number | string = 420;
  @Input() checkBoxList: CheckBoxType[] = []; // lista checkboxów
  @Input() radioBoxList: RadioBoxType[] = []; // lista radiobuttonow
  @Input() groupMsg: GroupMessage | null = null;
  @Input() title: string = '';
  shortcuts: ShortcutInput[] = [];
  unicalGuid = new Date().getTime() + Math.round(Math.random() * 10000);

  constructor(
    public event: EventService,
    public cd: ChangeDetectorRef,
    public translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (!this.width) this.width = 420;
    if (!this.title) this.title = 'information';

    if (this.kindDialog == 'question') this.title = 'nests.types.question';
    if (this.kindDialog == 'error') this.title = 'error';
    if (this.kindDialog == 'warning') this.title = 'warning';
  }

  onCancel = () => {
    setTimeout(() => {
      try {
        this.isVisible = false;
        this.onCanceling.emit(true);
      } catch {}
    }, 0);
  };

  onInit(e: any) {
    e.component.registerKeyHandler('escape', function () {});
  }

  ngAfterViewInit() {
    this.shortcuts.push({
      key: 'escape',
      allowIn: [AllowIn.Input, AllowIn.Select, AllowIn.Textarea],
      command: (e) => {
        this.btnConfig == 'yesnocancel' ? this.onCancel() : this.onClose();
      },
      preventDefault: true,
    });
  }

  onClose = () => {
    setTimeout(() => {
      try {
        (this.nobtn as any).element.nativeElement.blur();
        this.isVisible = false;
        this.onClosing.emit(true);
      } catch {}
    }, 0);
  };

  ngModelChange() {
    if (!this.isVisible) this.cd.detectChanges();
  }

  onRemove() {
    let ret:
      | true
      | CheckBoxType[]
      | RadioBoxType[]
      | GroupMessage
      | { checkBoxList: CheckBoxType[]; radioBoxList: RadioBoxType[] } = true;
    if (!this.checkBoxList && !this.radioBoxList) ret = true;
    if (this.checkBoxList && !this.radioBoxList) ret = this.checkBoxList;
    if (!this.checkBoxList && this.radioBoxList) ret = this.radioBoxList;
    if (this.checkBoxList && this.radioBoxList)
      ret = {
        checkBoxList: this.checkBoxList,
        radioBoxList: this.radioBoxList,
      };
    if (this.groupMsg) ret = this.groupMsg;

    this.isVisible = false;

    this.onRemoving.emit(ret);
  }
}
