var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server);

let currentUsers = [];
let currentColors = [];
let convoLog = [];
let ucExists = '';

let nickNames = ['SadCat', 'GrumpyBunny', 'LonelyFox', 'SleepyBear', 'HappyPanda', 'CuteLion', 'SneezyZebra'];

let colors =   [ "#ffd500", "#ff0000", "#0000ff", "#00cc00", "#551a8b", "#ffa500", "#ffb6c1"];

server.listen(3000);
console.log('Running....');

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

	socket.emit('handshake');

  socket.on('handshake relay', function(initName, initColor){
		if(initName != "" && initName != null)  {
      let tempCookie = [];
			socket.nickName = initName;
      socket.nickColor = initColor;
      tempCookie.push(initName);
      tempCookie.push(initColor);
			socket.emit('connected', tempCookie);
			var index = nickNames.indexOf(initName);
			if (index !== -1) nickNames.splice(index, 1);
		}

    else {
			let user = nickNames[randInt(nickNames.length)];
      let userColor = colors[randInt(colors.length)];
      let tempArr = [];

			socket.nickName = user;
      socket.nickColor = userColor;
      tempArr.push(user);
      tempArr.push(userColor);
			socket.emit('connected', tempArr);
			var index1 = nickNames.indexOf(user);
			if (index !== -1) nickNames.splice(index1, 1);
      var index2 = colors.indexOf(userColor);
			if (index !== -1) colors.splice(index2, 1);
		}
  });

  socket.on('new user', function(data){
    tempUserData = data;
  	currentUsers.push(tempUserData[0]);
    currentColors.push(tempUserData[1]);
  	io.emit('user list', currentUsers);
  });

  socket.on('chat message', function(new_msg){

    if (new_msg == "") {
      return;
    }

    let subString = new_msg;
    let checkNickname = "/nick ";
    let checkNickcolor = "/nickcolor";

    if (subString.includes(checkNickname))  {
      new_msg = subString.slice(6);

      for (i = 0; i < currentUsers.length; i++)  {
        if (new_msg == currentUsers[i])  {
          ucExists = 'The nickname already exists! <br><br>';
          io.emit('warning message', ucExists, socket.nickName);
          return;
        }
        else if (i == currentUsers.length-1 && new_msg != currentUsers[i]) {
          var index = currentUsers.indexOf(socket.nickName);
      		if (index !== -1)   {
            currentUsers[index] = new_msg;
          }
          socket.nickName = currentUsers[index];
          ucExists = 'The nickname has been changed! <br><br>';
          io.emit('user list', currentUsers);
          socket.emit('updated name', currentUsers[index]);
          io.emit('warning message', ucExists, socket.nickName);
          return;
        }
      }
    }

    if (subString.includes(checkNickcolor))  {
      new_msg = subString.slice(11);
      new_msg = "#" + new_msg;

      for (i = 0; i < currentColors.length; i++)  {
        if (new_msg == currentColors[i])  {
          ucExists = 'The color already exists! <br><br>';
          io.emit('warning message', ucExists, socket.nickColor);
          return;
        }
        else if (i == currentColors.length-1 && new_msg != currentColors[i]) {
          var index = currentColors.indexOf(socket.nickColor);
      		if (index !== -1)   {
            currentColors[index] = new_msg;
          }
          console.log('socket: ', socket.nickColor);
          console.log('new_msg: ', new_msg);
          console.log('socket: ', currentColors[index]);
          socket.nickColor = currentColors[index];
          //io.emit('user list', currentUsers);
          ucExists = 'The color has been changed! <br><br>';
          socket.emit('updated color', currentColors[index]);
          io.emit('warning message', ucExists, socket.nickColor);
          return;
        }
      }
    }

  	var timeStamp = new Date();
    let hours = timeStamp.getHours();
    let minutes = timeStamp.getMinutes();

    if(hours < 10)  {
      hours = '0' + hours;
    }

    if(minutes < 10)  {
      minutes = '0' + minutes;
    }

    var timeFormat = hours + ":" + minutes;
  	var color = socket.nickColor;
    var sentUser = socket.nickName;

    newMessage = new_msg + "<br><br>";
    io.emit('chat message', timeFormat, sentUser, color, newMessage);
    });

    socket.on('log message', function(nextMessage)  {
	     convoLog.push(nextMessage);
     });

     socket.on('display log', function(currentUserPush){
    	 socket.emit('display log', convoLog);
     });

     function randInt(num) {
       return Math.floor((Math.random() * num));
     };

     socket.on('disconnect', function(){
    	var index = currentUsers.indexOf(socket.nickName);
    	if (index !== -1) {
        currentUsers.splice(index, 1);
      }
    	io.emit('user list', currentUsers);
     });
});
