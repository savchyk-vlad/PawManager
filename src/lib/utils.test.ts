import test from 'node:test';
import assert from 'node:assert/strict';
import { getInitials } from './utils';

test('getInitials returns two uppercase initials from a full name', () => {
  assert.equal(getInitials('John Smith'), 'JS');
});

test('getInitials returns single initial when only one word', () => {
  assert.equal(getInitials('Alice'), 'A');
});

test('getInitials caps at two characters', () => {
  assert.equal(getInitials('Anna Belle Carter'), 'AB');
});

test('getInitials handles extra whitespace', () => {
  assert.equal(getInitials('  Jane   Doe  '), 'JD');
});

test('getInitials returns empty string for empty input', () => {
  assert.equal(getInitials(''), '');
});

test('getInitials uppercases lowercase names', () => {
  assert.equal(getInitials('mary poppins'), 'MP');
});
