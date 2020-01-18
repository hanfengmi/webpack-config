
var layuiOutSet = (function () {
    
    // 初始化
    layui.use(['layim', 'jquery', 'rate', 'form'], function (layim) {
        // var $ = layui.jquery;
        // var layer = layui.layer;
        // var rate = layui.rate;
        // var form = layui.form;
        // var isAuto;
        // var isXiaoyou;
        // var starInfo = {};
        // var fromid = '' // 未派单时评价时需要的参数
        // var openChatLog = false;

        // var ws = new WebSocket('wss://' + domain + "/wss");


        // 满意度相关类
        var evaluatePush = {
            data:{
                caseId:'',
                evalType:2
            },
            init:function(case_id){// 推送满意度评价消息
                if (!robotInfo) {
                    robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                    robotInfo.name = robotInfo.username
                }
                var user_info = robotInfo;
                var time = new Date().getTime();
                var that = this;
                this.data.caseId = case_id || initData.SESSIONKEY;
                this.data.evalType = case_id?1:2;
                renderTemplate(// 渲染满意度推送
                    initData,
                    {
                        template_code:'85676314cf42acac22fa25dc0d445cm1',
                        template_params:{
                            advisor_name:user_info["username"],
                            advisor_time:time
                        },
                    },
                    function(data){
                        var message = {
                            "avatar": addDomain(user_info["avatar"]),
                            "content": data,
                            "fromid": user_info["id"],
                            "haveFindKnowledge": "",
                            "system": false,
                            "timestamp": time,
                            "username": user_info["username"],
                            "transfer": true
                        };
                        var obj = { // 满意度模板渲染推送
                            username: message.username,
                            avatar: addDomain(message.avatar),
                            id: message.fromid,
                            type: 'friend',
                            content: data,
                            timestamp:message.timestamp,
                            transfer:message.transfer,
                            system:message.system,
                            isCenterEle:true,
                            isMarginTop:true
                        };
                        layim.getMessage(obj);// 满意度推送
                        chatLog.addChatRecord(obj.content,'center')
                        layim.setChatStatus('<span style="color:#FBD7D7;">在线</span>');
                        rateRender.init();
                })
            }
        }
        
        /**
         * 渲染评价消息框
         * @param {starInfo} 获得评价默认级别
         * @returns
         */
        var rateRender = {
            state: {
                attr:null,// 处理后star数组
                attrAll:null, // star原始数组
                evaluateData:{
                    type:0,
                    solve:0,
                    advise:'',
                    tag_ids:''
                }
            },
            init:function(){
                form.render();
                this.getStar();
            },
            getStar:function(){
                var that = this;
                var tempAppIdNum = initData.mainappid.slice(2, 3);
                var tempAppId = initData.mainappid.slice(3);
                var sendData = {
                    "appId": initData.mainappid
                }
                $.ajax({// 星星评价信息
                    url: defineUrl + '/ServerApi/workcircle/index.php?r=Satisfaction/GetSatisfactionConfigApi&ciId=' + tempAppId.slice(0, parseInt(tempAppIdNum)),
                    type: 'post',
                    data: sendData,
                    dataType: 'JSON',
                    success: function (data) {
                        if (data.errorInfo === 'ok') {
                            starInfo = data.data.starInfo
                            that.state.attr = getStarRating(starInfo);
                            that.state.attrAll = starInfo;
                            that.mouseEvent();
                            that.clickEvent();
                            that.message();
                            that.submit();
                        }
                    }
                })
                
            },
            mouseEvent:function(){
                $(document.body).on('mouseover','.new-comment-dialog .layui-icon-dataset',function(){
                    // 之前星星点亮
                    // 当前星星点亮
                    // 之后的星星熄灭
                    $(this).parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                    $(this).addClass('layui-icon-rate-solid')
                    $(this).parent().nextAll().find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                })
                $(document.body).on('mouseout','.new-comment-dialog .layui-icon-dataset',function(){
                    // 所有星星熄灭
                    // 标注的星星和之前的
                    $('.new-comment-dialog .new-layui-rate').find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                    $('.new-comment-dialog .new-layui-rate').find('.layui-icon-dataset[isChecked=true]').addClass('layui-icon-rate-solid')
                    $('.new-comment-dialog .new-layui-rate').find('.layui-icon-dataset[isChecked=true]').parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                })
            },
            clickEvent:function(){
                var that = this;
                $(document.body).on('click','.new-comment-dialog .layui-icon-dataset',function(){
                    that.length = $(this).parent().prevAll().find('.layui-icon-dataset').length + 1;
                    $('.new-comment-dialog .new-layui-rate').find('.layui-icon-dataset').removeAttr('isChecked')
                    $(this).attr('isChecked',true)
                    $('.new-comment-dialog').find('.new-evaluate').html(that.state.attr[that.length])
                    $(this).parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                    $(this).addClass('layui-icon-rate-solid')
                    $(this).parent().nextAll().find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                    commentData.type = that.length
                })
            },
            submit:function(){
                var thatobj = this;
                form.on('radio(ifResolveMessage)', function (data) {
                    console.log('data',data)
                    commentData.solve = data.value
                })
                $(document.body).on('click','.new-comment-wrapper .solve-buttons1',function(){
                    if($(this).hasClass('btn-unuse')) return false;
                    var that = this;
                    var ajaxUrl = $(this).attr('data-before-url')
                    
                    if (!commentData.type) {
                        layer.msg('本次服务未评星', {
                            zIndex: 198910175
                        });
                        return false
                    }
                    commentData = commentData || [];
                    commentData['comment_to_user'] = initData.comment_to_user || fromid;
                    console.log('evaluatePush.data',evaluatePush.data)
                    commentData['caseId'] = evaluatePush.data.caseId;
                    commentData.evalType = evaluatePush.data.evalType// 对客服评价
                    $.ajax({
                        url: defineUrl + '/yychat/im/index.php?r=ImCase/SaveEvaluate', //ajaxUrl,
                        type: 'POST',
                        dataType: 'JSON',
                        data: commentData,
                        success: function (data) {
                            if (data.Success) {
                                // 修改单选选中状态
                                $(that).parent().prev().find('input[name="solve-message"]').attr('checked',false)
                                $(that).parent().prev().find('input[name="solve-message"][value="'+commentData.solve+'"]').attr('checked',true)
                                
                                $(that).addClass('btn-unuse').html($(that).attr('data-after-name'));// 设置为不可点
                                $(document.body).off('mouseover','.new-comment-dialog .layui-icon-dataset')//星星不可选
                                $(document.body).off('mouseout','.new-comment-dialog .layui-icon-dataset');
                                $(document.body).off('click','.new-comment-dialog .layui-icon-dataset')// 星星不可点
                                $(document.body).find('.new-comment-dialog .layui-form-radio').off('click')// 单选不可点
                                layer.msg('谢谢您！我们已收到您宝贵的评价，您的评价是我们前进的动力！', {
                                    time: 3000,
                                    zIndex: 22000000
                                });
                                // 回填 
                                console.log('成功回填',commentData)
                                thatobj.state.evaluateData.type = commentData.type
                                thatobj.state.evaluateData.solve = commentData.solve

                                // 修改之前聊天状态
                                var layimHistory = JSON.parse(window.localStorage.getItem('layim') || '{}')
                                var recordList = layimHistory[initData.memberIdx] ?
                                    layimHistory[initData.memberIdx].chatlog ?
                                    layimHistory[initData.memberIdx].chatlog['friend'+robotInfo.id] : [] : [];
                                recordList = recordList || []
                                var findIndex = -1
                                for (var i = 0; i < recordList.length; i++) {
                                    if (recordList[i].timestamp == $(that).attr('data-time')) {
                                        findIndex = i
                                    }
                                }
                                if (findIndex > -1) {
                                    recordList[findIndex].content = $(that).parent().parent().parent().parent().parent().html()
                                    layimHistory[initData.memberIdx].chatlog['friend'+robotInfo.id] = recordList
                                    window.localStorage.setItem('layim', JSON.stringify(layimHistory))
                                }
                            }
                        }
                    });
                })
            },
            message:function(){// 留言
                var that = this;
                $(document.body).on('click','.new-comment-dialog .solve-buttons0',function(){
                    if($(this).hasClass('btn-unuse')) return false;
                    messageRenderfun(that, this)
                })
            }

        }

        /**
         * 留言评价弹窗
         * @param {starInfoAll} 获得评价默认级别
         * @returns
        */
        function messageRenderfun(rateRender,targetEle){
            var messageRender = {
                state: {
                    attr: rateRender.state.attrAll
                },
                init:function(){
                    this.render();
                },
                render:function(){
                    var that = this;
                    renderTemplate(// 渲染留言评价弹窗
                        initData,
                        {
                            template_code:'85676314cf42acac22fa25dc0d445cm2',
                            template_params:{},
                        },
                        function(data){
                            // console.log('temtemtemtem',data)
                            that.index = layer.open({
                                title: false,
                                type: 0,
                                btn: [],
                                zIndex: 198910170,
                                skin: 'new-comment-dialog-all',
                                content: data,
                                area: '600px',
                                closeBtn:0,
                            });
                            form.render();
                            that.mouseEvent();
                            that.clickEvent(); 
                            that.submit(); 
                            that.renderInit();
                    })
                },
                renderInit:function(){
                    console.log('rateRender.state',rateRender.state)
                    if(rateRender.state.evaluateData.solve){// 评价过了
                        form.val("messageForm", { 
                            "solve": rateRender.state.evaluateData.solve
                        });
                        $('.new-comment-wrapper-all').find('.new-layui-rate li').eq(rateRender.state.evaluateData.type - 1).find('.layui-icon-dataset').trigger('click')
                        $(document.body).off('mouseover','.new-comment-dialog-all .layui-icon-dataset');
                        $(document.body).off('mouseout','.new-comment-dialog-all .layui-icon-dataset');
                        $(document.body).off('click','.new-comment-dialog-all .layui-icon-dataset');
                        $(document.body).find('.new-comment-dialog-all .layui-form-radio').off('click')
                    }
                },
                mouseEvent:function(){
                    $(document.body).on('mouseover','.new-comment-dialog-all .layui-icon-dataset',function(){
                        // 之前星星点亮
                        // 当前星星点亮
                        // 之后的星星熄灭
                        $(this).parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                        $(this).addClass('layui-icon-rate-solid')
                        $(this).parent().nextAll().find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                    })
                    $(document.body).on('mouseout','.new-comment-dialog-all .layui-icon-dataset',function(){
                        // 所有星星熄灭
                        // 标注的星星和之前的
                        $('.new-comment-dialog-all .new-layui-rate').find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                        $('.new-comment-dialog-all .new-layui-rate').find('.layui-icon-dataset[isChecked=true]').addClass('layui-icon-rate-solid')
                        $('.new-comment-dialog-all .new-layui-rate').find('.layui-icon-dataset[isChecked=true]').parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                    })
                },
                clickEvent:function(){
                    var that = this;
                    $(document.body).on('click','.new-comment-dialog-all .layui-icon-dataset',function(){
                        $(this).parent().prevAll().find('.layui-icon-dataset').addClass('layui-icon-rate-solid')
                        $(this).addClass('layui-icon-rate-solid')
                        $(this).parent().nextAll().find('.layui-icon-dataset').removeClass('layui-icon-rate-solid')
                        that.length = $(this).parent().prevAll().find('.layui-icon-dataset').length + 1;
                        $('.new-comment-dialog-all .new-layui-rate').find('.layui-icon-dataset').removeAttr('isChecked')
                        $(this).attr('isChecked',true)
                        $('.new-comment-dialog-all').find('.new-evaluate-all').html(getStarRating(that.state.attr)[that.length])
                        commentData.type = that.length;
                        that.renderTag()
                    })
                },
                renderTag:function(){
                    var that = this;
                    var tagIndex = that.length;
                    var tagNameListStr = '';
                    that.state.attr[tagIndex].tag.forEach(function (item) {
                        var tmpStr = '<li class="solve-li-item" targetid="' + item.tag_id + '">' + item.tag_name + '</li>'
                        tagNameListStr += tmpStr
                    })
                    $('.solve-tag-box').html(tagNameListStr);   
                    $('.new-comment-dialog-all').off('click','.solve-tag-box .solve-li-item').on('click','.solve-tag-box .solve-li-item',function(){
                        if($(this).hasClass('solve-li-item-selected')){
                            $(this).removeClass('solve-li-item-selected')
                        }else {
                            $(this).addClass('solve-li-item-selected')
                        }
                    })
                },
                submit:function(){
                    var that = this;
                    form.on('radio(ifResolve)', function (data) {
                        commentData.solve = data.value
                    })
                    $('.new-comment-dialog-all').off('click','.message-buttons .message-btn0').on('click','.message-buttons .message-btn0',function(){
                        layer.close(that.index);
                    })
                    $('.new-comment-dialog-all').off('click','.message-buttons .message-btn1').on('click','.message-buttons .message-btn1',function(){
                        var tagId = $('.new-comment-dialog-all .solve-tag-box .solve-li-item-selected');
                        var tagArr = []
                        $.each(tagId, function (i, item) {
                            tagArr.push($(this).attr('targetid'))
                        });
                        commentData.tag_ids = tagArr.join(',')
                        if (!commentData.type) {
                            layer.msg('本次服务未评星', {
                                zIndex: 198910175
                            });
                            return false
                        }
                        commentData = commentData || [];
                        commentData['comment_to_user'] = initData.comment_to_user || fromid;
                        console.log('evaluatePush.data',evaluatePush.data)
                        commentData['caseId'] = evaluatePush.data.caseId;
                        commentData.evalType = evaluatePush.data.evalType
                        commentData.advise = $('.new-comment-dialog-all textarea[name="message"]').val();
                        // console.log('commentDatacommentData',commentData)
                        if(rateRender.state.evaluateData.solve){
                            console.log('需要调修改接口')
                            $.ajax({
                                url: defineUrl + '/yychat/im/index.php?r=ImCase/UpdateEvaluate', //ajaxUrl,
                                type: 'POST',
                                dataType: 'JSON',
                                data: commentData,
                                success: function (data) {
                                    if(data.Success){
                                        $('.new-comment-wrapper').find('.solve-buttons0').addClass('btn-unuse')// 消息推送按钮不可点
                                        $('.new-comment-wrapper').find('.solve-buttons1').addClass('btn-unuse')// 消息推送按钮不可点
                                        layer.msg('提交成功', {
                                            time: 3000,
                                            zIndex: 22000000
                                        });
                                        layer.close(that.index);
                                    }
                                    
                                }
                            })
                        }else {
                            $.ajax({
                                url: defineUrl + '/yychat/im/index.php?r=ImCase/SaveEvaluate', //ajaxUrl,
                                type: 'POST',
                                dataType: 'JSON',
                                data: commentData,
                                success: function (data) {
                                    if (data.Success) {
                                         // 修改单选选中状态
                                         form.val("solve-form", { 
                                            "solve": commentData.solve
                                        });
                                        $(targetEle).parent().prev().find('input[name="solve-message"]').attr('checked',false)
                                        $(targetEle).parent().prev().find('input[name="solve-message"][value="'+commentData.solve+'"]').attr('checked',true)
                                        
                                        layer.msg('谢谢您！我们已收到您宝贵的评价，您的评价是我们前进的动力！', {
                                            time: 3000,
                                            zIndex: 22000000
                                        });
                                        layer.close(that.index);
                                        // 回填 修改推送信息数据
                                        $('.new-comment-wrapper').find('.solve-buttons0').addClass('btn-unuse')// 消息推送按钮不可点
                                        $('.new-comment-wrapper').find('.solve-buttons1').addClass('btn-unuse')// 消息推送按钮不可点
                                        $(targetEle).parent().prev().prev().find('.new-layui-rate li').eq(commentData.type - 1).find('.layui-icon-dataset').trigger('click')
                                        setTimeout(function(){
                                            $(document.body).off('mouseover','.new-comment-dialog .layui-icon-dataset');
                                            $(document.body).off('mouseout','.new-comment-dialog .layui-icon-dataset');
                                            $(document.body).off('click','.new-comment-dialog .layui-icon-dataset');
                                            $(document.body).find('.new-comment-dialog .layui-form-radio').off('click')
                                        },200)
                                    }
                                }
                            });
                        }
                         // 修改之前聊天状态
                        // console.log(time)
                        // console.log('jijijijijiiji',$('.new-comment-wrapper .solve-buttons1[data-timestamp="'+time+'"]'))
                        var layimHistory = JSON.parse(window.localStorage.getItem('layim') || '{}')
                        var recordList = layimHistory[initData.memberIdx] ?
                            layimHistory[initData.memberIdx].chatlog ?
                            layimHistory[initData.memberIdx].chatlog['friend'+robotInfo.id] : [] : [];
                        recordList = recordList || []
                        var findIndex = -1
                        for (var i = 0; i < recordList.length; i++) {
                            if (recordList[i].timestamp == $(targetEle).attr('data-time')) {
                                findIndex = i
                            }
                        }
                        if (findIndex > -1) {
                            recordList[findIndex].content = $(targetEle).parent().parent().parent().parent().parent().html()
                            layimHistory[initData.memberIdx].chatlog['friend'+robotInfo.id] = recordList
                            window.localStorage.setItem('layim', JSON.stringify(layimHistory))
                        }
                    })
                }
            }
            messageRender.init()
        }
        /**
         * ws 监听消息
         * @returns
        */
        ws.onmessage = function (e) {
            var message = eval("(" + e.data + ")");
            var cnt = '';
            console.log('消息触发了！！',message);
            var ismin = ($("#layui-layim-chat").is(":visible")) ? 0 : 1;
            if(ismin && message.type != "bind" && message.type != "ping"){
                showNotice();// 消息提示
            }
            message.fromid ? fromid = message.fromid : null
            switch (message.type) {
                case "bind":
                    if(message.onlinestatus){
                        sessionStorage.setItem('repeatBind',true)
                    }else {
                        staffInfo['client_id'] = message.client_id;
                        sessionStorage.setItem('repeatBind',false)
                    }
                    // const num = Math.floor(Math.random()*10)
                    // console.log(num)
                    // if(num > 5){
                    //     sessionStorage.setItem('repeatBind','true')
                    // }else {
                    //     staffInfo['client_id'] = message.client_id;
                    //     sessionStorage.setItem('repeatBind','false')
                    // }
                    break;
                case "text":
                    layim.setChatStatus('<span style="color:#FBD7D7;">对方正在输入...</span>');
                    if (message.entity === true && !message.haveFindKnowledge) {
                        ws.send(recordUserData);
                        layim.setChatStatus('<span style="color:#FBD7D7;">在线</span>');
                        return
                    }
                    setTimeout(function () {
                        if (message.transfer) { // 转接的信息（可点击）
                            if(message.returntype == 2){
                                var aElement = $.parseJSON(message.content);
                                if (message.haveFindKnowledge) {// 没找到答案
                                    cnt = '<div class="chat-find-noAnswer">已收到您的反馈,' + message.username + '正在学习中,您可以换个问法或联系人工!' + '<a href="javascript:void(0)" class="search-no-question">人工客服</a></div>'
                                } else if (message.mark === null || message.mark === undefined) {// 没找到答案
                                    cnt += '<div class="question-topic-box"><p style="margin:5px 0">猜你想问：</p>'
                                    //  ques-resolve-box
                                    for (var i = 0; i < aElement.length; i++) {
                                        cnt += '<a href="javascript:void(0)" class="question-topic" data-question=' + aElement[i].id + '><b></b>' + aElement[i].text + '</a>'
                                    }
                                    cnt += '</div>'
                                } else if(message.mark && message.mark !== false) {// 找到答案了
                                    cnt += '<div class="ques-resolve-box">'
                                    for (var i = 0; i < aElement.length; i++) {
                                        cnt += '<a href="javascript:void(0)" class="color333" data-question=' + aElement[i].id + '>' + aElement[i].text + '</a><br>'
                                    }
                                    cnt += '<div class="question-resolve-btns"><p class="question-resolve" isresolve="0" msgid="' + message.msgid + '"></p><p class="question-resolve" isresolve="1" msgid="' + message.msgid + '"></p></div></div>'
                                }
                            }else if(message.returntype == 1) {
                                cnt = '<div class="chat-find-noAnswer">' + message.content + '<a href="javascript:void(0)" class="search-no-question">人工客服</a></div>'
                            }
                        } else {
                            cnt = message.content
                        }

                        obj = { // 更换信息成功的时候，人工客服推送的信息，要更改
                            username: message.username,
                            avatar: addDomain(message.avatar),
                            id: message.fromid,
                            type: 'friend',
                            content: cnt,
                            timestamp: message.timestamp,
                            transfer: message.transfer,
                            system: message.system
                        };
                        layim.getMessage(obj);// 小友回复
                        layim.setChatStatus('<span style="color:#FBD7D7;">在线</span>');
                        
                        
                    }, 1000);
                    break;

                case "topic": // 接入按钮
                    if (message.transfer) {
                        var html
                        if (ifClickIcon) {
                            html = '<div class="transfer-css">您可以转接人工客服，请选择您要咨询的业务类型：</div>';
                        } else {
                            html = '<div class="transfer-css">请选择您要咨询的业务类型：</div>';
                        }
                        btnCnt = '';
                        var btnElement = $.parseJSON(message.topic);
                        for (var j = 0; j < btnElement.length; j++) {
                            if (btnElement[j].topiccode.indexOf("g_") != -1) {
                                btnCnt += '<div class="transfer-css">' + btnElement[j].topic + '</div>';
                                var children = btnElement[j].children;
                                if (children) {
                                    for (k = 0; k < children.length; k++) {
                                        btnCnt += '<button class="transfer-btn" data-timestamp="' + message.time * 1000 + '" data-topiccode=' + children[k].topic_id + '>' + children[k].topic_name + '</button>'
                                    }
                                }
                            } else {
                                btnCnt += '<button class="transfer-btn" data-timestamp="' + message.time * 1000 + '" data-topiccode=' + btnElement[j].topiccode + '>' + btnElement[j].topic + '</button>'
                            }
                        }
                        cnt = html + btnCnt;
                        obj = {
                            username: message.username,
                            avatar: addDomain(message.avatar),
                            id: message.fromid,
                            type: 'friend',
                            content: cnt,
                            timestamp: message.time * 1000,
                            transfer: message.transfer
                        }
                    }
                    layim.getMessage(obj)// 接入人工主题推送

                    break;
                case "customertext":
                    obj = { //更换信息成功的时候，人工客服推送的信息，要更改
                        username: message.fromusername,
                        avatar: addDomain(message.fromavatar)
                            // ,id: initData.sstatus == 1 ? message.fromid : message.touserid
                            ,
                        id: message.fromid,
                        type: 'friend',
                        content: message.content,
                        timestamp: message.timestamp,
                        transfer: message.transfer,
                        system: message.system
                    }
                    // TEST 有信息时声音提示
                    if(voiceOn){
                        $('#audioPlay')[0].play();
                    }
                    layim.getMessage(obj) //收到客服聊天消息
                    var animClass = 'layer-anim layer-anim-06';
                    $('.layui-layim-min').addClass(animClass).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
                        $(this).removeClass(animClass);
                    });
                    break;
                case "close": // 关闭
                    var chatId = '';
                    $('span[lay-filter="transfer"]')
                        .removeClass('colorc0c7d4')
                        .addClass('color8590a5');

                    updateClientInfo(robotInfo, chatTool,initData.yy_user_id,robotInfo.id)
                    localStorage.removeItem("localcasenum"); //清除appid标记
                    // 更改是否是机器人的状态
                    isAuto = 1
                    obj = { //更换信息成功的时候，人工客服推送的信息，要更改
                        username: robotInfo.groupname,
                        avatar: addDomain(robotInfo.avatar),
                        id: chatId,
                        type: 'friend',
                        content: '您的本次会话已关闭，感谢您的咨询，如有问题，我们随时为您服务哦',
                        timestamp: new Date().getTime(),
                        system: message.system
                    }
                    layim.getMessage(obj)// 关闭会话提醒

                    var tempAppIdNum = initData.mainappid.slice(2, 3)
                    var tempAppId = initData.mainappid.slice(3)
                    // 获取满意度评价配置项
                    var sendData = {
                        //"appId": initData.appid, // 用户唯一标识
                        "appId": initData.mainappid
                    }
                    if (initData.isOpenComment) {
                        evaluatePush.init(); // 显示评价
                    }
                    floatBtnsPart.changeTab('close') // 修改浮动区按钮
                    break;
                case "access": // 接入
                    var accessInfo = message.staff
                    // console.log("accessInfo",accessInfo);
                    accessInfo.name = accessInfo.username;
                    accessInfo.from = accessInfo.touserid;
                    // accessInfo.id = staffInfo.id;//分层不切换机器人id
                    localStorage.setItem('sessionkey', accessInfo.SESSIONKEY)

                    if (!robotInfo) {
                        // robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                        robotInfo = layim.cache().friend[0].list[0] ? layim.cache().friend[0].list[0]: layim.cache().rabot[0].list[0]
                        robotInfo.name = robotInfo.username
                    }
                        
                    updateClientInfo(accessInfo, chatTool, robotInfo.id)
                    obj = { //更换信息成功的时候，人工客服推送的信息，要更改
                        username: accessInfo.username,
                        avatar: addDomain(accessInfo.avatar),
                        id: robotInfo.id,
                        type: 'friend',
                        content: message.content,
                        timestamp: new Date().getTime(),
                        system: message.system
                    }
                    $('span[lay-filter="transfer"]')
                        .removeClass('color8590a5')
                        .addClass('colorc0c7d4')
                    layim.getMessage(obj)// 推送接入提醒
                    floatBtnsPart.changeTab('access')
                    break;
                case "change": // 转接
                    var changeInfo = message.staff
                    if (!robotInfo) {
                        // robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                        robotInfo = layim.cache().friend[0].list[0] ? layim.cache().friend[0].list[0]: layim.cache().rabot[0].list[0]
                        robotInfo.name = robotInfo.username
                    }
                    updateClientInfo(changeInfo, chatTool, robotInfo.id)
                    obj = { //更换信息成功的时候，人工客服推送的信息，要更改
                        username: changeInfo.username,
                        avatar: addDomain(changeInfo.avatar),
                        id: robotInfo.id,
                        type: 'friend',
                        content: message.content,
                        timestamp: new Date().getTime(),
                        system: message.system
                    }
                    // console.log('转接参数',changeInfo,robotInfo.id,obj)
                    layim.getMessage(obj)// 转接推送提醒
                    
                    break;
                case "publish":
                    initData.SESSIONKEY = message.SESSIONKEY ? message.SESSIONKEY.SESSIONKEY : ''
                    break;
                case "online":
                    break;
                case "kf_abnormal_close": // 客服异常掉线
                    alert('非常抱歉顾问001的网络连接已断开，顾问正在和您重新建立连接，请稍等')
                    break;
            }
            ifClickIcon = false
        }

        /**
         * layim 初始化
         * @returns
        */
        layim.on('ready', function (res) {
            // console.log("layim ready 开始绑定", res)    
            var mine = res.mine;
            appid = mine.appid
            var bind = {
                "type": "bind",
                "fromid": mine.id,
                "appid": appid,
                "is_kf":1,
            };
            // 用户与socket进行绑定
            setTimeout(function () {
                ws.send(JSON.stringify(bind));
            }, 100);
            var isFirstTimeClick = true;

            // 初始化聊天框
            function initChat() {
                if (!isFirstTimeClick) return false;
                isFirstTimeClick = false;
                isAuto = parseInt(res.friend[0].list[0].is_auto)
                // console.log('点击加载聊天界面')
                // 自定义聊天窗
                layim.chat({
                    name: res.friend[0].list[0].username,
                    avatar: addDomain(res.friend[0].list[0].avatar),
                    id: res.friend[0].list[0].id,
                    type: "friend",
                    is_auto: isAuto,
                    from: staffInfo.from,
                    appiddes: staffInfo.platiden
                })

                // 嵌入式不用改变大小
                if (ifInset) {
                    hideNotice();
                    setTimeout(function () {
                        if (initData.initHeadColor) {
                            $('.layui-layer-title').css('backgroundColor', initData.initHeadColor)
                            $('.layui-layim-min').css('backgroundColor', initData.initHeadColor)
                        }
                    }, 100)
                }

                // TODO   $('.layim-friend7' + res.friend[0].list[0].id)=-1 ??? $('.layim-chat-friend').eq(-1)是什么鬼
                chatTool = $('.layim-chat-friend').eq($('.layim-friend7' + res.friend[0].list[0].id).index()).find('.layim-chat-tool');
                // Hi~小友很高兴为您服务 ！有什么可以帮助您？
                var systemMessage = {
                    username: res.friend[0].list[0].username,
                    avatar: addDomain(res.friend[0].list[0].avatar),
                    id: res.friend[0].list[0].id,
                    type: 'friend',
                    content: initData.wc_name ? '您好，顾问' + res.friend[0].list[0].username + '为您服务' : '您好，' + res.friend[0].list[0].username + '为您服务',
                    timestamp: new Date().getTime(),
                    transfer: false,
                    system: true
                };
                var theFirstSentence = {
                    username: res.friend[0].list[0].username,
                    avatar: addDomain(res.friend[0].list[0].avatar),
                    id: res.friend[0].list[0].id,
                    type: 'friend',
                    content: '您好~' + res.friend[0].list[0].username + '很高兴为您服务 ！有什么可以帮助您？',
                    timestamp: new Date().getTime(),
                    transfer: false,
                    system: false
                };
                // 有客服接入从后台获取历史记录
                // console.log(initData.sstatus && initData.yy_user_id)
                if (initData.sstatus && initData.yy_user_id) {
                    var historyRecordList = layim.cache().local.chatlog ? layim.cache().local.chatlog['friend' + initData.yy_user_id] : []
                    historyRecordList = historyRecordList || []
                    var len = historyRecordList.length
                    var sendtime
                    len > 0 ? sendtime = Math.floor(historyRecordList[len - 1].timestamp / 1000) : null;
                    var recordData = {
                        sendtime: sendtime,
                        userid: initData.memberIdx,
                        SESSIONKEY: initData.SESSIONKEY,
                        chatkey: initData.appiddes
                    }
                    chatLog.getRecord(recordData, systemMessage)

                    //自定义加载历史记录,接入人工才出现
                    // $('.layim-chat-main').prepend('<a class="layui-layer-record-btn" href="javascript:;">点击查看之前咨询记录</a>')
                    chatLog.getMoreRecord();
                } else {
                    layim.getMessage(systemMessage);// 
                }
                // 默认推送首句话
                if (!initData.sstatus && !initData.yy_user_id) {
                    layim.getMessage(theFirstSentence);// 默认推送
                    chatLog.addChatRecord(theFirstSentence.content,'default');
                }

                // 先将历史记录中的默认评价按钮设置为不可点击
                setHistoryButton();

                // 保存客服信息
                servicerInfo = systemMessage;
                if(isXiaoyou && !initData.sstatus){  // 机器人接入才推送
                    getDefaultPush(systemMessage);
                    // evaluatePush.init('case_id');
                    // getDefaultPushAppointment({Data:{id:288}})
                }
                // 查询是否有服务单和预约单,浮动区按钮
                checkServiceAppointment.init();

                setTimeout(function () {
                    if (initData.sstatus) {
                        $('span[lay-filter="transfer"]').addClass('colorc0c7d4')
                    } else {
                        $('span[lay-filter="transfer"]').addClass('color8590a5')
                    }
                }, 500)

                // 自定义关闭按钮
                $('.layui-layim-chat .layui-layer-close').off('click')
                .on('click', function(){
                    
                    // console.log(isAuto)
                    if(isAuto == 1){// 机器人
                        
                    }else{// 人工+等待
                        // layer.open({
                        //     type: 1, 
                        //     content: '关闭会话将会结束本次服务，同时收不到该 顾问的消息，如您想继续接收该顾问的消息，可最小化窗口' 
                        // });
                        layer.confirm(
                            '关闭会话将会结束本次服务，同时收不到该 顾问的消息，如您想继续接收该顾问的消息，可最小化窗口',
                            {icon: 3, title:['123','background:transparent'],shade:0},
                            function(index){
                                // console.log('关闭')
                            },
                            function(index){
                                // console.log('取消')
                            }
                        )
                        return false;
                    }
                    $('.layui-layer-min').trigger("click");
                });

                // TEST 自定义静音事件
                $('.layui-layim-chat .layui-layer-setwin')
                .prepend('<a class="layui-layer-voice" href="javascript:;"></a>')
                .prepend('<audio id="audioPlay" src="http://fwq.yonyou.com/assets2/chatClient/src/css/modules/layim/voice/default.mp3" hidden="true">')
                .off('click','.layui-layer-voice')
                .on('click','.layui-layer-voice',function(){
                    if(voiceOn){ // 点击静音
                        $(this).addClass('layui-layer-voice-none');
                        voiceOn = false;
                    }else {
                        $(this).removeClass('layui-layer-voice-none')
                        voiceOn = true;
                    }
                })

                
                // 初始化form
                form.render();
                
                
            }
            if (ifInset == '1') {
                // $(document).on('click', '#message', initChat);
                // 防止退出再登录时重复绑定
                $('#message').off('click').on('click', initChat);
                // 在点击时直接弹出
                if(window.IAppKey && !window.IbasewindowOff){
                    // 是其他平台引用
                    initChat();
                }
            } else if (ifInset == '2') {// 默认弹出
                initChat();
                layim.setChatMin()
            } else {
                initChat();
            }
        });

        //监听发送消息
        layim.on('sendMessage', function (data) {
            // 记录说话信息，目的为了传给选择话题的
            // console.log('说话了',isAuto,data)
            recordUserData = JSON.stringify({
                type: 'topic',
                'is_auto': isAuto,
                appid: appid,
                data: data,
                source: staffInfo.source,
                mainappid: mainappid,
                circle_app_id: initData.circle_app_id
            })
            saveContentData = data;
            // 记录最后一次的说话内容
            lastContent = data.mine.content;
            // 记录最后一次说话内容的状态
            lastContentType = 'text';
            // 如果是图片 返回img[./upload/chat/....png]
            lastContent = lastContent.replace(/img\[([^\s]+?)\]/g, function (img) { //转义图片
                if (/\.\/uploads\/chat/.test(img)) {
                    // //fwq.yonyou.com/yychat/im/./uploads/chat/20190611/894186.jpeg
                    return img.replace('//fwq.yonyou.com/yychat/im/', '').replace('//fuwu.yonyou.com/yychat/im/', '');
                }
                return img
            })
            isAuto ? sendCntSockket(data) : ajaxSend('text', lastContent);
        });

        function sendCntSockket(cnt) {
            console.log('走Socket========');
            var type = isXiaoyou ? 'text' : 'topic';

            // console.log({
            //     type: type,
            //     'is_auto': isAuto,
            //     appid: appid,
            //     data: cnt,
            //     source: staffInfo.source,
            //     mainappid: mainappid,
            //     circle_app_id: initData.circle_app_id
            // })
            ws.send(JSON.stringify({
                type: type,
                'is_auto': isAuto,
                appid: appid,
                data: cnt,
                source: staffInfo.source,
                mainappid: mainappid,
                circle_app_id: initData.circle_app_id
            }))
        }
        
        function ajaxSend(type, content) {
            console.log('走Ajax========')
            var _isImage = content.indexOf('img[');
            var _content = _isImage != -1 ? content.substring(4, content.length - 1) : content
            staffInfo.othertype = _isImage != -1 ? 'image' : type
            staffInfo.sendtime = parseInt(new Date().getTime() / 1000);
            staffInfo.content = _content;

            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=msgapi/ClientSendChat',
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify([staffInfo]),
                success: function (data) {
                    // console.log(data)
                }
            });
        }


		 /**
         * 发送预约接口
         * @param appointData 传入的参数
         */
        function saveAppointaction(cusname,phone,question,index){

            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=ImCase/AddAppoint',
                type: 'POST',
                dataType: 'json',
                data:{
                    appId: initData.appid,
                    userId: initData.memberIdx,
                    phone: phone,
                    userType: 3,
                    details: question,
                    linkname: cusname,
                    username: layui.layim.cache().mine.contact
                },
                success: function (data) {
                    if(data.Message=='该用户已存在预约'){
                        layer.msg('您好！您之前已经预约，客服人员在联系您的路上', {
                            zIndex: 198910175
                        });
                        layer.close(index);
                        $('.appoint-transfer-btn2').addClass('question-btn-unuse');
                        // TEST 测试
                        // console.log(13213213,data)
                        getDefaultPushAppointment(data)

                        return false;
                    }
                    if (data.Success === true) {
                        layer.msg(data.Message, {
                            zIndex: 198910175
                        });
                        layer.msg('提交成功，请耐心等待');
                        
                        getDefaultPushAppointment(data)
                        $('.appoint-transfer-btn2').addClass('question-btn-unuse')
                        layer.close(index);
                    }else{
                        layer.msg(data.Message, {
                            zIndex: 198910175
                        });
					}
					
                }
            });
        }

        // 推送提交预约单之后提示信息
        function getDefaultPushAppointment(data){
            if (!robotInfo) {
                robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                robotInfo.name = robotInfo.username
            }
            var obj = { // 更换信息成功的时候，人工客服推送的信息，要更改
                username: robotInfo.username,
                avatar: addDomain(robotInfo.avatar),
                id: robotInfo.id,
                type: 'friend',
                content: '小友已经收到您提交的问题，一个工作日内顾问会电话联系您，请保持电话畅通',
                timestamp: new Date().getTime(),
                transfer:true,
                system:false,
            };
            layim.getMessage(obj);// 提交问题提醒
            chatLog.addChatRecord(obj.content)// 保存聊天记录
            var appointContent = renderTemplate(// 渲染预约单按钮
                initData,
                {
                    template_code:'85676314cf42acac22fa25dc0d445yy3',
                    template_params:{
                        contract_mobile:data.Data.appoint_link,
                        contract_name:data.Data.callback,
                        appoint_id:data.Data.id,
                        contract_desc:data.Data.details,
                    },
                }
            )
            var obj2 = {
                username: robotInfo.username,
                avatar: addDomain(robotInfo.avatar),
                id: robotInfo.id,
                type: 'friend',
                // 预约信息展示
                content: appointContent,
                
                timestamp: new Date().getTime(),
                transfer:true,
                system:false,
                isCenterEle:true, // 居中
                isMarginTop:true // 无margin-top

            };
            layim.getMessage(obj2);//
            chatLog.addChatRecord(appointContent,'center')// 保存聊天记录
        }

        /**
         * 选择话题
         * @param topic 主题
         * @param code 主题编码
         * @param footerEle 工具栏元素
         */
        function turnToTheStaff(topic, code, footerEle, that) {
            lastContent = typeof (lastContent) === 'undefined' ? '你好' : lastContent;
            lastContentType = lastContent.indexOf('img[') > -1 ? 'image': lastContentType;
            lastContent = lastContent.indexOf('img[') > -1? lastContent.substring(4, lastContent.length - 1) : lastContent;
            if (!robotInfo) {
                robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                // robotInfo = layim.cache().rabot[0].list[0]
                robotInfo.name = robotInfo.username
            }
            // 选择话题，后台需要的信息
            var sendData = {
                "openid": initData.memberIdx, // 用户唯一标识
                "platId": initData.appid, // appid
                "nickname": initData.w_userID, // 用户名称
                "servicecode": initData.w_serviceProvide, //服务识别码
                "cusname": initData.w_cusName, //客户名称
                "isSPS": initData.w_expiredflag,
                "topic": topic,
                "topiccode": code,
                "content": lastContent, //内容
                "othertype": lastContentType || 'text', //text,images 最后一句话的类型
                "id": robotInfo.id || 1,
                "servicecode": initData.productSN,
                "source": staffInfo.source,
                "client_id": staffInfo.client_id,
                "contact": layim.cache().mine.contact,
                "contactPhone": layim.cache().mine.contactPhone,
                "mainappid": initData.mainappid, // 入口appid
                "log_id": initData.log_id,
                "scheme_id": initData.scheme_id,
                "localcasenum": initData.localcasenum,
                "circle_app_id": initData.circle_app_id,
                "w_userID": initData.w_userID

            };
            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=Msgapi/ClientFenPai',
                type: 'post',
                data: sendData,
                dataType: 'JSON',
                success: function (msg) {
                    // console.log(msg.data);
                    var staff = msg.data.staff;
                    staff.name = staff.username;
                    staff.appid = sendData.platId;
                    staff.touserid = sendData.openid;
                    staff.appiddes = staffInfo.platiden;
                    staff.type = 'friend'
                    initData.comment_to_user = staff.kf_id
                    initData.SESSIONKEY = staff.SESSIONKEY

                    $(that).parent().children().attr('disabled', true)
                    if (msg.code === 0) {// 成功接入
                        staffInfo.SESSIONKEY = staff.SESSIONKEY;
                        updateClientInfo(staff, footerEle);
                        $('span[lay-filter="transfer"]')
                            .removeClass('color8590a5')
                            .addClass('colorc0c7d4')
                        localStorage.setItem('sessionkey', initData.SESSIONKEY)
                    } else if (msg.code === 1) {
                        isAuto = staff.is_auto;
                        staffInfo.toname = staff.username;
                        staffInfo.topic = staff.topic;
                        staffInfo.to = staff.kf_account;
                        staffInfo.SESSIONKEY = staff.SESSIONKEY;
                        msg.msg = renderTemplate(// 渲染预约单按钮
                            initData,
                            {
                                template_code:'85676314cf42acac22fa25dc0d445yy2',
                                template_params:{
                                    desc:msg.msg,
                                },
                            }
                        )
                        //'<div class="appoint-div">您好，您前面还有4位用户排队中，请稍作等待或在下方提交问题！</div>';
                    }else if (msg.code === 4) {// 
                        isAuto = staff.is_auto;
                        staffInfo.toname = staff.username;
                        staffInfo.topic = staff.topic;
                        staffInfo.to = staff.kf_account;
                        staffInfo.SESSIONKEY = staff.SESSIONKEY;
                        msg.msg = renderTemplate(// 渲染预约单按钮
                            initData,
                            {
                                template_code:'85676314cf42acac22fa25dc0d445yy2',
                                template_params:{
                                    desc:msg.msg,
                                },
                            }
                        )
                        // msg.msg = 
                        // `<div class="appoint-div">
                        //     <p>${msg.msg}</p>
                        //     <button class="appoint-transfer-btn2">提交问题</button>
                        // </div>`
                        // '' + msg.msg + '</div>' + '<button class="appoint-transfer-btn2"' + ' data-username="' + robotInfo.username + '" data-wcname="' + initData.wc_name + '" data-avatar="' + addDomain(robotInfo.avatar) + '" data-id="' + robotInfo.id + '" data-cusname="' + initData.w_cusName + '">提交问题</button>';
                        // "<div class=\"appoint-div\">\r\n    <p style=\"display:block\">张三<\/p>\r\n    <button style=\"display:block\" aftername=\"提交成功\" class=\"appoint-transfer-btn2\">提交问题<\/button>\r\n<\/div>"
                    }else if (msg.code === 5) {
                        //无合适服务之家跳出
                        if (dostapnum < 3) {
                            var layerMsg = layer.msg(msg.msg, {
                                time: 300000,
                                zIndex: 22000000
                            });
                            sendData.wait_maxnums = staff.poutnum;
                            redoFencengStep(sendData, footerEle, that, layerMsg);
                            dostapnum++;
                        } else {
                            layer.msg("执行出现问题，请使用其他方式咨询", {
                                time: 3000,
                                zIndex: 22000000
                            });
                        }
                        return false;
                    }
                    staff.content = msg.msg
                    if (!robotInfo) {
                        robotInfo = layui.layim.cache().friend[0].list.splice(0, 1, staff)[0];
                        robotInfo.name = robotInfo.username
                    }
					
                    var sentence = {
                        username: robotInfo.username,
                        avatar: addDomain(robotInfo.avatar),
                        id: robotInfo.id,
                        type: 'friend',
                        content: msg.msg,
                        timestamp: new Date().getTime(),
                        transfer: true,
                        system: !!staff.system
                    };

                    layim.getMessage(sentence);// 排队提醒

                    // 修改之前聊天记录状态
                    // var layimHistory = JSON.parse(window.localStorage.getItem('layim') || '{}')
                    // var recordList = layimHistory[initData.memberIdx] ?
                    //     layimHistory[initData.memberIdx].chatlog ?
                    //     layimHistory[initData.memberIdx].chatlog[staff.type + staff.id] : [] : [];
                    // recordList = recordList || []
                    // var findIndex = -1
                    // for (var i = 0; i < recordList.length; i++) {
                    //     if (recordList[i].timestamp == $(that).attr('data-timestamp')) {
                    //         findIndex = i
                    //     }
                    // }
                    // if (findIndex > -1) {
                    //     // console.log('$(that).parent().html()',$(that),$(that).parent())
                    //     recordList[findIndex].content = $(that).parent().html()
                    //     // console.log('recordList[findIndex].content',recordList[findIndex].content,$(that).parent().html())
                    //     layimHistory[initData.memberIdx].chatlog[staff.type + staff.id] = recordList
                    //     window.localStorage.setItem('layim', JSON.stringify(layimHistory))
                    // }
                }
            });
        }

        /**
         * 更换接入人员的信息
         * @param staff
         * @param chatTool
         */
        function updateClientInfo(staff, chatTool, robotId, closeId) {
            isAuto = staff.is_auto
            var id = staff.id;
            var username = staff.username
            var avatar = addDomain(staff.avatar);
            var sign = staff.sign;
            staffInfo.toname = username;
            staffInfo.topic = staff.topic;
            staffInfo.to = staff.kf_account;
            staff.type = staff.type || 'friend';
            // staff
            // 给上传图片的初始化加数据
            layui.layim.cache().base.uploadImage.data = staffInfo
            if (ii == 0 && isAuto == 0 && !robotInfo) {
                robotInfo = layui.layim.cache().friend[0].list.splice(0, 1, staff)[0];
                robotInfo.name = robotInfo.username
                // robotInfo
                ii++;
            } else {
                layui.layim.cache().friend[0].list.splice(0, 1, staff)[0];
            }
            if (robotId) id = robotId
            // console.log('robotId',robotId,staff.id,closeId)
            // 更改聊天窗口的信息；
            // layim-friend2095817 layim-chatlist-friend2095817 layim-this
            console.log("111---" + id);
            $('.layui-layim-chat .layim-friend' + id).attr('src', addDomain(avatar))
                .siblings('.layim-chat-username').text(username);
            $('#layui-layim-min').attr('src', addDomain(avatar))
                .siblings('span').text(username);
            // 更改聊天列表的信息
            $('.layim-list-friend .layim-friend' + id + ' .layim-list-heads').attr('src', addDomain(avatar))
                .siblings('.layim-list-username').text(username).siblings('.layim-list-sign').text(sign);
            // 更改标题栏里data-json的信息
            var index = $('.layim-chat-list .' + 'layim-this').index();
            var cont = $('.layui-layer.layui-layer-page.layui-box.layui-layim-chat').find('.layim-chat').eq(index);
            // kf_id ? staff.id = kf_id : null;
            cont.find('.layim-chat-tool').data('json', encodeURIComponent(JSON.stringify(staff)))
            cont.find('.layim-chat-tool').attr('data-json', encodeURIComponent(JSON.stringify(staff)));

            $('.user-avator').addClass('layim-' + staff.type + staff.id)

            if (robotId) {
                $('.layim-this')
                    .removeClass('layim-friend' + robotId)
                    .addClass('layim-friend' + id)
                    .removeClass('layim-chatlist-friend' + robotId)
                    .addClass('layim-chatlist-friend' + id)
            }
            if(closeId){
                $('.layim-this')
                    .removeClass('layim-friend' + robotId)
                    .addClass('layim-friend' + closeId)
                    .removeClass('layim-chatlist-friend' + robotId)
                    .addClass('layim-chatlist-friend' + closeId)
            }

            decodeURIComponent(chatTool.eq(0).attr('data-json'))
            // console.log(decodeURIComponent(chatTool.eq(0).attr('data-json')));
        }


        //再次调用分层
        function redoFencengStep(Data, footerEle, that, layerMsg) {
            if (window.intset !== '1' && !window.app_key) {
                acid = GetQueryString('acid');
                baseInfoNew = GetQueryString('baseInfo');
                ifInset = GetQueryString('ifInset');
            } else {
                // console.log("baseInfo", window.baseInfo)
                acid = window.app_key;
                ifInset = window.intset;
                baseInfoNew = window.baseInfo || ''
            }
            // Data.acid = getQueryVariable("acid");
            // Data.baseInfo = getQueryVariable("baseInfo");
            Data.acid = acid;
            Data.baseInfo = baseInfoNew;
            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=Index/redoFenceng',
                type: 'POST',
                dataType: 'JSON',
                data: Data,
                success: function (res) {
                    initData.memberIdx = res.data.staff.memberIdx;
                    initData.appid = res.data.staff.appid;
                    initData.wc_name = res.data.staff.wc_name;
                    robotInfo.username = res.data.staff.robot_name;
                    robotInfo.avatar = addDomain(res.data.staff.robot_img);
                    staffInfo.platid = res.data.staff.appid;
                    staffInfo.source = res.data.staff.appid + "1";
                    staffInfo.platiden = res.data.staff.chat_key;
                    staffInfo.from = res.data.staff.memberIdx;
                    staffInfo.is_auto = res.data.staff.isauto;
                    isXiaoyou = res.data.staff.isauto;
                    //$('.layui-layim-chat .layim-friend'+staff.id).removeClass('layim-friend'+staff.id).addClass("layim-friend");
                    var bind = {
                        "type": "bind",
                        "fromid": res.data.staff.memberIdx,
                        "appid": res.data.staff.appid,
                        "is_kf":1,
                    };
                    // 重新绑定
                    setTimeout(function () {
                        ws.send(JSON.stringify(bind));
                    }, 100);
                    layer.close(layerMsg);
                    //robotInfo.id = res.data.staff.robot_id;
                    updateClientInfo(robotInfo, footerEle)
                    turnToTheStaff(Data.topic, Data.topiccode, footerEle, that);
                }
            });
        }

        /**
         * 服务单预约单展示模块 start
        */
        var checkServiceAppointment = {
            init:function(){
                this.checkList();// 先查看预约单服务单列表
            },
            checkList:function(){
                var that = this;
                $.ajax({
                    url: defineUrl + '/yychat/im/index.php?r=ImCase/GetUserActiveCaseList',
                    type: 'POST',
                    data:{
                        appId:initData.appid, //'wy11ffc4ba33fb21c36b4813', //
                        userId: initData.memberIdx,//'o8JhH6HTHCFD-KxiK3ikSilHbBn8',//
                        userType:3,// 1,//
                        userPhone:layim.cache().mine.contactPhone,// '15869079711'//
                    },
                    dataType: 'JSON',
                    success: function (data) {
                        if(data.Success){
                            floatBtnsPart.init({
                                robot:initData,// 接入人工，关闭人工
                                serviceList:data.Data.activeServList.concat(data.Data.activeAppointList),//服务单
                            });
                        }
                        // 接口成功并且有预约单服务单
                        if(data.Success && (data.Data.activeAppointList.length || data.Data.activeServList.length)){ 
                            if (!robotInfo) {
                                robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                                robotInfo.name = robotInfo.username
                            }
                            var obj = {
                                username: robotInfo.username,
                                avatar: addDomain(robotInfo.avatar),
                                id: robotInfo.id,
                                type: 'friend',
                                content: '<div class="check-list-box"><p>小友有如下信息提醒您，请选择查看</p><p class="check-list-detail">查看服务单进度</p></div>',
                                timestamp: new Date().getTime(),
                                transfer:true,
                                system:false,
                            };
                            setTimeout(function(){
                                layim.getMessage(obj);// 服务单
                                chatLog.addChatRecord(obj.content)
                            },300)
                            that.checkListDetail(data.Data.activeServList.concat(data.Data.activeAppointList));
                        }
                    }
                })
            },
            checkListDetail:function(list){
                var that = this;
                $('.layui-layim-chat').on('click','.check-list-detail',function(){
                    floatBtnsPart.changeTab('showServeOther')// 修改浮动区状态

                    if (!robotInfo) {
                        robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                        robotInfo.name = robotInfo.username
                    }
                    var obj = {
                        username: robotInfo.username,
                        avatar: addDomain(robotInfo.avatar),
                        id: robotInfo.id,
                        type: 'friend',
                        content: '查到正在处理的服务单，请选择查看',
                        timestamp: new Date().getTime(),
                        transfer:true,
                        system:false,
                    }
                    layim.getMessage(obj);
                    chatLog.addChatRecord(obj.content)
                    list.map(function(e,i){
                        var obj2 = {
                            username: robotInfo.username,
                            avatar: addDomain(robotInfo.avatar),
                            id: robotInfo.id,
                            type: 'friend',
                            content: `
                            <div class="servise-item-box" data-type="${e.id?'yuyue':'fuwu'}" data-id="${e.id?e.id:e.case_id}">
                                <p class="servise-item-title">单号${e.case_num}${e.state}</p>
                                <p class="servise-item-des">
                                    <span>问题描述:</span>
                                    <span>${e.details}</span>
                                </p>
                                <p class="servise-item-time">
                                    ${layui.data.date(Number(e.appointtime*1000))}
                                </p>
                            </div>
                            `,
                            timestamp: new Date().getTime(),
                            transfer:true,
                            system:false,
                            isCenterEle:true,
                            isMarginTop:true,
                        };
                        layim.getMessage(obj2);
                        chatLog.addChatRecord(obj2.content,'center')
                    })
                    that.checkDetailProgress();
                })
            },
            checkDetailProgress:function(){// 点击查看详情
                var _that = this;
                $('.layui-layim-chat').off('click','.servise-item-box').on('click','.servise-item-box',function(){
                    if($(this).hasClass('btn-unuse')) return false;
                    var that = this
                    $.ajax({
                        url: defineUrl + '/yychat/im/index.php?r=ImCase/GetServAllInfo',
                        type: 'POST',
                        data:{
                            // appId: initData.appid,
                            // caseId: $(this).attr('data-id'),
                            // caseType: $(this).attr('data-type')==='yuyue'?1:2
                            "appId": "wy11ffc4ba33fb21c36b4813",
                            "caseId": 143282,
                            "caseType": 2
                        },
                        dataType: 'JSON',
                        success: function (data) {
                            // console.log('单详情',data)
                            if(data.Success){ 
                                $(that).addClass('btn-unuse')
                                if (!robotInfo) {
                                    robotInfo = layim.cache().rabot[0] ? layim.cache().rabot[0].list[0] : layim.cache().friend[0].list[0]
                                    robotInfo.name = robotInfo.username
                                }
                                var progressList =''
                                if( data.Data.caseProgress.length ){
                                    progressList = '<div class="appoint-detail-box"><ol class="appoint-detail-list">'
                                    data.Data.caseProgress.map(function(e){
                                        if(e.operate == 1){
                                            progressList +='<li><p>服务单号为'+e.case_num+'问题被确认，在为您安排解决方案</p><span>'+layui.data.date(Number(e.add_time*1000))+'</span></li>'
                                        }else {
                                            var detialListele = ''
                                            e.detailsList.map(function(ele){
                                                detialListele += e.operuser_name+'工程师将'+ele.attr_name+'改为'+ele.after_value
                                            })
                                            progressList +='<li><p>'+detialListele+'</p><span>'+layui.data.date(Number(e.add_time*1000))+'</span></li>'
                                        }
                                    })
                                    progressList +='</ol></div>'
                                }
                                var caseEvaluate ='';
                                var beginEvaluate ='';
                                if( data.Data.caseEvaluate.solve ){// 已评价
                                    var tagEle = data.Data.caseEvaluate.tag_list.map(function(e){
                                        return e.tag_name
                                    })
                                    caseEvaluate = '<div class="evaluate-detail-box">';
                                    caseEvaluate += '<p>评分：'+data.Data.caseEvaluate.type+'星</p>';
                                    caseEvaluate += '<p>'+(data.Data.caseEvaluate.solve == 1?'已解决':'未解决')+'：'+tagEle.join(',')+'</p>';
                                    caseEvaluate += '<p>建议：'+data.Data.caseEvaluate.custom_sati || '无'+'</p>';
                                    caseEvaluate +='</div>';
                                }else {// 待评价
                                    beginEvaluate = '<div class="begin-evaluate-detail-box">';
                                    beginEvaluate += '<p>如无问题请您点击“已解决”并对本此服务进行评价；如还有疑问，请您选择“未解决”我们会尽快回复</p>';
                                    beginEvaluate += '<p class="serve-evaluate-button-list"><span class="serve-evaluate-button0" data-id="'+data.Data.caseInfo.case_id+'">未解决</span><span class="serve-evaluate-button1" data-id="'+data.Data.caseInfo.case_id+'">已解决</span></p>';
                                    beginEvaluate +='</div>';
                                }
                                var obj = {
                                    username: robotInfo.username,
                                    avatar: addDomain(robotInfo.avatar),
                                    id: robotInfo.id,
                                    type: 'friend',
                                    content: '已为您查到处理进度详情',
                                    timestamp: new Date().getTime(),
                                    transfer:true,
                                    system:false,
                                };
                                var obj2 = {
                                    username: robotInfo.username,
                                    avatar: addDomain(robotInfo.avatar),
                                    id: robotInfo.id,
                                    type: 'friend',
                                    content: `
                                    <div class="servise-item-detial-box">
                                        <p style="font-size:14px;font-weight:600">您的服务请求${data.Data.caseInfo.status_name || data.Data.caseInfo.state}</p>
                                        ${progressList}
                                        <p style="font-weight:600">问题描述</p>
                                        <p>${data.Data.caseInfo.case_desc || data.Data.caseInfo.details}</p>
                                        <p style="font-weight:600">评价结果</p>
                                        ${caseEvaluate || beginEvaluate}
                                    </div>
                                    `,
                                    timestamp: new Date().getTime(),
                                    transfer:true,
                                    system:false,
                                    isCenterEle:true,
                                    isMarginTop:true
                                };
                                layim.getMessage(obj);
                                chatLog.addChatRecord(obj.content)
                                setTimeout(function(){
                                    layim.getMessage(obj2);
                                    chatLog.addChatRecord(obj2.content,'center');
                                    _that.serveEvaluate()
                                },300)

                            }
                        }
                    })
                })
            },
            serveEvaluate:function(){
                // 点击推出评价 已解决未解决有啥不同？？？
                $('.layim-chat-text-center-ele').on('click','.serve-evaluate-button0',function(){
                    if($(this).hasClass('btn-unuse')) return false;
                    $(this).parent().find('span').addClass('btn-unuse');
                    evaluatePush.init($(this).attr('data-id'));

                })
                $('.layim-chat-text-center-ele').on('click','.serve-evaluate-button1',function(){
                    if($(this).hasClass('btn-unuse')) return false;
                    $(this).parent().find('span').addClass('btn-unuse');
                    evaluatePush.init($(this).attr('data-id'));
                })
            }
        }
         /**
         * 服务单预约单展示模块 end
        */

        /**
         * 浮动区按钮展示
         * */ 
        var floatBtnsPart = {
            transfer:'<div class="float-btn-item float-transfer-btn" style="display:none">召唤人工</div>',// 接入人工
            serviceBtn:'<div class="float-btn-item check-list-detail" style="display:none">查看服务单进度</div>',// 处理进度
            closeWS:'<div class="float-btn-item float-transfer-close-btn" style="display:none">结束人工</div',
            otherServise:'<div class="float-btn-item check-other-list-detail" style="display:none">查看其他服务单</div>',
            init:function(data){
                $('.float-btns').html('');
                $('.float-btns').append(this.transfer).append(this.serviceBtn).append(this.closeWS).append(this.otherServise)
                if(data.robot){
                    if(data.robot.isXiaoyou && !data.robot.sstatus){//机器人接入
                        $('.float-btns .float-transfer-btn').show()
                    }
                    if (data.robot.sstatus && data.robot.yy_user_id === '') {//在排队
                        // $('.float-btns').append(this.transfer)
                    }
                    if (data.robot.sstatus && data.robot.yy_user_id) {//人工接入
                        $('.float-btns .float-transfer-close-btn').show()
                    }
                }
                if(data.serviceList.length>0){//有服务单
                    $('.float-btns .check-list-detail').show();
                }
                // if(data.otherService){//其他服务单
                //     $('.float-btns .check-other-list-detail').show();
                // }
            },
            changeTab:function(type){
                if(type === 'access'){ // 接入人工了
                    $('.float-btns .float-transfer-btn').hide();
                    $('.float-btns .float-transfer-close-btn').show();
                }else if(type === 'showServe'){ //有服务单了
                    $('.float-btns .check-list-detail').show();
                    $('.float-btns .check-other-list-detail').hide();
                }else if(type === 'showServeOther'){ // 查看其他服务单
                    $('.float-btns .check-list-detail').hide();
                    $('.float-btns .check-other-list-detail').show();
                }else if(type === 'close'){ // 关闭客服
                    $('.float-btns .float-transfer-btn').show();
                    $('.float-btns .float-transfer-close-btn').hide();
                }
            }
        }


    });

