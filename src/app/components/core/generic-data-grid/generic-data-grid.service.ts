import { Injectable, inject } from '@angular/core';
import * as AspNetData from 'devextreme-aspnet-data-nojquery';
import DataSource, { DataSourceOptions } from 'devextreme/data/data_source';
import { environment } from '../../../../environments/environment';
import { EventService } from '../../../services/event-services.service';

/**
 * Service for handling generic data grid operations using DevExtreme DataGrid
 *
 * @description
 * This service provides functionality to create and manage data sources for DevExtreme DataGrid components.
 * It handles loading data from the server, managing loading states, and error handling through the EventService.
 */
@Injectable({
  providedIn: 'root',
})
export class GenericDataGridService {
  /** Event service instance for handling loading states and errors */
  event = inject(EventService);

  constructor() {}

  /**
   * Creates a new DataSource for DevExtreme DataGrid
   *
   * @param loadUrl - The URL endpoint for loading data
   * @param keyExpr - The key expression for the data source
   * @param loadParams - Additional parameters to be sent with the load request
   * @param onLoadedCallback - Optional callback function to be executed after data is loaded
   * @param deleteUrl - Optional URL endpoint for delete operations
   * @returns A configured DevExtreme DataSource instance
   *
   * @example
   * ```typescript
   * const dataSource = this.genericDataGridService.getData(
   *   '/api/data',
   *   'id',
   *   { filter: 'active' },
   *   (data) => console.log('Data loaded:', data),
   *   '/api/data/delete'
   * );
   * ```
   */
  getData(
    loadUrl: string,
    keyExpr: string,
    loadParams: any,
    onLoadedCallback?: (data: any) => void,
    deleteUrl?: string,
    dataSourceOptions?: DataSourceOptions,
  ){
    // this.event.onShown();
    const dataSource = new DataSource({
      store: AspNetData.createStore({
        key: keyExpr,
        onBeforeSend: this.event.onBeforeSendDataSource,
        loadUrl: `${environment.domain}${loadUrl}`,
        loadParams: loadParams,
        onLoaded: (data) => {
          if (onLoadedCallback) {
            onLoadedCallback(data);
          }
        },
        onAjaxError: this.event.onAjaxDataSourceError,
        deleteUrl: `${environment.domain}${deleteUrl ? deleteUrl : loadUrl}`,
      }),
      reshapeOnPush: false,
      ...dataSourceOptions,
    });

    return dataSource;
  }

  /**
   * Creates a new DataSource for DevExtreme DataGrid from local data
   *
   * @param localData - The local data array to be used as the data source
   * @param keyExpr - The key expression for the data source
   * @param dataSourceOptions - Additional options for the data source
   * @returns A configured DevExtreme DataSource instance
   */
  getLocalData(
    localData: any[],
    keyExpr: string,
    dataSourceOptions?: DataSourceOptions,
  ) {
    const dataSource = new DataSource({
      store: {
        type: 'array',
        data: localData,
        key: keyExpr,
      },
      ...dataSourceOptions,
    });

    return dataSource;
  }
}
