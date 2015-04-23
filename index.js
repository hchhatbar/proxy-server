let http = require('http')
let fs = require('fs')
let through = require('through')
let request = require('request')
let argv = require('yargs')
	.default('host', '127.0.0.1')
	.argv
let scheme = 'http://'
let port = argv.port || argv.host === '127.0.0.1' ? 7000 : 80
let destinationUrl = argv.url || scheme + argv.host + ':' + port
let logStream = argv.mylogfile ? fs.createWriteStream(argv.mylogfile) : process.stdout
//console.log(logStream)

http.createServer((req,res) => {
	logStream.write('Echo request: \n' + JSON.stringify(req.headers))
	for(let header in req.headers){
		res.setHeader(header,req.headers[header])
	}
	through(req, logStream, {autoDestroy:false})
	req.pipe(res)
}).listen(7000)

logStream.write('Listening at http://127.0.0.1:7000')

http.createServer((req,res) => {
	let options = {
		headers : req.headers,
		url : destinationUrl
	}
	logStream.write('Proxy request: \n' + JSON.stringify(req.headers))
	through(req, logStream, {autoDestroy:false})
	let destinationResponse = req.pipe(request(options))

		logStream.write(JSON.stringify(destinationResponse.headers))
		destinationResponse.pipe(destinationResponse)
	through(req, logStream, {autoDestroy:false})
	
	
	//
	
}).listen(7001)