'use strict';{let a={};(window.translate=function(b){if(b+="",b in a){b=a[b].split("%s");for(var c=1;c<b.length;c++)b[c]=c in arguments?arguments[c]+""+b[c]:"?"+b[c];return b.join("")}if(1<arguments.length){b+="(";for(var c=1;c<arguments.length;c++)b+=arguments[c]+",";b=b.substring(0,b.length-1)+")"}return b}).register=function(b){var c,d=0;for(c in b)d+=c in a,a[c]=b[c]+"";return d}}