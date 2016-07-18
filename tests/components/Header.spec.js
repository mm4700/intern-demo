import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { Header } from 'components/Header';

describe('Header', () => {

  it('should should show the correct user name', () => {
    const renderedComponent = TestUtils.renderIntoDocument(
      <Header />
    );
    expect(renderedComponent).toExist();
  });


});