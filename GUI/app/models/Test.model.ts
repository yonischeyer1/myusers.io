export enum TEST_STATUS {
    IDLE = "IDLE",
    PLAYING = "PLAYING",
    FAIL = "FAIL",
    SUCCESS = "SUCCESS"
}

export interface TestModel {
    schedule?:{}
    testName:string
    userId:string
    actionId:string
    status:TEST_STATUS
}

export interface Test {
    id?:string
    suiteName:string
    suite:TestModel[]
}

export interface UserAction {
    userId:string
    actionId:string
}