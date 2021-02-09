const Promise = (cb) => {
    let _promiseResult  = 0 ;
    let temp = [];
    const resolve = (promiseResult) => {
        console.log(promiseResult,_promiseResult)
        _promiseResult = promiseResult
        
    }
    cb(resolve)
    return {
        then:(thenCB)=>{
            if(_promiseResult) {
                thenCB(_promiseResult)
            } else {
                temp.push(thenCB)
            }
        }
    }
}


const p = Promise((resolve)=>{
    setTimeout(
        ()=>{
        resolve(1)
    }, 0)
})
p.then(a => console.log(a))