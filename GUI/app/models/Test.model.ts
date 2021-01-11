export enum TEST_STATUS {
    IDLE = "IDLE",
    PLAYING = "PLAYING",
    FAIL = "FAIL",
    SUCCESS = "SUCCESS"
}

export interface Test {
    id?:string
    schedule?:{}
    suite?:Test[]
    name:string
    userId:string
    actionId:string
    status:TEST_STATUS
}

export interface UserAction {
    userId:string
    actionId:string
}