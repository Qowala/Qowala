<template>
  <div>
    <ul id="conversations">
      <li v-for="conversation in conversations">
        <router-link :to="{ name: 'conversation', params: { conversationID: conversation.threadID , conversationName: conversation.name}}">
          {{ conversation.name }}
          <template v-if="conversation.imageSrc">
            <img v-bind:src="conversation.imageSrc" width="30px"/>
          </template>
          <!-- Temporary placeholder if conversation has no image -->
          <template v-else>
            <div style="width: 30px; height: 30px; display: inline-block; background-color: gray;"></div>
          </template>
          {{ conversation.snippet }}
          <!-- Display images in snippet if there are some -->
          <template v-for="attachment in conversation.snippetAttachments">
            <template v-if="attachment.attach_type === 'photo'">
              <img v-bind:src="attachment.thumbnail_url"/>
            </template>
            <template v-else>
              <img v-bind:src="attachment.url"/>
            </template>
          </template>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'conversations-list',
  data() {
    return {
      conversations: [],
    };
  },
  beforeMount: function() {
    const payload = {
      token: localStorage.getItem('qowala-token'),
    };
    this.$socket.emit('get/conversations', payload);
  },
  methods: {
    sendMsg: function sendMsg() {
			const payload = {
				token: localStorage.getItem('qowala-token'),
				msg: this.messageInput
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
		'return/threadlist': function (threadList) {
      console.log('received thread list: ', threadList);
      this.conversations = threadList;
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
