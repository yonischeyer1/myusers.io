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
    type: TagType
    hash:string
    distances:number[]
    maxWaitTimeUntilFail:number
    originalReferenceSnapshotURI:string
    screenShotFromPlayURI:string
    dynamic?:any
}