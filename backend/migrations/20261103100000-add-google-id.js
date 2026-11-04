'use strict';

// Google's stable user id (the `sub` claim of its ID token). Accounts are matched on this,
// never on email, which Google says can change.
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'googleId', {
      type: Sequelize.STRING(255),
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'googleId');
  },
};
