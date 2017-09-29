$(document).ready(function() {

  $('.accept').click(function() {
    $.post('/accept', {id: $(this).parent().attr('id') }, function(err, res) {
      return;
    });
  });

});