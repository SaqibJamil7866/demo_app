const express=require('express');
const bodyParser=require('body-parser');
const path = require('path');
const api = require('./routes/api');
const port = 8080;
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.static(path.join(__dirname,'src')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/api',api);

app.listen(port,function(){
    console.log('Node.js server is running on port ' + port);
});
