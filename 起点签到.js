// 初始化
console.show();
auto.waitFor();

// 启动起点
app.launchPackage('com.qidian.QDReader');
waitForPackage('com.qidian.QDReader');
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
waitView("书架");
log("应用已识别");

// 我 - 福利中心
clickButton(findView("我"));
clickButton(waitView("福利中心"));
waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
waitView("限时彩蛋");

log("每日福利");
let textView;

// #region 免费开宝箱
log("免费开宝箱");
if (textView = findView("免费开宝箱")) {
    clickButton(textView);
}
if (textView = findView("看视频可再抽一次")){
    clickButton(textView);
    watchAds();
    sleep(1000);
} else if (textView = findView("我知道了")){
    clickButton(textView);
    sleep(1000);
}
// #endregion

// #region 看视频开宝箱
log("看视频开宝箱");
if (textView = findView("看视频开宝箱")) {
    clickButton(textView);
    watchAds();
    sleep(3000);
}
// #endregion

// 每日视频
log("每日视频 开始");
while ((textView = findView("看第\\d+个视频", "match")) || (textView = findView("看视频领福利"))){
    clickButton(textView);
    watchAds();
    sleep(3000);
}
log("每日视频 结束");

// 限时彩蛋
log("限时彩蛋 开始");
while(textView = findView("看视频")) {
    clickButton(textView);
    watchAds();
    sleep(1000);
}
log("限时彩蛋 结束");

// 玩游戏
log("玩游戏 开始");
if ((textView = findView("当日玩游戏\\d+分钟", "match"))) {
    let layout = textView.parent();
    textView = layout.findOne(text("去完成"));
    if (textView) {
        // 计算剩余时间
        let text = layout.findOne(textMatches("\\d+/\\d+分钟"));
        if (text) {
            text = text.text();
            let result = text.match("(\\d+)/(\\d+)分钟");
            let gameTimes = parseInt(result[1]);
            let allTime = parseInt(result[2]);
            let playMinutes = Math.max(allTime - gameTimes, 1);
            // 玩游戏
            clickButton(findView("去完成"));
            waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
            clickButton(waitView("新游"));
            waitForActivity("com.qidian.QDReader.ui.activity.GameBrowserActivity");
            clickButton(waitView("在线玩"));
            sleep(1000);
            log("保持屏幕常亮");
            device.keepScreenDim();
            for (let i = playMinutes + 1; i > 0; --i) {
                log(`剩余 ${i}min`);
                sleep(66000);
                device.wakeUpIfNeeded();
            }
            log("停止屏幕常亮，游戏挂机结束");
            device.cancelKeepingAwake();
            device.vibrate(500);
            // 游戏页(无标题) - 新游 - 游戏中心 - 福利中心
            while (true) {
                if (findView("福利中心")) {
                    break;
                }
                back();
                sleep(1000);
            }
        }
    }
}
log("玩游戏 结束");

// 领奖励
log("领奖励 开始");
while(textView = findView("领奖励")) {
    clickButton(textView);
    sleep(1000);
        if (textView = findView("我知道了")) {
            clickButton(textView);
        }
}
log("领奖励 结束");

// 结束
log("返回书架");
back();
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
clickButton(waitView("书架"));
log("运行结束");
sleep(5000);
console.hide();

// ==================================================================

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，默认 text，可选 match
 * @returns 第一个符合条件的控件，不存在返回 undefined
 */
function findView(content, mode) {
    log(`查找控件 ${content}`);
    let find;
    if (mode === 'match') {
        find = textMatches(content);
    } else {
        find = text(content);
    }
    return find && find.exists() ? find.findOnce() : undefined;
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @returns 第一个符合条件的控件
 */
function waitView(content) {
    log(`等待控件 ${content}`);
    let view = text(content);
    view.waitFor();
    return view.findOnce();
}

/**
 * 根据文字查找按钮并点击
 * @param {UiObject} view 按钮上的文字所在 view
 * @returns 是否成功点击
 */
function clickButton(view) {
    log("点击 " + view.text());
    // 查找按钮所在控件
    let btn = view;
    while (btn && !btn.clickable()) {
        btn = btn.parent();
    }
    // 点击
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

/**
 * 看广告，等待广告结束并关闭广告
 * @returns 是否播放完成
 */
function watchAds() {
    waitForActivity("com.qq.e.tg.RewardvideoPortraitADActivity");
    className("android.widget.Image").waitFor();
    sleep(1000);
    let skip = false;
    // 加载广告
    let sleepTime = 0;
    let loop = 0;
    while (!skip && sleepTime === 0) {
        if (findView("观看视频15秒后，可获得奖励")) {
            sleepTime = 16;
            log("预览 15s");
        } else if (findView("观看视频30秒后，可获得奖励")) {
            sleepTime = 31;
            log("预览 30s");
        } else if (findView("观看完视频，可获得奖励")) {
            let adLength = NaN;
            let views = className("android.view.View").find();
            for (let i = 0; i < views.size(); ++i) {
                adLength = parseInt(views.get(i).text());
                if (!isNaN(adLength)) break;
            }
            if (isNaN(adLength) || adLength < 3) {
                log("广告长度读取失败，即将重新查看")
                skip = true;
            } else {
                log(`广告预览 ${adLength + 1}s`)
                sleepTime = adLength + 1;
            }
        }else {
            loop++;
            if (loop === 50) {
                break;
            }
        }
    }
    if (!skip) {
        sleep(sleepTime * 1000);
    }
    // 关闭广告
    let view = className("com.tencent.tbs.core.webkit.WebView");
    if (view && view.exists()) {
        let closeImg = view.findOnce().find(className("android.widget.Image"));
        if (closeImg && closeImg.size() > 0) {
            closeImg = closeImg.get(0);
            // 最后一串 [] 内数据如何获取。。。
            // while (closeImg && !toString(closeImg).includes("ACTION_CLICK")) {
            //     closeImg = closeImg.parent();
            // }
            // if (closeImg) {
            //     closeImg.click();
            // } else {
            //     log("Error: 找不到关闭按钮点击区域");
            // }
            closeImg.click();
            closeImg.parent().click();
            closeImg.parent().parent().click();
            
            if (skip) {
                clickButton(waitView("跳过视频"));
                return false;
            }
        }
    }
    sleep(1000);
    if (textView = findView("我知道了")) {
        clickButton(textView);
    }
    log("广告已结束")
    return true;
}

/**
 * 在控制台输出某个视图及所有子视图
 * @param {UiObject} view 视图
 * @param {number} level 空格等级
 */
function logView(view, level) {
    let s = "";
    for (let i = 0; i < level; ++i) s += " ";
    log(`${s}${view}`);
    view.children().forEach(v => logView(v, level + 2));
}

/**
 * 在控制台输出当前屏幕所有视图的内容
 * @param {UiObject} child 内部任意一个子视图
 */
function logRootView(child) {
    let pl = 0;
    let pv = child.parent();
    while (pv) {
        pl++;
        child = pv;
        pv = child.parent();
    }
    log(pl);
    logView(child, 0);
}
