// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
import * as ConstValue from "../models/ConstValue";

var UserDataMgr = require('UserDataMgr');
var ScreenMgr = require("ScreenMgr");
var UtilsFB = require("UtilsFB");
var UtilsCommon = require("UtilsCommon");

cc.Class({
    extends: require('DialogView'),

    properties: {
        btnGet: {
            default: null,
            type: cc.Node,
        },
    },

    onEnterBegin(args) {
        this.updateLeftCount();
    },

    onBtnClickGet() {
        if (this.leftGetCount <= 0) {
            ScreenMgr.instance.showMessage("Chances are used up, please come tommorrow.");
            return;
        }

        this.close();

        let imageBase64 = UtilsCommon.getScreenshotBase64(UtilsCommon.getCameraMain());
        UtilsFB.chooseAsync(imageBase64)
        .then(function() {
            this.onShareSuccess();
        }.bind(this))
        .catch(function(error) {

        });
    },

    onBtnClickNo() {
        this.close();
    },

    close() {
        this.node.active = false;
    },

    onShareSuccess() {
        this.lastGetCount += 1;
        let lastGetDateStr = (new Date()).toDateString();
        UserDataMgr.instance.incrementData(ConstValue.ITEM_DIAMOND, 100);
        UserDataMgr.instance.setData(ConstValue.DATA_LAST_DIAMOND_COUNT, this.lastGetCount);
        UserDataMgr.instance.setData(ConstValue.DATA_LAST_DIAMOND_DATE, lastGetDateStr);

        UserDataMgr.instance.setDataToFB();
    },

    //更新剩余次数
    updateLeftCount() {
        let lastGetDate = new Date();
        //上次获得奖励的日期
        let lastGetDateStr = UserDataMgr.instance.getDataString(ConstValue.DATA_LAST_DIAMOND_DATE);
        //上次获得奖励的次数
        this.lastGetCount = UserDataMgr.instance.getDataNumber(ConstValue.DATA_LAST_DIAMOND_COUNT);
        if (lastGetDateStr != "") {
            lastGetDate = new Date(lastGetDateStr);
        }
        lastGetDate.setHours(0, 0, 0, 0);

        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        let dayMs = 24 * 60 * 60 *1000;
        let diffDays = Math.floor((currentDate - lastGetDate) / dayMs);

        if (diffDays > 0) {
            this.lastGetCount = 0;
        } else if (diffDays < 0) {
            this.lastGetCount = ConstValue.DAILY_DIAMOND_COUNT;
        }

        //剩余可获取的次数
        this.leftGetCount = Math.max(ConstValue.DAILY_DIAMOND_COUNT - this.lastGetCount, 0);
        
        this.btnGet.getComponentInChildren(cc.Label).string = "Get 100 Diamonds (" + this.leftGetCount + ")";
    },
});
