import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DxButtonModule } from 'devextreme-angular';
import { EventService } from '../../../services/event-services.service';
import { LoaderConfig } from './wapro-loader.interface';
@Component({
  selector: 'wapro-loader',
  templateUrl: './wapro-loader.component.html',
  styleUrls: ['./wapro-loader.component.scss'],
  standalone: true,
  imports: [CommonModule, DxButtonModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaproLoaderComponent {
  @Input() mode: 'primary' | 'secondary' = 'secondary';
  @Input() config: LoaderConfig = new LoaderConfig();
  @Input() message: string = 'Loading...';
  @Input() canAbort: boolean = false;
  @Input() loaderText: boolean = true;
  @Input() abortBtnText: string = '';
  @Output() onAbort = new EventEmitter();
  spinnerSize: number = 30;
  innerCircleFill: string = '#DC1E28';
  constructor(public event: EventService, public translate: TranslateService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes?.['mode']?.currentValue === 'primary') {
      this.spinnerSize = 74;
    }

    if (changes?.['abortBtnText']?.currentValue == '') {
      this.translate.get('buttons.abort').subscribe((res) => {
        this.abortBtnText = res;
      });
    }
  }

  abort() {
    this.onAbort.emit();
  }
}
