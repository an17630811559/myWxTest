const util = require('../../utils/util.js');
const api = require('../../config/api.js');
const user = require('../../services/user.js');

//获取应用实例
const app = getApp()

Page({
    data: {
        floorGoods: [],
        openAttr: false,
        showChannel: 0,
        showBanner: 0,
        showBannerImg: 0,
        goodsCount: 0,
        banner: [],
        index_banner_img: 0,
        userInfo: {},
        imgurl: '',
        sysHeight: 0,
        loading: 0,
        autoplay:true
    },
    onHide:function(){
        this.setData({
            autoplay:false
        })
    },
    goSearch: function () {
        wx.navigateTo({
            url: '/pages/search/search',
        })
    },
    goCategory: function (e) {
        let id = e.currentTarget.dataset.cateid;
        wx.setStorageSync('categoryId', id);
        wx.switchTab({
            url: '/pages/category/index',
        })
    },
    //获取搜索框商品数量
    getCatalog: function () {
        let that = this;
        util.request(api.GoodsCount).then(function (res) {
            that.setData({
                goodsCount: res.data
            });
        });
    },
    handleTap: function (event) {
        //阻止冒泡 
    },
    onShareAppMessage: function () {
        let info = wx.getStorageSync('userInfo');
        return {
            title: '海风小店',
            desc: '开源微信小程序商城',
            path: '/pages/index/index?id=' + info.id
        }
    },
    toDetailsTap: function () {
        wx.navigateTo({
            url: '/pages/goods-details/index',
        });
    },
    //获取商品信息
    getIndexData: function () {
        let that = this;
        util.request(api.IndexUrl).then(function (res) {
            console.log(res)
            if (res.code == 200) {
                that.setData({
                    floorGoods: res.data.floorGoods,
                    banner: res.data.banner,
                    channel: res.data.floorGoods,
                    notice: res.data.msg,
                    loading: 1,
                });
            }
        });
    },
    //页面加载完成时
    onLoad: function (options) {
        let systemInfo = wx.getStorageSync('systemInfo');
        var scene = decodeURIComponent(options.scene);
        this.getCatalog();
    },
    onShow: function () {
        this.getCartNum();
        this.getChannelShowInfo();
        this.getIndexData();
        var that = this;
        let userInfo = wx.getStorageSync('userInfo');
        if (userInfo != '') {
            that.setData({
                userInfo: userInfo,
            });
        };
        let info = wx.getSystemInfoSync();
        let sysHeight = info.windowHeight - 100;
        this.setData({
            sysHeight: sysHeight,
            autoplay:true
        });
        wx.removeStorageSync('categoryId');
    },
    //获取购物车数量 
    //TODO 在本地完成购物车
    getCartNum: function () {
        util.request(api.CartGoodsCount).then(function (res) {
            if (res.errno === 0) {
                let cartGoodsCount = '';
                if (res.data.cartTotal.goodsCount == 0) {
                    wx.removeTabBarBadge({
                        index: 2,
                    })
                } else {
                    cartGoodsCount = res.data.cartTotal.goodsCount + '';
                    wx.setTabBarBadge({
                        index: 2,
                        text: cartGoodsCount
                    })
                }
            }
        });
    },
    //页面加载完第二个调用的方法 获取数据库中的设置
    getChannelShowInfo: function (e) {
        let that = this;
        util.request(api.ShowSettings).then(function (res) {
            console.log(res)
            if (res.code == 200) {
                let show_channel = res.data.showChannel;
                let show_banner = res.data.showBanner;
                let show_notice = res.data.showNotice;
                let index_banner_img = res.data.indexBannerImg;
                that.setData({
                    show_channel: show_channel,
                    show_banner: show_banner,
                    show_notice: show_notice,
                    index_banner_img: index_banner_img
                });
            }
        });
    },
    //下拉事件
    onPullDownRefresh: function () {
        wx.showNavigationBarLoading()
        this.getIndexData();
        this.getChannelShowInfo();
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
    },
})