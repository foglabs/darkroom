$(document).ready(function() {
  $('.del').click(function() {
    $.post('/noinvite', {inv_id: $(this).attr('id')}, function(err, res) {
      window.location.reload();
    });
  });
});