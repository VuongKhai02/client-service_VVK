(window.webpackJsonp=window.webpackJsonp||[]).push([[60],{bOIV:function(t,i,s){"use strict";s.r(i),(function(t){s.d(i,"TbFlot",function(){return b});var e=s("//Q6"),o=s("0lYY"),n=s("RV8Q"),a=s("wd/R"),r=s("Zss7"),h=s("aX2P"),l=s("OiFK"),c=s("3Tyt"),p=r,d=a,u=n.c,m=n.b,b=function(){function i(i,s){var o;this.ctx=i,this.chartType=s,this.plotInited=!1,this.isMouseInteraction=!1,this.flotHoverHandler=this.onFlotHover.bind(this),this.flotSelectHandler=this.onFlotSelect.bind(this),this.dblclickHandler=this.onFlotDblClick.bind(this),this.mousedownHandler=this.onFlotMouseDown.bind(this),this.mouseupHandler=this.onFlotMouseUp.bind(this),this.mouseleaveHandler=this.onFlotMouseLeave.bind(this),this.flotClickHandler=this.onFlotClick.bind(this),this.chartType=this.chartType||"line",this.settings=i.settings,this.utils=this.ctx.$injector.get(l.a),this.showTooltip=!Object(e.n)(this.settings.showTooltip)||this.settings.showTooltip,this.tooltip=this.showTooltip?t("#flot-series-tooltip"):null,0===(null===(o=this.tooltip)||void 0===o?void 0:o.length)&&(this.tooltip=this.createTooltipElement()),this.trackDecimals=i.decimals,this.trackUnits=i.units,this.tooltipIndividual="pie"===this.chartType||!!Object(e.n)(this.settings.tooltipIndividual)&&this.settings.tooltipIndividual,this.tooltipCumulative=!!Object(e.n)(this.settings.tooltipCumulative)&&this.settings.tooltipCumulative,this.hideZeros=!!Object(e.n)(this.settings.hideZeros)&&this.settings.hideZeros;var n={color:this.settings.fontColor||"#545454",size:this.settings.fontSize||10,family:"Roboto"};if(this.options={title:null,subtitile:null,shadowSize:Object(e.n)(this.settings.shadowSize)?this.settings.shadowSize:4,HtmlText:!0,grid:{hoverable:!0,mouseActiveRadius:10,autoHighlight:!0===this.tooltipIndividual,markings:[]},selection:{mode:"x"},legend:{show:!1}},"line"===this.chartType||"bar"===this.chartType||"state"===this.chartType){if(this.options.xaxes=[],this.xaxis={mode:"time",timezone:"browser",font:Object(e.e)(n),labelFont:Object(e.e)(n)},this.yaxis={font:Object(e.e)(n),labelFont:Object(e.e)(n)},this.settings.xaxis&&(this.xaxis.font.color=this.settings.xaxis.color||this.xaxis.font.color,this.xaxis.label=this.utils.customTranslation(this.settings.xaxis.title,this.settings.xaxis.title)||null,this.xaxis.labelFont.color=this.xaxis.font.color,this.xaxis.labelFont.size=this.xaxis.font.size+2,this.xaxis.labelFont.weight="bold"),this.yAxisTickFormatter=this.formatYAxisTicks.bind(this),this.yaxis.tickFormatter=this.yAxisTickFormatter,this.settings.yaxis&&(this.yaxis.font.color=this.settings.yaxis.color||this.yaxis.font.color,this.yaxis.min=Object(e.n)(this.settings.yaxis.min)?this.settings.yaxis.min:null,this.yaxis.max=Object(e.n)(this.settings.yaxis.max)?this.settings.yaxis.max:null,this.yaxis.label=this.utils.customTranslation(this.settings.yaxis.title,this.settings.yaxis.title)||null,this.yaxis.labelFont.color=this.yaxis.font.color,this.yaxis.labelFont.size=this.yaxis.font.size+2,this.yaxis.labelFont.weight="bold",Object(e.x)(this.settings.yaxis.tickSize)?this.yaxis.tickSize=this.settings.yaxis.tickSize:this.yaxis.tickSize=null,Object(e.x)(this.settings.yaxis.tickDecimals)?this.yaxis.tickDecimals=this.settings.yaxis.tickDecimals:this.yaxis.tickDecimals=null,this.settings.yaxis.ticksFormatter&&this.settings.yaxis.ticksFormatter.length))try{this.yaxis.ticksFormatterFunction=new Function("value",this.settings.yaxis.ticksFormatter)}catch(a){this.yaxis.ticksFormatterFunction=null}this.options.grid.borderWidth=1,this.options.grid.color=this.settings.fontColor||"#545454",this.settings.grid&&(this.options.grid.color=this.settings.grid.color||"#545454",this.options.grid.backgroundColor=this.settings.grid.backgroundColor||null,this.options.grid.tickColor=this.settings.grid.tickColor||"#DDDDDD",this.options.grid.borderWidth=Object(e.n)(this.settings.grid.outlineWidth)?this.settings.grid.outlineWidth:1,!1===this.settings.grid.verticalLines&&(this.xaxis.tickLength=0),!1===this.settings.grid.horizontalLines&&(this.yaxis.tickLength=0),Object(e.n)(this.settings.grid.margin)&&(this.options.grid.margin=this.settings.grid.margin),Object(e.n)(this.settings.grid.minBorderMargin)&&(this.options.grid.minBorderMargin=this.settings.grid.minBorderMargin)),this.options.xaxes[0]=Object(e.e)(this.xaxis),this.settings.xaxis&&!1===this.settings.xaxis.showLabels&&(this.options.xaxes[0].tickFormatter=function(){return""}),this.options.series={},this.options.crosshair={mode:"x"},"line"===this.chartType&&this.settings.smoothLines&&(this.options.series.curvedLines={active:!0,monotonicFit:!0}),"line"!==this.chartType&&"bar"!==this.chartType||!isFinite(this.settings.thresholdsLineWidth)||(this.options.grid.markingsLineWidth=this.settings.thresholdsLineWidth),"bar"===this.chartType&&(this.options.series.lines={show:!1,fill:!1,steps:!1},this.options.series.bars={show:!0,lineWidth:0,fill:.9,align:this.settings.barAlignment||"left"},this.defaultBarWidth=this.settings.defaultBarWidth||600),"state"===this.chartType&&(this.options.series.lines={steps:!0,show:!0})}else"pie"===this.chartType&&(this.options.series={pie:{show:!0,label:{show:!0===this.settings.showLabels},radius:this.settings.radius||1,innerRadius:this.settings.innerRadius||0,stroke:{color:"#fff",width:0},tilt:this.settings.tilt||1,shadow:{left:5,top:15,alpha:.02}}},this.options.grid.clickable=!0,this.settings.stroke&&(this.options.series.pie.stroke.color=this.settings.stroke.color||"#fff",this.options.series.pie.stroke.width=this.settings.stroke.width||0),this.options.series.pie.label.show&&(this.options.series.pie.label.formatter=function(t,i){return"<div class='pie-label'>"+i.dataKey.label+"<br/>"+Math.round(i.percent)+"%</div>"},this.options.series.pie.label.radius=3/4,this.options.series.pie.label.background={opacity:.8}),this.animatedPie=!0===this.settings.animatedPie);this.ctx.defaultSubscription&&this.init(this.ctx.$container,this.ctx.defaultSubscription)}return i.pieSettingsSchema=function(){return u},i.pieDatakeySettingsSchema=function(){return m},i.settingsSchema=function(t){return Object(n.d)(t)},i.datakeySettingsSchema=function(t,i){return Object(n.a)(t,i)},i.prototype.init=function(t,i){var s,n,a=this;if(this.$element=t,this.subscription=i,this.comparisonEnabled=this.subscription?this.subscription.comparisonEnabled:this.settings.comparisonEnabled,this.comparisonEnabled){var r=Object(e.e)(this.xaxis);r.position="top",this.settings.xaxisSecond&&(!1===this.settings.xaxisSecond.showLabels&&(r.tickFormatter=function(){return""}),r.label=this.utils.customTranslation(this.settings.xaxisSecond.title,this.settings.xaxisSecond.title)||null,r.position=this.settings.xaxisSecond.axisPosition),r.tickLength=0,this.options.xaxes.push(r),this.options.series.stack=!1}else this.options.series.stack=!0===this.settings.stack;var l=[];this.yaxes=[];var d={},u=[],m=[];if(this.settings.customLegendEnabled&&(null===(s=this.settings.dataKeysListForLabels)||void 0===s?void 0:s.length)){this.labelPatternsSourcesData=[];var b=[];this.settings.dataKeysListForLabels.forEach(function(t){t.settings={}}),this.subscription.datasources.forEach(function(t){var i={type:t.type,entityType:t.entityType,entityId:t.entityId,dataKeys:a.settings.dataKeysListForLabels};b.push(i)}),this.subscribeForLabelPatternsSources(b)}var g=null;if(this.settings.tooltipValueFormatter&&this.settings.tooltipValueFormatter.length)try{g=new Function("value",this.settings.tooltipValueFormatter)}catch(I){g=null}for(var x=0;x<this.subscription.data.length;x++){var f=this.subscription.data[x];l.push(f.dataKey.color);var y=f.dataKey.settings;if(f.dataKey.tooltipValueFormatFunction=g,y.tooltipValueFormatter&&y.tooltipValueFormatter.length)try{f.dataKey.tooltipValueFormatFunction=new Function("value",y.tooltipValueFormatter)}catch(I){f.dataKey.tooltipValueFormatFunction=g}if(f.lines={fill:!0===y.fillLines},this.settings.stack&&!this.comparisonEnabled?f.stack=!y.excludeFromStacking:f.stack=!1,"line"===this.chartType||"state"===this.chartType?f.lines.show=!1!==y.showLines:f.lines.show=!0===y.showLines,Object(e.n)(y.lineWidth)&&null!==y.lineWidth&&(f.lines.lineWidth=y.lineWidth),f.points={show:!1,radius:8},!0===y.showPoints&&(f.points.show=!0,f.points.lineWidth=Object(e.n)(y.showPointsLineWidth)?y.showPointsLineWidth:5,f.points.radius=Object(e.n)(y.showPointsRadius)?y.showPointsRadius:3,f.points.symbol=Object(e.n)(y.showPointShape)?y.showPointShape:"circle","custom"===f.points.symbol&&y.pointShapeFormatter))try{f.points.symbol=new Function("ctx, x, y, radius, shadow",y.pointShapeFormatter)}catch(I){f.points.symbol="circle"}"line"===this.chartType&&this.settings.smoothLines&&!f.points.show&&(f.curvedLines={apply:!0});var v=p(f.dataKey.color);if(v.setAlpha(.75),f.highlightColor=v.toRgbString(),f.datasource.isAdditional?(f.xaxisIndex=1,f.xaxis=2):(f.xaxisIndex=0,f.xaxis=1),this.yaxis){var T=f.dataKey.units&&f.dataKey.units.length?f.dataKey.units:this.trackUnits,k=void 0;if(y.showSeparateAxis?(k=this.createYAxis(y,T),this.yaxes.push(k)):(k=d[T])||(k=this.createYAxis(y,T),d[T]=k,this.yaxes.push(k)),f.yaxisIndex=this.yaxes.indexOf(k),f.yaxis=f.yaxisIndex+1,k.keysInfo[x]={hidden:!1},k.show=!0,y.thresholds&&y.thresholds.length)for(var w=function(t){if("predefinedValue"===t.thresholdValueSource&&isFinite(t.thresholdValue)){var i=D.subscription.data.length+u.length;D.generateThreshold(u,f.yaxis,t.lineWidth,t.color,i,t.thresholdValue)}else if(t.thresholdEntityAlias&&t.thresholdAttribute){var s=D.ctx.aliasController.getEntityAliasId(t.thresholdEntityAlias);if(!s)return"continue";var e=m.filter(function(t){return t.entityAliasId===s})[0],n={type:c.h.attribute,name:t.thresholdAttribute,label:t.thresholdAttribute,settings:{yaxis:f.yaxis,lineWidth:t.lineWidth,color:t.color},_hash:Math.random()};e?e.dataKeys.push(n):(e={type:o.a.entity,name:t.thresholdEntityAlias,aliasName:t.thresholdEntityAlias,entityAliasId:s,dataKeys:[n]},m.push(e))}},D=this,F=0,H=y.thresholds;F<H.length;F++){w(H[F])}}(null===(n=this.labelPatternsSourcesData)||void 0===n?void 0:n.length)&&this.substituteLabelPatterns(f,x)}if(this.subscribeForThresholdsAttributes(m),this.options.grid.markings=u,this.predefinedThresholds=u,this.options.colors=l,this.options.yaxes=Object(e.e)(this.yaxes),"line"!==this.chartType&&"bar"!==this.chartType&&"state"!==this.chartType||("bar"===this.chartType&&(this.subscription.timeWindowConfig.aggregation&&this.subscription.timeWindowConfig.aggregation.type===h.a.NONE?this.options.series.bars.barWidth=this.defaultBarWidth:this.options.series.bars.barWidth=.6*this.subscription.timeWindow.interval),this.options.xaxes[0].min=this.subscription.timeWindow.minTime,this.options.xaxes[0].max=this.subscription.timeWindow.maxTime,this.comparisonEnabled&&(this.options.xaxes[1].min=this.subscription.comparisonTimeWindow.minTime,this.options.xaxes[1].max=this.subscription.comparisonTimeWindow.maxTime)),this.checkMouseEvents(),this.plot&&this.plot.destroy(),"pie"===this.chartType&&this.animatedPie){this.pieDataAnimationDuration=250,this.pieData=Object(e.e)(this.subscription.data),this.pieRenderedData=[],this.pieTargetData=[];for(x=0;x<this.subscription.data.length;x++)this.pieTargetData[x]=this.subscription.data[x].data&&this.subscription.data[x].data[0]?this.subscription.data[x].data[0][1]:0;this.pieDataRendered()}this.plotInited=!0,this.createPlot()},i.prototype.update=function(){var t,i=this;if(this.updateTimeoutHandle&&(clearTimeout(this.updateTimeoutHandle),this.updateTimeoutHandle=null),this.subscription)if(!this.isMouseInteraction&&this.plot)if("line"===this.chartType||"bar"===this.chartType||"state"===this.chartType){var s=!1;if(this.yaxis){for(var e=0;e<this.subscription.data.length;e++){var o=this.subscription.data[e],n=o.yaxisIndex;this.yaxes[n].keysInfo[e].hidden!==o.dataKey.hidden&&(this.yaxes[n].keysInfo[e].hidden=o.dataKey.hidden,s=!0),(null===(t=this.labelPatternsSourcesData)||void 0===t?void 0:t.length)&&this.substituteLabelPatterns(o,e)}s&&(this.options.yaxes.length=0,this.yaxes.forEach(function(t){var s=!0;t.keysInfo.forEach(function(t){t&&(s=s&&t.hidden)}),t.hidden=s;var e=1;t.hidden||(i.options.yaxes.push(t),e=i.options.yaxes.length);for(var o=0;o<t.keysInfo.length;o++)t.keysInfo[o]&&(i.subscription.data[o].yaxis=e)}),this.options.yaxis={show:!!this.options.yaxes.length})}this.options.xaxes[0].min=this.subscription.timeWindow.minTime,this.options.xaxes[0].max=this.subscription.timeWindow.maxTime,this.comparisonEnabled&&(this.options.xaxes[1].min=this.subscription.comparisonTimeWindow.minTime,this.options.xaxes[1].max=this.subscription.comparisonTimeWindow.maxTime),"bar"===this.chartType&&(this.subscription.timeWindowConfig.aggregation&&this.subscription.timeWindowConfig.aggregation.type===h.a.NONE?this.options.series.bars.barWidth=this.defaultBarWidth:this.options.series.bars.barWidth=.6*this.subscription.timeWindow.interval),s?this.redrawPlot():(this.plot.getOptions().xaxes[0].min=this.subscription.timeWindow.minTime,this.plot.getOptions().xaxes[0].max=this.subscription.timeWindow.maxTime,this.comparisonEnabled&&(this.plot.getOptions().xaxes[1].min=this.subscription.comparisonTimeWindow.minTime,this.plot.getOptions().xaxes[1].max=this.subscription.comparisonTimeWindow.maxTime),"bar"===this.chartType&&(this.subscription.timeWindowConfig.aggregation&&this.subscription.timeWindowConfig.aggregation.type===h.a.NONE?this.plot.getOptions().series.bars.barWidth=this.defaultBarWidth:this.plot.getOptions().series.bars.barWidth=.6*this.subscription.timeWindow.interval),this.updateData())}else"pie"===this.chartType&&(this.animatedPie?this.nextPieDataAnimation(!0):this.updateData());else this.isMouseInteraction&&this.plot&&(this.updateTimeoutHandle=setTimeout(this.update.bind(this),30))},i.prototype.resize=function(){if(this.resizeTimeoutHandle&&(clearTimeout(this.resizeTimeoutHandle),this.resizeTimeoutHandle=null),this.plot&&this.plotInited){var t=this.$element.width(),i=this.$element.height();t&&i?(this.plot.resize(),"pie"!==this.chartType&&this.plot.setupGrid(),this.plot.draw()):this.resizeTimeoutHandle=setTimeout(this.resize.bind(this),30)}},i.prototype.checkMouseEvents=function(){var t=!this.ctx.isEdit;(Object(e.B)(this.mouseEventsEnabled)||this.mouseEventsEnabled!==t)&&(this.mouseEventsEnabled=t,this.$element&&(t?this.enableMouseEvents():this.disableMouseEvents(),this.redrawPlot()))},i.prototype.destroy=function(){this.cleanup(),this.tooltip&&(this.tooltip.stop(!0),this.tooltip.hide()),this.plot&&(this.plot.destroy(),this.plot=null,this.plotInited=!1)},i.prototype.cleanup=function(){this.updateTimeoutHandle&&(clearTimeout(this.updateTimeoutHandle),this.updateTimeoutHandle=null),this.createPlotTimeoutHandle&&(clearTimeout(this.createPlotTimeoutHandle),this.createPlotTimeoutHandle=null),this.resizeTimeoutHandle&&(clearTimeout(this.resizeTimeoutHandle),this.resizeTimeoutHandle=null)},i.prototype.createPlot=function(){if(this.createPlotTimeoutHandle&&(clearTimeout(this.createPlotTimeoutHandle),this.createPlotTimeoutHandle=null),this.plotInited&&!this.plot){var i=this.$element.width(),s=this.$element.height();i&&s?"pie"===this.chartType&&this.animatedPie?this.plot=t.plot(this.$element,this.pieData,this.options):this.plot=t.plot(this.$element,this.subscription.data,this.options):this.createPlotTimeoutHandle=setTimeout(this.createPlot.bind(this),30)}},i.prototype.updateData=function(){this.plot.setData(this.subscription.data),"pie"!==this.chartType&&this.plot.setupGrid(),this.plot.draw()},i.prototype.redrawPlot=function(){this.plot&&this.plotInited&&(this.plot.destroy(),this.plot=null,this.createPlot())},i.prototype.createYAxis=function(t,i){var s,o,n=Object(e.e)(this.yaxis),a=t.axisTitle&&t.axisTitle.length?t.axisTitle:n.label;s=Object(e.x)(t.axisTickDecimals)?t.axisTickDecimals:n.tickDecimals,o=Object(e.x)(t.axisTickSize)?t.axisTickSize:n.tickSize;var r=t.axisPosition&&t.axisPosition.length?t.axisPosition:"left",h=Object(e.n)(t.axisMin)?t.axisMin:n.min,l=Object(e.n)(t.axisMax)?t.axisMax:n.max;if(n.label=a,n.min=h,n.max=l,n.tickUnits=i,n.tickDecimals=s,n.tickSize=o,n.alignTicksWithAxis="right"===r&&null===o?1:null,n.position=r,n.keysInfo=[],t.axisTicksFormatter&&t.axisTicksFormatter.length)try{n.ticksFormatterFunction=new Function("value",t.axisTicksFormatter)}catch(c){n.ticksFormatterFunction=this.yaxis.ticksFormatterFunction}return n},i.prototype.subscribeForThresholdsAttributes=function(t){var i=this,s={datasources:t,useDashboardTimewindow:!1,type:o.m.latest,callbacks:{onDataUpdated:function(t){return i.thresholdsSourcesDataUpdated(t.data)}}};this.ctx.subscriptionApi.createSubscription(s,!0).subscribe(function(t){i.thresholdsSourcesSubscription=t})},i.prototype.thresholdsSourcesDataUpdated=function(t){var i=this,s=Object(e.e)(this.predefinedThresholds);t.forEach(function(t){if(t&&t.data&&t.data[0]){var o=t.data[0][1];if(Object(e.y)(o)&&isFinite(o)){var n=t.dataKey.settings,a=i.subscription.data.length+s.length;i.generateThreshold(s,n.yaxis,n.lineWidth,n.color,a,o)}}}),this.options.grid.markings=s,this.redrawPlot()},i.prototype.generateThreshold=function(t,i,s,o,n,a){var r,h={};r=1!==i?"y"+i+"axis":"yaxis",isFinite(s)&&(h.lineWidth=s),Object(e.n)(o)?h.color=o:h.color=this.utils.getMaterialColor(n),h[r]={from:a,to:a},t.filter(function(t){return Object(e.r)(t[r],h[r])}).length||t.push(h)},i.prototype.subscribeForLabelPatternsSources=function(t){var i=this,s={datasources:t,useDashboardTimewindow:!1,type:o.m.latest,callbacks:{onDataUpdated:function(t){i.labelPatternsParamsDataUpdated(t.data)}}};this.ctx.subscriptionApi.createSubscription(s,!0).subscribe(function(t){i.labelPatternsSourcesSubscription=t})},i.prototype.labelPatternsParamsDataUpdated=function(t){this.labelPatternsSourcesData=t;for(var i=0;i<this.subscription.data.length;i++){var s=this.subscription.data[i];this.substituteLabelPatterns(s,i)}this.updateData(),this.ctx.detectChanges()},i.prototype.substituteLabelPatterns=function(t,i){for(var s=this.labelPatternsSourcesData.filter(function(i){return i.datasource.entityId===t.datasource.entityId}),o=Object(e.d)(t.datasource,t.dataKey.pattern),n=0;n<s.length;n++){var a=s[n];if(a&&a.data&&a.data[0]){var r=a.data[0][1],h=a.dataKey.name;Object(e.n)(r)&&null!==r&&(o=Object(e.m)(o,h,r))}}if(Object(e.n)(this.subscription.legendData)){var l=this.subscription.legendData.keys.findIndex(function(t){return t.dataIndex===i});-1!==l&&(this.subscription.legendData.keys[l].dataKey.label=o)}t.dataKey.label=o},i.prototype.seriesInfoDiv=function(i,s,o,n,a,r,h,l){var c=t("<div></div>");c.css({display:"flex",alignItems:"center",justifyContent:"space-between"});var p=t("<span></span>");p.css({backgroundColor:s,width:"20px",height:"3px",display:"inline-block",verticalAlign:"middle",marginRight:"5px"}),c.append(p);var d,u=t("<span>"+i+":</span>");u.css({marginRight:"10px"}),r&&u.css({color:"#FFF",fontWeight:"700"}),c.append(u),d=l?l(o):this.ctx.utils.formatValue(o,a,n),Object(e.x)(h)&&(d+=" ("+Math.round(h)+" %)");var m=t("<span>"+d+"</span>");return m.css({marginLeft:"auto",fontWeight:"700"}),r&&m.css({color:"#FFF"}),c.append(m),c},i.prototype.seriesInfoDivFromInfo=function(t,i){var s=t.units&&t.units.length?t.units:this.trackUnits,o=Object(e.o)(t.decimals)?t.decimals:this.trackDecimals;return this.seriesInfoDiv(t.label,t.color,t.value,s,o,t.index===i,null,t.tooltipValueFormatFunction).prop("outerHTML")},i.prototype.createTooltipElement=function(){var i=t('<div id="flot-series-tooltip" class="flot-mouse-value"></div>');return i.css({fontSize:"12px",fontFamily:"Roboto",fontWeight:"300",lineHeight:"18px",opacity:"1",backgroundColor:"rgba(0,0,0,0.7)",color:"#D9DADB",position:"absolute",display:"none",zIndex:"1100",padding:"4px 10px",borderRadius:"4px"}).appendTo("body"),i},i.prototype.formatPieTooltip=function(t){var i=t.series.dataKey.units&&t.series.dataKey.units.length?t.series.dataKey.units:this.trackUnits,s=Object(e.o)(t.series.dataKey.decimals)?t.series.dataKey.decimals:this.trackDecimals;return this.seriesInfoDiv(t.series.dataKey.label,t.series.dataKey.color,t.datapoint[1][0][1],i,s,!0,t.series.percent,t.series.dataKey.tooltipValueFormatFunction).prop("outerHTML")},i.prototype.formatChartTooltip=function(i,s){var o=this,n="";if(this.tooltipIndividual){var a=(i[1]&&i[1].seriesHover.length?i[0].seriesHover.concat(i[1].seriesHover):i[0].seriesHover).filter(function(t){return t.index===s});if(a&&a.length){var r=parseInt(a[0].time,10),h=d(r).format("YYYY-MM-DD HH:mm:ss"),l=t("<div>"+h+"</div>");l.css({display:"flex",alignItems:"center",justifyContent:"center",padding:"4px",fontWeight:"700"}),n+=l.prop("outerHTML"),n+=this.seriesInfoDivFromInfo(a[0],s)}}else{var c;c=i[1]&&i[1].seriesHover.length?5:15;var p=0;p=i[1]&&i[1].seriesHover.length>i[0].seriesHover.length?Math.ceil(i[1].seriesHover.length/c):Math.ceil(i[0].seriesHover.length/c),i.forEach(function(i){if(Object(e.x)(i.time)){var a="",r=parseInt(i.time,10),h=d(r).format("YYYY-MM-DD HH:mm:ss"),l=t("<div>"+h+"</div>");l.css({display:"flex",alignItems:"center",justifyContent:"center",padding:"4px",fontWeight:"700"}),n+=l.prop("outerHTML");var u=t("<div></div>");u.css({display:"flex",flexDirection:"row"});for(var m=0;m<p;m++){var b=t("<div></div>");b.css({display:"flex",flexDirection:"column",flex:"1"});for(var g="",x=m*c;x<(m+1)*c&&!(x>=i.seriesHover.length);x++){var f=i.seriesHover[x];g+=o.seriesInfoDivFromInfo(f,s)}b.html(g),g&&(m>0&&(a+='<span style="min-width: 20px;"></span>'),a+=b.prop("outerHTML"))}u.html(a),n+=u.prop("outerHTML")}})}return n},i.prototype.formatYAxisTicks=function(t,i){if(this.settings.yaxis&&!1===this.settings.yaxis.showLabels)return"";if(i.options.ticksFormatterFunction)return i.options.ticksFormatterFunction(t);var s=i.options.tickDecimals?Math.pow(10,i.options.tickDecimals):1,o=""+Math.round(t*s)/s;if(Object(e.n)(i.options.tickDecimals)&&null!==i.options.tickDecimals){var n=o.indexOf("."),a=-1===n?0:o.length-n-1;a<i.options.tickDecimals&&(o=(a?o:o+".")+(""+s).substr(1,i.options.tickDecimals-a))}return i.options.tickUnits&&(o+=" "+i.options.tickUnits),o},i.prototype.enableMouseEvents=function(){this.$element.css("pointer-events",""),this.$element.addClass("mouse-events"),this.options.selection={mode:"x"},this.$element.bind("plothover",this.flotHoverHandler),this.$element.bind("plotselected",this.flotSelectHandler),this.$element.bind("dblclick",this.dblclickHandler),this.$element.bind("mousedown",this.mousedownHandler),this.$element.bind("mouseup",this.mouseupHandler),this.$element.bind("mouseleave",this.mouseleaveHandler),this.$element.bind("plotclick",this.flotClickHandler)},i.prototype.disableMouseEvents=function(){this.$element.css("pointer-events","none"),this.$element.removeClass("mouse-events"),this.options.selection={mode:null},this.$element.unbind("plothover",this.flotHoverHandler),this.$element.unbind("plotselected",this.flotSelectHandler),this.$element.unbind("dblclick",this.dblclickHandler),this.$element.unbind("mousedown",this.mousedownHandler),this.$element.unbind("mouseup",this.mouseupHandler),this.$element.unbind("mouseleave",this.mouseleaveHandler),this.$element.unbind("plotclick",this.flotClickHandler)},i.prototype.onFlotHover=function(i,s,o){var n=this;if(this.plot&&this.tooltip)if(this.tooltipIndividual&&!o||this.ctx.isEdit)this.tooltip.stop(!0),this.tooltip.hide(),this.plot.unhighlight();else{var a=!this.tooltipIndividual;a&&this.plot.unhighlight();var r=s.pageX,h=s.pageY,l=void 0,c=void 0;if("pie"===this.chartType?l=this.formatPieTooltip(o):(c=this.getHoverInfo(this.plot.getData(),s),(Object(e.x)(c[0].time)||c[1]&&Object(e.x)(c[1].time))&&(c[0].seriesHover.sort(function(t,i){return i.value-t.value}),c[1]&&c[1].seriesHover.length&&c[1].seriesHover.sort(function(t,i){return i.value-t.value}),console.log("Hover info: ",c),l=this.formatChartTooltip(c,o?o.seriesIndex:-1))),l){this.tooltip.html(l).css({top:0,left:0}).fadeIn(200);var p=t(window).width(),d=t(window).height(),u=this.tooltip.width(),m=this.tooltip.height(),b=r+5,g=h+5;p-r<u+50&&(b=r-u-10),d-h<m+20&&(g=h-m-10),this.tooltip.css({top:g,left:b}),a&&c.forEach(function(t){t.seriesHover.forEach(function(t){n.plot.highlight(t.index,t.hoverIndex)})})}}},i.prototype.onFlotSelect=function(t,i){this.plot&&(this.plot.clearSelection(),this.subscription.onUpdateTimewindow(i.xaxis.from,i.xaxis.to))},i.prototype.onFlotDblClick=function(){this.subscription.onResetTimewindow()},i.prototype.onFlotMouseDown=function(){this.isMouseInteraction=!0},i.prototype.onFlotMouseUp=function(){this.isMouseInteraction=!1},i.prototype.onFlotMouseLeave=function(){this.tooltip&&(this.tooltip.stop(!0),this.tooltip.hide(),this.plot&&this.plot.unhighlight(),this.isMouseInteraction=!1)},i.prototype.onFlotClick=function(t,i,s){this.plot&&this.onPieSliceClick(t,s)},i.prototype.getHoverInfo=function(t,i){var s,e,o,n,a,r,h,l,c,p;console.log("seriesList: ",t);var d,u=0,m=0,b=[{seriesHover:[]}];for(this.comparisonEnabled&&b.push({seriesHover:[]}),"bar"===this.chartType&&"left"!==this.options.series.bars.align&&(m="center"===this.options.series.bars.align?this.options.series.bars.barWidth/2:this.options.series.bars.barWidth),s=0;s<t.length;s++){var g=void 0;g=(e=t[s]).datasource.isAdditional?i.x2:i.x,g+=m,o=this.findHoverIndexFromData(g,e),e.data[o]&&e.data[o][0]&&(n=g-e.data[o][0],r=e.data[o][0],e.datasource.isAdditional?(!d||n>=0&&(n<d||d<0)||n<0&&n>d)&&(d=n,l=r):(!a||n>=0&&(n<a||a<0)||n<0&&n>a)&&(a=n,h=r),p=e.stack?this.tooltipIndividual||!this.tooltipCumulative?e.data[o][1]:u+=e.data[o][1]:e.data[o][1],(e.stack||e.curvedLines&&e.curvedLines.apply)&&(o=this.findHoverIndexFromDataPoints(g,e,o)),this.hideZeros&&!p||(c={value:p,hoverIndex:o,color:e.dataKey.color,label:e.dataKey.label,units:e.dataKey.units,decimals:e.dataKey.decimals,tooltipValueFormatFunction:e.dataKey.tooltipValueFormatFunction,time:r,distance:n,index:s},e.datasource.isAdditional?b[1].seriesHover.push(c):b[0].seriesHover.push(c)))}return b[1]&&b[1].seriesHover.length&&(b[1].time=l),b[0].time=h,b},i.prototype.findHoverIndexFromData=function(t,i){for(var s,e=0,o=i.data.length-1;;){if(e>o)return Math.max(o,0);if(s=Math.floor((e+o)/2),i.data[s][0]===t)return s;i.data[s][0]<t?e=s+1:o=s-1}},i.prototype.findHoverIndexFromDataPoints=function(t,i,s){var e,o=i.datapoints.pointsize,n=s*o,a=i.datapoints.points.length;for(e=n;e<a;e+=o)if(!i.lines.steps&&null!=i.datapoints.points[n]&&null==i.datapoints.points[e]||i.datapoints.points[e]>t)return Math.max(e-o,0)/o;return e/o-1},i.prototype.pieDataRendered=function(){for(var t=0;t<this.pieTargetData.length;t++){var i=this.pieTargetData[t]?this.pieTargetData[t]:0;this.pieRenderedData[t]=i,this.pieData[t].data[0]||(this.pieData[t].data[0]=[0,0]),this.pieData[t].data[0][1]=i}},i.prototype.nextPieDataAnimation=function(t){if(t){this.finishPieDataAnimation(),this.pieAnimationStartTime=this.pieAnimationLastTime=Date.now();for(var i=0;i<this.subscription.data.length;i++)this.pieTargetData[i]=this.subscription.data[i].data&&this.subscription.data[i].data[0]?this.subscription.data[i].data[0][1]:0}this.pieAnimationCaf&&(this.pieAnimationCaf(),this.pieAnimationCaf=null),this.pieAnimationCaf=this.ctx.$scope.raf.raf(this.onPieDataAnimation.bind(this))},i.prototype.onPieDataAnimation=function(){var t=Date.now(),i=t-this.pieAnimationLastTime,s=(t-this.pieAnimationStartTime)/this.pieDataAnimationDuration;if(s>=1)this.finishPieDataAnimation();else{if(i>=40){for(var e=0;e<this.pieTargetData.length;e++){var o=this.pieRenderedData[e],n=o+(this.pieTargetData[e]-o)*s;this.pieData[e].data[0]||(this.pieData[e].data[0]=[0,0]),this.pieData[e].data[0][1]=n}console.log("this.pieData: ",this.pieData),this.plot.setData(this.pieData),this.plot.draw(),this.pieAnimationLastTime=t}this.nextPieDataAnimation(!1)}},i.prototype.finishPieDataAnimation=function(){this.pieDataRendered(),this.plot.setData(this.pieData),this.plot.draw()},i.prototype.onPieSliceClick=function(t,i){var s=this.ctx.actionsApi.getActionDescriptors("sliceClick");if(t&&s.length){t.stopPropagation();var e=this.ctx.actionsApi.getActiveEntityInfo(),o=e?e.entityId:null,n=e?e.entityName:null,a=e?e.entityLabel:null;this.ctx.actionsApi.handleWidgetAction(t,s[0],o,n,i,a)}},i}()}).call(this,s("xexB"))}}]);