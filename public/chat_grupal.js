const socket = io();

const username = prompt('Ingresa tu nombre de usuario');

socket.emit('set-username', username);

document.getElementById('welcome-message').textContent = `¡Bienvenido, ${username}!`;

const typingIndicator = document.getElementById('typing-indicator');

document.getElementById('group-message-input').addEventListener('input', () => {

  socket.emit('typing', { username: username });
});


socket.on('typing', (data) => {
  typingIndicator.textContent = `${data.username} está escribiendo...`;
});


document.getElementById('send-group-message').addEventListener('click', () => {
  const message = document.getElementById('group-message-input').value;
  socket.emit('group-chat-message', { from: username, message });
  document.getElementById('group-message-input').value = '';
  typingIndicator.textContent = '';
});


socket.on('group-chat-message', (data) => {
  const { from, message } = data;
  const messageElement = document.createElement('div');

  if (from === username) {

    messageElement.textContent = `Tú: ${message}`;
    messageElement.style.textAlign = 'right';
    messageElement.style.backgroundColor = '#d3ffd3';
  } else {

    messageElement.textContent = `${from}: ${message}`;
    messageElement.style.textAlign = 'left';
    messageElement.style.backgroundColor = '#f1f1f1';
  }

  document.getElementById('messages').appendChild(messageElement);

  typingIndicator.textContent = '';
});
