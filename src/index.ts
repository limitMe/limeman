import * as fs from 'fs'
import Koa from 'koa';
import * as Sniffer from './sniffer'

// This is for mobile device to download cert
const app = new Koa();
app.use(async (ctx: any) => {
  //ctx.body = 'hellp world'
  ctx.attachment('my-private-root-ca.crt.pem')
  ctx.set('Content-Type', 'application/octet-stream')
  ctx.body = fs.createReadStream('my-private-root-ca.crt.pem')
});
app.listen(3000);

const proxy = Sniffer.createServer({
  certAuthority: {
    key: fs.readFileSync(`my-private-root-ca.key.pem`),
    cert: fs.readFileSync(`my-private-root-ca.crt.pem`)
  }
})

proxy.intercept({
  // Intercept before the request is sent
  phase: 'request'
}, async (request, response) => {
  // console.log(request)
  /*
  if (request.headers['transfer-encoding'] === 'chunked') {
    delete request.headers['transfer-encoding']
  }*/
  return request
})


proxy.intercept({
  // Intercept after the response has arrived
  phase: 'response'
}, async (request, response) => {
  // Also see https://github.com/request/request/issues/2091
  delete response.headers['content-length']
  response.body = Buffer.from('<h1>hello hacker</h1>')
  
  return response
})

proxy.listen(8080)

console.log('proxy is on')