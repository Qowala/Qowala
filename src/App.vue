<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app',
	sockets: {
		'err': function(err) {
			console.log('An error occured: ', err);
		}
	}
};
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font: 13px Helvetica, Arial; }
</style>
