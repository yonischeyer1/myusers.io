export enum TEST_STATUS {
    IDLE = "IDLE",
    PLAYING = "PLAYING",
    FAIL = "FAIL",
    SUCCESS = "SUCCESS"
}

export interface Test {
    id?:string
    name:string
    userId:string
    actionId:string
    schedule:{},
    finishAction: UserAction,
    status:TEST_STATUS
}

export interface UserAction {
    userId:string
    actionId:string
}