import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-mobile-main-submenu',
  templateUrl: './mobile-main-submenu.component.html',
  styleUrls: ['./mobile-main-submenu.component.scss'],
  inputs: ['items', 'parentLevel'],
  standalone: true,
  imports: [TranslateModule, CommonModule, RouterModule],
})
export class MobileMainSubmenuComponent implements OnInit {
  @Output() onClosingSubmenu = new EventEmitter();
  @Output() onCloseMenu = new EventEmitter();
  items: any;

  parentLevel: any;
  isTap: any = null;
  constructor(public router: Router) {}

  ngOnInit(): void {}

  ngOnChanges() {}

  backToParent = () => {
    if (this.items.id != this.parentLevel.id) {
      this.items = this.parentLevel;
      return;
    }

    this.onClosingSubmenu.emit(true);
  };

  onItemClickMobile = (e: any) => {
    if (!e.items || e.items.length == 0) {
      this.router.navigate([e.url]);
      this.onCloseMenu.emit(true);
      return;
    }

    if (e.items && e.items.length > 0) {
      this.items = {
        id: e.id,
        name: e.name,
        items: e.items,
      };
      return;
    }
  };

  onCloseSubmenu = () => {
    this.onClosingSubmenu.emit(true);
  };

  touchStart = (e: any) => {
    this.isTap = e.id;
  };

  touchEnd = () => {
    this.isTap = null;
  };
}
