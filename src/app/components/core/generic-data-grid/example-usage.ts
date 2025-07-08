/**
 * UWAGA: Ten plik jest tylko przykładem użycia i nie powinien być importowany bezpośrednio w aplikacji.
 * Służy jedynie jako dokumentacja sposobu używania komponentu GenericDataGridComponent.
 * 
 * Aby użyć tego przykładu, należy:
 * 1. Zaimportować GenericDataGridComponent w module lub komponencie
 * 2. Dodać GenericDataGridComponent do tablicy imports (dla komponentów standalone)
 * 3. Przekazać odpowiednie dane, kolumny i szablony
 */

import { Component, TemplateRef, ViewChild } from '@angular/core';
import { GenericGridColumn, GenericGridOptions } from './generic-data-grid.model';
import { GenericDataGridComponent } from './generic-data-grid.component';
import DataSource from 'devextreme/data/data_source';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-example',
  template: `
    <!-- Przykład użycia generycznego komponentu DataGrid -->
    <app-generic-data-grid
      [dataSource]="dataSource"
      [columns]="columns"
      [options]="gridOptions"
      [templateRefs]="templateRefs"
      (onFocusedRowChanged)="onFocusedRowChanged($event)"
    ></app-generic-data-grid>

    <!-- Definiowanie szablonów, które będą używane przez komponent -->
    <ng-template #prgCodeTemplate let-data>
      <div>
        <p style="margin-bottom: 0px;">
          {{ returnAppInfo(data.value).productName }}
        </p>
      </div>
    </ng-template>

    <ng-template #isActiveTemplate let-data>
      <div class="text-center">
        <i *ngIf="data.data.isActive" 
           class="icon absui-icon--status-ok-green"
           style="font-size: 1rem !important;"
           [id]="'isActive' + data.data.userId">
        </i>
      </div>
    </ng-template>

    <ng-template #blockTemplate let-data>
      <div class="text-center">
        <i *ngIf="data.data.isBlocked" 
           class="icon absui-icon--set-lock"
           [id]="'acces' + data.data.userId">
        </i>
      </div>
    </ng-template>
  `,
  // W rzeczywistym komponencie należy dodać:
  imports: [GenericDataGridComponent, CommonModule]
})
export class ExampleComponent {
  @ViewChild(GenericDataGridComponent) dataGrid!: GenericDataGridComponent;
  
  // Referencje do szablonów z widoku
  @ViewChild('prgCodeTemplate', { static: true }) prgCodeTemplate!: TemplateRef<any>;
  @ViewChild('isActiveTemplate', { static: true }) isActiveTemplate!: TemplateRef<any>;
  @ViewChild('blockTemplate', { static: true }) blockTemplate!: TemplateRef<any>;
  
  // Obiekt zawierający referencje do szablonów
  templateRefs: { [key: string]: TemplateRef<any> } = {};
  
  // Definicja kolumn siatki
  columns: GenericGridColumn[] = [
    {
      caption: 'APP',
      dataField: 'prgCode',
      alignment: 'left',
      width: 250,
      allowReordering: false,
      allowSorting: false,
      groupIndex: 0,
      groupTemplateName: 'prgCodeTemplate', // Nazwa szablonu do wyświetlenia w grupowaniu
      name: 'prgCode',
    },
    {
      caption: 'A',
      dataField: 'isActive',
      templateName: 'isActiveTemplate', // Nazwa szablonu do wyświetlenia w komórce
      width: 26,
      allowReordering: false,
      allowSorting: false,
      name: 'isActive',
    },
    {
      caption: 'Z',
      dataField: 'isBlocked',
      templateName: 'blockTemplate', // Nazwa szablonu do wyświetlenia w komórce
      width: 26,
      allowReordering: false,
      allowSorting: false,
      hidingPriority: 10,
      name: 'isBlocked',
    },
    {
      dataField: 'firstName',
      caption: 'Imię',
      width: 200,
      allowSorting: false,
      name: 'firstName',
    },
    {
      dataField: 'lastName',
      caption: 'Nazwisko',
      width: 200,
      allowSorting: false,
      name: 'lastName',
    }
  ];
  
  // Opcje konfiguracyjne siatki
  gridOptions: GenericGridOptions = {
    showBorders: true,
    wordWrapEnabled: false,
    focusedRowEnabled: true,
    allowColumnReordering: true,
    allowColumnResizing: true,
    height: 'calc(100vh - 260px)',
    autoFocus: true,
    paging: {
      enabled: true,
      pageSize: 100
    },
    pager: {
      showPageSizeSelector: true,
      allowedPageSizes: [300, 500, 1000],
      showInfo: true
    },
    grouping: {
      autoExpandAll: true
    },
    selection: {
      mode: 'single',
      selectAllMode: 'page',
      showCheckBoxesMode: 'always'
    },
    editing: {
      mode: 'cell',
      allowUpdating: false,
      allowAdding: false,
      allowDeleting: false
    }
  };
  
  // Źródło danych
  dataSource: any;
  
  // Aktualnie wybrany wiersz
  focusedSelectedUser: any[] = [];
  
  constructor() {
    // Inicjalizacja źródła danych (przykład)
    this.dataSource = new DataSource([]);
    
    // Pobranie danych i aktualizacja źródła danych
    this.getData();
  }
  
  // Po inicjalizacji widoku - przypisanie referencji do szablonów
  ngAfterViewInit() {
    // Przypisanie referencji do szablonów do obiektu templateRefs
    this.templateRefs = {
      'prgCodeTemplate': this.prgCodeTemplate,
      'isActiveTemplate': this.isActiveTemplate,
      'blockTemplate': this.blockTemplate
    };
  }
  
  // Przykładowa metoda pobierania danych
  getData() {
    // Tutaj byłoby wywołanie serwisu pobierającego dane
    // Na przykład:
    // this.appService.getAuth(`Companies`).subscribe(data => {
    //   this.dataSource = data;
    //   // Ustawienie fokusu po załadowaniu danych
    //   if (this.dataGrid) {
    //     this.dataGrid.focus();
    //   }
    // });
  }
  
  // Przykład odświeżenia danych z automatycznym ustawieniem fokusu
  refreshData() {
    // Przykład:
    // this.appService.getAuth(`Companies`).subscribe(data => {
    //   this.dataSource = data;
    //   if (this.dataGrid) {
    //     this.dataGrid.refreshAndFocus();
    //   }
    // });
  }
  
  // Przykład obsługi zamknięcia modala z przywróceniem fokusu do grida
  onModalClosed() {
    // Po zamknięciu modala, przywrócenie fokusu na grid
    if (this.dataGrid) {
      this.dataGrid.focus();
    }
  }
  
  // Obsługa zdarzenia zmiany wybranego wiersza
  onFocusedRowChanged(e: any) {
    if (e?.row?.data) {
      this.focusedSelectedUser = [e.row.data];
    }
  }
  
  // Przykładowa funkcja pomocnicza używana w szablonie
  returnAppInfo(value: any) {
    // Przykładowa implementacja zwracająca obiekt z nazwą produktu
    return { productName: `Aplikacja ${value}` };
  }
} 