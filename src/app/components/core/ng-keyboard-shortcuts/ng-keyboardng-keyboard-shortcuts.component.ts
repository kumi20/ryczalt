import {
  Component,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
  Input,
  effect,
} from '@angular/core';
import { EventService } from '../../../services/event-services.service';
import { takeUntil, Subject } from 'rxjs';
import { KeyboardShortcutsModule, ShortcutInput } from 'ng-keyboard-shortcuts';


@Component({
  selector: 'qumi-keyboard-shortcuts',
  template: `<ng-keyboard-shortcuts
    [shortcuts]="shortcuts"
    [disabled]="disabled || disabledShortcut"
  ></ng-keyboard-shortcuts> `,
  standalone: true,
  imports: [KeyboardShortcutsModule],
})
export class NgShortcutsComponent implements OnDestroy {
  @Input() shortcuts: ShortcutInput[] = [];
  @Input() disabled = false;
  @Input() unicalGuid: string | number | null= null;
  @Input() alwaysEnabled: boolean = false;
  @ViewChild('keyboard') keyboard: any;
  disabledShortcut: boolean = false;
  destroy$: Subject<void> = new Subject();
  constructor(
    public event: EventService,
    public cd: ChangeDetectorRef
  ) {}


  getState(): boolean {
    let isShortcutDisabled: boolean = true;
    let popup = document.getElementsByClassName(
      'dx-overlay-wrapper dx-popup-wrapper dx-overlay-shader'
    );
    if (popup.length > 0) {
      if (popup[popup.length - 1].id == this.unicalGuid) {
        isShortcutDisabled = false;
      }
    } else {
      isShortcutDisabled = false;
    }
    if (this.alwaysEnabled) isShortcutDisabled = false;

    return isShortcutDisabled;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
