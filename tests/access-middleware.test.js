import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import requireRole from '../src/middlewares/role.middleware.js';
import requireAssignedRequest from '../src/middlewares/requestAccess.middleware.js';
import MaintenanceRequest from '../src/models/maintenanceRequest.js';
import RequestAssignee from '../src/models/requestAssignee.js';

function mockResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

describe('Role middleware', () => {
  it('returns 401 when user is missing', () => {
    const req = {};
    const res = mockResponse();
    let called = false;

    requireRole('admin')(req, res, () => {
      called = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
  });

  it('returns 403 when role is not allowed', () => {
    const req = { user: { role: 'viewer' } };
    const res = mockResponse();
    let called = false;

    requireRole('admin')(req, res, () => {
      called = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
  });

  it('allows an admin when admin role is required', () => {
    const req = { user: { role: 'admin' } };
    const res = mockResponse();
    let called = false;

    requireRole('admin')(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
  });
});

describe('Assigned request middleware', () => {
  let originalFindByPk;
  let originalFindOne;

  beforeEach(() => {
    originalFindByPk = MaintenanceRequest.findByPk;
    originalFindOne = RequestAssignee.findOne;
  });

  afterEach(() => {
    MaintenanceRequest.findByPk = originalFindByPk;
    RequestAssignee.findOne = originalFindOne;
  });

  it('returns 401 when user is missing', async () => {
    const req = { params: { id: '1' } };
    const res = mockResponse();
    let called = false;

    await requireAssignedRequest(req, res, () => {
      called = true;
    });

    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
  });

  it('allows an admin without checking assignment', async () => {
    const req = {
      params: { id: '1' },
      user: { role: 'admin' },
    };
    const res = mockResponse();
    let called = false;

    await requireAssignedRequest(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
  });

  it('returns 403 when user is not a technician or admin', async () => {
    const req = {
      params: { id: '1' },
      user: { role: 'viewer' },
    };
    const res = mockResponse();
    let called = false;

    await requireAssignedRequest(req, res, () => {
      called = true;
    });

    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
  });

  it('returns 404 when request does not exist', async () => {
    MaintenanceRequest.findByPk = async () => null;

    const req = {
      params: { id: '999' },
      user: { role: 'technician', technicianId: 7 },
    };
    const res = mockResponse();

    await requireAssignedRequest(req, res, () => {});

    assert.equal(res.statusCode, 404);
  });

  it('returns 403 when technician is not assigned', async () => {
    MaintenanceRequest.findByPk = async () => ({ id: 1 });
    RequestAssignee.findOne = async () => null;

    const req = {
      params: { id: '1' },
      user: { role: 'technician', technicianId: 7 },
    };
    const res = mockResponse();

    await requireAssignedRequest(req, res, () => {});

    assert.equal(res.statusCode, 403);
    assert.equal(res.body.message, 'You are not assigned to this request');
  });

  it('allows a technician assigned to the request', async () => {
    MaintenanceRequest.findByPk = async () => ({ id: 1 });
    RequestAssignee.findOne = async () => ({ requestId: 1, technicianId: 7 });

    const req = {
      params: { id: '1' },
      user: { role: 'technician', technicianId: 7 },
    };
    const res = mockResponse();
    let called = false;

    await requireAssignedRequest(req, res, () => {
      called = true;
    });

    assert.equal(called, true);
  });
});