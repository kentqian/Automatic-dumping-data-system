$(document).ready(function (){	
	socket = io.connect('http://10.237.62.92:3333');
	var client_info = {
		type: 'client', 
		name: null
	};
	socket.emit('type_user', client_info);

	$("#main_page_nav").click(function (){
		$.ajax({
			type:'get',
			url:'/main_page',
			success: function (html){
				if (html){
					$("#main_window").html(html);
					$("#main_page_nav").siblings().removeClass("active");
					$("#main_page_nav").addClass("active");
					window.location.href = "/";	
				}else{
					console.log("????");
				}
			}
		});
	});

	$("#intro_nav").click(function (){
		$.ajax({
			type:'get',
			url:'/introduction',
			success: function (html){
				if (html){
					$("#main_window").html(html);
					$("#intro_nav").siblings().removeClass("active");
					$("#intro_nav").addClass("active");
				}else{
					console.log("????");
				}
			}
		});
	});


	$("#3dc").click(function (){
		$.ajax({
			type: 'get',
			url: '/3dc_files',
			success: function (html){
				if (html){
					$("#main_window").html(html);
					$("#key_frame_nav").siblings().removeClass("active");
					$("#key_frame_nav").addClass("active");
					$("#3dc_nav").siblings().removeClass("active");
					$("#3dc_nav").addClass("active");
				}else{
					console.log("????");
				}
			}
		});
	});

	$("#pm4").click(function (){
		$.ajax({
			type: 'get',
			url: '/pm4_files',
			success: function (html){
				if (html){
					$("#main_window").html(html);
					$("#key_frame_nav").siblings().removeClass("active");
					$("#key_frame_nav").addClass("active");
					$("#pm4_nav").siblings().removeClass("active");
					$("#pm4_nav").addClass("active");
				}else{
					console.log("????");
				}
			}
		});
	});

	$("#search").click(function (){
		window.location.href = "/results_search";
	});

});

function upload_bat(){
	if ($("#exp_bat").val() != ""){
		var data = new FormData($('#exp_bat_update')[0]);

		$.ajax({
			type:'post',
        	dataType:'text',
        	processData: false,
        	contentType: false,
        	url:"/upload_bat",
			data: data,
			success: function (data){
				$("#exp_bat_update").prepend('<div class="alert alert-success alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true"> &times;</button>Updated successfully!</div>');
			},
			error: function (data){
				$("#exp_bat_update").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true"> &times;</button>Updated Error!</div>');
			}
		});
	}else{
		$("#exp_bat_update").prepend('<div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true"> &times;</button>No File Select!</div>');
	}
}

function dumpOP_3dc(){
	var file_start = $("#exp_bat").val().lastIndexOf("\\");
	var checked = $("input[type='checkbox']:checked");
	if (checked.length <= 0){
		alert("Please Select Files!");
	}else{
		flag = "";
		emit_flag = true;
		checked.each(function (){
			if ((flag != this.name) && (this.name.indexOf("_isfulltrace") < 0)){
				var dump_info = {op:"d3dc", dump_list:[]}
				dump_info["dump_machine"] = this.name;
				var value_checked = $("input[name='"+ this.name +"']:checked");
				value_checked.each(function (){
					if ($("#" + this.id +"_full").prop("checked")){
						if (($("#" + this.id +"_from").val() != "")&&($("#" + this.id +"_to").val() != "")){
							alert("Please Select Trim Trace Or Full Trace!");
							emit_flag = false;
						}
						var dump = {
							"full_trace": true,
							"d3dc_name": $(this).val()
						}
					}else{
						if (parseInt($("#" + this.id +"_to").val()) - parseInt($("#" + this.id +"_from").val()) < 0){
							alert("The Num Ranges For Trimming Are Invalid!");
							emit_flag = false;
						}
						var dump = {
							"trim_from": parseInt($("#" + this.id +"_from").val()),
							"trim_to": parseInt($("#" + this.id +"_to").val()),
							"full_trace": false,
							"d3dc_name": $(this).val() 
						}
					}
					if ($("#exp_bat").val().slice(file_start + 1, -4) != ""){
						dump["exp_bat"] = $("#exp_bat").val().slice(file_start + 1, -4);
					}
					dump_info.dump_list.push(dump);
				});
				if (emit_flag){
					$.ajax({
						type: 'post',
						url: '/dump_queue',
						dataType: 'json',
						data: {dump_machine: this.name},
						success: function (data){
							alert(data.msg);	
							socket.emit('from_client', dump_info);
						}
					});
				}	
				flag = this.name;
			}
		});
	}
}

function dumpOP_pm4(){
	var file_start = $("#exp_bat").val().lastIndexOf("\\");
	var checked = $("input[type='checkbox']:checked")
	if (checked.length <= 0){
		alert("Please Select Files!");
	}else{
		flag = "";
		emit_flag = true;
		checked.each(function (){
			if (flag != this.name){
				var dump_info = {op:"pm4", dump_list:[]}	
				dump_info['dump_machine'] = this.name;
				var value_checked = $("input[name='"+ this.name +"']:checked");
				value_checked.each(function (){
					var select_batch = $("input[name='"+ this.name + "_" + $(this).val() +"_batch_select']:checked").val();
					if (select_batch == undefined){
						alert("Please Select Batch File!");
						emit_flag = false;
					}else if (select_batch == "exp_counter"){
						select_batch = $("#exp_bat").val().slice(file_start + 1, -4);
					}
					var dump = {
						"batch_select": select_batch,
						"pm4_name": $(this).val()
					}
					dump_info.dump_list.push(dump);
				});
				if (emit_flag) {
					$.ajax({
						type: 'post',
						url: '/dump_queue',
						dataType: 'json',
						data: {dump_machine: this.name},
						success: function (data){
							alert(data.msg);	
							socket.emit('from_client', dump_info);
						}
					});
				}
				flag = this.name;
			}
		});
	}
}

function checkbox_change(item){
	if ($("#" + item).prop("checked")){
		$("#" + item +"_trim").fadeIn();
		$("#" + item +"_full").prop("checked",true);
	}else{
		$("#" + item +"_trim").fadeOut();
		$("#" + item +"_full").prop("checked",false);
		$("#" + item +"_from").val("");
		$("#" + item +"_to").val("");
	}
}

function trimed_change(item){
	$("#" + item).prop("checked",false);
}

function selectbox_change(item){
	if ($("#" + item).prop("checked")){
		$("#" + item +"_batch").fadeIn();
	}else{
		$("#" + item +"_batch").fadeOut();
	}
}

