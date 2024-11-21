import { ShortcutInput } from "ng-keyboard-shortcuts";

export interface CustomShortcutInput extends ShortcutInput {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    cmdKey?: boolean;
}