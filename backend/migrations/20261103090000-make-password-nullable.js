'use strict';

// Accounts that sign in with Google have no password, so the column must allow NULL.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Fails if any account without a password exists by then.
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING(255),
      allowNull: false,
    });
  },
};
