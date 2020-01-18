import '../css/popDialog.less';

var Drigging_width="60";
var Drigging_height="60";
var offsetX=0; //声明p在当前窗口的Left值
var offsetY=0; //声明p在当前窗口的Top值
var bool=false; //标识是否移动元素
var is_move_type=1;//移动点击

/* 保存上一次点击的clientX、clientY，用于判断是否为真移动 */
var preClientX=0;

/*初始化浮动框*/
export function initPopDialog(is_show,callback){
    sessionStorage.setItem('repeatBind','ready')
    var message_click = '<input type="hidden" id="message" value="测试">'
    $("body").append(message_click)
    var popdialog=`
        <div id="Drigging" style="display:${is_show?'block':'none'}">
            <div id="messge_notice"></div>
            <input type="hidden" class="layui-close-websoket">
            <div class="drigging-alert">
                <span class="drigging-alert-text">客服模块正在加载中...</span>
                <span class="drigging-alert-arrow"></span>
            </div>
        </div>
    `;
    $("body").append(popdialog);
    mouseinit();

    callback && callback();
}

//显示消息提示
export function showNotice(){
	$("#messge_notice").show();
}

//关闭消息提示
export function hideNotice(){
	$("#messge_notice").hide();
}

// 隐藏浮窗
export function hidePopDialog(isLoginOut=true){
    // 隐藏
    $('.layui-layer-min').trigger('click');
    $('#Drigging').css({
        display:'none',
        right:0,
        bottom:0
    })

    if(isLoginOut){
        $('#message').remove();
        $('#Drigging').remove();
    }
}

//阻止事件冒泡
//不仅仅要stopPropagation，还要preventDefault
function pauseEvent(e){
    if(e.stopPropagation) e.stopPropagation();
    if(e.preventDefault) e.preventDefault();
    e.cancelBubble=true;
    e.returnValue=false;
    return false;
}

/*初始化鼠标拖动事件*/
var click_dobble = false;
function mouseinit(){
    $("#Drigging").mousedown(function(){
        bool=true;
        offsetX = event.offsetX;
        offsetY = event.offsetY;
        preClientX = event.clientX;
    }).mouseup(function(){
        bool=false;
        // 模拟click, 判断是否为假移动
        if(is_move_type == 1 || (is_move_type == 2 && preClientX == event.clientX)){
            if(click_dobble) return false;
            click_dobble = true;
            if(sessionStorage.getItem('repeatBind') === 'ready1'){
                $('.drigging-alert-text').text('客服模块正在加载中...')
                $('.drigging-alert').slideDown();
                setTimeout(function(){
                    $('.drigging-alert').hide();
                    click_dobble = false;
                },2000)
            }else if(sessionStorage.getItem('repeatBind') === 'ready'){
                $("#message").trigger("click");
                $('.drigging-alert').hide();
                click_dobble = false;
            }else if(sessionStorage.getItem('repeatBind') === 'true'){
                $('.drigging-alert-text').text('该账户已在别的页面建立客服连接...');
                $('.drigging-alert').css('background','#FB8486').css('color',"#fff");
                $(".drigging-alert-arrow").css({background:'#FB8486'})
                $('.drigging-alert').slideDown();
                setTimeout(function(){
                    $('.drigging-alert').hide();
                    click_dobble = false;
                },5000)
            }
        }
    });

    $(document).mousemove(function(e){
        e=e || window.event;
        pauseEvent(e);

		if(!bool || event.which == 0){
            bool=false;
			is_move_type=1;
		    return;
		}
	    is_move_type=2;

        var x = event.clientX + $(document).scrollLeft() - offsetX;
        var y = event.clientY + $(document).scrollTop() - offsetY;

        if(x < document.body.scrollWidth - Drigging_width && x > 0){
            $("#Drigging").css("left", x);
        }
        if(y < document.body.scrollHeight - Drigging_height && y > 0){
            $("#Drigging").css("top", y);
        }
	});
}

// /**
//  *
//  * @param title---------------标题
//  * @param product_name--------产品名称
//  * @param desc----------------描述
//  * @param file_path-----------图片或文件路径
//  * @param file_type-----------文件类型 1 图片 2 文件 3 音频 4 视频
//  * @param jumpUrl-------------跳转地址
//  * @param other_data----------其他信息
//  * @returns
//  */
// var snapshot_name="snapshot";
// function setsnapshot(title,product_name,desc,file_path,file_type,jumpUrl,other_data){
//     var snapshot_data=[];
//     var snapshot_tmp={title:title,product_name:product_name,desc:desc,file_path:file_path,file_type:file_type,jumpUrl:jumpUrl,other_data:other_data};
//     var cookie_data=getCookie(snapshot_name);
//     if(cookie_data==null){
//         snapshot_data.push(snapshot_tmp);
//     }else{
//         snapshot_data=JSON.parse(cookie_data);
//         snapshot_data.push(snapshot_tmp);
//     }
//     setCookie(snapshot_name,JSON.stringify( snapshot_data ));
//     console.log(getCookie(snapshot_name));
// }
// function setCookie(name,value){
//     var Days = 1;
//     var exp = new Date();
//     exp.setTime(exp.getTime() + Days*24*60*60*1000);
//     document.cookie =name+"="+ escape (value) + ";expires=" + exp.toGMTString();
// }
// function getCookie(name)
// {
//     var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
//     if(arr=document.cookie.match(reg))
//         return unescape(arr[2]);
//     else
//         return null;
// }