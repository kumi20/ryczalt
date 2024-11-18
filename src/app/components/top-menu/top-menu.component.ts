import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DxMenuModule, DxScrollViewModule } from 'devextreme-angular';

@Component({
  selector: 'app-top-menu',
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.scss'],
  inputs: ['items', 'code'],
  standalone: true,
  imports: [
    CommonModule,
    DxScrollViewModule,
    DxMenuModule,
    RouterModule,
    TranslateModule,
  ],
})
export class TopMenuComponent implements OnInit {
  items: any;
  code: any;
  products: any[] = [
    {
      id: '1',
      name: 'menu.start',
      url: '/content/start',
      items: [],
      signature: 'S',
      classCss: 'redHeader',
    },
    {
      id: '2',
      name: 'menu.companies',
      url: '/content/companies',
      items: [],
      signature: 'F',
      classCss: 'blueGreyHeader',
    },
  ];

  showFirstSubmenuModes = {
    name: 'onHover',
    delay: { show: 0, hide: 500 },
  };
  showMenu: boolean = true;
  constructor(public cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (localStorage.getItem('dataPortal')) {
      this.showMenu = false;
    }
  }

  ngOnChanges() {
    if (this.items) {
      if (this.items.items.length > 0) {
        this.products = this.items.items;
        this.products?.forEach((url: any) => {
          url.url = `/${url.url}`;
        });
        //this.getPermissionsToMenu()
      } else {
        this.products = [
          {
            id: '1',
            name: 'menu.start',
            url: '/content/start',
            items: [],
            signature: 'S',
            classCss: 'redHeader',
          },
          {
            id: '2',
            name: 'menu.companies',
            url: '/content/companies',
            items: [],
            signature: 'F',
            classCss: 'blueGreyHeader',
          },
        ];
      }
    }

    this.cd.detectChanges();
  }

  itemClick(event: any) {
    console.log(event);
  }
}
