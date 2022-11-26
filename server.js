var WebSocketServer = require('ws').Server;   // webSocket library

// configure the webSocket server:
const wssPort = process.env.PORT || 8080;             // port number for the webSocket server
const wss = new WebSocketServer({port: wssPort}); // the webSocket server
var clients = new Object;         // list of client connections
var roomHost = new Object


// ------------------------ webSocket Server functions
function handleConnection(client, request) {
	// console.log("New Connection");        // you have a new client
	// clients.push(client);    // add this client to the clients array

	function endClient() {
		// var position = clients.indexOf(client);
		// clients.splice(position, 1);
		// console.log("connection closed");
	}

    const onMessage = (messageClient) => {
        messageClient += ""
		const isHost = messageClient.split("|")[0]
		const sender = messageClient.split("|")[1]
		const tag = messageClient.split("|")[2]
		const message = messageClient.split("|")[3]
        const codeRoom = messageClient.split("|")[4]

		console.log(messageClient)
	
		switch (tag) {
			case "!CreateRoom": //only host
				createRoom(message, sender, client)
				break;
			
			case "!JoinRoom": // only client
				joinRoom(sender, message, client)
				break;
		
			default:
                if(isHost === "true"){
                    broadcastHost(message, sender, tag, codeRoom)
                }else{
                    sendToHost(message, tag, sender, codeRoom)
                }
				break;
		}
	}

	// set up client event listeners:
	client.on('message', onMessage);
	client.on('close', endClient);
}

const createRoom = (codeRoom, hostName, client) => {
    client.alias = hostName
    clients[codeRoom] = [client]
    roomHost[codeRoom] = hostName
    broadcast("room created", codeRoom)
}

const joinRoom = (clientName, codeRoom, client) => {
    try {
        client.alias = clientName
        let cArr = clients[codeRoom]
        cArr.push(client)
        clients[codeRoom] = cArr
        let players = cArr.length
        cArr.forEach(e => {
            players += "_"+e.alias
        });
        // console.log("players: ", players)
        broadcast("client joined|"+players, codeRoom)
    } catch (error) {
        console.log(error)
    }
}

const broadcastHost = (message, sender, tag, codeRoom) => {
	let cArr = clients[codeRoom]
    // console.log(cArr)
    // cArr.shift()
	for (c in cArr) {
		cArr[c].send(`${tag}|${message}|${sender}`);
	}
}

const broadcast = (message, codeRoom) => {
	let cArr = clients[codeRoom]
  
	for (c in cArr) {
		cArr[c].send(message);
	}
}

const sendToHost = (message, tag, sender, codeRoom) => {
    let cArr = clients[codeRoom]

    cArr[0].send(`${tag}|${message}|${sender}`)
}

// listen for clients and handle them:
wss.on('connection', handleConnection);