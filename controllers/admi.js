const Admin = require('../models/admin'); // Modelo del administrador

const adminController = {
  // Obtener todos los usuarios
  getAllUsers: async (req, res) => {
    try {
      const users = await Admin.getAllUsers(); // Función para obtener usuarios
      res.json(users);
    } catch (error) {
      res.status(500).send('Error al obtener usuarios.');
    }
  },

  // Eliminar un usuario
  deleteUser: async (req, res) => {
    const { userId } = req.params;
    try {
      await Admin.deleteUser(userId);
      res.status(200).send('Usuario eliminado con éxito.');
    } catch (error) {
      res.status(500).send('Error al eliminar usuario.');
    }
  },
};

module.exports = adminController;
