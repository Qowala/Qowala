import Vue from 'vue';
import Login from 'src/components/Login';

describe('Login.vue', () => {
  it('should render correct contents', () => {
    const vm = new Vue({
      el: document.createElement('div'),
      render: (h) => h(Login),
    });
    expect(vm.$el.querySelector('input[name="email"]').placeholder)
      .to.equal('Email');
  });
});
