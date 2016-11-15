var socket = io();

var app = new Vue({
  el: '#app',
  data: {
    messageInput: '',
    messages: [],
    availability: 'Available',
  },
  methods: {
    sendMsg: function() {
      socket.emit('chat message', this.messageInput);
      this.messageInput = '';
    },
    notifyMe: function(msg) {
      var msg = 'Qowala: ' + msg;
      // Let's check if the browser supports notifications
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }

      // Let's check whether notification permissions have already been granted
      else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(msg);
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(msg);
          }
        });
      }

      // At last, if the user has denied notifications, and you
      // want to be respectful there is no need to bother them any more.
    }
  },
  created: function() {
    socket.on('reload page', function(){
      document.location.reload(true);
    }.bind(this));
    socket.on('chat message', function(msg){
      this.messages.push(msg);

      // Send notification only if user available
      if (this.availability === 'Available') {
        this.notifyMe(msg);
      }
    }.bind(this));
  }
})
