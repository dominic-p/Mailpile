Mailpile.render_thread_message = function(mid) {
  $.ajax({
    url			 : Mailpile.api.message + mid + "/single.jhtml",
    type		 : 'GET',
    dataType : 'json',
    success  : function(response) {
      if (response.result) {
        $('#snippet-' + mid).replaceWith(response.result);
        Mailpile.thread_initialize_tooltips();
      }
    },
    error: function() {
      Mailpile.notification({status: 'error', message: 'Could not retrieve message'});
    }
  });
};


Mailpile.thread_scroll_to_message = function() {

  var thread_id = _.keys(Mailpile.instance.messages)[0];
  var msg_top_pos = $('#message-' + thread_id).position().top + 1;
  $('#content-view').scrollTop(msg_top_pos - 150);

  setTimeout(function(){
    $('#content-view').animate({ scrollTop: msg_top_pos }, 350);
  }, 50);
};


Mailpile.thread_analyze_message = function(mid) {

  // Get Email
  var email = $('#message-' + mid).find('.thread-item-text').html();

  // Check & Extract Inline PGP Key
  var check_inline_pgp_key = email.split('-----BEGIN PGP PUBLIC KEY BLOCK-----');
  if (check_inline_pgp_key) {
    var pgp_key = '-----BEGIN PGP PUBLIC KEY BLOCK-----' + check_inline_pgp_key.slice(1).join().split('-----END PGP PUBLIC KEY BLOCK-----')[0];
    pgp_key += '-----END PGP PUBLIC KEY BLOCK-----';

    // Make HTML5 download href
    var pgp_href = 'data:application/pgp-keys;charset=ascii,' + encodeURIComponent(pgp_key.replace(/<\/?[^>]+(>|$)/g, ''));

    // Replace Text
    var key_template = _.template($('#template-messsage-inline-pgp-key-import').html());
    var name = Mailpile.instance.metadata[mid].from.fn;
    var import_key_html = key_template({ pgp_key: pgp_key, pgp_href: pgp_href, mid: mid, name: name });
    var new_email = email.replace(pgp_key, import_key_html);
    $('#message-' + mid).find('.thread-item-text').html(new_email);
  }
};


/* Thread - iframe styling */
Mailpile.thread_html_iframe = function(element) {
  var new_iframe_height = $(element).contents().height();
  $('.thread-item-html').height(new_iframe_height);
  $(element).contents().find('body div').addClass('thread-item-html-text');
};


/* Thread - Show People In Conversation */
$(document).on('click', '.show-thread-people', function() {
 $('#modal-full .modal-title').html($('#thread-people').data('modal_title'));
 $('#modal-full .modal-body').html($('#thread-people').html());
 $('#modal-full').modal(Mailpile.UI.ModalOptions);
});


/* Thread - Show Tags In Converstation */
$(document).on('click', '.show-thread-tags', function() {
 $('#modal-full .modal-title').html($('#thread-tags').data('modal_title'));
 $('#modal-full .modal-body').html($('#thread-tags').html());
 $('#modal-full').modal(Mailpile.UI.ModalOptions);
});


/* Thread - Show Security */
$(document).on('click', '.show-thread-security', function() {
  alert('FIXME: Show details about security of thread');
});


/* Thread - Show Metadata Info */
$(document).on('click', '.thread-message-metadata-details-toggle', function() {
  var mid = $(this).data('mid');
  var target = '#metadata-details-' + mid;
  if ($(target).css('display') === 'none') {
    $(target).show('fast').addClass('border-bottom');
    $(this).css('color', '#4d4d4d');
  }
  else {
    $(target).hide('fast').removeClass('border-bottom');
    $(this).css('color', '#ccc');
  }
});


/* Thread - Expand Snippet */
$(document).on('click', 'div.thread-snippet', function(e) {  
  var mid = $(this).data('mid');
  if (e.target.href === undefined && $(e.target).data('expand') !== 'no' && $(e.target).hasClass('show-thread-message-metadata-details') === false) {
    Mailpile.render_thread_message(mid);
  }
});


/* Thread - Message Quote */
$(document).on('click', '.thread-message-actions-quote', function() {
  var mid = $(this).parent().parent().data('mid');
  $('#message-' + mid).find('.thread-item-quote').removeClass('hide');
  $('#message-' + mid).find('.thread-item-signature').removeClass('hide');
  $(this).parent().hide();
});


/* Thread - Might Move to Global Location / Abstraction */
$(document).on('click', '.dropdown-toggle', function() {
  $(this).find('.icon-arrow-right').removeClass('icon-arrow-right').addClass('icon-arrow-down');
});


/* Search - Dragging items from a Thread to Sidebar */
$('div.thread-draggable').draggable({
  containment: "#container",
  appendTo: 'body',
  cursor: 'move',
  scroll: false,
  revert: false,
  opacity: 1,
  helper: function(event) {
    return $('<div class="pile-results-drag ui-widget-header"><span class="icon-message"></span> Moving Thread</div>');
  },
  start: function(event, ui) {

    // Add Draggable MID
    var mid = location.href.split("thread/=")[1].split("/")[0];
    Mailpile.bulk_cache_add('messages_cache', mid);

    // Update Bulk UI
  	// Style & Select Checkbox
  },
  stop: function(event, ui) {}
});


/* Thread Tooltips */
$(document).ready(function() {

  // Thread Scroll to Message
  if (location.href.split("thread/=")[1]) {

    // Scroll to Message
    Mailpile.thread_scroll_to_message();
    
    // Show Tooltips
    Mailpile.thread_initialize_tooltips();
  }
});