import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { LoginView } from 'views/LoginView';

describe('Login View', () => {
  
  it('should update credentials on form changes', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    let node = renderedComponent.refs.emailInput;
    node.value = 'admin@sagedesk.org';
    TestUtils.Simulate.change(node);
    expect(renderedComponent.state.credentials.email).toBe(node.value);

    node = renderedComponent.refs.passwordInput;
    node.value = 'pasword123';
    TestUtils.Simulate.change(node);
    expect(renderedComponent.state.credentials.password).toBe(node.value);
  });

  it('should update credentials on form changes', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    let node = renderedComponent.refs.emailInput;
    node.value = 'admin@sagedesk.org';
    TestUtils.Simulate.change(node);
    expect(renderedComponent.state.credentials.email).toBe(node.value);

    node = renderedComponent.refs.passwordInput;
    node.value = 'pasword123';
    TestUtils.Simulate.change(node);
    expect(renderedComponent.state.credentials.password).toBe(node.value);
  });

  it('should show two errors if login submitted by default', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    TestUtils.Simulate.click(renderedComponent.refs.submitLoginBtn);

    expect(Object.keys(renderedComponent.state.errors).length).toBe(2);
    expect(renderedComponent.state.errors.email).toBe('This field is required.');
    expect(renderedComponent.state.errors.password).toBe('This field is required.');

    expect(TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'has-error').length).toBe(2);
    
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'form-error');
    expect(els.length).toBe(2);
    expect(els[0].textContent).toEqual('This field is required.');
    expect(els[1].textContent).toEqual('This field is required.');
  });

  it('should show an error if email not provided', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    let node = renderedComponent.refs.emailInput;
    node.value = 'admin@sagedesk.org';
    TestUtils.Simulate.change(node);
    TestUtils.Simulate.click(renderedComponent.refs.submitLoginBtn);

    expect(Object.keys(renderedComponent.state.errors).length).toBe(2);
    expect(renderedComponent.state.errors.email).toBe(null);
    expect(renderedComponent.state.errors.password).toBe('This field is required.');

    expect(TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'has-error').length).toBe(1);
    
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'form-error');
    expect(els.length).toBe(2);
    expect(els[0].textContent).toEqual('');
    expect(els[1].textContent).toEqual('This field is required.');
  });

  it('should show an error if password not provided', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    let node = renderedComponent.refs.passwordInput;
    node.value = 'password123';
    TestUtils.Simulate.change(node);
    TestUtils.Simulate.click(renderedComponent.refs.submitLoginBtn);

    expect(Object.keys(renderedComponent.state.errors).length).toBe(2);
    expect(renderedComponent.state.errors.email).toBe('This field is required.');
    expect(renderedComponent.state.errors.password).toBe(null);

    expect(TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'has-error').length).toBe(1);
    
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'form-error');
    expect(els.length).toBe(2);
    expect(els[0].textContent).toEqual('This field is required.');
    expect(els[1].textContent).toEqual('');
  });

  it('should remove errors on input after first submit', () => {
    const location = {
      query: {
        next: '/'
      }
    };
    
    const renderedComponent = TestUtils.renderIntoDocument(
      <LoginView location={location} />
    );
    expect(renderedComponent).toExist();

    TestUtils.Simulate.click(renderedComponent.refs.submitLoginBtn);

    let node = renderedComponent.refs.passwordInput;
    node.value = 'password123';
    TestUtils.Simulate.change(node);

    expect(Object.keys(renderedComponent.state.errors).length).toBe(2);
    expect(renderedComponent.state.errors.email).toBe('This field is required.');
    expect(renderedComponent.state.errors.password).toBe(null);

    expect(TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'has-error').length).toBe(1);
    
    let els = TestUtils.scryRenderedDOMComponentsWithClass(renderedComponent, 'form-error');
    expect(els.length).toBe(2);
    expect(els[0].textContent).toEqual('This field is required.');
    expect(els[1].textContent).toEqual('');
  });

});