if(process.argv[2])
	var jsonDB = require('./' + process.argv[2] + '.json');
else
	var jsonDB = require('./local.json');

module.exports.connectToMongo = function(cb){
	MongoClient.connect(jsonDB.mongo, function(err, db) {
		if (err) {
			throw err;
		}
		cb(db);
	});
};