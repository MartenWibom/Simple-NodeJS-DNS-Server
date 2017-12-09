//import required libraries
var dns = require('native-dns');
var util = require('util');

var customEntries = {
	'ha-ui': [
		{
			name: 'ha-ui',
			address: '192.168.2.201',
			ttl: 30
		}
	]
};

var server = dns.createServer();

server.on('request', function (request, response) {
	var domain = request.question[0].name;
	if (customEntries[domain]) {
		//if custom entry exists, push it back...
		customEntries[domain].map((entry) => response.answer.push(dns.A(entry)));
		response.send();
	} else {
		// OK, not found. continue upwards
		var question = dns.Question({
			name: domain,
			type: 'A',
		});
		var req = dns.Request({
			question: question,
			server: { address: '8.8.8.8', port: 53, type: 'udp' },
			timeout: 1000,
		});
		req.on('message', function (err, answer) {
			var entries = [];
			answer.answer.forEach(function (a) {
				response.answer.push(dns.A(a));
			});
			response.send();
		});
		req.send();
	}
});

server.on('error', function (err, buff, req, res) {
	console.log(err.stack);
});

console.log('Listening on ' + 53);
server.serve(53);