<script>
export default {
  name: 'app',
  data() {
    return {
      initializing: true,
      systems: [],
      viewing: []
    };
  },
  mounted() {
    this.fetchSystems();
  },
  methods: {
    increment() {
      this.count++;
    },
    fetchSystems(){
      this.initializing = true;
      this.$http.get("/api/systems")
      .then(({data}) => {
        this.initializing = false;
        this.systems = data;
        this.viewing = this.systems.filter(
          system => system.system_id == "mnl"
        );
      });
    },
    showSystem(system, event){
      let max = 2;

      if(!this.viewing.find(s => system.system_id == s.system_id)){

        if(this.viewing.length == max){
          this.viewing.pop();
        }

        this.viewing.push(system);
      }
    },
    hideSystem(system, event){
      this.viewing.splice(
        this.viewing.indexOf(system), 1
      );
    }
  }
}
</script>

<style lang="sass">

@import ../sass/defaults

#sidebar-wrapper, #content-wrapper
  position: absolute
  top: 0
  height: 100%

#sidebar-wrapper
  $padding: 1.5em
  left: 0
  width: $sidebar-width
  overflow: hidden
  overflow-y: auto
  #header-wrapper
    padding: $padding
    .title
      font-size: 2em
      font-family: $font-display
      text-transform: uppercase
      font-weight: 900
      letter-spacing: 0.2em
      color: $color-main
    .subtitle
      font-weight: 300
      opacity: 0.25
      font-size: 0.7em
  #systems-wrapper
    .title
      padding: 0.5em $padding
      font-weight: 700
      text-transform: uppercase
      font-family: $font-display
      font-size: 0.9em
    .systems
      .system
        padding: 0.5em $padding
        cursor: pointer
        &:hover
          background-color: rgba(0, 0, 0, 0.2)
        .name
        .city, .country
          font-size: 0.7em
          opacity: 0.5


#content-wrapper
  left: $sidebar-width
  width: calc(100% - #{$sidebar-width})
  .views-wrapper
    position: absolute
    top: 0
    left: 0
    width: 100%
    height: 100%
    display: flex
    justify-content: space-between
    .view
      border-left: 2px solid rgb(23, 23, 23)
      flex-grow: 1
      flex-shrink: 1
      .btn-close
        z-index: 1
        $size: 2em
        width: $size
        height: $size
        position: absolute
        top: 2em
        right: 2em
        cursor: pointer
        .line
          width: $size
          height: 2px
          position: absolute
          left: 50%
          top: 50%
          background-color: white
          &.line-1
            transform: translate(-50%, -50%) rotate(-45deg)
          &.line-2
            transform: translate(-50%, -50%) rotate(45deg)
      iframe
        border: 0
        position: absolute
        top: 0
        left: 0
        right: 0
        bottom: 0
        width: 100%
        height: 100%
        z-index: 0

</style>


<template lang="pug">

  div.screen
    div.screen(v-if="initializing")
      include ../pug/_loading

    div.screen(v-else)
      #sidebar-wrapper
        #header-wrapper
          .title Train Systems
          .subtitle Visualization by Carlos Arcenas, Carlo de Guzman and Mike del Castillo
        #systems-wrapper
          .title Systems
          .systems
            .system(v-for=`system in systems` @click="showSystem(system, $event)")
              .name {{ system.system_name }}
              .city {{system.city_name}}
              .country {{system.country_name}}

      #content-wrapper
        .views-wrapper
          .view(v-for=`system in viewing`)
            .btn-close(@click=`hideSystem(system, $event)`)
              .line.line-1
              .line.line-2
            iframe(v-bind:src=`"/view.html?system_id=" + system.system_id`)
</template>
