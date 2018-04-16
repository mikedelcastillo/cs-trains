<script>
export default {
  name: 'app',
  data() {
    return {
      screen: "loading",
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
      this.screen = "loading";
      this.$http.get("/api/systems")
      .then(({data}) => {
        this.screen = "story-1"
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
  .navigation-wrapper
    margin-top: 4em
    .navigation
      color: rgba(255,255,255,0.5)
      font-weight: 300
      padding: 0.5em $padding
      cursor: pointer
      font-size: 1.2em
      &:hover
        color: $color-main
      &.different:hover
        color: $color-yellow


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


.screen-text
  overflow: auto
  .text-wrapper
    width: 70%
    margin: 5em auto
    max-width: 700px
    .title-wrapper
      .title
        font-family: $font-display
        text-transform: uppercase
        font-weight: 900
        font-size: 3em
        color: $color-main
      .subtitle
        font-size: 1.5em
        font-weight: 700

    .paragraphs-wrapper
      margin-top: 3em
      $b: 5px
      border-left: $b solid $color-main
      p
        padding-left: 2em
        color: rgba(255,255,255,0.75)
        font-weight: 300
        line-height: 1.75em
        margin-bottom: 1.5em
        &.indented
          padding-left: 4em
        b
          color: white

        &:before
          content: ' '
          $size: 20px
          width: $size
          height: $size
          position: absolute
          top: 0
          left: -$size/2 - $b/2
          background-color: $color-main
          border-radius: 50%

    .buttons-wrapper
      button
        display: block
        padding: 0.5em 2em
        font-family: $font-display
        text-transform: uppercase
        font-weight: 700
        color: white
        cursor: pointer
        background-color: $color-main
        border: 0
        border-radius: 1000px
        font-size: 1.2em
        width: 80%
        margin: auto
  &.different
    .text-wrapper
      .title-wrapper .title
        color: $color-yellow
      .paragraphs-wrapper
        border-color: $color-yellow
        p:before
          background-color: $color-yellow
      .buttons-wrapper
        button
          background-color: $color-yellow


</style>


<template lang="pug">

  div.screen
    div.screen(v-if=`screen=="loading"`)
      include ../pug/_loading

    div.screen.screen-text(v-if=`screen=="story-1"`)
      .text-wrapper
        .title-wrapper
          .title Off the Rails:
          .subtitle Visualizing Rapid Rail Transit Use Across Major Cities
        .paragraphs-wrapper
          p It’s no secret that Metro Manila has a severe traffic problem. With the metro ranking <b><i>first</i></b> in several <b><i>rankings of traffic congestion</i></b>, this concern has forced all sectors of society to consider relevant and useful solutions to this growing problem.
          p While private sector initiatives such as ride-sharing powered by Uber and Grab have taken the metro by storm, it is clear that Manila faces a severe congestion problem—one that can only be solved by reducing the number of passenger vehicles plying our roads and highways.
          p
            b With car-based initiatives out of the picture, what can our riding public turn to?
          p Metro Manila’s light-rail system was the first one to be established in Southeast Asia, bringing rapid transit to what was, at the time,  Asia’s fastest-growing economies. But more than thirty years later, the three lines spanning the constituent cities of the metro are buckling under increased ridership, with breakdowns on MRT-3, the most heavily-used line, often making national headlines.
          p Despite the issues plaguing Manila’s rail system, <b><i>the MRT and the LRT have become integral parts of the metro’s transport system</i></b>, transporting thousands of passengers per day across 42 stations.
          p But <i>would targeted improvements to our metro rail lines actually improve our traffic situation?</i>
          p.indented Several cities across the world have either delayed or cancelled projects to expand train lines due to prohibitive monetary and space costs. For instance, Jakarta is only building out the first line of their MRT after seeing high use of their rapid bus transit system.
          p How could we possibly measure how much a transit is system is used? Given that, <b>how can we determine how effective a system</b> actually is?
          p To answer this question, we needed to compare how many passengers pass through a system over a certain period of time. We did that by <b>obtaining the entry-and-exit data</b> across all stations of the MRT-3 line, and, for comparison, that of four other systems from across the world: the <i>London Underground</i>, the <i>New York Subway</i>, the <i>Seoul Metro</i>, and <i>San Francisco’s Bay Area Rapid Transit</i>.
          p We used this entry-and-exit data to create an interactive visualization comparing passenger inflow and outflow not only between stations, but also across entire systems—giving us <b>a great graphical overview how a system is used throughout the day</b>.
          p We also created a quantifier for utilization, called the <i>utility index</i>, gives us a guage of a system's overall activity based on the average entries and exits of each station of a given hour.

        .buttons-wrapper
          button(@click=`screen="app"`) Start Visualization

    div.screen.screen-text.different(v-if=`screen=="story-2"`)
      .text-wrapper
        .title-wrapper
          .title Keeping on Track:
          .subtitle Towards Better Rail Transit in Metro Manila
        .paragraphs-wrapper
          p From the visualization, <b>it is clear that across all locales, the metro system has become an invaluable component of the city’s overall transport scheme</b>, with ridership heading into the millions in a single day.
          p We can see that all the systems <b>share similar periods of high and low ridership at certain points of the day</b>, and from that, we can easily figure out stations that are integral to city life, most often located in central business districts.
          p.indented This tells us that a high stations should be clustered around the CBD—another pattern clear not only in the four overseas systems, but also many others, such as how the Singapore MRT’s greatest clustering is within the Downtown Core: the island nation’s center of economic activity.
          p Given that, it is also clear that a big use of metro systems is in <b>getting from the outskirts of the city towards the center</b>, and this is reflected in how lines are built all over the world.
          p We find too that the number of stations and lines correlates with overall activity—<b>the more stations accessible to the riding public, the more they will use it</b>. Coupled with how densely populated the cities are, this is especially true with New York’s and Seoul’s utilization indices. <b>Essentially: If you build it, they will come.</b>
          p Given that, it seems as though any kind of rail expansion would be beneficial to the Metro—especially those situated in locations that are either <b>origins or destinations of high foot traffic.</b>
          p This visualization offers many other paths of exploration.
          p.indented It is clear that stations located in the central business district are highly used. <i>What about stations located near other points of interest, such as amusement parks or other places of recreation?</i>
          p.indented An interesting route to explore would be to investigate the impact of interchanges, which allow users to easily transfer between lines without having to travel between stations on foot. <i>Does having more line intersections lead to increasing passenger flow?</i>
          p.indented Coupling the visualization with an index of the congestion around the station would also help users understand the sheer popularity of a station. Correlations between congestion and station use could indicate how a station could be a point where passengers change modes of transport, while high entries and exits and no congestion could indicate that the station is the last point in a user’s journey.
        .buttons-wrapper
          button(@click=`screen="app"`) Return to Visualization

    div.screen(v-if=`screen=="app"`)
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
        .navigation-wrapper
          .navigation(@click=`screen="story-1"`) Introduction
          .navigation.different(@click=`screen="story-2"`) Insights

      #content-wrapper
        .views-wrapper
          .view(v-for=`system in viewing`)
            .btn-close(@click=`hideSystem(system, $event)`)
              .line.line-1
              .line.line-2
            iframe(v-bind:src=`"/view.html?system_id=" + system.system_id`)
</template>
