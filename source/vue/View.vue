<script>
const queryString = require('query-string');

export default {
  name: 'app',
  data() {
    return {
      author: "Mike",
      count: 1
    };
  },
  mounted(){

    console.log(location.search);
    //=> '?foo=bar'

    const parsed = queryString.parse(location.search);
    console.log(parsed);

  },
  methods: {
    increment(){
      this.count++;
    }
  }
}
</script>

<style lang="sass">
  @import ../sass/defaults

  body
    color: red
    display: flex
</style>


<template lang="pug">
div The author is {{author}}
  button(@click="increment") The count is {{count}}
</template>
