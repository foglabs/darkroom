$(document).ready(function() {

  $('.accept').click(function() {
    $.post('/accept', {id: $(this).attr('id') }, function(err, res) {
      return;
    });
  });

});