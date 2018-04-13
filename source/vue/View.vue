<script>
const queryString = require('query-string');
const moment = require('moment');

export default {
  name: 'app',
  data() {
    return {
      initializing: true,
      loading: true,
      query: queryString.parse(location.search),
      system: {},
      range: {
        start: 0,
        end: 100,
        time: 50,
        step: 60 * 60 / 4,
        acitivites: []
      },
      playing: false,
      display: [],
      utilityIndex: 0,
      activities: [],
      maxEntries: 0,
      maxExits: 0
    };
  },
  mounted() {
    this.fetchSystem();
    window.addEventListener("keydown", e => {
      if(e.keyCode == 32){
        this.playing = !this.playing;
        console.log(this.playing);
        e.preventDefault();
      }
    }, false);

    this.playLoop();
  },
  computed: {
    viewingRange() {
      return `from ${
        moment(this.range.start * 1000).format("MMMM D")
      } to ${
        moment(this.range.end * 1000).format("MMMM D, YYYY")
      }`;
    },
    viewingTime() {
      if(this.range.start == 0) return "";
      return moment(this.range.time * 1000).format("MMM DD, YYYY ddd HH:MM");
    }
  },
  watch: {
    'range.time'(value){
      this.range.activities = [];

      let totalEntries = 0;
      let totalExits = 0;
      let hour = 60 * 60;

      this.activities.forEach(act => {
        if(act.unix_start <= this.range.time && this.range.time <= act.unix_end){
          this.range.activities.push(act);


          let duration = act.unix_end - act.unix_start;
          totalEntries += act.entries * (hour / duration);
          totalExits += act.exits * (hour / duration);
        }
      });

      this.display.forEach(line => {
        line.stations.forEach(station => {
          let activity = this.range.activities.find(s => s.station_id == station.station_id);

          if(activity){
            station.entries = activity.entries;
            station.exits = activity.exits;

          } else{
            station.entries = 0;
            station.exits = 0;
          }
        });
      });

      let totalStations = this.system.stations.length;
      this.utilityIndex = (
        totalEntries / totalStations +
        totalExits / totalStations
      ) / 2;

      this.utilityIndex = Math.log(this.utilityIndex + 1);

    }
  },
  methods: {
    playLoop(){
      if(this.playing){
        this.range.time = Math.min(this.range.end, this.range.time + this.range.step);

        if(this.range.time == this.range.end) this.playing = false;
      }

      requestAnimationFrame(this.playLoop);
    },
    fetchSystem() {
      this.initializing = true;
      this.$http.get(`/api/systems/${this.query.system_id}`)
        .then(({
          data
        }) => {
          if (data.length == 1) {
            this.initializing = false;
            this.system = data[0];

            this.system.unix_start = Number(this.system.unix_start);
            this.system.unix_end = Number(this.system.unix_end);

            let initTime = Math.floor(this.system.unix_start + (this.system.unix_end - this.system.unix_start)/2);

            this.fetchRange(initTime);

            // this.$refs.timelineRange.value = initTime;

            this.display = this.system.lines.map(
              rawLineData => {
                let line = {
                  line_id: rawLineData[0],
                  line_name: rawLineData[1],
                  line_color: rawLineData[2],
                  stations: this.system.order
                    .filter(o => o[1] == rawLineData[0])
                    .map(o => {
                      let rawStation = this.system.stations.find(s => s[0] == o[2]);
                      let station = {
                        station_id: o[2],
                        station_name: rawStation[1],
                        order: o[0],
                        entries: 0,
                        exits: 0
                      };

                      return station;
                    })
                    .sort((a, b) => a.order - b.order)
                };

                return line;
              }
            );
          } else {
            alert("Something went wrong!");
          }
        });
    },
    fetchRange(time) {
      time = Number(time);
      this.range.target = time;

      this.loading = true;
      let range = 60 * 60 * 24 * 7;
      let min = Math.max(this.system.unix_start, time - range / 2);
      let max = Math.min(this.system.unix_end, time + range / 2);

      this.$http.get(`/api/systems/${this.query.system_id}/${min}/${max}`, {
        before(request) {
          if (this.previousRequest) {
            this.previousRequest.abort();
          }
          this.previousRequest = request;
        }
      }).then(({bodyText}) => {

        this.maxEntries = 0;
        this.maxExits = 0;

        let data = bodyText.trim().split("\n")
          .map(row => row.trim().split(","))
          .map(row => {
            let act = {
              unix_start: Number(row[0]),
              unix_end: Number(row[1]),
              station_id: row[2],
              entries: Number(row[3]),
              exits: Number(row[4])
            };

            this.maxEntries = Math.max(this.maxEntries, act.entries);
            this.maxExits = Math.max(this.maxExits, act.exits);

            return act;
          });

        this.range.start = min;
        this.range.end = max;
        this.range.target = this.range.time = time;

        this.activities = data;

        let graphActivities = [];
        let maxUtility = 0;

        for(let t = this.range.start; t < this.range.end; t += 60 * 60){
          let totalEntries = 0;
          let totalExits = 0;
          let hour = 60 * 60;

          this.activities.forEach(act => {
            if(act.unix_start <= t && t <= act.unix_end){
              let duration = act.unix_end - act.unix_start;
              totalEntries += act.entries * (hour / duration);
              totalExits += act.exits * (hour / duration);
            }
          });

          let totalStations = this.system.stations.length;
          let utilityIndex = (
            totalEntries / totalStations +
            totalExits / totalStations
          ) / 2;

          utilityIndex = Math.log(1 + utilityIndex);

          maxUtility = Math.max(maxUtility, utilityIndex);

          graphActivities.push({
            time: t,
            utilityIndex
          });
        }

        let timelineGraph = this.$refs.activityCanvas;
        let timelineGraphContext = timelineGraph.getContext("2d");
        timelineGraph.width = timelineGraph.clientWidth * 2;
        timelineGraph.height = timelineGraph.clientHeight * 2;

        timelineGraphContext.clearRect(0, 0, timelineGraphContext.width, timelineGraphContext.height);

        timelineGraphContext.beginPath();
        timelineGraphContext.moveTo(0, timelineGraph.height);

        let timelineGradient = timelineGraphContext.createLinearGradient(0,0,0,timelineGraph.height);
        timelineGradient.addColorStop(0,"#56CCF2");
        timelineGradient.addColorStop(1,"rgba(187,107,217,0)");

        graphActivities.forEach(act => {
          let x = (act.time - this.range.start) / (this.range.end - this.range.start);
          let y = 1 - act.utilityIndex/15;

          timelineGraphContext.lineTo(
            timelineGraph.width * x,
            timelineGraph.height * y);
        });

        timelineGraphContext.lineTo(timelineGraph.width, timelineGraph.height);
        timelineGraphContext.closePath();
        timelineGraphContext.fillStyle = timelineGradient;
        timelineGraphContext.fill();

        this.loading = false;

      });
    },
    selectTime(event){
      let x = event.offsetX;
      let width = event.target.clientWidth;
      let time = Math.floor(
        this.range.start +
        (this.range.end - this.range.start) * (x / width)
      );

      this.range.time = time;
    },
    semiCircle(n, m){
      m = 5000;
      let min = 10;
      let max = 30;
      let size = min + (max - min) * Math.sqrt(n/m);
      return {
        width: `${size}px`,
        height: `${size}px`
      }
    }
  }
}
</script>

