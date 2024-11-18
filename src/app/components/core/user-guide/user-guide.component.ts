import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  Component,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { UserGuide, UserGuideStep } from './user-guide.model';
import UserGuideData from './user-guide-data.json';
import { ShepherdService } from 'angular-shepherd';
import Step from 'shepherd.js/src/types/step';
import { DxScrollViewComponent } from 'devextreme-angular';

@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss'],
  standalone: true,
  imports: [],
})
export class UserGuideComponent implements OnDestroy, OnChanges {
  @Input() scrollViewRef: DxScrollViewComponent = {} as DxScrollViewComponent;
  @Input() view: string = '';
  @Output('finished') finished: EventEmitter<boolean> =
    new EventEmitter<boolean>(); // jak true - cancel

  userGuideData: UserGuide[] = UserGuideData as UserGuide[];
  currentUserGuide: UserGuide = {} as UserGuide;
  private createdGuide: Subject<void> = new Subject();
  createdGuide$ = this.createdGuide.asObservable();
  destroy$: Subject<void> = new Subject();
  constructor(
    private shepherdService: ShepherdService,
    private translate: TranslateService
  ) {
    this.createdGuide$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.shepherdService.start();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['view']?.currentValue) {
      this.currentUserGuide = this.userGuideData.find(
        (el) => el.view === this.view
      ) as UserGuide;

      if (this.currentUserGuide) {
        this.createShepherdGuide();
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createShepherdGuide() {
    if (this.shepherdService.isActive) return;

    this.createDefaultOptions();
    this.createShepherdSteps();
  }

  createShepherdEvents() {
    this.shepherdService.tourObject.on('complete', () => {
      this.finished.emit(false);
    });
    this.shepherdService.tourObject.on('cancel', () => {
      this.finished.emit(true);
    });

    this.createdGuide.next();
  }

  createDefaultOptions() {
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
    this.shepherdService.defaultStepOptions =
      this.currentUserGuide.defaultStepOptions;
  }

  createShepherdSteps() {
    const steps: any[] = [];
    let index = 1;
    for (let step of this.currentUserGuide.steps) {
      let newStep: Step.StepOptions = {};
      newStep.attachTo = step.attachTo;
      const title = this.translate.instant(
        `userGuide.${this.view}.${index}.title`
      ); // step.title
      const text = this.translate.instant(
        `userGuide.${this.view}.${index}.text`
      ); // step.text
      newStep.title = title;
      newStep.text = text;
      newStep.classes = step.classes || '';
      newStep.id = step.id;
      newStep.buttons = this.createStepButtons(step);
      newStep.modalOverlayOpeningRadius = 4;

      if (step.when === 'scrollTo') {
        newStep.when = {
          show: () => this.onShow.bind(this, step),
        };
      } else {
        newStep.when = {
          show: () => this.addProgress.bind(this),
        };
      }

      index++;
      steps.push(newStep);
    }

    this.shepherdService.addSteps(steps);

    this.createShepherdEvents();
  }

  onShow(step: UserGuideStep) {
    const element: Element = document.querySelectorAll(
      step.attachTo.element as string
    )[0];
    this.scrollViewRef.instance.scrollToElement(element);

    // dodanie progresu w onboardingu
    this.addProgress();
  }

  addProgress() {
    const currentStep = this.shepherdService.tourObject.getCurrentStep();
    if (currentStep) {
      const currentStepElement = currentStep.getElement();
      if (currentStepElement) {
        const footer = currentStepElement.querySelector('.shepherd-footer');
        const progress = document.createElement('div');
        const steps = this.shepherdService.tourObject?.steps;
        progress.className = 'onboarding-summary';
        progress.innerText = `${steps.indexOf(currentStep) + 1} / ${
          steps.length
        }`;
        footer?.insertBefore(
          progress,
          currentStepElement.querySelector('.shepherd-button')
        );
      }
    }
  }

  createStepButtons(step: UserGuideStep): Step.StepOptionsButton[] {
    const buttons: Step.StepOptionsButton[] = [];
    for (let button of step.buttons) {
      const newButton: any = {};
      if (button.secondary) newButton.secondary = true;

      if (button.action === 'next') {
        newButton.text = `<i class='icon icon--keyboard-arrow-right'></i>`;
        newButton.action = function () {
          return this.next();
        };
      } else if (button.action === 'finish') {
        newButton.text = this.translate.instant('buttons.finish');
        newButton.classes = 'shepherd-finish-button';
        newButton.action = function () {
          return this.next();
        };
      } else if (button.action === 'back') {
        newButton.text = `<i class='icon icon--keyboard-arrow-left'></i>`;
        newButton.action = function () {
          return this.back();
        };
      } else {
        // inny typ
        newButton.text = '';
      }
      buttons.push(newButton);
    }
    return buttons;
  }
}
