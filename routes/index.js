var express = require('express');
var fs = require('fs');
var async = require('async');
var formidable = require('formidable');
var router = express.Router();

/* GET home page. */
router
	.get('/', function (req, res, next) {
		console.log(machine_list);
		res.render("index", machine_list);
	});

/* GET Introduce page. */
router
	.get('/introduction',function (req, res, next) {
		res.render("introduction");
	});

/* GET FROM 3DC page. */
router
	.get('/3dc_files',function (req, res, next){
		conn.query("select hostname from 3dc_list group by hostname", function (err, hostname, fields){
			host_sqls = {};
			d3dcs = {};
			for (var key in hostname){
				host_sql = "select d3dc_list, d3dc_path from 3dc_list where hostname = '" + hostname[key].hostname + "'";
				host_sqls[hostname[key].hostname] = host_sql;
			}
			console.log(host_sqls);
			async.forEachOf(host_sqls, function (item, key, callback){
				conn.query(item, function (err, d3dc_list, fields){
					if (err) {
						callback(err);
					}else{
						d3dcs[key] = d3dc_list;
						callback();
					}
				});
			}, function (err){
				if (err){
					console.log(err);
				}else{
					res.render("3dc", {"whole_3dc_list": d3dcs});
				}
			});
			
		});
	});

/* GET FROM PM4 page. */
router
	.get('/pm4_files',function (req, res, next){
		conn.query("select hostname from pm4_list group by hostname", function (err, hostname, fields){
			host_sqls = {};
			pm4s = {};
			for (var key in hostname){
				host_sql = "select pm4_list from pm4_list where hostname = '" + hostname[key].hostname + "'";
				host_sqls[hostname[key].hostname] = host_sql;
			}
			console.log(host_sqls);
			async.forEachOf(host_sqls, function (item, key, callback){
				conn.query(item, function (err, pm4_list, fields){
					if (err) {
						callback(err);
					}else{
						pm4s[key] = pm4_list;
						callback();
					}
				});
			}, function (err){
				if (err){
					console.log(err);
				}else{
					res.render("pm4_list", {"whole_pm4_list": pm4s});
				}
			});
			
		});
	});

/**/
router
	.post('/dump_queue',function (req, res, next){
		if (machine_list[req.body.dump_machine] != undefined){
			if (dump_tasks_queue[req.body.dump_machine] == undefined){
				res.send({msg: "No Need Queue!"});
			}else{
				console.log(machine_list);
				res.send({msg: req.body.dump_machine + " has " + (dump_tasks_queue[req.body.dump_machine].length + 1) + " task(s) in queue!" });
			}
		}
	});


router
	.post('/upload_bat',function (req, res, next){
		var form = new formidable.IncomingForm();
	  		form.encoding = 'utf-8';
	  		form.uploadDir = 'public/upload/';
	  		form.keepExtensions = true;
	  		form.maxFieldsSize = 2 * 1024 * 1024;
	  		form.parse(req, function (err, fields, files){
	  			if (err) {
		  			console.log(err);
		  			res.sendStatus(500);
		  			return;
				}
        		fs.renameSync(files.exp_bat.path, form.uploadDir+files.exp_bat.name);
        		res.sendStatus(200);
	  		});

	});

// ------------------------------------------------------------------------------------------------------
// Slirpi Data Searching System code part
router
	.post('/results/:machine/search',function (req, res, next) {
		var flag = 0;
		var combined_sql = "";
		var sql = "select distinct name from slirpi_chips where chips = ";
		var sql_date = "select name from slirpi_analysis where ";
		if (req.body.from_date != ""){
			sql_date += "date >= str_to_date('"+ req.body.from_date +"','%d %M %Y')"
		}
		if ((req.body.from_date != "") && (req.body.to_date != "")){
			sql_date += " and "
		}
		if (req.body.to_date != ""){
			sql_date += "date <= str_to_date('"+ req.body.to_date +"','%d %M %Y')"
		}
		if (typeof req.body.chips == "string"){
			sql += "'" + req.body.chips + "'"
		}else if(typeof req.body.chips != "undefined"){
			for (i in req.body.chips){
				if (flag == 0){
					sql += "'" + req.body.chips[i] + "'"
					flag = 1;
				}else{
					sql += " or chips = '" + req.body.chips[i] + "'"
				}	
			}
			sql += " group by name having count(name) = " + req.body.chips.length
		}
		if (((req.body.from_date) != "" || (req.body.to_date) != "") && (typeof req.body.chips == "undefined")){
			combined_sql += "select * from slirpi_analysis as a1,(" + sql_date + ") as a2 where a1.name = a2.name"
		}else if ((req.body.chips != "") && ((req.body.from_date) == "" && (req.body.to_date) == "")){
			combined_sql += "select * from slirpi_analysis as a1,("+ sql +") as a2 where a1.name = a2.name"
		}else{
			combined_sql += "select * from slirpi_analysis as a1, (" + sql + ") as a2, ("+ sql_date +") as a3 \
			where a1.name = a2.name and a1.name = a3.name"
		}
		conn.query(combined_sql,function (err, chips_list, fields){
			res.render("results/results_search",{"title": req.params.machine, "chips_list": chips_list});

		});
	});
// ------------------------------------------------------------------------------------------------------


router
	.get('/results/:machine',function (req, res, next) {
		conn.query("select path from slirpi_config where hostname = 'shpv001-pc' group by path order by path desc",function (err, rows, fields){
			res.render("results/shpv001", {"name":req.params.machine,"r":rows});
		});
		
	});

router
	.get('/results/shpv001-pc/:slirpi_name', function (req, res, next){
		conn.query("select config from slirpi_config where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = false", function (err, config_rows, fields){
			conn.query("select app from slirpi_apps where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "'", function (err, apps_rows, fields){
				conn.query("select config from slirpi_config where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = true", function (err, based_row, fields){
					res.render("results/results_show",{"based_r":based_row[0].config, "apps_r": apps_rows, "config_r":config_rows, "name":req.params.slirpi_name});
				});
			});
			
		});
	});

router
	.get('/results/shpv004-pc/:slirpi_name', function (req, res, next){
		conn.query("select config from slirpi_config where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = false", function (err, config_rows, fields){
			conn.query("select app from slirpi_apps where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "'", function (err, apps_rows, fields){
				conn.query("select config from slirpi_config where path = 'D:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = true", function (err, based_row, fields){
					res.render("results/results_show",{"based_r":based_row[0].config, "apps_r": apps_rows, "config_r":config_rows, "name":req.params.slirpi_name});
				});
			});
			
		});
	});

router
	.get('/results/shpv005-pc/:slirpi_name', function (req, res, next){
		conn.query("select config from slirpi_config where path = 'E:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = false", function (err, config_rows, fields){
			conn.query("select app from slirpi_apps where path = 'E:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "'", function (err, apps_rows, fields){
				conn.query("select config from slirpi_config where path = 'E:/SlirpiNextV2_Results/"+ req.params.slirpi_name + "' and isbased = true", function (err, based_row, fields){
					res.render("results/results_show",{"based_r":based_row[0].config, "apps_r": apps_rows, "config_r":config_rows, "name":req.params.slirpi_name});
				});
			});
			
		});
	});

module.exports = router;