<style lang="sass">

  @import ../sass/defaults

  #screen-view
    background-color: rgba(0, 0, 0, 0.2)
    padding: 2em
    width: 100%
    height: 100%
    overflow: hidden
    display: flex
    flex-direction: column
    justify-content: space-between
    align-items: flex-start
    #lines-wrapper, #header-wrapper, #timeline-wrapper
      width: 100%
    #header-wrapper, #timeline-wrapper
      flex-grow: 0
      flex-shrink: 0
    #lines-wrapper
      flex-grow: 1
      flex-shrink: 1
      overflow: auto

    #header-wrapper
      .text-country
        font-size: 1em
        opacity: 0.5
        font-family: $font-display
        text-transform: uppercase
        letter-spacing: 0.3em
        font-weight: 700
        line-height: 1em
        margin-bottom: -0.2em
      .text-system
        font-size: 2em
        font-weight: 100
        font-family: $font-main
      .info-wrapper
        display: flex
        align-items: center
        .index-wrapper
          flex-grow: 0
          flex-shrink: 0
          padding: 1em
          padding-left: 1em
          text-align: center
          .value
            font-size: 3em
            font-family: $font-mono
            font-weight: 900
          .title
            text-transform: uppercase
        .activity-wrapper
          flex-grow: 1
          flex-shrink: 1
          height: 5em
          canvas
            position: absolute
            top: 0
            left: 0
            height: 100%
            width: 100%
            cursor: ew-resize
          .line
            height: 100%
            position: absolute
            width: 2px
            background-color: white
          .text-date
            position: absolute
            top: 1em
            left: 1em
            font-family: $font-mono
            font-size: 0.9em
            font-weight: 300
            text-transform: uppercase
    #lines-wrapper
      $station-size: 30px
      $station-width: 100px
      .line-wrapper
        padding: 1em 0
        .name-wrapper
          width: 100%
          .name
            display: inline-block
            font-family: $font-display
            text-transform: uppercase
            font-weight: 700
            font-size: 0.8em
            color: black
            padding: 0.4em 0.7em
        .stations-wrapper
          width: 100%
          overflow: auto
          padding-top: 1em
          .line
          .stations
            display: flex
            .station
              width: $station-width
              flex-basis: $station-width
              flex-grow: 0
              flex-shrink: 0
              .circle
                height: $station-size * 2
                .top, .bottom
                  width: 100%
                  height: $station-size
                  overflow: hidden
                  .semi-circle
                    border-radius: 50%
                    position: absolute
                    left: 50%
                    transform: translateX(-50%)
                .top
                  .semi-circle
                    background-color: $color-green
                    bottom: 0
                .bottom
                  .semi-circle
                    background-color: $color-red
                    top: 0
              .tooltip
                text-align: center
                font-size: 0.6em
                text-align: center
                font-weight: 700
                .tick
                  position: absolute
                  left: 50%
                  $size: 5px
                  width: $size
                  height: $size
                  transform: translate(-50%, 3px)
                .name
                  width: 100%
                  padding: 0.2em 0.7em
                  border-top: 4px solid
                  padding-top: 1em
                  white-space: nowrap
                  overflow: hidden
                  text-overflow: ellipsis
                .numbers
                  .entries, .exits
                    display: inline-block
                    margin: 0.2em
                  .entries
                    color: $color-green
                  .exits
                    color: $color-red
    #timeline-wrapper
      $track-height: 10px
      $track-color: #474747
      $track-radius: $track-height
      $thumb-height: 20px
      $thumb-width: 50px
      $thumb-radius: 30px
      $thumb-color: #B2B2B2

      input[type=range]
        display: block
        width: 100%
        appearance: none
        margin: 10px 0
        width: 100%
        background-color: transparent
        &:focus
          outline: none
        &::-webkit-slider-runnable-track
          width: 100%
          height: $track-height
          cursor: pointer
          box-shadow: 0
          background: $track-color
          border-radius: $track-radius
          border: 0
        &::-webkit-slider-thumb
          box-shadow: 0
          border: 0
          height: $thumb-height
          width: $thumb-width
          border-radius: $thumb-radius
          background: $thumb-color
          cursor: pointer
          -webkit-appearance: none
          margin-top: ($thumb-height - $track-height) / -2
        &:focus::-webkit-slider-runnable-track
          background: $track-color
        &::-moz-range-track
          width: 100%
          height: $track-height
          cursor: pointer
          box-shadow: 0
          background: $track-color
          border-radius: $track-radius
          border: 0
        &::-moz-range-thumb
          box-shadow: 0
          border: 0
          height: $thumb-height
          width: $thumb-width
          border-radius: $thumb-radius
          background: $thumb-color
          cursor: pointer
      .loading-bar
        width: 80%
        height: 2px
        overflow: hidden
        margin: 1em auto
        .bar
          height: 100%
          width: 5em
          background-color: white
          animation: bar infinite 1.5s
          position: absolute
          top: 0
          @keyframes bar
            from
              left: -20%
            to
              left: 120%
      .text-date
        text-align: center
        padding-top: 0.5em
        font-size: 0.7em
        opacity: 0.5
