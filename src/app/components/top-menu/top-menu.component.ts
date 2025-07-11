import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DxMenuModule, DxScrollViewModule } from 'devextreme-angular';

/**
 * Top navigation menu component for the application.
 * 
 * This component provides the main navigation menu at the top of the application.
 * It manages menu items, handles navigation events, and supports both static and dynamic menu configurations.
 * 
 * @example
 * ```html
 * <app-top-menu [items]="menuItems" [code]="menuCode"></app-top-menu>
 * ```
 * 
 * @author Generated documentation
 * @since 1.0.0
 */
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
  /**
   * Menu items configuration passed from parent component
   * @type {any}
   * @description Contains the menu structure and configuration data
   * @since 1.0.0
   */
  items: any;
  
  /**
   * Menu code identifier passed from parent component
   * @type {any}
   * @description Unique identifier for the menu configuration
   * @since 1.0.0
   */
  code: any;
  
  /**
   * Array of menu products/items to display
   * @type {any[]}
   * @description Contains the processed menu items with default fallback items
   * @default Default menu items (Start and Companies)
   * @since 1.0.0
   */
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

  /**
   * Configuration for submenu display behavior
   * @type {object}
   * @description Defines when and how submenus are shown (on hover with delay)
   * @since 1.0.0
   */
  showFirstSubmenuModes = {
    name: 'onHover',
    delay: { show: 0, hide: 500 },
  };
  
  /**
   * Flag controlling menu visibility
   * @type {boolean}
   * @description Determines whether the menu should be displayed
   * @default true
   * @since 1.0.0
   */
  showMenu: boolean = true;
  /**
   * Creates an instance of TopMenuComponent.
   * 
   * @param {ChangeDetectorRef} cd - Angular change detector reference for manual change detection
   * @memberof TopMenuComponent
   */
  constructor(public cd: ChangeDetectorRef) {}

  /**
   * Initializes the component.
   * 
   * Checks localStorage for 'dataPortal' key to determine if menu should be shown.
   * This is used for portal-specific menu visibility logic.
   * 
   * @returns {void}
   * @memberof TopMenuComponent
   */
  ngOnInit(): void {
    if (localStorage.getItem('dataPortal')) {
      this.showMenu = false;
    }
  }

  /**
   * Handles input property changes.
   * 
   * Updates the menu products based on the items input. If items are provided,
   * processes them and adds URL prefixes. If no items are provided, falls back
   * to default menu items (Start and Companies).
   * 
   * @returns {void}
   * @memberof TopMenuComponent
   */
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

  /**
   * Handles menu item click events.
   * 
   * Currently logs the event for debugging purposes.
   * This method can be extended to handle specific menu item actions.
   * 
   * @param {any} event - The menu item click event
   * @returns {void}
   * @memberof TopMenuComponent
   */
  itemClick(event: any) {
    console.log(event);
  }
}
