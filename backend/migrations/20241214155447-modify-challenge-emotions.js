'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenge_emotions', 'user_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('challenge_emotions', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    });
  }
};