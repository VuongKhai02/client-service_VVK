(window.webpackJsonp=window.webpackJsonp||[]).push([[59],{"0mCz":function(e,t,n){"use strict";n.r(t),n.d(t,"TbAnalogueRadialGauge",function(){return s});var r=n("mrSG"),l=n("rxPF"),i=n("r6Bh"),c=n("//Q6");var a,o=l.RadialGauge,u=((a=Object(c.e)(i.c)).schema.properties=Object(r.a)(Object(r.a)({},a.schema.properties),{startAngle:{title:"Start ticks angle",type:"number",default:45},ticksAngle:{title:"Ticks angle",type:"number",default:270},needleCircleSize:{title:"Needle circle size",type:"number",default:10}}),a.form.unshift("startAngle","ticksAngle","needleCircleSize"),a),s=function(e){function t(t,n){return e.call(this,t,n)||this}return Object(r.d)(t,e),Object.defineProperty(t,"settingsSchema",{get:function(){return u},enumerable:!1,configurable:!0}),t.prototype.prepareGaugeOptions=function(e,t){t.ticksAngle=e.ticksAngle||270,t.startAngle=e.startAngle||45,t.colorNeedleCircleOuter="#f0f0f0",t.colorNeedleCircleOuterEnd="#ccc",t.colorNeedleCircleInner="#e8e8e8",t.colorNeedleCircleInnerEnd="#f5f5f5",t.needleCircleSize=e.needleCircleSize||10,t.needleCircleInner=!0,t.needleCircleOuter=!0,t.animationTarget="needle"},t.prototype.createGauge=function(e){return new o(e)},t}(i.a)}}]);