import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import requestRepository from '../src/repositories/request.repository.js';
import {
  updateRequestStatus,
} from '../src/services/request.service.js';

describe('Request status transitions', () => {
  let originalFindById;
  let originalUpdateStatus;
  let currentRequest;

  beforeEach(() => {
    originalFindById = requestRepository.findById;
    originalUpdateStatus = requestRepository.updateStatus;

    currentRequest = {
      id: 1,
      status: 'new',
    };

    requestRepository.findById = async () => currentRequest;
    requestRepository.updateStatus = async (id, status, author, userId) => ({
      id,
      status,
      author,
      userId,
    });
  });

  afterEach(() => {
    requestRepository.findById = originalFindById;
    requestRepository.updateStatus = originalUpdateStatus;
  });

  it('allows new -> in_progress', async () => {
    const result = await updateRequestStatus(1, 'in_progress');

    assert.equal(result.status, 'in_progress');
  });

  it('allows new -> rejected', async () => {
    const result = await updateRequestStatus(1, 'rejected');

    assert.equal(result.status, 'rejected');
  });

  it('allows in_progress -> done', async () => {
    currentRequest.status = 'in_progress';

    const result = await updateRequestStatus(1, 'done');

    assert.equal(result.status, 'done');
  });

  it('rejects new -> done', async () => {
    await assert.rejects(
      updateRequestStatus(1, 'done'),
      { code: 'INVALID_STATUS_TRANSITION' },
    );
  });

  it('rejects done -> in_progress', async () => {
    currentRequest.status = 'done';

    await assert.rejects(
      updateRequestStatus(1, 'in_progress'),
      { code: 'INVALID_STATUS_TRANSITION' },
    );
  });

  it('returns null when request does not exist', async () => {
    requestRepository.findById = async () => null;

    const result = await updateRequestStatus(999, 'in_progress');

    assert.equal(result, null);
  });
});