var fs = require('fs'), url = require('url');
var sys = require('sys');
/*
* Name: staticServlet
* Description: handle static content
* Properties:
*   MimeMap: map of files type
* */
function staticServlet(){};
module.exports = staticServlet;
staticServlet.MimeMap = {
	'txt': 'text/plain',
	'html': 'text/html',
	'css': 'text/css',
	'xml': 'application/xml',
	'json': 'application/json',
	'js': 'application/javascript',
	'jpg': 'image/jpeg',
	'jpeg': 'image/jpeg',
	'gif': 'image/gif',
	'png': 'image/png',
  'ogv':'video/ogg',
  'mp4':'video/mp4',
  'webm':'video/webm',
  'swf':'application/x-shockwave-flash'
};
function escapeHtml(value) {
  return value.toString().
    replace('<', '&lt;').
    replace('>', '&gt;').
    replace('"', '&quot;');
};
/*
* Name: handleRequest
* Description: Specify request methods to response result
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
* Returns:
*   None.
* */
staticServlet.prototype.handleRequest = function(req, res){
	var self = this;
	var path = ('./' + req.url.pathname).replace(/%(..)/, function(match, hex){
		return String.fromCharCode(parseInt(hex, 16));
	});
	var parts = path.split('/');
    if (parts[parts.length - 1].charAt(0) === '.')
        return self.sendForbidden_(req, res, path);
    if(parts.length > 3 && parts[2] == 'public'){
        if(parts.length == 4 && parts[parts.length -1 ].length == 0)
            path = path + 'index.html';
        fs.stat(path, function (err, stat) {
            if (err)
                return self.sendMissing_(req, res, path);
            if (stat.isDirectory())
                return self.sendDirectory_(req, res, path);
            return self.sendFile_(req, res, path);
        });
    }
    else{
        if(parts[2].length == 0){
            res.writeHead(302, {
                'Location': 'https://' + req.headers.host + '/public/'
            });
            res.end();
        }
        else{
            fs.stat(path, function (err, stat) {
                if (err)
                    return self.sendMissing_(req, res, path);
                if (stat.isDirectory())
                    return self.sendForbidden_(req, res, path);
                return self.sendFile_(req, res, path);
            });
        }
    }
	/*if(parts[parts.length -1].charAt(0) ==='.')
        return self.sendForbidden_(req, res, path);
	fs.stat(path, function(err, stat){
        console.log(path);
		if(err)
			return self.sendMissing_(req, res, path);
		if(stat.isDirectory())
			return self.sendDirectory_(req, res, path);
		return self.sendFile_(req, res, path);
	}); */
};
/*
* Name: sendError_
* Description: response "500 internal server error"
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   error: internal server error
* Returns:
* */
staticServlet.prototype.sendError_ = function(req, res, error){
	res.writeHead(500, {'Content-Type': 'text/html'});
	res.write('<!doctype html>\n');
	res.write('<title>Internal Server Error</title>\n');
	res.write('<h1>Internal Server Error</h1>');
	res.write('<pre>' + escapeHtml(sys.inspect(error)) + '</pre>');
};
/*
* Name: sendMissing_
* Description: response "404 Not Found error"
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   path: path of request
* Returns:
*   None
* */
staticServlet.prototype.sendMissing_ = function(req, res, path){
	path = path.substring(1);
	res.writeHead(404, {'Content-Type': 'text/html'});
	res.write('<!doctype html>\n');
	res.write('<title>404 Not Found</title>\n');
	res.write('<h1>Not Found</h1>');
	res.write(
		'<p>The requested URL ' +
		escapeHtml(path) +
		' was not found on this server.</p>'
	  );
	  res.end();
	  //sys.puts('404 Not Found: ' + path);
};
/*
* Name: sendForbidden_
* Description: response "403 error"
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   path: path of request
* Returns:
*   None
* */
staticServlet.prototype.sendForbidden_ = function(req, res, path){
	path = path.substring(1);
	res.writeHead(403, {'Content-Type': 'text/html'});
	res.write('<!doctype html>\n');
	res.write('<title>403 Forbidden</title>\n');
	res.write('<h1>Forbidden</h1>');
	res.write(
	'<p>You do not have permission to access ' +
	escapeHtml(path) + ' on this server.</p>'
	);
	res.end();
	//sys.puts('403 Forbidden: ' + path);
};
/*
* Name: sendRedirect_
* Description: response "301 Moved Permanently"
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   path: path of request
* Returns:
*   None
* */
staticServlet.prototype.sendRedirect_ = function(req, res, redirectUrl){
	res.writeHead(301, {
	  'Content-Type': 'text/html',
	  'Location': redirectUrl
	});
	res.write('<!doctype html>\n');
	res.write('<title>301 Moved Permanently</title>\n');
	res.write('<h1>Moved Permanently</h1>');
	res.write(
	'<p>The document has moved <a href="' +
	redirectUrl +
	'">here</a>.</p>'
	);
	res.end();
	//sys.puts('301 Moved Permanently: ' + redirectUrl);
};
/*
 * Name: sendFile_
 * Description: response a file
 * Parameters:
 *   res: an instance of http.IncomingMessage
 *   res: an instance of http.ServerResponse
 *   path: path of request
 * Returns:
 *   None
 * */
