<script>
export default {
  name: 'app',
  data() {
    return {
      author: "Mike",
      count: 1
    };
  },
  mounted(){
    
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
