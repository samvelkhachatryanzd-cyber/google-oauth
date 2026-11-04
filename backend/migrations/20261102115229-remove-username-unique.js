'use strict';

// Usernames are display names, not identifiers, so duplicates are allowed.
// (email stays unique: it is what users log in with.)
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeIndex('Users', 'username');
  },

  async down(queryInterface) {
    // Fails if duplicate usernames exist by then.
    await queryInterface.addIndex('Users', ['username'], { unique: true, name: 'username' });
  },
};
