import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DxPopupModule, DxScrollViewModule } from 'devextreme-angular';

@Component({
  selector: 'app-mobile-list',
  templateUrl: './mobile-list.component.html',
  styleUrls: ['./mobile-list.component.scss'],
  inputs: ['dataSource', 'visible', 'title', 'titleIcon'],
  standalone: true,
  imports: [DxPopupModule, CommonModule, TranslateModule, DxScrollViewModule],
})
export class MobileListComponent implements OnInit {
  @Output() onItemClick = new EventEmitter();
  @Output() onClosed = new EventEmitter();
  @ViewChild('scrollview') scrollview: any;

  dataSource: any;
  visible: any;
  isTouch: any = null;
  isSubmenu: boolean = false;
  parent: any;
  titleSubmenu: string = '';
  parentTop: any;
  title: any;
  titleIcon: any;
  lang: any;
  constructor() {}

  ngOnInit(): void {
    this.lang = localStorage.getItem('lang');
  }

  ngOnChanges() {
    this.parent = this.dataSource;
  }

  touchStart = (item: any) => {
    this.isTouch = item;
  };

  touchEnd = () => {
    this.isTouch = null;
  };

  close = () => {
    this.onClosed.emit(true);
    this.dataSource = this.parent;
    this.isSubmenu = false;
    this.titleSubmenu = '';
  };

  onShown() {}

  itemClick = (e: any) => {
    if (!e.items || e.items.length == 0) {
      this.onItemClick.emit({ itemData: e });
      this.visible = false;
      return;
    }

    if (e.items.length > 0) {
      this.parentTop = this.dataSource;
      this.isSubmenu = true;
      this.titleSubmenu = e.name ? e.name : e.text;
      this.dataSource = e.items;
    }
  };

  backToParentTop = () => {
    if (this.parentTop != this.parent) {
      this.dataSource = this.parentTop;
      return;
    }

    this.dataSource = this.parent;
    this.isSubmenu = false;
  };
}
