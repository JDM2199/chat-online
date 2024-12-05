const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');
const socketIo = require('socket.io');

const app = express();

// Configuración de la base de datos
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bd_chat'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conectado a la base de datos');
});

app.use((req, res, next) => {
  req.db = db;
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: true,
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

app.get('/chat', (req, res) => {
  if (req.session.usuario) {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
  } else {
    res.redirect('/');
  }
});

app.get('/chat-grupal', (req, res) => {
  if (req.session.usuario) {
    res.sendFile(path.join(__dirname, 'public', 'chat-grupal.html'));
  } else {
    res.redirect('/');
  }
});


const clientController = require('./controllers/client');
const registroController = require('./controllers/registro');

app.post('/registro', registroController.registrarUsuario);

// Rutas para el controlador de login
app.post('/login', clientController.iniciarSesion);

const server = app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});

// Configuración de Socket.io
const io = socketIo(server);

let users = {};
let groupChatMessages = [];

io.on('connection', (socket) => {
  console.log('Nuevo usuario conectado:', socket.id);

  // Almacenar usuario y socketId
  socket.on('set-username', (username) => {
    users[username] = socket.id;
    io.emit('user-list', Object.keys(users));
  });

  // Cuando se envía un mensaje de chat individual
  socket.on('chat-message', (data) => {
    const { to, message } = data;
    const recipientSocketId = users[to];

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat-message', {
        from: data.from,
        message: message,
      });
    }
  });

  // Cuando se envía un mensaje al chat grupal
  socket.on('group-chat-message', (data) => {
    groupChatMessages.push({ from: data.from, message: data.message });
    io.emit('group-chat-message', {
      from: data.from,
      message: data.message,
    });
  });

  // Cuando un usuario está escribiendo en el chat grupal
  socket.on('typing', (username) => {
    socket.broadcast.emit('typing', username);
  });

  // Cuando un usuario deja de escribir
  socket.on('stop-typing', () => {
    socket.broadcast.emit('stop-typing');
  });

  // Cuando un usuario se desconecta
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    for (let username in users) {
      if (users[username] === socket.id) {
        delete users[username];
        break;
      }
    }
    io.emit('user-list', Object.keys(users));
  });
});
