'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'notification_settings', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: JSON.stringify({
        like_notifications: true,
        comment_notifications: true,
        challenge_notifications: true,
        encouragement_notifications: true
      })
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'notification_settings');
  }
};