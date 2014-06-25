/**
 * @name order_operation.js
 * @desc woocommerce订单操作插件
 * @author tysonpan
 */


function $(e){
    return jQuery(e);
}

Array.prototype.contains = function (element) { //利用Array的原型prototype点出一个我想要封装的方法名contains
    for (var i = 0; i < this.length; i++) {
        if (this[i] == element) { //如果数组中某个元素和你想要测试的元素对象element相等，则证明数组中包含这个元素，返回true
            return true;
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
    '<button class="processing-btn operate-btn" action="processing">processing</button>' +
    '<button class="complete-btn operate-btn" action="complete">complete</button>' +
    '</div>' +
    '<div class="status-list-container">' +
        '<ul class="status-list" id="operate_status_list">' +
            '<li>log show here.</li>' +
            //'<li><span class="order-id">#2312</span><i class="loading"></i></li>' +
        '</ul>' +
    '</div>';
$('body').append(elHtml);


function order_operate(order_id_list,action){
    var $operate_status_list = $('#operate_status_list');
    $operate_status_list.empty();

    $('#the-list').children('tr').each(function(){
        var order_id = $(this).children('.order_title').find('a strong').html().replace('#','');
        if(order_id == '') return;
        if(order_id_list.contains(order_id)){
            if(action == 'processing'){
                var $processing_button = $(this).find('a.processing');
                if($processing_button.length>0){
                    $operate_status_list.append('<li><span class="order-id">#'+order_id+'</span><i class="loading" id="i_status'+order_id+'"></i></li>');
                    var ajax_link = $processing_button.attr('href');
                    jQuery.ajax({
                        url : ajax_link,
                        type: 'GET',
                        dataType: 'text',
                        success: function(){
                            $('#i_status'+order_id).removeClass('loading').addClass('ok');
                            $processing_button.remove();
                        },
                        error: function(){
                            $('#i_status'+order_id).removeClass('loading').addClass('fail');
                        }
                    });
                }
            }
            else if(action == 'complete'){
                var $complete_button = $(this).find('a.complete');
                if($complete_button.length>0){
                    $operate_status_list.append('<li><span class="order-id">#'+order_id+'</span><i class="loading" id="i_status'+order_id+'"></i></li>');
                    var ajax_link = $complete_button.attr('href');
                    jQuery.ajax({
                        url : ajax_link,
                        type: 'GET',
                        dataType: 'text',
                        success: function(){
                            $('#i_status'+order_id).removeClass('loading').addClass('ok');
                            $complete_button.remove();
                        },
                        error: function(){
                            $('#i_status'+order_id).removeClass('loading').addClass('fail');
                        }
                    });
                }
            }
        }
    });
}

$('#operate_win .operate-btn').click(function(){
    var order_id_arr = $('#order_id_list').val().split(',');
    var action = $(this).attr('action');
    order_operate(order_id_arr,action);
});