// 功能函数==========================================================================
    /**
     * 获取star列表 简化数据，只取等级，剔除标签
     * @param starInfo 原始数据
     */
    function getStarRating(starInfo) {
        starInfo = starInfo || {}
        var info = {}
        Object.keys(starInfo).forEach(function (star) {
            info[star] = starInfo[star]['star_rating']
        })
        return info
    }

    /**
     * 获取模板接口
     * @param {initData,params,callback} 身份信息，请求参数，回调函数
     * @returns
     * */ 
    function renderTemplate(initData,params,callback) {
        var ciId = getCiId(initData).ciId;
        var templateResult = '';
        $.ajax({
            url: defineUrl + '/ServerApi/workcircle/index.php?r=service_im/Template/getMsgTemplate&ciId='+ciId,
            type: 'POST',
            async : false,
            data:{
                template_code: params.template_code,
                template_params: JSON.stringify(params.template_params),
                template_wc_id: getCiId(initData).wcId
            },
            dataType: 'JSON',
            success: function (data) {
                if(data.Success){ 
                    callback && callback(data.Data)
                    templateResult = data.Data
                }
            }
        })
        return templateResult;
    }

    // 获取ci_id 和 wc_id
    function getCiId(initData){
        var tempAppIdNum = initData.mainappid.slice(2, 3);
        var tempAppId = initData.mainappid.slice(3);
        var tempWcidNum=initData.mainappid.slice(-1);
        var tempWcid=initData.mainappid.substr(-4,parseInt(tempWcidNum));
        return {
            ciId : tempAppId.slice(0, parseInt(tempAppIdNum)),
            wcId : tempWcid
        }
    }
    return {
        'layuiCloseWebsoket': function () {

            // 关闭 websoket
            $(".layui-close-websoket").trigger("click");
            $(".layui-layer").remove();
            $(".layui-layer-move").remove();
            layui.layer.close();
           
            // 解除layim 绑定在body 上的函数
            layui.layim.closeCellEvent();
            layui.layer = null;
            layui.layim = null;
            layui = null;

            // 解除chatClient绑定在document 上的函数
            $(document).off('click', '.transfer-btn');
            $(document).off('click', '.search-no-question');
            $(document).off('click', '.appoint-transfer-btn2');
            $(document).off('click', '.question-hasuseful');
            $(document).off('click', '.question-resolve');
            $(document).off('click', '.question-topic');
            $(document).off('click', '.question-default');
            $(document).off('click', '.ques-def-resolve');
            $(document).off('click', '.layui-close-websoket');
        }
    }
})();