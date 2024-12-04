import { QueryInterface, DataTypes } from 'sequelize';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('challenge_emotions', 'note', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenge_emotions', 'note');
  }
};