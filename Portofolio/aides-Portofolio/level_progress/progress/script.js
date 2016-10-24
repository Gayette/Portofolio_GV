var prog  = $('.progress-auto')
var value = prog.data('value')
var title = prog.data('title')
prog.append("<div class='progress-circle-value progress-value-"+value+"'></div>");
prog.append("<div class='progress-circle-label-value'>"+ value +"%</div>");
prog.append("<div class='progress-circle-label-title'>"+ title +"</div>");