import { Transform } from "stream";


let appPath = require('electron').remote.app.getAppPath()
if(appPath.indexOf("app.asar") > -1) {
    appPath = isWindows() ? appPath.replace("resources\\app.asar","app") : appPath.replace("Resources/app.asar","app")
    const fixPath = require('fix-path');
    fixPath();
}

export const APP_CWD = isWindows() ? `${appPath}\\` : `${appPath}/` ;
export const APP_DOCKER_META_PATH =  isWindows() ? `${APP_CWD}dockerMeta\\` : `${APP_CWD}dockerMeta/`
 
export function isWindows( ) {
    return process.platform.indexOf("win32") > -1;
}

export const sleep = (timeInMs:number) => {
  return new Promise((resolve, reject) => {
    setTimeout(()=>{
      resolve()
    }, timeInMs)
  })
}


export function getRandomArbitrary(min:number, max:number) {
  return Math.ceil(Math.random() * (max - min) + min);
}

export function toDataURL(url:any, callback:any) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var reader = new FileReader();
    reader.onloadend = function() {
      callback(reader.result);
    }
    reader.readAsDataURL(xhr.response);
  };
  xhr.open('GET', url);
  xhr.responseType = 'blob';
  xhr.send();
}

export class ExtractFrames extends Transform {
  delimiter: any;
  buffer: any;
  constructor(delimiter) {
    super({ readableObjectMode: true })
    this.delimiter = Buffer.from(delimiter, "hex")
    this.buffer = Buffer.alloc(0)
  }

  _transform(data, enc, cb) {
    // Add new data to buffer
    this.buffer = Buffer.concat([this.buffer, data])
    while (true) {
      const start = this.buffer.indexOf(this.delimiter)
      if (start < 0) break // there's no frame data at all
      const end = this.buffer.indexOf(
        this.delimiter,
        start + this.delimiter.length,
      )
      if (end < 0) break // we haven't got the whole frame yet
      this.push(this.buffer.slice(start, end)) // emit a frame
      this.buffer = this.buffer.slice(end) // remove frame data from buffer
      if (start > 0) console.error(`Discarded ${start} bytes of invalid data`)
    }
    cb()
  }
}