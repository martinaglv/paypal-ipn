var https = require('https');
var qs = require('querystring');

var SANDBOX_URL = 'www.sandbox.paypal.com';
var REGULAR_URL = 'www.paypal.com';


exports.verify = function verify(params, options, callback) {

  if (typeof options === "function") {
    callback = options;
    options = {};
  }

  options = options || {};

  if (typeof params === "undefined") {
    return process.nextTick(function() {
      callback(new Error('No params were passed to ipn.verify'));
    });
  }

  if (!options.sandbox && params.test_ipn) {
    return process.nextTick(function() {
      callback(new Error('Sandbox request received, but the sandbox option is not set'));
    });
  }

  params.cmd = '_notify-validate';

  var body = qs.stringify(params);

  //Set up the request to paypal
  var req_options = {
    host: (options.sandbox) ? SANDBOX_URL : REGULAR_URL,
    method: 'POST',
    path: '/cgi-bin/webscr',
    headers: {'Content-Length': body.length}
  }


  var req = https.request(req_options, function paypal_request(res) {
    var data = [];

    res.on('data', function paypal_response(d) {
      data.push(d);
    });

    res.on('end', function response_end() {
      var response = data.join('');

      //Check if IPN is valid
      if (response === 'VERIFIED') {
        callback(null, response);
      } else {
        callback(new Error('IPN Verification status: ' + response));
      }
    });
  });

  //Add the post parameters to the request body
  req.write(body);

  req.end();

  //Request error
  req.on('error', callback);
};
