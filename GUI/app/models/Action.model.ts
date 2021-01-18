export interface Action {
    id?:string
    startUrl:string
    name:string
    ioActions:[]
    tags: Tag[]
}

export enum TagType {
    LIVE = "LIVE",
    NOROMAL = "NORMAL",
    LOGIN = "LOGIN"
}

export interface Tag {
    dynamic?:any
    skip:boolean
    name:string
    type: TagType
    hash:string
    distances:number[]
    waitTime:any
    originalReferenceSnapshotURI:string
}