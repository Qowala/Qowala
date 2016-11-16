<template>
  <div>
    <form action="" v-on:submit.prevent="sendCredentials">
      <input type="text" name="email" placeholder="Email" v-model="email" />
      <input type="password" name="password" v-model="password"/>
      <input id="submit" type="submit" />
    </form>
    <div v-if="loading">Login...</div>
    <div v-if="failed">Login failed!</div>
  </div>
</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      failed: false
    };
  },
  methods: {
    sendCredentials: function() {
      const credentials = {
        email: this.email,
        password: this.password
      };
      this.$socket.emit('login', credentials);
      this.failed = false;
      this.loading = true;
      this.email = '';
      this.password = '';
    }
  },
  sockets: {
    'login ok': function (token) {
      this.loading = false;
			localStorage.setItem('qowala-token', token);
      console.log('redirecting to conversation');
      this.$router.push('/conversation');
    },
    'login failed': function () {
      this.loading = false;
      this.failed = true;
      console.log('Login failed! ');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
