import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { AdminView } from 'views/AdminView';

describe('Admin View', () => {

  it('should should show all the categories as filters', () => {
    const renderedComponent = TestUtils.renderIntoDocument(
      <AdminView />
    );
    expect(renderedComponent).toExist();

    let tabs = AdminView.defaultProps.initialItems.map((obj) => { return obj.category; });
    tabs = tabs.filter((v,i) => { return tabs.indexOf(v) == i; });
    tabs.unshift('All');
 
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'tab-item');
    expect(els.length).toBe(tabs.length);
    tabs.forEach((n, i) => {
      expect(els[i].textContent).toEqual(n);
    });
  });

  it('should default to All filter', () => {
    const renderedComponent = TestUtils.renderIntoDocument(
      <AdminView />
    );
    expect(renderedComponent).toExist();

    expect(renderedComponent.state.filter).toBe('All');
    
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'selected');
    expect(els.length).toBe(1);
    expect(els[0].textContent).toEqual('All');

    els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'admin-item');
    expect(els.length).toBe(AdminView.defaultProps.initialItems.length);
  });

  it('should filter items when a filter is clicked', () => {
    const renderedComponent = TestUtils.renderIntoDocument(
      <AdminView />
    );
    expect(renderedComponent).toExist();

    let el = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'tab-item')[1];
    TestUtils.Simulate.click(el);

    let category = AdminView.defaultProps.initialItems[0].category;
    expect(renderedComponent.state.filter).toBe(category);

    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'selected');
    expect(els.length).toBe(1);
    expect(els[0].textContent).toEqual(category);
  });

});