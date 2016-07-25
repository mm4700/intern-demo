import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../actions';

export class ModelOverlay extends Component {
  constructor(props, context) {
    super(props, context);

  }


}

const mapStateToProps = (state) => ({
  measurements: state.measurements.data,
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ModelOverlay);