'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // user_id 컬럼 추가
      await queryInterface.addColumn('challenge_emotions', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        }
      }, { transaction });

      // log_date 컬럼 추가
      await queryInterface.addColumn('challenge_emotions', 'log_date', {
        type: Sequelize.DATEONLY,
        allowNull: false
      }, { transaction });
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('challenge_emotions', 'user_id', { transaction });
      await queryInterface.removeColumn('challenge_emotions', 'log_date', { transaction });
    });
  }
};