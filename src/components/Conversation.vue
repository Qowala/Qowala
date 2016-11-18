<template>
  <div>
    <div style="height: 30px; background-color: green; color: white; padding: 5px;">
      {{ this.$route.params.conversationName }}
    </div>
    <ul id="messages">
      <li v-for="message in messages">
        [{{ message.timestampDatetime }}] {{ message.senderName }}: {{ message.body }}
        <template v-for="attachment in message.attachments">
          <template v-if="attachment.type === 'sticker'">
            <img v-bind:src="attachment.url"  v-bind:width="attachment.width"/>
          </template>
          <template v-if="attachment.type === 'photo' || attachment.type === 'animated_image'">
            <a v-bind:href="attachment.previewUrl">
              <img v-bind:src="attachment.thumbnailUrl" v-bind:alt="attachment.name"/>
            </a>
          </template>
          <template v-if="attachment.type === 'video'">
            <video v-bind:src="attachment.url" width="150px" controls/></video>
          </template>
          <template v-else>
            <img v-bind:src="attachment.image" v-bind:alt="attachment.title" width="150px"/>
          </template>
        </template>
      </li>
    </ul>
    <form action="" v-on:submit.prevent="sendMsg">
      <input v-model="messageInput" autocomplete="off" />
      <select id="availability" v-model="availability">
        <option id="available">Available</option>
        <option id="unavailable">Unavailable</option>
      </select>
      <button>Send</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'conversation',
  data() {
    return {
      messageInput: '',
      messages: [],
      availability: 'Available',
    };
  },
  created: function () {
    // Set messages from cache
    const history = JSON.parse(localStorage.getItem('conversations-history'));
    if (history && history[this.$route.params.conversationID]) {
      this.messages = history[this.$route.params.conversationID];
    }

    const payload = {
      token: localStorage.getItem('qowala-token'),
      conversationID: this.$route.params.conversationID
    };
    this.$socket.emit('get/conversationHistory', payload);
  },
  methods: {
    sendMsg: function sendMsg() {
			const payload = {
				token: localStorage.getItem('qowala-token'),
				msg: this.messageInput,
        conversationID: this.$route.params.conversationID
			};
      this.$socket.emit('chat message', payload);
      this.messageInput = '';
    },
    notifyMe: function notifyMe(msg) {
      const notifMsg = 'Qowala: ' + msg;
      // Let's check whether notification permissions have already been granted
      if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(notifMsg);
      }

      // Otherwise, we need to ask the user for permission
      else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function requestPermission (permission) {
          // If the user accepts, let's create a notification
          if (permission === "granted") {
            var notification = new Notification(notifMsg);
          }
        });
      }

      // At last, if the user has denied notifications, and you
      // want to be respectful there is no need to bother them any more.
    }
  },
	sockets: {
		'return/threadHistory': function (threadHistory) {
      this.messages = threadHistory;
      // Set history in localStorage as cache
      var history = JSON.parse(localStorage.getItem('conversations-history')) || {};
      history[this.$route.params.conversationID] = this.messages;
      localStorage.setItem('conversations-history', JSON.stringify(history));
		},
		'chat message': function (msg) {
      if (msg.conversationID === this.$route.params.conversationID){
        this.messages.push(msg);
      }

			// Send notification only if user available
			if (this.availability === 'Available') {
				this.notifyMe(msg.body);
			}
		},
    'need auth': function () {
      console.log('redirecting to login');
      this.$router.push('/login');
    },
	},
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
form { background: #000; padding: 3px; position: fixed; bottom: 0; width: 100%; }
form input { border: 0; padding: 10px; width: 80%; margin-right: .5%; }
form select { width: 9%; margin-right: .5%; }
form button { width: 9%; background: rgb(130, 224, 255); border: none; padding: 10px; }
#messages { list-style-type: none; margin: 0; padding: 0; }
#messages li { padding: 5px 10px; }
#messages li:nth-child(odd) { background: #eee; }
</style>
