const bcrypt = require('bcrypt');

exports.iniciarSesion = (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).send('Por favor, complete todos los campos');
  }

  const query = 'SELECT * FROM usuarios WHERE usuario = ?';
  req.db.query(query, [usuario], (err, results) => {
    if (err) return res.status(500).send('Error al consultar la base de datos');
    if (results.length === 0) {
      return res.status(400).send('Usuario no encontrado');
    }

    const user = results[0];
    bcrypt.compare(contrasena, user.contrasena, (err, isMatch) => {
      if (err) return res.status(500).send('Error al verificar la contraseña');
      if (!isMatch) return res.status(400).send('Contraseña incorrecta');

      req.session.usuario = user.usuario;
      req.session.nombre = user.nombre;

      return res.redirect('/chat');
    });
  });
};
