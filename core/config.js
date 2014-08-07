// Init function to return configuration values on request with specific type
exports.Config = function (type) {
    var returnValue = "";
    switch (type) {
        case "DATABASE":
            returnValue = databaseConfig;
            break;
        case "LANGUAGE":
            returnValue = languageConfig;
            break;
        case "SERVER":
            returnValue = serverConfig;
            break;
        case "CHANNEL":
            returnValue = channelConfig;
            break;
        case "DEBUG":
            returnValue = debugConfig;
            break;
        default:
            break;
    }
    return returnValue;
}
/**	
 * (MySQL) Database Access Information, default host is localhost (or 127.0.0.1)
 */
var databaseConfig = {
    database: "livesale_db",      // database name
    user: "livesale_db",          // mysql user
    password: "M2YRPhD57KaB2Zf7"  // mysql password
};
/**	
 * Language Configuration (we don't use it for this version, only have one language)  
 */
var languageConfig = {
    default: "eng"
}
/**	
 * Server Configuration for Socket.IO connection 
 */
var serverConfig = {
    PORT: 443,              // port using for connect; 80 (HTTP); 443 (HTTPS); This option isn't use for this version due input port direct in noivado.js
    timeout_session: 155,	  // + X second of heartbeat timeout
    heartbeat_timeout: 30,	// timeout of a socket connection that need to receive a heartbeat from server
    heartbeat_interval: 10,	// time that client should send a heartbeat to server.    
}
/**	
 * Channel Configuration; Apply to accessed client 
 */
var channelConfig = {    
    default_stream_url: "rtmp://54.225.239.33:1935/live/",  // Live streaming URL for video/voice chat, provided by Wowza Media Server
    default_stream_name: "public.mp4",  // default stream name to play; This option is obsoleted due we don't need default live stream on Customer access  
    session_timeout: 180 * 1000,        // timeout for inactive customer connection 
    callback_timeout: 25 * 1000,        //
    admin_channel: 666,                 // channel value for Admin, equally to Waiting Queue Room
    max_user_in_public_channel: 50,     // maximum user is able to join Public Channel (Waiting Room), including Operators
    max_user: 50,                       // maximum user allows by socket.io  
    NICK_IN_USE: -1,                    // status: Operator is logged-in
    NO_SALE_ONLINE: -2,                 // status: No Operator is online
    CHANNEL_FULL: -3,                   // status: Public Channel is full
    sale_not_available: -4,             // status: Operator is online but not available to support
    max_cus_in_sale_channel: 2,         // status: allow number of Customer in private session with Operator; Support 1-to-many 
    sale_channel_full: -6,              // status: Private session is full
    cust_is_supported: -7               // status: Customer is supported by Operator
}
/**	
 * Debug Configuration 
 */
var debugConfig = {
    debugPacket: true,
    debugPacketLog: 'file', // file or console
    debugTime: true,
    debugTimeLog: 'file'
}