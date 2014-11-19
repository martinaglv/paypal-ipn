var ipn = require('../index');
var qs = require('querystring');
var rewire = require('rewire');

var ipn_sandbox_msg = 'mc_gross=19.95&protection_eligibility=Eligible&address_status=confirmed&payer_id=LPLWNMTBWMFAY&tax=0.00&address_street=1+Main+St&payment_date=20%3A12%3A59+Jan+13%2C+2009+PST&payment_status=Completed&charset=windows-1252&address_zip=95131&first_name=Test&mc_fee=0.88&address_country_code=US&address_name=Test+User&notify_version=2.6&custom=&payer_status=verified&address_country=United+States&address_city=San+Jose&quantity=1&verify_sign=AtkOfCXbDm2hu0ZELryHFjY-Vb7PAUvS6nMXgysbElEn9v-1XcmSoGtf&payer_email=gpmac_1231902590_per%40paypal.com&txn_id=61E67681CH3238416&payment_type=instant&last_name=User&address_state=CA&receiver_email=gpmac_1231902686_biz%40paypal.com&payment_fee=0.88&receiver_id=S8XGHLYDW9T3S&txn_type=express_checkout&item_name=&mc_currency=USD&item_number=&residence_country=US&test_ipn=1&handling_amount=0.00&transaction_subject=&payment_gross=19.95&shipping=0.00';

// tests for bad (fake) IPN requests
module.exports['Fake IPN request'] = function(test) {

  var params = qs.parse(ipn_sandbox_msg);

  ipn.verify(params, function callback(err, msg) {
    test.notEqual(err, null, 'when returning error, err should not equal null');

    test.done();
  });
};

// test for undefined parameters passed to function
module.exports['Undefined parameters'] = function(test) {
  ipn.verify(undefined, function(err, msg) {
    test.notEqual(err, null, 'when returning error on undefined parameters, err should not equal null');

    test.done();
  });
};

// test for simulated requests while sandbox is false
module.exports['test_ipn with sandbox:false'] = function(test){

  var params = qs.parse(ipn_sandbox_msg);

  ipn.verify(params, { sandbox:false }, function(e){
    test.equal(e.message, 'Sandbox request received, but the sandbox option is not set');

    test.done();
  });

};

// test for which url is requested when sandbox is true
module.exports['URL when sandbox is true'] = function(test){

  var ipn = rewire('../lib/paypal-ipn.js');

  var fake_https = {}, f = function(){}, 
      req = { write: f, end: f, on:f };

  var params = qs.parse(ipn_sandbox_msg);


  fake_https.request = function(options, callback){
    test.equal(options.host, 'www.sandbox.paypal.com', 'when sandbox is true, www.sandbox.paypal.com should be used');
    test.done();
    return req;
  };

  ipn.__set__('https', fake_https);

  ipn.verify(params, { sandbox:true }, function(){});

};

// test for which url is requested when sandbox is false
module.exports['URL when sandbox is false'] = function(test){

  var ipn = rewire('../lib/paypal-ipn.js');

  var fake_https = {}, f = function(){}, 
      req = { write: f, end: f, on:f };

  var params = qs.parse(ipn_sandbox_msg);

  delete params.test_ipn;

  fake_https.request = function(options, callback){
    test.equal(options.host, 'www.paypal.com', 'when sandbox is false, www.paypal.com should be used');
    test.done();
    return req;
  };

  ipn.__set__('https', fake_https);

  ipn.verify(params, { sandbox:false }, function(){});

};

// test for which url is requested when sandbox is not set
module.exports['URL when sandbox is undefined'] = function(test){

  var ipn = rewire('../lib/paypal-ipn.js');

  var fake_https = {}, f = function(){}, 
      req = { write: f, end: f, on:f };

  var params = qs.parse(ipn_sandbox_msg);

  delete params.test_ipn;

  fake_https.request = function(options, callback){
    test.equal(options.host, 'www.paypal.com', 'when sandbox is undefined, www.paypal.com should be used');
    test.done();
    return req;
  };

  ipn.__set__('https', fake_https);

  ipn.verify(params, function(){});

};