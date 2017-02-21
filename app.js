var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: 'c560ab7b-5533-443b-99fe-65ea3b3559ff',
    appPassword: '2jkWnBevEvzeM4WEfh6AUk7'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());


//=========================================================
// Bots Dialogs
//=========================================================

var Worker = {
    'Time':{
        'dialog':'/time'
    },
    'Chat':{
        'dialog':'/chat'
    }
}
var chat = new builder.IntentDialog();

bot.dialog('/', [
    function (session,args,next) {//確認身份
        if(!session.userData.privateData){
            session.beginDialog('/newUser',session.userData.privateData);
        }else{
            next();
        }
    },
    function (session, results) {//正試運作
        if(results.response){
            session.userData.privateData = results.response;
        }
        var data = session.userData.privateData;
        console.log('results='+results.response)
        session.send('Hello, %s!',data.name);
        session.beginDialog('/work');
    }
]);
//Work
bot.dialog('/work',[
    function(session){
        builder.Prompts.choice(session,'What can I help you?',Worker);
    },
    function (session,results){
        if (results.response) {
            var work = Worker[results.response.entity];
            if(results.response.entity != 'Chat'){
                session.beginDialog(work.dialog);
            }else{
                session.send('Ok, that\'s talk!');
                session.beginDialog(work.dialog);
            }
            
        } else {
            session.send("ok");
        }
    }
])

bot.dialog('/newUser',[
    function(session,args,next){//有沒有name
        session.dialogData.privateData = args || {};
        if(!session.dialogData.privateData.name){
            builder.Prompts.text(session,'What is your name?');
        }else{
            next();
        }
    },
    function(session,results,next){//有沒有年紀
        if(results.response){
            session.dialogData.privateData.name = results.response;
        }if(!session.dialogData.privateData.age){
            builder.Prompts.number(session,'What is your age?');
        }else{
            next();
        }
    },
    function(session,results){
        if (results.response) {
            session.dialogData.privateData.age = results.response;
        }
        session.endDialogWithResult({response: session.dialogData.privateData});
    }
])
//Time
bot.dialog('/time',function(session){
    var Date = '2017/2/20';
    session.send(Date);
    session.endDialog();
    session.replaceDialog('/');
})
//Chat
bot.dialog('/chat',chat);
chat.matches(/^help/i,function(session){
    session.send('Help what!?');
}).matches(/^talk/i,function(session){
    session.send('說話啊，不是要聊天!');
}).onDefault(builder.DialogAction.send("I'm sorry. I didn't understand."))
//c560ab7b-5533-443b-99fe-65ea3b3559ff
//2jkWnBevEvzeM4WEfh6AUk7

