export interface CheckBoxType {
    text: string
    modelName: string
    value: boolean 
    readOnly: boolean
}

export interface RadioBoxType {
    text: string, 
    modelName: string, 
    items: { value: number | string, label: string }[], 
    value: number | string, 
    readOnly: boolean, 
    layout: 'vertical' | 'horizontal'
}

export type ConfirmButtonConfig = 'close' | 'saveCancel' | 'yesnocancel' | 'continuegiveup'

export type KindDialog = 'warning' | 'information' | 'question' | 'error' 

export interface GroupMessage {
    textInfo: string,
    list: {textMsg: string, readMore: string }[]
}