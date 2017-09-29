$(document).ready(function() {
  $('.plus, .minus, .request').click(function() {
    var dis = $(this);

    if( dis.hasClass('request') ) {
      
      $.post('/request', { id: dis.parent().parent().attr('id'),  }, function(err, resp) {
        console.log(resp)
      });

      return;
    } else if(dis.hasClass('plus')) {
      var val = 1;
    } else if(dis.hasClass('minus')){
      var val = -1;
    }

    $.post('/rating', { id: dis.parent().parent().attr('id'), val: val }, function(err, resp) {
      console.log(resp)
    });
  });
});