$(document).ready(function() {

  // subscribe to new posts
  io.socket.get('/newposts', function respond(body, response) {
      console.log(response)

    if(response){
      // success
    }
  });

  // respond to new posts
  io.socket.on('a_new_post', function received (post_id) {


    $.post('/details', {postid: post_id}, function(thot) {
      var tho = thot;

      var tho_span = $(document.createElement('span')).attr('id', tho.id).addClass('bl b_purple square bord_white white left');

      var tho_row_name = $(document.createElement('span')).addClass('W96 left bl b_black P2 white');
      
      if(tho.friend) {
        tho_row_name.text( tho.friend.name );
      } else if(tho.mine) {
       tho_row_name.text( 'Me' );
      }

      var tho_row_body = $(document.createElement('span')).addClass('W96 left bl black P2 b_white');
      tho_row_body.text( tho.body );

      var tho_row_buttons = $(document.createElement('span')).addClass('W96 left bl P2');
        
        if(!tho.mine){
          
          var plus_button = $(document.createElement('button')).addClass('plus');
          var minus_button = $(document.createElement('button')).addClass('minus');
          var request_button = $(document.createElement('button')).addClass('request');  
          
          tho_row_buttons.append( plus_button );
          tho_row_buttons.append( minus_button );
          tho_row_buttons.append( request_button );

        }

        var rating = $(document.createElement('span')).addClass('rating').text(tho.rating);
        tho_row_buttons.append(rating);

      var tho_row_date = $(document.createElement('span')).addClass('F10 W96 left bl P2');
      tho_row_date.text( tho.datestring );

      tho_span.append( tho_row_name );  
      tho_span.append( tho_row_body );  
      tho_span.append( tho_row_buttons );  
      tho_span.append( tho_row_date ); 

      $('#message_cont').append(tho_span); 
    });
    
  });


  // button ajax
  $('.plus, .minus, .request').click(function() {
    var dis = $(this);
    dis.addClass('b_red');
    if( dis.hasClass('request') ) {
      
      $.post('/request', { id: dis.parent().parent().attr('id'),  }, function(err, resp) {
        console.log(resp)
        dis.removeClass('b_red').addClass('b_green');
      });

      return;
    } else if(dis.hasClass('plus')) {
      var val = 1;
    } else if(dis.hasClass('minus')){
      var val = -1;
    }
    $.post('/rating', { id: dis.parent().parent().attr('id'), val: val }, function(err, resp) {
      console.log(resp)
      dis.removeClass('b_red').addClass('b_green');
    });
  });
});