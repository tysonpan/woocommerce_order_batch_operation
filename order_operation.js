/**
 * @name order_operation.js
 * @desc woocommerce订单操作插件
 * @author tysonpan
 */


function $(e){
    return jQuery(e);
}

//自定义搜索订单号是否匹配的方法
Array.prototype.contain_order_id = function (order_id) {
    for (var i = 0; i < this.length; i++) {
        if (this[i][0] == order_id) { //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true
            return true;
        }
    }
    return false;
}

//根据订单号找出对应的运单号
Array.prototype.getTrackingNumber = function(order_id){
    for (var i = 0; i < this.length; i++) {
        if (this[i][0] == order_id) { //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true
            return this[i][1];
        }
    }
    return false;
}

//加入浮层样式
var elStyle = document.createElement('link');
elStyle.setAttribute('type', 'text/css');
elStyle.setAttribute('rel', 'stylesheet');
elStyle.setAttribute('href', 'http://tysonpan.github.io/woocommerce_order_batch_operation/order_operation.css');
$('head').append(elStyle);

//加入浮层结构
var elHtml = '<div id="operate_win">' +
    '<input type="text" class="order-id-input" id="order_id_list">' +
    '<p class="tips">input the order id list,separated by the comma.</p>' +
    '<div class="btn-container">' +
//    '<button class="processing-btn operate-btn" action="processing">processing</button>' +
    '<button class="complete-btn operate-btn" action="complete">complete and send tracking number</button>' +
    '</div>' +
    '<div class="status-list-container">' +
        '<ul class="status-list" id="operate_status_list">' +
            '<li>log show here.</li>' +
            //'<li><span class="order-id">#2312</span><i class="loading"></i></li>' +
        '</ul>' +
    '</div>';
$('body').append(elHtml);


//全局变量
var order_id_list;
var i;
var tr_list;
var security;
var $operate_status_list;


function complete_order(){
    i++;
    if(i > tr_list.length-1) return;
    var $tr = $(tr_list[i]);
    var order_id = $tr.find('a strong').html().replace('#','');
    var post_id = $tr.attr('id').split('-')[1];
    if(order_id == '') return;
    if(order_id_list.contain_order_id(order_id)){
        var $complete_button = $tr.find('a.complete');
        if($complete_button.length>0){
            $operate_status_list.append('<li><span class="order-id">#'+order_id+'</span><i class="loading" id="complete_status'+order_id+'"></i><i class="loading" id="note_status'+order_id+'"></i></li>');
            var ajax_link = $complete_button.attr('href');
            jQuery.ajax({
                url : ajax_link,
                type: 'GET',
                dataType: 'text',
                success: function(){
                    //complete the order
                    $('#complete_status'+order_id).removeClass('loading').addClass('ok');
                    $complete_button.remove();
                },
                error: function(){
                    $('#complete_status'+order_id).removeClass('loading').addClass('fail');
                },
                complete: function(){
                    var tracking_number = order_id_list.getTrackingNumber(order_id);
                    if(tracking_number != ''){
                        //send tracking number
                        jQuery.ajax({
                            url : 'http://' + document.domain + '/wp-admin/admin-ajax.php',
                            type: 'POST',
                            dataType: 'text',
                            data:{action:'woocommerce_add_order_note',post_id:post_id,note:tracking_number,note_type:'customer',security:security},
                            success: function(){
                                $('#note_status'+order_id).removeClass('loading').addClass('ok');
                            },
                            error: function(){
                                $('#note_status'+order_id).removeClass('loading').addClass('fail');
                            },
                            complete: function(){
                                //next order
                                complete_order();
                            }
                        });
                    }
                    else{
                        $('#note_status'+order_id).removeClass('loading').addClass('ok');
                        complete_order();
                    }
                }
            });
        }
        else{
            complete_order();
        }
    }
    else{
        complete_order();
    }
}

$('#operate_win .operate-btn').click(function(){
    order_id_list = eval($('#order_id_list').val());
    i=-1;
    tr_list = $('#the-list').children('tr');
    security = woocommerce_admin_meta_boxes.add_order_note_nonce;
    $operate_status_list = $('#operate_status_list');
    $operate_status_list.empty();

    if(typeof(order_id_list) == 'object' && typeof(order_id_list[0]) == 'object'){
        complete_order();
    }
    else {
        alert('Please enter valid format string');
    }

});