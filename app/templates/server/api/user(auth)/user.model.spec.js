'use strict';

var should = require('should');
var app = require('../../app');
var User = require('./user.model');

var user = new User({
  provider: 'local',
  name: 'Fake User',
  email: 'test@test.com',
  password: 'password'
});

describe('User Model', function() {
  before(function(done) {
    // Clear users before testing
    User.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    // Renew user object. Mongoose does not insert to database object that already have been saved.
    user = new User(user);
    User.remove().exec().then(function() {
      done();
    });
  });

  it('should begin with no users', function(done) {
    User.find({}, function(err, users) {
      users.should.have.length(0);
      done();
    });
  });

  it('should fail when saving a duplicate user', function(done) {
    user.save(function() {
      var userDup = new User(user);
      userDup.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it('should fail when saving without an email', function(done) {
    var userBroken = new User(user);
    userBroken.email = '';
    userBroken.save(function(err) {
      should.exist(err);
      done();
    });
  });

  it('should fail when saving a user with already occupied email', function(done) {
    var userAnother = new User({
      provider: 'local',
      name: 'Another ' + user.name,
      email: user.email,
      password: 'differentpassword'
    });
    user.save(function(err, _user) {
      should.not.exist(err);
      userAnother.save(function(err) {
        should.exist(err);
        done();
      });
    });
  });

  it("should authenticate user if password is valid", function() {
    return user.authenticate('password').should.be.true;
  });

  it("should not authenticate user if password is invalid", function() {
    return user.authenticate('blah').should.not.be.true;
  });
});
