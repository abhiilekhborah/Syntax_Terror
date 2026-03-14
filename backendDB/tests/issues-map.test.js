/**
 * Integration test: when a user reports an issue through the map,
 * the payload is sent to POST /api/issues/map and the issue is inserted into the database.
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

let mongoServer;
let app;

describe('Map issue report → database insertion', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGO_URI = uri;
    app = require('../index');
    await new Promise((resolve, reject) => {
      if (mongoose.connection.readyState === 1) return resolve();
      mongoose.connection.once('connected', resolve);
      mongoose.connection.once('error', reject);
    });
  });

  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it('inserts map report data into the database when POST /api/issues/map is called', async () => {
    const payload = {
      latitude: 28.6139,
      longitude: 77.209,
      address: 'Map Selected Location',
      description: 'pothole : Deep pothole near the crossing',
      issue_type: 'pothole',
      priority: 'low',
      name: 'Test Reporter',
      phone: '9876543210',
    };

    const res = await request(app)
      .post('/api/issues/map')
      .set('Content-Type', 'application/json')
      .send(payload);

    assert.strictEqual(res.status, 201, 'Expected 201 Created');
    assert.ok(res.body.message, 'Response should have message');
    assert.strictEqual(res.body.message, 'Report saved');
    assert.ok(res.body.ticket_id, 'Response should include ticket_id');

    const Issue = require('../models/issue');
    const doc = await Issue.findById(res.body.ticket_id);

    assert.ok(doc, 'Issue should exist in the database');
    assert.strictEqual(doc.source, 'map');
    assert.strictEqual(doc.category, 'pothole');
    assert.strictEqual(doc.priority, 'low');
    assert.strictEqual(doc.status, 'reported');
    assert.strictEqual(doc.description, payload.description);
    assert.strictEqual(doc.name, payload.name);
    assert.strictEqual(doc.phone, payload.phone);
    assert.strictEqual(doc.location.latitude, payload.latitude);
    assert.strictEqual(doc.location.longitude, payload.longitude);
    assert.strictEqual(doc.location.address, payload.address);
    assert.ok(doc.title.includes('pothole') && doc.title.includes('map'));
  });

  it('returns 400 when latitude, longitude or issue_type is missing', async () => {
    const res = await request(app)
      .post('/api/issues/map')
      .set('Content-Type', 'application/json')
      .send({ latitude: 1, longitude: 2 });

    assert.strictEqual(res.status, 400);
    assert.ok(res.body.message?.includes('required'));
  });
});
