const restify = require('restify');
const fs = require('fs');
const md5 = require('md5');
const corsMiddleware = require('restify-cors-middleware')
const JWT = require('jwt-simple');
const JWT_SECRET = "A PRETTY DECENT STRING";
const DATADIR = "data/";
const ACCOUNTS = DATADIR+"accounts/";
const IMAGES = DATADIR+'images/';

const cors = corsMiddleware({
	origins: ['*'],
	allowHeaders: ['*'],
  })
  

const server = restify.createServer();
server.use(restify.plugins.bodyParser({ mapParams: true }));
server.pre(cors.preflight)
server.use(cors.actual)


server.get('/', (req, res, next)=>{
	res.send({title:'Talkr Server',ver:1});
	console.log('Hit /');
	next();
});

server.post('/user/contacts/get',(req,res,next)=>{
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var contacts = JSON.parse(fs.readFileSync(ACCOUNTS+user+'/contacts.file'));
		res.send(contacts);
		next();	
	}
});

server.post('/user/contacts/add',(req,res,next)=>{
	var token = JWT.decode(req.params.token, JWT_SECRET);
	var user = token.username;
	var contacts = JSON.parse(fs.readFileSync(ACCOUNTS+user+'/contacts.file'));
	contacts.push(req.params.contactName);
	fs.writeFileSync(ACCOUNTS+user+'/contacts.file', JSON.stringify(contacts));
	res.send(contacts);
	next();
});

server.post('/user/login', (req,res,next) => {
	if(fs.existsSync(ACCOUNTS+req.params.username)){
		var accountData = JSON.parse(fs.readFileSync(ACCOUNTS+req.params.username+'/auth.file'));
		var reqPassword = md5(req.params.password);
		if(accountData.password === reqPassword){
			var userToken = JWT.encode({username:req.params.username, issued: Math.floor(new Date() / 1000)}, JWT_SECRET);
			res.send({jwt:userToken});
		}else{
			res.send({error:'Invalid Password'});
		}
	}else{
		res.send({error:"Invalid Account"});
	}
	next();
});

server.get('/user/profile/:profile', (req,res,next) => {
	var profile = req.params.profile;
	if(fs.existsSync(ACCOUNTS+profile)){
		var profileData = JSON.parse(fs.readFileSync(ACCOUNTS+profile+'/profile.file'));
		res.send(profileData);
	}else{
		res.send({error:'Invalid Account'});
	}
	next();
});

server.post('/user/create', (req,res,next) => {
	if(req.params.serverkey === "MASTERKEY"){
		if(!fs.existsSync(ACCOUNTS+req.params.username)){
			fs.mkdirSync(ACCOUNTS+req.params.username);
			fs.writeFileSync(ACCOUNTS+req.params.username+'/auth.file', JSON.stringify({password:md5(req.params.password)}));
			fs.writeFileSync(ACCOUNTS+req.params.username+'/profile.file', JSON.stringify({profile_image:"default.jpg"}));
			fs.writeFileSync(ACCOUNTS+req.params.username+'/contacts.file', JSON.stringify(['System']));
			fs.mkdirSync(ACCOUNTS+req.params.username+'/messages/');
			res.send({success:"Created Account"});
		}else{
			res.send({error:"Account exists"});
		}
	}else{
		res.send('Nope');
	}
	next();
});

