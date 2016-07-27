import React, { Component, PropTypes } from 'react';

export default class AboutView extends Component {
  render() {
    return (
      <div className="main-container">
        <div className="row">
          <div className="col-xs-12" style={{padding: '50px', background: 'rgba(255,255,255,0.5)'}}>
            <p>
              This is a demo built for my summer internship at Schlumberger which shows how an oil field engineer
              might view uncertianity for various data aggregated for the oil and gas wells in the field. It additionally
              provides the oil field engineer with different mechanisms to drill into the data and the accompanying
              simulation models to determine reasons for the uncertianity in the data. 
            </p>
            <p>Author: <strong>Mei Mei</strong></p>
            <p>
              Released under the MIT license.
            </p>
            <p>
              Code is available at <a href="https://github.com/mmei/intern-demo">Github</a>
            </p>
            <div className="version-history" style={{fontSize: '11px'}}>
              <h1 style={{font: 'bold 16px Tahoma, Verdana, Geneva, Arial, Helvetica, sans-serif', margin: 0, padding: '0 0 10px'}}>History</h1>
              <div className="releases">
                <div className="release" style={{margin: '0px 0 10px', background: '#fffbcd', marginBottom: '30px', padding: '20px', border: '1px solid #f5c83f', borderRadius: '4px'}}>
                  <h3 style={{font: 'bold 13px Tahoma, Verdana, Geneva, Arial, Helvetica, sans-serif', margin: 0, padding: 0}}>Version 1.0.0 <span style={{fontWeight: 'normal', color: '#777'}}>(2016-07-29)</span>:</h3>
                  <ul style={{listStyle: 'disc', padding: '10px 0 0 40px', margin: 0}}>
                    <li style={{padding: '0 0 5px'}}>
                      Initial BETA release to the public. Enjoy!
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
