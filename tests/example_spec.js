// node
import path from 'path';
// vendors
import React from 'react';

describe('Testing', () => {
  it('node import should work', () => {
    expect(path).not.toBe(null);
  });
  it('vendors import should work', () => {
    expect(React).not.toBe(null);
  });
  it('should be 2', () => {
    let sum = 1 + 1;
    expect(2).toBe(2);
  });
});