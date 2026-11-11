import { describe, expect, it } from 'vitest';
import {
  validatePassword, validatePhone, validatePincode, validatePrice, validateQuantity,
} from '../utils/validators';

// each case: [input, shouldBeValid]
const check = (validator, cases) =>
  it.each(cases)('%j -> valid: %s', (input, valid) => {
    expect(validator(input) === '').toBe(valid);
  });

describe('validatePhone', () => {
  check(validatePhone, [['9876543210', true], ['5876543210', false], ['987654321', false], ['98765432101', false], ['', false]]);
});

describe('validatePincode', () => {
  check(validatePincode, [['500001', true], ['050001', false], ['50000', false], ['5000011', false]]);
});

describe('validatePassword', () => {
  check(validatePassword, [
    ['abcdefg1', true],
    ['abcdefgh', false], // no digit
    ['12345678', false], // no letter
    ['abc123', false], // too short
    ['a1'.padEnd(72, 'x'), true],
    ['a1'.padEnd(73, 'x'), false],
  ]);
});

describe('validatePrice (text in, no arithmetic)', () => {
  check(validatePrice, [
    ['1', true], ['28.5', true], ['28.50', true], ['99999.99', true], ['0.01', true],
    ['0', false], ['0.00', false], ['100000', false], ['12.345', false],
    ['.5', false], ['28.', false], ['-5', false], ['', false], ['abc', false],
  ]);
});

describe('validateQuantity', () => {
  check(validateQuantity, [['0', true], ['100000', true], ['100001', false], ['-1', false], ['1.5', false], ['', false]]);
});