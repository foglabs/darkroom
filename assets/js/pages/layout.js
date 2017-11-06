$(document).ready(function() {

  $('#submit').click(function(){
    var txt = $('#creation').val();
    $.post('/say',{bo: txt},function(response){
      $('#creation').val('');
    });
  });
  
  $('#creation').keypress(function(e){
      if(e.which == 13){
          $('#submit').click();
      }
  });


});