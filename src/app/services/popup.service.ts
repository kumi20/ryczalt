import { Injectable, Type } from '@angular/core';
import { DxPopupComponent } from 'devextreme-angular/ui/popup';
import { DxPopupModule } from 'devextreme-angular/ui/popup';
import { ComponentRef, createComponent, EnvironmentInjector, inject, EventEmitter, ApplicationRef } from '@angular/core';

type PositionAlignment = 'left' | 'center' | 'right' | 'top' | 'bottom';

interface PopupPosition {
  my: PositionAlignment;
  at: PositionAlignment;
  of: Window | HTMLElement;
}

@Injectable({
  providedIn: 'root'
})
export class PopupService {
  private environmentInjector = inject(EnvironmentInjector);
  private appRef = inject(ApplicationRef);
  private activePopup: { popup: ComponentRef<DxPopupComponent>, component: ComponentRef<any>, element: HTMLElement } | null = null;

  constructor() {}

  openPopup<T>(component: Type<T>, options: {
    title?: string;
    width?: number;
    height?: number;
    showCloseButton?: boolean;
    closeOnOutsideClick?: boolean;
    position?: PopupPosition;
    data?: any;
    onShown?: EventEmitter<any>;
    onHidden?: EventEmitter<any>;
  } = {}) {
    // Zamknij poprzedni popup jeśli istnieje
    this.closePopup();

    // Utwórz nowy popup
    const popupRef = createComponent(DxPopupComponent, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.environmentInjector
    });

    // Utwórz komponent wewnątrz popupu
    const componentRef = createComponent(component, {
      environmentInjector: this.environmentInjector,
      elementInjector: this.environmentInjector
    });

    // Skonfiguruj popup
    popupRef.instance.visible = true;
    popupRef.instance.title = options.title || '';
    popupRef.instance.width = options.width || 500;
    popupRef.instance.height = options.height || 400;
    popupRef.instance.showCloseButton = options.showCloseButton ?? false;
    popupRef.instance.closeOnOutsideClick = options.closeOnOutsideClick ?? true;
    popupRef.instance.position = options.position || {
      my: 'bottom',
      at: 'bottom',
      of: window
    };
    popupRef.instance.animation = {
      show: { type: 'slideIn', direction: 'bottom' },
      hide: { type: 'slideOut', direction: 'bottom' }
    };

    if (options.onShown) {
      popupRef.instance.onShown = options.onShown;
    }

    if (options.onHidden) {
      popupRef.instance.onHidden = options.onHidden;
    }
    // Dodaj popup do DOM
    const popupElement = document.createElement('div');
    document.body.appendChild(popupElement);
    popupRef.location.nativeElement.appendChild(componentRef.location.nativeElement);
    popupElement.appendChild(popupRef.location.nativeElement);

    // Zarejestruj komponenty w Angular
    this.appRef.attachView(popupRef.hostView);
    this.appRef.attachView(componentRef.hostView);

    // Przekaż dane do komponentu jeśli zostały podane
    if (options.data) {
      Object.assign(componentRef.instance as object, options.data);
    }

    this.activePopup = {
      popup: popupRef,
      component: componentRef,
      element: popupElement
    };

    return {
      close: () => {
        if (this.activePopup) {
          this.activePopup.popup.instance.visible = false;
          setTimeout(() => this.closePopup(), 100);
        }
      },
      instance: componentRef.instance,
      popup: popupRef
    };
  }

  closePopup() {
    if (this.activePopup) {
      this.appRef.detachView(this.activePopup.popup.hostView);
      this.appRef.detachView(this.activePopup.component.hostView);
      this.activePopup.popup.destroy();
      this.activePopup.component.destroy();
      this.activePopup.element.remove();
      this.activePopup = null;
    }
  }
} 