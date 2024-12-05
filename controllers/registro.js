const bcrypt = require('bcrypt');

exports.registrarUsuario = (req, res) => {
  const { nombre, usuario, correo, contrasena } = req.body;

  if (!nombre || !usuario || !correo || !contrasena) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  const query = 'SELECT * FROM usuarios WHERE usuario = ? OR correo = ?';
  req.db.query(query, [usuario, correo], (err, results) => {
    if (err) return res.status(500).send('Error al consultar la base de datos');
    if (results.length > 0) {
      return res.status(400).send('El usuario o correo ya está registrado');
    }

    bcrypt.hash(contrasena, 10, (err, hashedPassword) => {
      if (err) return res.status(500).send('Error al cifrar la contraseña');

      const insertQuery = 'INSERT INTO usuarios (nombre, usuario, correo, contrasena) VALUES (?, ?, ?, ?)';
      req.db.query(insertQuery, [nombre, usuario, correo, hashedPassword], (err) => {
        if (err) return res.status(500).send('Error al registrar el usuario');

        req.session.usuario = usuario;
        req.session.nombre = nombre;

        res.redirect('/chat');
      });
    });
  });
};
