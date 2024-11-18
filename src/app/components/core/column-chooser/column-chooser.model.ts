export interface ColumnChooserColumn {
    name: string
    caption: string
    visibleIndex: number
    checked?: boolean
    width: string | number
    allowReordering?: boolean
    dataField?: string
}

export interface RawColumn {
    caption: string 
    checked: boolean
    items: any[] // nie istotne dla kolejnosci
    name: string
}