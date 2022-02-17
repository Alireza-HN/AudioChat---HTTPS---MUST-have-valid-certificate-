// const socket = io('/');
const videoGrid = document.getElementById('video-grid');

// Create WebSocket connection.
const socket = new WebSocket('wss://localhost:3000');

let myPeer = null;
let peerConnectionId = null;


// Connection opened
socket.addEventListener('open', function (event) {
	createPeer();
});


// Listen for messages
socket.addEventListener('message', function (message) 
{
    let msg = JSON.parse(message.data);
	console.log(msg);

	if (msg.event === 'user ended the call') {
		endCall(msg.userId);
	}

	else if (msg.event === 'admin ended the call') {
		if (peerConnectionId === msg.endedUserId) {
			alert("Call Ended");
			endCall();
		}
	}
});


async function createPeer() 
{
	myPeer = new Peer(undefined, {
		host: '/',
		port: '3001'
	});
	
	myPeer.on('open', id => {
		peerConnectionId = id;
	});
}


const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}
let audioStream = null;;

navigator.mediaDevices.getUserMedia({
	// video: true,
	audio: true
}).then(stream => 
{
	audioStream = stream;

	myPeer.on('call', call => 
	{
		console.log("call");
		call.answer(audioStream);
		const video = document.createElement('video')
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
			changeBtnStatusToConnected();
		});
	});

});



function addVideoStream(video, stream) {
	video.srcObject = stream
	video.addEventListener('loadedmetadata', () => {
		video.play()
	})
	videoGrid.append(video)
}


async function requestCall() 
{
	let connectionStatus = document.getElementById("requestCallBtn").getAttribute("status");

	if (connectionStatus === "notConnected") 
	{
		if (!peerConnectionId) {
			await createPeer();
		}

		let requestCallBtn = document.getElementById("requestCallBtn");
		let requestCallBtnContent = requestCallBtn.children[0];
		requestCallBtnContent.innerText = "Please Wait...";

		socket.send(JSON.stringify({
			event: 'join-room',
			roomId: ROOM_ID,
			username: USERNAME,
			userId: peerConnectionId
		}));
	}
}

// close the connection and change the buttons
function endCall() 
{
	socket.send(JSON.stringify({
		event: 'user ended the call',
		roomId: ROOM_ID,
		userId: peerConnectionId
	}));

	changeBtnStatusToDisconnected();
	peerConnectionId = null;
}


function changeBtnStatusToConnected() 
{
	let requestCallBtn = document.getElementById("requestCallBtn");
	let requestCallBtnContent = requestCallBtn.children[0];

	requestCallBtnContent.innerText = "Connected";
	requestCallBtn.setAttribute("class", "clientConnected");
	requestCallBtn.setAttribute("status", "connected");
	requestCallBtn.setAttribute("onmouseover", "document.getElementById('requestCallBtn').children[0].innerText='Disconnect'");
	requestCallBtn.setAttribute("onmouseout", "document.getElementById('requestCallBtn').children[0].innerText='Connected'");
	requestCallBtn.onclick = endCall;
}

function changeBtnStatusToDisconnected() 
{
	let requestCallBtn = document.getElementById("requestCallBtn");
	let requestCallBtnContent = requestCallBtn.children[0];

	requestCallBtnContent.innerText = "Request Call";
	requestCallBtn.setAttribute("class", "clientNotConnected");
	requestCallBtn.setAttribute("status", "notConnected");
	requestCallBtn.setAttribute("onclick", "requestCall()");
	requestCallBtn.removeAttribute("onmouseover");
	requestCallBtn.removeAttribute("onmouseout");
}