</style>


<template lang="pug">
div.screen
  div.screen(v-if="initializing")
    include ../pug/_loading

  div#screen-view.screen(v-else)
    #header-wrapper
      .text-country {{system.country_id}} / {{system.city_name}}
      .text-system {{system.system_name}}
      .info-wrapper
        .index-wrapper
          .value {{ utilityIndex.toFixed(2) }}
          .title Utility Index
        .activity-wrapper
          .text-date {{ viewingTime }}
          .line(:style=`{left:((range.time-range.start)/(range.end-range.start)) * 100 + "%"}`)
          canvas(ref="activityCanvas" @mousemove="selectTime")
    #lines-wrapper
      .line-wrapper(v-for=`line in display`)
        .name-wrapper
          .name(v-bind:style=`{backgroundColor:line.line_color}`) {{line.line_name}}
        .stations-wrapper
          .line
          .stations
            .station(v-for=`station in line.stations`)
              .circle
                .top
                  .semi-circle(v-bind:style=`semiCircle(station.entries, maxEntries)`)
                .bottom
                  .semi-circle(v-bind:style=`semiCircle(station.exits, maxExits)`)
              .tooltip
                .numbers
                  .entries {{ station.entries }}
                  .exits {{ station.exits }}
                .tick(v-bind:style=`{backgroundColor:line.line_color}`)
                .name(v-bind:style=`{borderColor:line.line_color}`) {{ station.station_name }}
    #timeline-wrapper
      input(v-bind:value="range.target" type="range" v-bind:min="system.unix_start" v-bind:max="system.unix_end" @change=`fetchRange($event.target.value)`)
      .info
        .loading-bar(v-if="loading")
          .bar
        .text-date(v-if=`range.start != 0`) Viewing activity {{ viewingRange }}
</template>
