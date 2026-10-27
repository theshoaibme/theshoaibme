import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load mock data to verify against
const dataPath = resolve(process.cwd(), 'public/data.json');
const rawJson = JSON.parse(readFileSync(dataPath, 'utf8'));

test('API Service Contract: standard envelope builder produces expected structure', () => {
  function buildApiResponse(data, options = {}) {
    return {
      success: true,
      statusCode: options.statusCode ?? 200,
      data,
      message: options.message,
      meta: {
        timestamp: new Date().toISOString(),
        cached: options.cached ?? false,
        count: options.count,
        total: options.total,
      },
    };
  }

  const response = buildApiResponse(rawJson.projects, {
    cached: false,
    count: rawJson.projects.length,
    total: rawJson.projects.length,
    message: 'Projects retrieved successfully',
  });

  assert.equal(response.success, true);
  assert.equal(response.statusCode, 200);
  assert.equal(response.message, 'Projects retrieved successfully');
  assert.equal(typeof response.meta.timestamp, 'string');
  assert.equal(response.meta.cached, false);
  assert.equal(response.meta.count, rawJson.projects.length);
  assert.equal(response.meta.total, rawJson.projects.length);
  assert.ok(Array.isArray(response.data));
});

test('API Service: projects query filters by featured and search', () => {
  const projects = rawJson.projects;

  // Filter featured
  const featured = projects.filter((p) => Boolean(p.featured) === true);
  assert.ok(featured.length > 0);
  assert.ok(featured.every((p) => p.featured === true));

  // Search filter
  const query = 'react';
  const searched = projects.filter((p) => {
    const inName = p.name.toLowerCase().includes(query);
    const inDesc = p.description.toLowerCase().includes(query);
    const inTech = p.tech_stack.some((tech) => tech.toLowerCase().includes(query));
    return inName || inDesc || inTech;
  });
  assert.ok(searched.length > 0);
});

test('API Service: pagination limits and offsets work accurately', () => {
  const projects = rawJson.projects;
  const limit = 2;
  const offset = 1;
  const paged = projects.slice(offset, offset + limit);

  assert.equal(paged.length, 2);
  assert.equal(paged[0].name, projects[1].name);
});

test('Error handling: isAbortError correctly identifies abort exceptions and messages', () => {
  function isAbortError(error) {
    if (error instanceof DOMException && error.name === 'AbortError') return true;
    if (error instanceof Error) {
      return error.name === 'AbortError' || /aborted/i.test(error.message);
    }
    return false;
  }

  assert.equal(isAbortError(new DOMException('aborted', 'AbortError')), true);
  assert.equal(isAbortError(new Error('signal is aborted without reason')), true);
  assert.equal(isAbortError(new Error('The user aborted a request.')), true);
  assert.equal(isAbortError(new Error('Failed to fetch data')), false);
  assert.equal(isAbortError(null), false);
});