server.post('/chat/message/send', (req,res,next) => {
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var messageContents = req.params.content;
		var userTo = req.params.to;
		var type = req.params.type;
		var messageJson = {type:type,from:user,to:userTo,message:messageContents, time:Math.round((new Date()).getTime() / 1000)};
		var messageString = JSON.stringify(messageJson);
		var messageDir = ACCOUNTS+user+'/messages/'+userTo+'/';
		var messageFile = messageDir + 'chat.json';
		if(!fs.existsSync(messageDir)){
			fs.mkdirSync(messageDir);
			fs.writeFileSync(messageFile, JSON.stringify([{from:user,message:'Hey!',type:'text', time:0}]));
		}
		if(!fs.existsSync(ACCOUNTS+userTo+'/messages/'+user+'/chat.json')){
			fs.mkdirSync(ACCOUNTS+userTo+'/messages/'+user+'/');
			fs.writeFileSync(ACCOUNTS+userTo+'/messages/'+user+'/chat.json', JSON.stringify([{from:user,message:'Hey!',type:'text', time:0}]));
		}
		var currentMessages = JSON.parse(fs.readFileSync(messageFile));
		currentMessages.push(JSON.parse(messageString));
		fs.writeFileSync(messageFile, JSON.stringify(currentMessages));
		res.send(JSON.parse(messageString));
	}else{
		res.send({error:'No token'});
	}
	next();
});

server.post('/chat/messages/get/recent', (req,res,next) => {
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var otherUser = req.params.from;
		var messages = [];
		if(fs.existsSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json') && fs.existsSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json')){
			var m1 = JSON.parse(fs.readFileSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json'));
			var m2 = JSON.parse(fs.readFileSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json'));
			m1 = m1.slice(Math.max(m1.length - 10, 1))
			m2 = m2.slice(Math.max(m2.length - 10, 1))
			messages = [...m1,...m2];
			messages.sort((a,b)=>(a.time - b.time));
		}else{
			messages = [];
		}

		res.send(messages);

	}else{
		res.send({error:'No token'});
	}
	next();
});

server.post('/chat/messages/get/after', (req,res,next) => {
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var otherUser = req.params.from;
		var pointInTime = req.params.time;
		var messages = [];
		if(fs.existsSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json') && fs.existsSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json')){
			var m1 = JSON.parse(fs.readFileSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json'));
			var m2 = JSON.parse(fs.readFileSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json'));
			m1 = m1.filter(ob=>{return ob.time > pointInTime});
			m2 = m2.filter(ob=>{return ob.time > pointInTime});
			messages = [...m1,...m2];
			messages.sort((a,b)=>(a.time - b.time));
		}else{
			messages = [];
		}

		res.send(messages);

	}else{
		res.send({error:'No token'});
	}
	next();
});

server.post('/images/upload', (req,res,next)=>{
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var imageContent = req.params.content;
		var time = Math.round((new Date()).getTime() / 1000);
		var filename = user+time;
		fs.writeFileSync(IMAGES+filename,imageContent);
		res.send({filename:filename});
	}else{
		res.send({error:'No Token'});
	}
	next();
});

server.get('/images/serve/:filename',(req,res,next)=>{
	var filename = req.params.filename;
	var image = IMAGES+filename;
	if(fs.existsSync(image)){
		var file = fs.readFileSync(image,'utf8');
		var buffer = new Buffer(file.split(",")[1], 'base64');
		res.write(buffer);
		res.end();
	}else{
		res.send({error:'No File'});
	}
	next();
});

server.post('/chat/messages/get/last', (req,res,next) => {
	if(req.params.token){
		var token = JWT.decode(req.params.token, JWT_SECRET);
		var user = token.username;
		var otherUser = req.params.from;
		var messages = [];
		if(fs.existsSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json') && fs.existsSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json')){
			var m1 = JSON.parse(fs.readFileSync(ACCOUNTS+user+'/messages/'+otherUser+'/chat.json'));
			var m2 = JSON.parse(fs.readFileSync(ACCOUNTS+otherUser+'/messages/'+user+'/chat.json'));
			messages = [...m1,...m2];
			messages.sort((a,b)=>(a.time - b.time));
			messages = messages[messages.length - 1];
		}else{
			messages = [];
		}

		res.send(messages);

	}else{
		res.send({error:'No token'});
	}
	next();
});

server.listen(8081, function() {
  console.log('Talkr Server Listening at 8081');
});