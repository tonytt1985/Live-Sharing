var sys = require('sys');
var https = require('https'), http = require('http');
var url = require('url');
/*
* Name: server
* Description: An HTTP or HTTPS server implementation that uses a map of methods to decide action routing
* Properties:
*   server: HTTP or HTTPS server instance.
*   handlers: map of request methods.
*   port:port which server will listen
* */

function server(handlers, options){
	this.handlers = handlers;
	if(options)
		this.server = https.createServer(options, this.handleRequest_.bind(this));
	else
		this.server = http.createServer(this.handleRequest_.bind(this));
};
/*
* Name: start
* Description: Server listen on [port]. ex: 1337.
* Parameters:
*   port: port which server will listen.
* Returns:
*   none
* */
server.prototype.start = function(port){
	this.port = port;
	this.server.listen(this.port);
};
/*
* Name: parseUrl_
* Description: format url
* Parameters:
*   urlString: a url string.
* Returns:
*   none.
* */
server.prototype.parseUrl_ = function(urlString){
	var parsed = url.parse(urlString);
	parsed.pathname = url.resolve('/', parsed.pathname);
	return url.parse(url.format(parsed), true);
};
/*
* Name: handleRequest_
* Description: Specify request methods and invoke handle static content if request methods is in Map.
* Parameters:
*   req: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
* Returns:
*   None.
* */
server.prototype.handleRequest_ = function(req, res){
    // Force run application in HTTPS mode if HTTP is requested
    if(this.port == 80) {
        res.writeHead(302, {
            'Location': 'https://' + req.headers.host + req.url
        });
        res.end();
        return;
    }

    var logEntry = req.method + ' ' + req.url;
    if(req.headers['users-agent']){
        logEntry += ' ' + req.headers['users-agent'];
    }
    req.url = this.parseUrl_(req.url);

    var handler = this.handlers[req.method];
    if(!handler){
        res.writeHead(501);
        res.end();
    }else{
        handler.call(this, req, res);
    }
};
module.exports = server;