staticServlet.prototype.sendFile_ = function(req, res, path){
	var self = this;
	var file = fs.createReadStream(path);
	res.writeHead(200, {'Content-Type': staticServlet.MimeMap[path.split('.').pop()] || 'text/plain'});
	if(req.method === 'HEAD'){
		res.end();
	}else{
		file.on('data', res.write.bind(res));
		file.on('close', function(){res.end();});
		file.on('error', function(error){self.sendError_(req, res, error);});
	}
};
/*
* Name: sendDirectory_
* Description: response a directory
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   path: path of request
* Returns:
*   None
* */
staticServlet.prototype.sendDirectory_ = function(req, res, path){
	var self = this;
	if(path.match(/[^\/]$/)){
		req.url.pathname += '/';
		var redirectUrl = url.format(url.parse(url.format(req.url)));
		return self.sendRedirect_(req, res, redirectUrl);
	}
	fs.readdir(path, function(err, files){
		if(err)
			return self.sendError_(req, res, err)
		if(!files.length)
			return self.writeDirectoryIndex_(req, res, path, []);
		
		var remaining = files.length;
		files.forEach(function(fileName, index){
			fs.stat(path + '/' + fileName, function(err, stat){
				if(err)
					return self.sendError_(req, res, err);
				if(stat.isDirectory()){
					files[index] = fileName + '/';
				}
				if(!(--remaining))
					return self.writeDirectoryIndex_(req, res, path, files);
			});
		});
	});
};
/*
* Name: writeDirectoryIndex_
* Description: write structure of directory
* Parameters:
*   res: an instance of http.IncomingMessage
*   res: an instance of http.ServerResponse
*   path: path of request
*   files: list of files in directory
* Returns:
*   None
* */
staticServlet.prototype.writeDirectoryIndex_ = function(req, res, path, files){
	path = path.substring(1);
	res.writeHead(200, {'Content-Type': 'text/html'});
	if(req.method == 'HEAD'){
		res.end();
		return;
	}
	res.write('<!doctype html>\n');
	res.write('<title>' + escapeHtml(path) + '</title>\n');
	res.write('<style>\n');
	res.write('  ol { list-style-type: none; font-size: 1.2em; }\n');
	res.write('</style>\n');
	res.write('<h1>Directory: ' + escapeHtml(path) + '</h1>');
	res.write('<ol>');
	files.forEach(function(fileName) {
	if (fileName.charAt(0) !== '.') {
	  res.write('<li><a href="' +
		escapeHtml(fileName) + '">' +
		escapeHtml(fileName) + '</a></li>');
	}
	});
	res.write('</ol>');
	res.end();
};