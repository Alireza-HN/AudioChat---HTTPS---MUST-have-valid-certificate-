// const socket = io('/');
const videoGrid = document.getElementById('video-grid');


// Create WebSocket connection.
const socket = new WebSocket('wss://localhost:3000');

const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001',
});

// Connection opened
socket.addEventListener('open', function(event) 
{
	myPeer.on('open', id => {
		socket.send(JSON.stringify({
			event: 'join-room',
			roomId: ROOM_ID,
			username: USERNAME,
			userId: id
		}));
	});

});

// Listen for messages
// socket.addEventListener('message', function (message) 
// {
// 	console.log(message);
//     let msg = JSON.parse(message.data);

// 	// if (msg.event === 'user-connected') {
// 	// 	console.log("hello");
// 	// 	usersQueue.push(msg.userId);
// 	// 	addUserToQueue(msg.userId, msg.username);
// 	// }

// 	// else if (msg.event === 'user ended the call') {
// 	// 	endCall(msg.userId);
// 	// }

// 	// else if (msg.event === 'user-disconnected') {
// 	// 	removeUserFromQueue(msg.userId);
// 	// }
// });

socket.addEventListener('message', function (message) 
{
    let msg = JSON.parse(message.data);
	console.log(msg);

});



const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {};
const usersQueue = [];
let audioStream = null;

navigator.mediaDevices.getUserMedia({
	// video: true,
	audio: true
}).then(stream => {
	audioStream = stream;
});


// socket.on('user-connected', (userId, username) => {
// 	usersQueue.push(userId);
// 	addUserToQueue(userId, username);
// });


// socket.on('user ended the call', userId => {
// 	endCall(userId);
// });

// socket.on('user-disconnected', userId => {
// 	removeUserFromQueue(userId);
// });



function addVideoStream(video, stream) {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	videoGrid.append(video);
}


function addUserToQueue(userId, username) 
{
	if (userId && !document.getElementById(userId))
	{
		let div = document.createElement('div');
		div.innerHTML = `<span>${username}</span>&nbsp;&nbsp;&nbsp;
		<span class="connectBtn" onclick="callUser(this.parentElement.id)">Connect</span>`;
	
		div.setAttribute("id", `${userId}`);
		div.setAttribute("class", "user");
	
		let usersQueueDiv = document.getElementById("usersQueue");
		usersQueueDiv.appendChild(div); 
	}
}


function removeUserFromQueue(userId) {
	let userDiv = document.getElementById(userId);
	if (userDiv) userDiv.remove();
}

function changeConnectBtn(status, userId) 
{
	if (status === "connected") 
	{
		let userDiv = document.getElementById(userId);
		let connectBtn = userDiv.querySelector(".connectBtn");

		connectBtn.setAttribute("onmouseover", "this.innerText='Disconnect'");
		connectBtn.setAttribute("onmouseout", "this.innerText='Connected'");
		connectBtn.setAttribute("onclick", "adminEndCall(this.parentElement.id)");
		connectBtn.setAttribute("class", "connectedBtn");
		connectBtn.innerText = "Connected";
	}
}

function adminEndCall(userId) 
{
	socket.send(JSON.stringify({
		event: "admin ended the call",
		roomId: ROOM_ID,
		endedUserId: userId
	}));

	endCall(userId);
}

// remove user from the queue and close the connection
function endCall(userId) {
	let userQueueNum = usersQueue.indexOf(userId);
	if (userQueueNum !== -1) usersQueue.splice(userQueueNum, 1);
	if (peers[userId]) peers[userId].close();
	removeUserFromQueue(userId);
}


function callUser(userId) 
{
	const call = myPeer.call(userId, audioStream);
	const video = document.createElement('video');
	peers[userId] = call;

	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream);
		changeConnectBtn("connected", userId);
	});

	// remove user from the queue and close the connection
	call.on('close', () => {
		video.remove();
		let userQueueNum = usersQueue.indexOf(userId);
		if (userQueueNum !== -1) usersQueue.splice(userQueueNum, 1);
		removeUserFromQueue(userId);
	});
}