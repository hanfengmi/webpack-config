/*
 * @Author: Yonyou
 * @Date: 2020-01-15 15:17:42
 * @LastEditTime : 2020-01-18 14:42:26
 * @LastEditors  : hanfengmi
 * @Description: 主逻辑
 */
import qs from 'qs';
import {
    checkWebSocket,
    getCookie,
    addDomain
} from './util';

layui.config({
    dir: './lib/layui/'
})

const ClassChat = {
    setData() {
        this.domain = 'branch.yonyou.com'
        // this.domain = 'fuwu.yonyou.com';
        // this.domain = 'fwq.yonyou.com';
        this.defineUrl = 'http://' + this.domain

        this.urlObj = qs.parse(window.location.search.split('?')[1])
        this.acid = window.app_key ? window.app_key : this.urlObj.acid
        this.baseInfoNew = window.baseInfo ? window.baseInfo : this.urlObj.baseInfo
        this.ifInset = window.intset ? window.intset : this.urlObj.ifInset
        this.defaultType = window.IAppKey ? 1 : 0

        this.initData // 用户认证信息
        this.commentData = {}
        this.staffInfo = {} // 人员信息
        this.isXiaoyou
        this.isAuto

        this.skey

        this.lastContent // 保存最后一句话的内容
        this.lastContentType // 最后一句话类型
        this.robotInfo // 机器人信息
        this.recordUserData
        this.ii = 0
        this.chatTool
        this.saveContentData
        this.ifClosePage
        this.ifClickIcon
        this.mainappid
        this.defaultPush // 存默认推送数据
        this.servicerInfo // 存服务人员（小友或客服）信息
        this.dostapnum = 0
        this.voiceOn = true // 默认打开声音
        this.chatReady = false // bind 是否执行了
        this.new_width = 720 //你要固定的浏览器宽度
        this.new_height = 700 //你要固定的浏览器高度
    },

    init() {
        this.setData();// 设置属性
        checkWebSocket();// 检查是否支持websocket
        this.wsInit();// 初始化websocket
        this.layuiInit();// 初始化layui
    },

    layuiInit() {
        var that = this;
        layui.use(['layim', 'jquery', 'rate', 'form'], function (layim) {
            var $ = layui.jquery;
            var layer = layui.layer;
            var rate = layui.rate;
            that.form = layui.form;
            that.layim = layim;

            if (!that.ifInset) {
                layer.msg('正在为您分配顾问，请您耐心等待', {
                    time: 3000,
                });
            }
            that.guestIdentity();
            
        })
    },

    wsInit() {
        var that = this;
        this.ws = new WebSocket('wss://' + this.domain + "/wss");

        this.ws.onopen = function () { // 客户端给服务器发送心跳
            console.log('绑定开始');
            setInterval(show, 1000)

            function show() {
                console.log(1)
                that.ws.send(JSON.stringify({
                    "type": "ping"
                }))
            }
        }

        this.ws.onclose = function () {// ws关闭
            console.log(that.ws.readyState)
        }

        this.ws.onmessage = function (e) {// ws收到信息
            var message = eval("(" + e.data + ")");
            var cnt = '';
            console.log('消息触发了！！', message);
            var ismin = !$("#layui-layim-chat").is(":visible");// 是否是最小化
            if(ismin && message.type != "bind" && message.type != "ping"){
                $("#messge_notice").show(); // 消息提示
            }
            that.fromid = message.fromid;
            switch (message.type) {
                case "bind":// 绑定
                    if(message.onlinestatus){
                        sessionStorage.setItem('repeatBind',true);
                    }else {
                        that.staffInfo['client_id'] = message.client_id;
                        sessionStorage.setItem('repeatBind',false)
                    }
                    break;
                case "text":// 机器人自动回复
                    break;
                case "topic":// 接入人工主题
                    break;
                case "customertext":// 人工回复
                    break;
                case "close":// 人工回复
                    break;
                case "access":// 接入人工
                    break;
                case "change":// 人工转接
                    break;
                case "publish":// ???
                    // that.initData.SESSIONKEY = that.message.SESSIONKEY ? that.message.SESSIONKEY.SESSIONKEY : ''
                    break;
                case "kf_abnormal_close": // 客服异常掉线
                    alert('非常抱歉顾问001的网络连接已断开，顾问正在和您重新建立连接，请稍等')
                    break;
            }
        }

        // 联网判断
        var EventUtil = {
            addHandler: function (element, type, handler) {
                if(element.addEventListener) {
                    element.addEventListener(type, handler, false);
                }else if (element.attachEvent) {
                    element.attachEvent("on" + type, handler);
                }else {
                    element["on" + type] = handler;
                }
            } }; 
        EventUtil.addHandler(window, "online", function () {
            if (!that.robotInfo) {
                that.robotInfo = that.layim.cache().rabot[0] ? that.layim.cache().rabot[0].list[0]: that.layim.cache().friend[0].list[0] 
            }
            var sentence = {
                username: that.robotInfo.username,
                avatar: addDomain(that.robotInfo.avatar),
                id: that.robotInfo.id,
                type: 'friend',
                content: '您的网络已重新连接，已为您恢复与客服的会话',
                timestamp: new Date().getTime(),
                transfer: true,
                system: true
            };
            that.layim.getMessage(sentence);
        }); 
        EventUtil.addHandler(window, "offline", function () {
            if (!that.robotInfo) {
                that.robotInfo = that.layim.cache().rabot[0] ? that.layim.cache().rabot[0].list[0]: that.layim.cache().friend[0].list[0] 
            }
            var sentence = {
                username: that.robotInfo.username,
                avatar: addDomain(that.robotInfo.avatar),
                id: that.robotInfo.id,
                type: 'friend',
                content: '您的网络连接已断开，请检查网络连接',
                timestamp: new Date().getTime(),
                transfer: true,
                system: true
            };
            that.layim.getMessage(sentence);
        });
    },

    guestIdentity() { // 用户信息认证
        var that = this;
        $.ajax({
            url: that.defineUrl + '/yychat/im/index.php?r=index/GuestIdentity',
            data: {
                acid: that.acid,
                baseInfo: JSON.stringify(that.baseInfoNew),
                type: that.defaultType,
                skey: getCookie('PHPSESSID') || window.localStorage.getItem('fyqPHPSESSID'),
                localcasenum: window.localStorage.getItem('localcasenum')
            },
            type: 'GET',
            dataType: 'JSON',
            success: function (data) {
                if(data.Success) {
                    var initData = data.Data;
                    that.initData = initData;
                    window.userTalkClient = {
                        userid: initData.memberIdx,
                        appiddes: initData.appiddes
                    }
    
                    that.commentData = {
                        appId: initData.appid,
                        userId: initData.memberIdx, //评价人id
                        caseId: '', // 对服务单评价时传递服务单case_id, 对客服评价时传递sessionkey
                        evalType: 2, // 1：对服务单的评价 2：对客服的评价
                        type: '', // 几颗星
                        solve: 1, // 是否解决 默认已解决
                        advise: '', // 用户评价+
                        tag_ids: '', // 标签id
                    }
    
                    that.staffInfo = {
                        platid: initData.appid,
                        source: initData.source,
                        platiden: initData.appiddes,
                        MessageID: '',
                        stage: 1,
                        fromname: initData.memberName,
                        from: initData.memberIdx,
                        to: initData.kf_account ? initData.kf_account : null,
                        SESSIONKEY: initData.SESSIONKEY ? initData.SESSIONKEY : null
                    }
    
                    that.isXiaoyou = initData.isXiaoyou;
                    that.skey = initData.skey;
                    that.mainappid = initData.mainappid;
                    that.wc_name = initData.wc_name;
    
                    localStorage.setItem("localcasenum", initData.localcasenum); //创建casenum标记
                    localStorage.setItem("fyqPHPSESSID", initData.sessionid);// 后台不是php时没有PHPSESSID时的代替值
    
                    // 是否接入客服判断
                    if (initData.sstatus) {
                        if (initData.yy_user_id === '') {
                            layer.msg('您已经进入队列中，请稍后', {
                                time: 5000,
                                zIndex: 19900000
                            });
                        } else {
                            if (initData.yy_status != '1') {
                                layer.msg('您好！当前客服繁忙，可能不能及时回复您的问题！', {
                                    time: 5000,
                                    zIndex: 19900000
                                });
                            } else {
                                layer.msg('您好！当前客服在线，欢迎随时咨询问题', {
                                    time: 5000,
                                    zIndex: 19900000
                                });
                            }
                        }
                    }
    
                    that.layimInit();
                } else if (data.Success === 'error') { //'数据加载格式异常'
                    layer.open({
                        type: 0,
                        content: data.Message,
                        closeBtn: 0,
                        yes: function (index, layero) {
                            layer.close(index);
                        }
                    });
                } else if (data.Success === 'dataerror') { //'发生未知错误'
                    // 效果 : 数据异常请刷新重试，或者联系管理员
                    layer.open({
                        type: 0,
                        content: data.Message,
                        closeBtn: 0,
                        yes: function (index, layero) {
                            layer.close(index);
                        }
                    });
                }
            },
            error: function () {
                console.log("发生了一个错误")
            }
        })
    },

    layimInit(){// layim初始化
        var that = this;
        this.layim.config({
            init: {
                url: that.defineUrl + '/yychat/im/index.php?r=index/GetUserInfo',
                data: {
                    memberIdx: that.initData.memberIdx,
                    appiddes: that.initData.appiddes,
                    yuserid: that.initData.yy_user_id,
                    circle_app_id: that.initData.circle_app_id,
                }
            },
            minRight: 20,
            isgroup: true, //关闭组列表
            uploadImage: {//上传图片接口
                url: that.defineUrl + '/yychat/im/index.php?r=Msgapi/UploadImg', //（返回的数据格式见下文）
                type: 'post', //默认post
                data: {},
                ajaxSendImg: function (type, content) {
                    this.data.othertype = type
                    this.data.sendtime = parseInt(new Date().getTime() / 1000);
                    this.data.content = content;
                    sendData = this.data
                    $.ajax({
                        url: that.defineUrl + '/yychat/im/index.php?r=Msgapi/ClientSendChat',
                        type: 'POST',
                        dataType: 'JSON',
                        data: JSON.stringify([sendData]),
                        success: function (data) {
                            console.log(data)
                        }
                    });
                }
            },
            title: '客服端', // 自定义主面板最小化时的标题
            right: '0px', // 主面板相对浏览器右侧距离
            isfriend: false, // 是否开启好友
            isNoLayerOpen: that.initData.isFatherFlag == 1, // 是否关闭layer
            notice: false, // 是否开启桌面消息提醒，默认false
            voice: 'default.mp3', // 声音提醒，默认开启，声音文件为：default.mp3
            copyright: true,
            showCloseBtn: true, // 主弹框是否显示 closeBtn
            isReset:true,
            initSkin: that.initData.initSkin,
            initHeadColor: that.initData.initHeadColor,
            chatLog: layui.cache.dir + 'css/modules/layim/html/chatlog.html', //聊天记录页面地址，若不开启，剔除该项即可
            width: $(window).width(),
            area: $(window).width()
        })

        this.layim.on('ready', function (res) {
            var bind = {
                "type": "bind",
                "fromid": res.mine.id,
                "appid": res.mine.appid,
                "is_kf":1,
            };
            // bind绑定客户
            setTimeout(function () {
                that.ws.send(JSON.stringify(bind));
            }, 100);

            that.isFirstTimeClick = true;
            if (that.ifInset == '1') {
                $('#message').off('click').on('click', that.chatInit.bind(that,res));
                if(window.IAppKey && !window.IbasewindowOff){
                    // 是其他平台引用
                    that.chatInit(res);
                }
            } else {
                that.chatInit(res);
            }
        })

        this.layim.on('sendMessage', function (data) {
            console.log(data)
        })
    },

    chatInit(res){// 初始化自定义聊天窗
        var that = this;
        if (!this.isFirstTimeClick) return false;
        this.isFirstTimeClick = false;
        this.isAuto = parseInt(res.friend[0].list[0].is_auto)
        // 自定义聊天窗
        this.layim.chat({
            name: res.friend[0].list[0].username,
            avatar: addDomain(res.friend[0].list[0].avatar, this.defineUrl),
            id: res.friend[0].list[0].id,
            type: "friend",
            is_auto: this.isAuto,
            from: this.staffInfo.from,
            appiddes: this.staffInfo.platiden
        })

        var systemMessage = {
            username: res.friend[0].list[0].username,
            avatar: addDomain(res.friend[0].list[0].avatar),
            id: res.friend[0].list[0].id,
            type: 'friend',
            content: `${this.initData.wc_name?'顾问':''}${res.friend[0].list[0].username}为您服务`,
            timestamp: new Date().getTime(),
            transfer: false,
            system: true
        };
        var theFirstSentence = {
            username: res.friend[0].list[0].username,
            avatar: addDomain(res.friend[0].list[0].avatar),
            id: res.friend[0].list[0].id,
            type: 'friend',
            content: `您好~${res.friend[0].list[0].username}很高兴为您服务 ！有什么可以帮助您？`,
            timestamp: new Date().getTime(),
            transfer: false,
            system: false
        };

        that.layim.getMessage(systemMessage);// 首句系统通知
        that.servicerInfo = systemMessage;
        if (this.initData.sstatus && this.initData.yy_user_id) {// 有人工接入
            // //自定义加载历史记录,接入人工才出现
            $('.layim-chat-main').prepend('<a class="layui-layer-record-btn" href="javascript:;">点击查看之前咨询记录</a>')
            // 
            // chatLog.getMoreRecord();
            
        } else if (!this.initData.sstatus && !this.initData.yy_user_id) {// 无人工接入
            that.layim.getMessage(theFirstSentence);// 默认推送
            that.defaultPush(systemMessage)
            // chatlog.addChatRecord(theFirstSentence.content,'default');
            // chatlog.addChatRecord()
        }

        that.setHistoryButton();
        that.clickEvent();
    },
    defaultPush(user_info){// 默认推送信息
        var that = this;
        $.ajax({
            url: that.defineUrl + '/ServerApi/workcircle/index.php?r=service_im/knowpush/DefaultPush',
            data: {
                appid: that.initData.mainappid,
                circle_app_id: that.initData.circle_app_id
            },
            type: 'POST',
            dataType: 'JSON',
            success: function (data) {
                // 存在默认推送数据才进行推送
                if(data.Success){
                    that.defaultPush = data.Data;
                    var pushData = [];
                    for(var i=0; i<data.Data.length; i++){
                        pushData.push({
                            "id": data.Data[i].kb_id,
                            "text": data.Data[i].kb_caption,
                            "type": 3
                        });
                    }

                    var message = {
                        "avatar": addDomain(user_info["avatar"]),
                        "content": JSON.stringify(pushData),
                        "fromid": user_info["id"],
                        "haveFindKnowledge": "",
                        "system": false,
                        "timestamp": new Date().getTime(),
                        "username": user_info["username"],
                        "transfer": true
                    };

                    var aCnt = '';
                    var aElement
                    var saveText = "";  // 存数据库
                    var saveIds = "";

                    aElement = $.parseJSON(message.content);
                    for (var i = 0;i < aElement.length; i++) {
                        aCnt+= '<a href="javascript:void(0)" class="question-default" data-question='+ aElement[i].id + '><b></b>' + aElement[i].text + '</a>'
                        if(i > 0){
                            saveText += "\n";
                            saveIds += ",";
                        }
                        saveText += (i + 1) + "." + aElement[i].text;
                        saveIds += aElement[i].id;
                    }

                    // that.chatlog.addChatRecord(addData); 保存默认推送
                    $.ajax({
                        url: that.defineUrl + '/yychat/im/index.php?r=Defaultpush/AddChat',
                        type: "POST",
                        dataType: "json",
                        data: {
                            "appid": that.initData.mainappid,
                            "from": 'xiaoyou',          // 小友
                            "to": that.initData.memberIdx,   // 聊天用户id
                            "content": saveText,
                            "ids": saveIds,
                            "source": "chat_default_kb",                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                            "push_type": 2
                        },
                        async: false,   // 同步，先获取记录id才能使用
                        success: function (data) {
                            // if(data.Success){
                            //     def_msgid = data.Data;
                            // }
                        }
                    });
                    
                    var obj = { // 更换信息成功的时候，人工客服推送的信息，要更改
                        username: message.username
                        ,avatar: addDomain(message.avatar)
                        ,id: message.fromid
                        ,type: 'friend'
                        ,content: `
                            <div class="transfer-css">猜你想问：</div>
                                ${aCnt}
                            </div>`
                        ,timestamp:message.timestamp
                        ,transfer:message.transfer
                        ,system:message.system
                        ,isGuessAsk:true // 是猜你想问模块
                    };
                    that.layim.getMessage(obj); // 默认推送的5条消息
                    that.layim.setChatStatus('<span style="color:#FBD7D7;">Hi，我是'+message.username+'，24小时为您解答问题</span>');
                }
            },
            error: function () {
                console.log("查询默认推送发生错误");
            }
        });
    },
    chatlog:{// 操作聊天记录类
        addChatRecord:function(content,type){
            var that = ClassChat;
            var addData = {
                fromavator:layui.layim.cache().friend[0].list[0].avatar,
                fromuserid:layui.layim.cache().friend[0].list[0].id,
                fromname:layui.layim.cache().friend[0].list[0].username,
                toavator:layui.layim.cache().mine.avatar,
                touserid:layui.layim.cache().mine.id,
                toname:layui.layim.cache().mine.contact,
                content:content,
                type:'friend',
                skey:that.initData.skey,
                appiddes:that.initData.appiddes,
                SESSIONKEY:that.initData.SESSIONKEY,
                circle_app_id:that.initData.circle_app_id,
                circle_app_name:that.initData.circle_app_name,
                othertype:'text',
                auto:that.isAuto,
                msgtype:type || 'default',// default默认 noUserSpace猜你想问（无头像，与上条消息无间距） center居中显示（类似系统消息）
            };
            var def_msgid = 0;
            // console.log(JSON.stringify([addData]))
            $.ajax({
                url: that.defineUrl + '/yychat/im/index.php?r=msgapi/ClientSendChat',
                type: "POST",
                dataType: "json",
                data: JSON.stringify([addData]),
                async: false,   // 同步，先获取记录id才能使用
                success: function (data) {
                    if(data.Success){
                        def_msgid = data.Data;
                    }
                }
            });
            return def_msgid;
        },
        getRecord:function(data, systemMessage){ // 获取未存储到本地的历史记录
            var that = ClassChat;
            $.ajax({
                url: that.defineUrl + '/yychat/im/index.php?r=Msgapi/AjaxChatBySessionkey',
                type: 'POST',
                dataType: 'JSON',
                data: data,
                success: function (res) {
                    var content = res.Data[data['SESSIONKEY']].content || []
                    for (var i = 0; i < content.length; i++) {
                        if (content[i].id === data['userid']) {
                            content[i].mine = true
                        }
                        if (content[i].othertype === '1') {
                            content[i].content = 'img[' + content[i].content + ']'
                        }
                        content[i].avatar = addDomain(content[i].avatar)
                        content[i].timestamp = Number(content[i].timestamp) * 1000
                        content[i].type = 'friend'
                        that.layim.getMessage(content[i]);// 获取之前聊天记录
                    }
                    that.layim.getMessage(systemMessage);// 接入提醒
                }
            });
        },
        getMoreRecord:function(){
            // 点击加载更多聊天记录
            var that = ClassChat;
            $(document).off('click','.layui-layer-record-btn').on('click','.layui-layer-record-btn',function(){
                var recordData = {
                    sendtime: $('.layim-chat-main ul').find('li').eq(0).attr('data-time'),
                    userid: that.initData.memberIdx,
                    SESSIONKEY: that.initData.SESSIONKEY,
                    chatkey: that.initData.appiddes
                }
                $.ajax({
                    url: that.defineUrl + '/yychat/im/index.php?r=Msgapi/AjaxChatBySessionkey',
                    type: 'POST',
                    dataType: 'JSON',
                    data: recordData,
                    success: function (res) {
                        // var content = res.Data[data['SESSIONKEY']].content || []
                        // console.log('contentcontentcontent',res)
                        // for (var i = 0; i < content.length; i++) {
                        //     if (content[i].id === data['userid']) {
                        //         content[i].mine = true
                        //     }
                        //     if (content[i].othertype === '1') {
                        //         content[i].content = 'img[' + content[i].content + ']'
                        //     }
                        //     content[i].avatar = addDomain(content[i].avatar)
                        //     content[i].timestamp = Number(content[i].timestamp) * 1000
                        //     content[i].type = 'friend'
                        //     // layim.getMessage(content[i]);// 获取之前聊天记录
                        //     console.log()
                        // }
                    }
                });
            })
            
        }
    },
    setHistoryButton(){// 重置记录里面的可点击按钮
        var btnOtherResolve = $(".question-resolve");
        var btnAppoint = $(".appoint-transfer-btn2");// 历史纪录中预约单按钮重置
        var btnTransfer = $('.transfer-btn');// 历史纪录中找人工按钮重置
        var checkListDetail = $('.check-list-detail')// 查看服务单进度
        var serviseItemBox = $('.servise-item-box') // 查看某条服务单详情
        var appointMsgCancle = $('.appoint-msg-cancle')// 取消预约
        var serveEvaluateButton0 = $('.serve-evaluate-button0')
        var serveEvaluateButton1 = $('.serve-evaluate-button1')

        $.each(btnOtherResolve, function (i, item) {
            $(this).addClass('question-btn-unuse')
        });

        $.each(btnAppoint, function (i, item) {
            $(this).addClass('question-btn-unuse')
        });

        $.each(btnTransfer, function (i, item) {
            $(this).attr('disabled',true)
        });
        
        $.each(checkListDetail, function (i, item) {
            $(this).addClass('btn-unuse')
        });

        $.each(serviseItemBox, function (i, item) {
            $(this).addClass('btn-unuse')
        });

        $.each(appointMsgCancle, function (i, item) {
            $(this).addClass('btn-unuse').html($(this).attr('data-after-name'))
        });

        $.each(serveEvaluateButton0, function (i, item) {
            $(this).addClass('btn-unuse')
        });
        $.each(serveEvaluateButton1, function (i, item) {
            $(this).addClass('btn-unuse')
        });
    },
    clickEvent(){// 绑定的点击事件
        var that = this; 
        // 点击获取接入人工话题
        $('.layui-layim-chat').on('click', '.float-transfer-btn', function () {
            recordUserData = JSON.stringify({
                type: 'topic',
                'is_auto': isAuto,
                appid: appid,
                data: {
                    mine:layim.cache().mine,
                    to:robotInfo?robotInfo:layim.cache().friend[0].list[0]
                },
                source: staffInfo.source,
                mainappid: mainappid,
                circle_app_id: initData.circle_app_id
            })
            ws.send(recordUserData);
        });
        
        // 选择话题接入人工
        $('.layui-layim-chat').on('click', '.transfer-btn', function () {
            if ($(this).attr('disabled')) return false;// 禁止点击
            var toppic = $(this).text()
            var code = $(this).attr('data-topiccode');
            var footerEle = $(this).parents('.layim-chat-main').siblings('.layim-chat-footer').find('.layim-chat-tool');
            // console.log(JSON.parse(decodeURIComponent(footerEle.eq(0).attr('data-json'))))
            turnToTheStaff(toppic, code, footerEle, this);
        });

        // 点击没找到答案时
        $('.layui-layim-chat').on('click', '.search-no-question', function () {
            recordUserData = JSON.stringify({
                type: 'topic',
                'is_auto': isAuto,
                appid: appid,
                data: {
                    mine:layim.cache().mine,
                    to:robotInfo?robotInfo:layim.cache().friend[0].list[0]
                },
                source: staffInfo.source,
                mainappid: mainappid,
                circle_app_id: initData.circle_app_id
            })
            ws.send(recordUserData);
        });

		// 点击预约按钮
        $('.layui-layim-chat').on('click', '.appoint-transfer-btn2', function () {
            if($(this).hasClass('question-btn-unuse')) return false;
            var content = renderTemplate(// 渲染预约单按钮
                initData,
                {
                    template_code:'85676314cf42acac22fa25dc0d445yy1',
                    template_params:{},
                }
            )
            layer.open({
                title: false,
                type: 1,
                btn: [],
                closeBtn: true,
                zIndex: 198910170,
                resize:false,
                skin: 'appoint-dialog',
                content: content,
                area: '50%',
                success:function(layero,index){
                    $('.appoint-dialog').on('click','.layui-layer-btn0',function(){
                        var cusname = $('#cus_contact_person').val() // 用户的w_cusname
                        var phone = $('#cus_contact_phone').val() // 用户输入的手机号
                        var question = $('#cus_contact_question').val() // 用户输入的问题

                        if(!cusname) {
                            layer.msg('请填写联系人名称', {
                                zIndex: 198910175
                            });
                            return false;
                        }
                        if(!phone) {
                            layer.msg('请填写电话号', {
                                zIndex: 198910175
                            });
                            return false;
                        }
                        if(!(/^1[3456789]\d{9}$/.test(phone))){ 
                            layer.msg('电话号格式有误', {
                                zIndex: 198910175
                            });
                            return false;
                        }
                        if(!question) {
                            layer.msg('请填写问题描述', {
                                zIndex: 198910175
                            });
                            return false;
                        }
                        saveAppointaction(cusname,phone,question,index);
                    })
                }
            });
        });

        // 点击取消预约
        $('.layui-layim-chat').on('click', '.appoint-msg-cancle', function () {
            if($(this).hasClass('btn-unuse')) return false;
            var that = this;
            $.ajax({
                url: defineUrl + '/yychat/im/index.php?r=ImCase/CancelAppoint',
                type: "POST",
                dataType: "json",
                data: {
                    appId:initData.appid,
                    userId:initData.memberIdx,
                    caseId:$(that).attr('data-appointid')
                },
                success: function (data) {
                    if(data.Success){
                        $(that).addClass('btn-unuse').html($(that).attr('data-after-name'));
                        layer.msg('取消预约成功！'); 
                    }
                }
            });
        })

        // 点击默认推送话题
        $('.layui-layim-chat').on('click', '.question-default', function(){
            var kb_id = $(this).attr('data-question');
            console.log(that.defaultPush)
            for(var i=0; i<that.defaultPush.length; i++){
                if(that.defaultPush[i].kb_id == kb_id){
                    // 添加答案推送聊天记录
                    var addData = {
                        "appid": that.initData.mainappid,
                        "from": 'xiaoyou',
                        "to": that.initData.memberIdx,
                        "content": that.defaultPush[i].kb_solution,
                        "ids": kb_id,
                        "source": "chat_default_kb",
                        "push_type": 2
                    };
                    var tempMsgid = 123 // addChatRecord(addData);
                    var time = new Date().getTime();
                    // 展示推送内容
                    var aCnt = `<div class="color333 ques-resolve-box" data-question="${that.defaultPush[i].kb_id}">
                                    ${that.defaultPush[i].kb_solution}
                                    <div class="ques-def-resolve-btns" data-timestamp="${time}">
                                        <p class="ques-def-resolve" isresolve="0" msgid="${tempMsgid}"></p>
                                        <p class="ques-def-resolve" isresolve="1" msgid="${tempMsgid}"></p>
                                    </div>
                                </div>`;
                    var obj = { // 更换信息成功的时候，人工客服推送的信息，要更改
                        username: that.servicerInfo['username']
                        ,avatar: addDomain(that.servicerInfo['avatar'])
                        ,id: that.servicerInfo['id']
                        ,type: 'friend'
                        ,content: aCnt
                        ,timestamp: time
                        ,transfer: true
                        ,system: false
                    };
                    that.layim.getMessage(obj);// 点击默认推送显示答案
                    that.chatlog.addChatRecord(aCnt);// 保存聊天记录
                    that.layim.setChatStatus('<span style="color:#FBD7D7;">在线</span>');
                    break;
                }
            }
        });
        
        // 默认推送话题 点击已解决未解决 
        $('.layui-layim-chat').on('click', '.ques-def-resolve', function () {
            if($(this).hasClass('question-btn-unuse')) return false;
            var is_solve = $(this).attr('isresolve');
            var Id = $(this).attr('msgid');
            var _this = this;
            if(!Id) return false;
            $.ajax({
                url: that.defineUrl + '/yychat/im/index.php?r=Defaultpush/ChatSolve',
                type: "POST",
                dataType: "json",
                data: {
                    'is_solve': is_solve > 0 ? 1 : 0,
                    'Id': Id
                },
                success: function (data) {
                    if(data.Success){
                        // 点击之后将按钮设置为不可点状态
                        var siblingsEle = $(_this).parent().find('.ques-def-resolve');
                        $(_this).addClass('resolve-selected');
                        siblingsEle.addClass('question-btn-unuse');

                        if (!that.robotInfo) {
                            that.robotInfo = that.layim.cache().rabot[0] ? that.layim.cache().rabot[0].list[0]: that.layim.cache().friend[0].list[0] 
                        }
                        var resolve_cont = '';
                        if(is_solve == 0){
                            resolve_cont = '谢谢您的参与~'
                        }else{
                            resolve_cont = `
                                <div class="chat-find-noAnswer">
                                    已收到您的反馈，小友会努力学习的~ 可以告诉小友哪里做的不好？小友会根据您的问题帮你召唤人工客服为您服务!
                                    <a href="javascript:void(0)" class="search-no-question">人工客服</a>
                                </div>
                            `
                        }
                        var sentence = {
                            username: that.robotInfo.username,
                            avatar: addDomain(that.robotInfo.avatar),
                            id: that.robotInfo.id,
                            type: 'friend',
                            content: resolve_cont,
                            timestamp: new Date().getTime(),
                            transfer: true,
                            system: false
                        };
                        setTimeout(function(){
                            that.layim.getMessage(sentence);// 默认推送点击解决 未解决推送
                            that.chatlog.addChatRecord(resolve_cont)// 保存聊天记录
                        },300)

                        // 修改之前聊天状态
                        var layimHistory = JSON.parse(window.localStorage.getItem('layim') || '{}')
                        var recordList = layimHistory[that.initData.memberIdx] ?
                            layimHistory[that.initData.memberIdx].chatlog ?
                            layimHistory[that.initData.memberIdx].chatlog['friend'+that.robotInfo.id] : [] : [];
                        recordList = recordList || []
                        var findIndex = -1
                        for (var i = 0; i < recordList.length; i++) {
                            if (recordList[i].timestamp == $(_this).parent().attr('data-timestamp')) {
                                findIndex = i
                            }
                        }
                        if (findIndex > -1) {
                            recordList[findIndex].content = $(_this).parent().parent().parent().html()
                            layimHistory[that.initData.memberIdx].chatlog['friend'+that.robotInfo.id] = recordList
                            window.localStorage.setItem('layim', JSON.stringify(layimHistory))
                        }
                    }
                }
            });
        });

        // 机器人回复找不到答案，推送猜你想问
        $('.layui-layim-chat').on('click', '.question-topic', function () {
            var questionId = $(this).attr('data-question')
            var recordUserDataObj = JSON.parse(recordUserData)
            recordUserDataObj.type = 'text'
            recordUserDataObj.findanswer = true
            recordUserDataObj.data.mine.content = questionId
            // recordUserDataObj.content = questionId
            ws.send(JSON.stringify(recordUserDataObj));
        })

        // 点击查看服务记录
        $('.layui-layim-chat').off('click','.check-other-list-detail').on('click','.check-other-list-detail',function(){
            $('.layim-tool-chatlog').trigger('click')
        })


        // 点击查看服务记录
        $('.layui-layim-chat').off('click','.float-transfer-close-btn').on('click','.float-transfer-close-btn',function(){
            console.log(layui.layim.cache(),robotInfo)
            // var bind = {
            //     "type": "customerclose",
            //     "msg_to":1,
            // };
            // 重新绑定
            setTimeout(function () {
                ws.send(JSON.stringify(bind));
            }, 100);

        })

        // 关闭websoket
        $(document).on('click', '.layui-close-websoket', function (){
            console.log("关闭websoket");
            ws.close();
        });
    }

}

export default ClassChat;