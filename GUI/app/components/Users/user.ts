import Container, { CONTAINER_MODE } from "../../utils/Container.controller";
export default class User {
    container:Container
    type:any
    name:any
    constructor(user:any){
       this.type = user.type;
       this.name = user.name
       this.container = new Container(CONTAINER_MODE.player)
       this.container.init();
    }
    status() { }
    stop() { }
    play() { }
    restart(){ }
    edit() {}
    export () {}

} 