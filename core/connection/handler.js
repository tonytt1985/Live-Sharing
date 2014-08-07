//Require js and url module
var fs = require('fs');
var url = require("url");

var handler = function (req, res) {
    console.log(typeof res.redirect);
	var path = url.parse(req.url).path;
	switch(path){
		case '/admin':
		case '/index':
			fs.readFile('client'+path+'.html', function(err, data){
				if(err){
					res.writeHead(500, {"Content-Type": "text/html", "Content-Length": data.length});
					return res.end('Error loading admin.html');
				}
				res.writeHead(200);
				res.end(data);
			});
			break;
		default:
			if(path.indexOf("/public") !== -1){
				var index = path.lastIndexOf(".");
				var ext = index < 0 ? "" : path.substring(index + 1);
				fs.readFile(path.substring(1), function(err, data){
					var headers = {};
					switch(ext){
						case 'js':
							headers = {"Content-Type": "application/javascript", "Content-Length": data.length};
							break;
						case 'css':
							headers = {"Content-Type": "text/css", "Content-Length": data.length};
							break;
						default:
							break;
					};
					if(err){
						res.writeHead(500);
						return res.end('Error loading '+ path);
					}
					else if(headers !== {}){
						res.writeHead(200, headers);
						res.end(data);
					}
				});
			}
			break;
	};
};
exports.handler = handler;