const socket = io();


const username = prompt('Ingresa tu nombre o usuario');
socket.emit('set-username', username);


document.getElementById('welcome-message').textContent = `Bienvenido, ${username}`;


socket.on('user-list', (users) => {
  const userList = document.getElementById('users');
  userList.innerHTML = '';

  users.forEach(user => {
    if (user !== username) {
      const li = document.createElement('li');
      li.textContent = user;
      li.addEventListener('click', () => selectUser(user));
      userList.appendChild(li);
    }
  });
});

let selectedUser = null;

function selectUser(user) {
  selectedUser = user;
  alert(`Seleccionaste a ${user} para enviar un mensaje`);
}

document.getElementById('send-button').addEventListener('click', () => {
  if (selectedUser) {
    const message = document.getElementById('message-input').value;
    socket.emit('chat-message', { from: username, to: selectedUser, message });
    document.getElementById('message-input').value = '';
  } else {
    alert('Por favor, selecciona un usuario para enviar un mensaje');
  }
});

socket.on('chat-message', (data) => {
  const { from, message } = data;
  const messageElement = document.createElement('div');
  messageElement.textContent = `${from}: ${message}`;
  document.getElementById('messages').appendChild(messageElement);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});
