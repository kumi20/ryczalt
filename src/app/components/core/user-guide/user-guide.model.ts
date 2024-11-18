import Step from 'shepherd.js/src/types/step';

export interface UserGuide{
    view: string,
    defaultStepOptions: DefaultStepOptions
    steps: UserGuideStep[]
}

export interface DefaultStepOptions { // możliwe inne parametry domyślne zgodne z shepherd
    classes: string, // domyslne klasy dla guide'a
    scrollTo?: boolean | ScrollIntoViewOptions // czy scrolluje do kroku
    cancelIcon: {
        enabled: boolean,
    }
}

export interface UserGuideStep{
    attachTo: Step.StepOptionsAttachTo,
    classes?: string, // dodatkowe klasy
    buttons: UserGuideStepButton[],
    id: string // identyfikator kroku - format NazwaKomponentu-step-nr np. articles-step-1
    when?: string  // zachowanie scrollowania do elementu
}

export interface UserGuideStepButton{
    action: string, // typ akcji
    text?: string // tekst butona -> scieżka dla modułu translate 'menu.articles'
    classes?: string // dodatkowe klasy css dla buttona
    secondary?: boolean // czy dodatkowa klasa css ma się dodać
}

export interface UserGuideStepAttachTo{
    element: string, // selector css elementu do którego ma być przypięte
    on: string // po której stronie strzałka
}