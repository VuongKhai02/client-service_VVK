(window.webpackJsonp=window.webpackJsonp||[]).push([[52],{"53JH":function(e,t){!function(e){function t(e,t){return t*Math.floor(e/t)}function n(t,n,r,i){if(e.isFunction(t.strftime))return t.strftime(n);var a,o,s=function(e,t){return t=""+(null==t?"0":t),1===(e=""+e).length?t+e:e},u=[],c=!1,m=t.getHours(),l=m<12;null==r&&(r=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]),null==i&&(i=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]),o=m>12?m-12:0===m?12:m;for(var h=0;h<n.length;++h)if(a=n.charAt(h),c){switch(a){case"a":a=""+i[t.getDay()];break;case"b":a=""+r[t.getMonth()];break;case"d":a=s(t.getDate());break;case"e":a=s(t.getDate()," ");break;case"h":case"H":a=s(m);break;case"I":a=s(o);break;case"l":a=s(o," ");break;case"m":a=s(t.getMonth()+1);break;case"M":a=s(t.getMinutes());break;case"q":a=""+(Math.floor(t.getMonth()/3)+1);break;case"S":a=s(t.getSeconds());break;case"y":a=s(t.getFullYear()%100);break;case"Y":a=""+t.getFullYear();break;case"p":a=l?"am":"pm";break;case"P":a=l?"AM":"PM";break;case"w":a=""+t.getDay()}u.push(a),c=!1}else"%"===a?c=!0:u.push(a);return u.join("")}function r(e){function t(e,t,n,r){e[t]=function(){return n[r].apply(n,arguments)}}var n={date:e};void 0!==e.strftime&&t(n,"strftime",e,"strftime"),t(n,"getTime",e,"getTime"),t(n,"setTime",e,"setTime");for(var r=["Date","Day","FullYear","Hours","Milliseconds","Minutes","Month","Seconds"],i=0;i<r.length;i++)t(n,"get"+r[i],e,"getUTC"+r[i]),t(n,"set"+r[i],e,"setUTC"+r[i]);return n}function i(e,t){if("browser"===t.timezone)return new Date(e);if(t.timezone&&"utc"!==t.timezone){if("undefined"!=typeof timezoneJS&&void 0!==timezoneJS.Date){var n=new timezoneJS.Date;return n.setTimezone(t.timezone),n.setTime(e),n}return r(new Date(e))}return r(new Date(e))}var a={second:1e3,minute:6e4,hour:36e5,day:864e5,month:2592e6,quarter:7776e6,year:525949.2*60*1e3},o=[[1,"second"],[2,"second"],[5,"second"],[10,"second"],[30,"second"],[1,"minute"],[2,"minute"],[5,"minute"],[10,"minute"],[30,"minute"],[1,"hour"],[2,"hour"],[4,"hour"],[8,"hour"],[12,"hour"],[1,"day"],[2,"day"],[3,"day"],[.25,"month"],[.5,"month"],[1,"month"],[2,"month"]],s=o.concat([[3,"month"],[6,"month"],[1,"year"]]),u=o.concat([[1,"quarter"],[2,"quarter"],[1,"year"]]);e.plot.plugins.push({init:function(r){r.hooks.processOptions.push(function(r){e.each(r.getAxes(),function(e,r){var o=r.options;"time"===o.mode&&(r.tickGenerator=function(e){var n=[],r=i(e.min,o),c=0,m=o.tickSize&&"quarter"===o.tickSize[1]||o.minTickSize&&"quarter"===o.minTickSize[1]?u:s;null!=o.minTickSize&&(c="number"==typeof o.tickSize?o.tickSize:o.minTickSize[0]*a[o.minTickSize[1]]);for(var l=0;l<m.length-1&&!(e.delta<(m[l][0]*a[m[l][1]]+m[l+1][0]*a[m[l+1][1]])/2&&m[l][0]*a[m[l][1]]>=c);++l);var h=m[l][0],k=m[l][1];if("year"===k){if(null!=o.minTickSize&&"year"===o.minTickSize[1])h=Math.floor(o.minTickSize[0]);else{var f=Math.pow(10,Math.floor(Math.log(e.delta/a.year)/Math.LN10)),d=e.delta/a.year/f;h=d<1.5?1:d<3?2:d<7.5?5:10,h*=f}h<1&&(h=1)}e.tickSize=o.tickSize||[h,k];var M=e.tickSize[0];k=e.tickSize[1];var g=M*a[k];"second"===k?r.setSeconds(t(r.getSeconds(),M)):"minute"===k?r.setMinutes(t(r.getMinutes(),M)):"hour"===k?r.setHours(t(r.getHours(),M)):"month"===k?r.setMonth(t(r.getMonth(),M)):"quarter"===k?r.setMonth(3*t(r.getMonth()/3,M)):"year"===k&&r.setFullYear(t(r.getFullYear(),M)),r.setMilliseconds(0),g>=a.minute&&r.setSeconds(0),g>=a.hour&&r.setMinutes(0),g>=a.day&&r.setHours(0),g>=4*a.day&&r.setDate(1),g>=2*a.month&&r.setMonth(t(r.getMonth(),3)),g>=2*a.quarter&&r.setMonth(t(r.getMonth(),6)),g>=a.year&&r.setMonth(0);var S,y=0,p=Number.NaN;do{if(S=p,p=r.getTime(),n.push(p),"month"===k||"quarter"===k)if(M<1){r.setDate(1);var z=r.getTime();r.setMonth(r.getMonth()+("quarter"===k?3:1));var b=r.getTime();r.setTime(p+y*a.hour+(b-z)*M),y=r.getHours(),r.setHours(0)}else r.setMonth(r.getMonth()+M*("quarter"===k?3:1));else"year"===k?r.setFullYear(r.getFullYear()+M):r.setTime(p+g)}while(p<e.max&&p!==S);return n},r.tickFormatter=function(e,t){var r=i(e,t.options);if(null!=o.timeformat)return n(r,o.timeformat,o.monthNames,o.dayNames);var s=t.options.tickSize&&"quarter"===t.options.tickSize[1]||t.options.minTickSize&&"quarter"===t.options.minTickSize[1],u=t.tickSize[0]*a[t.tickSize[1]],c=t.max-t.min,m=o.twelveHourClock?" %p":"",l=o.twelveHourClock?"%I":"%H";return n(r,u<a.minute?l+":%M:%S"+m:u<a.day?c<2*a.day?l+":%M"+m:"%b %d "+l+":%M"+m:u<a.month?"%b %d":s&&u<a.quarter||!s&&u<a.year?c<a.year?"%b":"%b %Y":s&&u<a.year?c<a.year?"Q%q":"Q%q %Y":"%Y",o.monthNames,o.dayNames)})})})},options:{xaxis:{timezone:null,timeformat:null,twelveHourClock:!1,monthNames:null}},name:"time",version:"1.0"}),e.plot.formatDate=n}(jQuery)}}]);