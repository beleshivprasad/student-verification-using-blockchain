const express = require('express');
const app = express();
const routes = require('./controllers/routes');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use('/', routes);
app.use('/register', routes);
app.use('/login', routes);
app.use('/success', routes);
app.use('/logout', routes);
app.use('/verification', routes);
app.use('/home', routes);
app.use("/verify",routes);

const PORT =8000;
app.listen(PORT, () => console.log("Server Stated At Port", PORT));
