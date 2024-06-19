'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'account_type', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'individual',
      validate: {
        isIn: [['individual', 'organization']]
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'account_type');
  }
};