;(function($, window, document, undefined){
    var ArrowChart = function(ele, opt){
        this.$element = ele;
        this.element_height = 0;    // 元素的默认高度
        this.increase_data = [];    // 增长的数据
        this.decline_data = [];     // 下降的数据
        this.default = {
            data: [],   // 数据
            topOffset: 10,  // 增长数据第一个bar的左偏移量
            bottomOffset: 10,  // 下降数据第一个bar的左偏移量
            verticalAlign: false,   // 增长数据和下降数据是否对齐显示, 默认不对齐
            arrowHeight: -1,    // 手动设置箭头图的高度参数，所有图形均为一样高，单位为 %；默认为后台传来的动态高度
            clickCallBack: function(){}   // 点击回调
        }
        this.options = $.extend({}, this.default, opt);
    }

    ArrowChart.prototype = {
        /**
         * 初始化
         */
        init: function(){
            return this.dataProcessing();
        },

        /**
         * 数据分类处理
         */
        dataProcessing: function(){
            this.element_height = this.$element.height() - 40;  // 需要减去 .chart_wrap 的上下内边距
            var total_data_length = this.options.data.length;
            
            for(var i = 1; i < total_data_length; i++){
                if(this.options.data[i].value[1] >= 0){
                    // 增长的数据
                    this.increase_data.push(this.options.data[i]);
                } else {
                    // 下降的数据
                    this.decline_data.push(this.options.data[i]);
                }
            }

            return this.draw();
        },

        /**
         * 渲染方法
         */
        draw: function(){
            var $html = $('<div class="w_100w pad_20_20 boxFlex boxFlexCen chart_wrap" style="box-sizing: border-box;"></div>'),
                $chart_detailed = $('<div class="colFlex w_100w pad_r20 chart_detailed"><div class="chart_detailed_line_between"></div></div>');

            var temp_total_html = '',       // 总数据元素结构
                temp_increase_decline_html = '',    // 增长和下降数据元素结构
                total_data_length = this.options.data.length,   // 总数据长度
                bar_width = this.chartWidth();  // 图表 bar 宽度

            // 拼装总数据元素结构
            if(this.options.data[0].value[1] >= 0){
                temp_total_html = '<a class="boxFlexCen increase total_type" href="javascript:;">'+
                                        '<div class="txt_left pad_lr7">'+
                                            '<div class="title_name">'+this.options.data[0].name+'</div>'+
                                            '<div class="mar_t10 numerical sumNumerBor">'+this.options.data[0].value[0]+'</div>'+
                                            '<div class="mar_t10 percentage">'+
                                                '<p class="arrow_icon">'+this.options.data[0].value[1]+'%</p>'+
                                            '</div>'+
                                        '</div>'+
                                    '</a>';
            } else {
                temp_total_html = '<a class="boxFlexCen decline total_type" href="javascript:;">'+
                                        '<div class="txt_left pad_lr7">'+
                                            '<div class="title_name">'+this.options.data[0].name+'</div>'+
                                            '<div class="mar_t10 numerical sumNumerBor">'+this.options.data[0].value[0]+'</div>'+
                                            '<div class="mar_t10 percentage">'+
                                                '<p class="arrow_icon">'+this.options.data[0].value[1]+'%</p>'+
                                            '</div>'+
                                        '</div>'+
                                    '</a>';
            }

            // 拼装增长数据元素结构和下降数据元素结构
            for(var i = 1; i < total_data_length; i++){

                if(this.options.data[i].value[1] >= 0){  // 增长数据
                    temp_increase_decline_html += '<a class="boxFlex boxFlexBottomStart increase char_bar_item" href="javascript:;" style="width:'+bar_width.increase+'%;height:'+this.chartHeigth(this.options.data[i].value[1])+'px">'+
                                            '<div class="txt_left pad_lr7 pad_b10">'+
                                                '<div class="title_name">'+this.options.data[i].name+'</div>'+
                                                '<div class="mar_t10 numerical">'+this.options.data[i].value[0]+'</div>'+
                                                '<div class="mar_t10 percentage">'+
                                                    '<p class="arrow_icon">'+this.options.data[i].value[1]+'%</p>'+
                                                '</div>'+
                                            '</div>'+
                                        '</a>';
                } else {    // 下降数据
                    temp_increase_decline_html += '<a class="boxFlex boxFlexTopStart decline char_bar_item" href="javascript:;" style="width:'+bar_width.decline+'%;height:'+this.chartHeigth(this.options.data[i].value[1])+'px">'+
                                            '<div class="txt_left pad_lr7 pad_t10">'+
                                                '<div class="title_name">'+this.options.data[i].name+'</div>'+
                                                '<div class="mar_t10 numerical">'+this.options.data[i].value[0]+'</div>'+
                                                '<div class="mar_t10 percentage">'+
                                                    '<p class="arrow_icon">'+this.options.data[i].value[1]+'%</p>'+
                                                '</div>'+
                                            '</div>'+
                                        '</a>';
                }
            }

            // 最后的元素结构组装
            $chart_detailed.find('.chart_detailed_line_between').html(temp_increase_decline_html);

            $html.append(temp_total_html).append($chart_detailed);

            var backStr = this.$element.html($html);

            this.chartClick();
            this.chartOffset();
            this.onResize();

            return backStr;
        },

        /**
         * 图表位置处理
         */
        chartOffset: function(){
            var _that = this,
                $chart_detailed = _that.$element.find('.chart_detailed'),
                $line_between_children = $chart_detailed.find('.chart_detailed_line_between').children();

            var increase_length = 0,    // 临时统计增长数据个数
                decline_length = 0,     // 临时统计下降数据个数
                left = 0;

            $line_between_children.each(function(index, obj){
                var $this = $(this),
                    this_windth = $this.width();
                    
                if(_that.options.verticalAlign){
                    if($this.hasClass('increase')){     // 增长数据
                        left = this_windth * increase_length + _that.options.topOffset;
                        increase_length++;
                    } else if($this.hasClass('decline')){   // 下降数据
                        left = this_windth * decline_length + _that.options.bottomOffset;
                        decline_length++;
                    }
                } else {
                    if($this.hasClass('increase')){     // 增长数据
                        left = this_windth * index + _that.options.topOffset;
                    } else if($this.hasClass('decline')){   // 下降数据
                        left = this_windth * index + _that.options.bottomOffset;
                    }
                }

                $(this).css({
                    'left': left+'px'
                });
            });
        },

        /**
         * 图表 bar 的宽度处理
         */
        chartWidth: function(){
            var width = {};     // 返回百分比宽度
            if(this.options.verticalAlign){
                width = {
                    increase: 100 / this.increase_data.length,
                    decline: 100 / this.decline_data.length
                }
            } else {
                width = {
                    increase: 100 / this.options.data.length,
                    decline: 100 / this.options.data.length
                }
            }
            return width;
        },

        /**
         * 图表 bar 的高度处理
         */
        chartHeigth: function(v){
            var tempHeight = this.options.arrowHeight >= 0 ? this.options.arrowHeight : Math.abs(v) >= 100 ? 100 : Math.abs(v);    // 传过来的高度为百分比，需要转换成具体数值
            return (this.element_height/2) * (tempHeight/100);
        },

        /**
         * 窗口变化事件
         */
         onResize: function(){
            var _that = this;
            
            $(window).resize(function(){
                _that.chartOffset();
            });
         },

        /**
         * click 事情绑定
         */
        chartClick: function(){
            var _that = this;
            _that.$element.off().on('click', 'a', function(){
                var $this = $(this);
                if(typeof _that.options.clickCallBack === 'function'){
                    _that.options.clickCallBack($this);
                }
            });
        }
    }

    $.fn.arrowChart = function(option){
        var chart = new ArrowChart(this, option);
        return chart.init();
    }
})(jQuery, window, document);