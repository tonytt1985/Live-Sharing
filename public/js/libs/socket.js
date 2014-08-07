var socket;
var socket_id;
var disconnected = false;
					
//socketConnected(function(result){ });

var intervalTimeout;

/*socketOnDisconnect( function() {
	if(global_config.reconnect === -1){
		template_engine.displayNotificationLoading(error.className, error.disconnected);
		global_config.reconnect = setInterval(function(){location.reload();}, global_config.closeTimeout);
	}
} );

 socketOnReconnecting( function(count) {} );

socketOnReconnected( function() {
	//cleart the timeout of reload
	clearInterval(global_config.reconnect);
	global_config.reconnect = -1;
	template_engine.displayNotification(success.className, textDisplay.reconnect);
} );
*/
function socketConnected(callback)
{
	if( typeof(io) !== 'undefined' )
	{
		socket = io.connect(window.location.host,
							{
								'connect timeout' : 10000,
								'reconnection delay': 5000,
								'reconnection limit': 5000,
								'max reconnection attempts': 30,
								'sync disconnect on unload': true	//not firing disconnect event on unload page
							});

		socket.on('connect', function() {
            if(disconnected)
			{
                if(sale !== undefined)
				    socket.emit('operReconnect', {operId: sale.channelId} );
				disconnected = false;
			}
			socket_id = socket.socket.sessionid;
			callback(true);
			
		});
		socket.on( 'disconnect', function() {
			disconnected = true;
		});
	}
	else
		callback(false);

}

function socketEmit( event, msg )
{
	//msg.clientSend = getDateUTC();
		
	socket.emit( event, msg );
}

function socketOn( event, callback )
{
	socket.on( event, function(data) {
		if( /*config.debug == true && */ data && data.clientSend && data.clientSend != '')
		{
		
			var result = (getDateUTC() - data.clientSend).toString();
		
			//var log = "Time of send & receive message from server: " + result + "ms";
			
			socketEmit('messTime', result);
			
		}
		
		callback(data);
	});
}

function socketOnConnecting(callback)
{
	socket.on( 'connecting', function () {
		callback();
	});
}

function socketOnDisconnect( callback )
{
	socket.on( 'disconnect', function() {
		callback();
	});
}


function socketOnReconnecting( callback )
{
	socket.on( 'reconnecting', function(transport, count) {
		callback(count);		
	});
}

function socketOnReconnected( callback )
{
	socket.on( 'reconnect', function() {
		callback();
	});
}

function socketOnce( event, callback )
{
	socket.once( event, function(data) {
		callback(data);
	});
}

function socketJsonSend( data )
{
	data.clientSend = getDateUTC();
		
	socket.json.send (  data );
}

function socketDisconnect()
{	
	//socket.disconnect();
	socket.emit( 'socketDisconnect', {disconnect: true} );
}

function getDateUTC() 
{
	var d = new Date()
	var n = d.getTimezoneOffset();
	
	return ( d.getTime() + n*60*1000 );
}