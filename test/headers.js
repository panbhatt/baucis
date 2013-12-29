var expect = require('expect.js');
var mongoose = require('mongoose');
var express = require('express');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var request = require('request');
var baucis = require('..');

var fixtures = require('./fixtures');

describe('Headers', function () {
  before(fixtures.vegetable.init);
  beforeEach(fixtures.vegetable.create);
  after(fixtures.vegetable.deinit);

  it('should set Last-Modified', function (done) {
    var latestModifiedDate = Math.max.apply(null, vegetables.map(function (vege) {
      return vege.get('lastModified');
    }));
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      done();
    });
  });

  it('should save new lastModified date', function (done) {
    var vege = vegetables[0];
    var originalModified = vege.get('lastModified');

    // Wait or else lastModified will still have the same string represntation
    setTimeout(function () {
      var options = {
        url: 'http://localhost:8012/api/vegetables/' + vege._id,
        json: { name: 'Pumpkin' }
      };
      request.put(options, function (err, response, body) {
        if (err) return done(err);
        var updatedModified = new Date(response.headers['last-modified']);
        var options = {
          url: 'http://localhost:8012/api/vegetables/' + vege._id,
          json: true
        };

        expect(response).to.have.property('statusCode', 200);
        expect(updatedModified).to.be.greaterThan(originalModified);

        request.head(options, function (err, response, body) {
          if (err) return done(err);
          expect(response).to.have.property('statusCode', 200);
          expect(new Date(response.headers['last-modified'])).to.eql(updatedModified);
          done();
        });
      });
    }, 1000);
  });

  it('should set allowed', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      expect(response.headers).to.have.property('allow', 'HEAD,GET,POST,PUT,DELETE');
      done();
    });
  });

  it('should set ETag', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.get(options, function (err, response, body) {
      if (err) return done(err);
      var etag = response.headers['etag'];
      expect(response).to.have.property('statusCode', 200);
      expect(response.headers).to.have.property('etag');

      request.head(options, function (err, response, body) {
        if (err) return done(err);
        expect(response).to.have.property('statusCode', 200);
        expect(response.headers).to.have.property('etag', etag);
        done();
      });
    });
  });

  it('should set accept', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      expect(response.headers).to.have.property('accept', 'application/json, application/x-www-form-urlencoded');
      done();
    });
  });

  it('should set X-Powered-By', function (done) {
    var options = {
      url: 'http://localhost:8012/api/vegetables',
      json: true
    };
    request.head(options, function (err, response, body) {
      if (err) return done(err);
      expect(response).to.have.property('statusCode', 200);
      expect(response.headers).to.have.property('x-powered-by', 'Baucis');
      done();
    });
  });

});
