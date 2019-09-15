<template>
  <div class="mapcontainer">
    <svg viewBox="0 0 800 600">
      <path v-for="(feature,i) in data" 
        v-bind:key="i"
        class="feature"
        v-bind:d="pathMaker(feature)"
        v-bind:style="{'fill': setFill(feature)}">
      </path>
    </svg>
  </div>
</template>

<script>
// Käytetään d3:n funktioita kartan piirtämiseen
const d3 = require('d3');
export default {
  name: 'Map',
  props: ['selection', 'clicked', 'geojson'],
  data: function () {
    return {
      pathMaker: () => {},
      data: {},
    }
  },
  watch: { 
    geojson: function(newVal, oldVal) {
      this.data = this.geojson.features;
      this.initMap()
    }
  },
  mounted: function() {
    this.initMap();
  },
  methods: {
    initMap() {
      // Määritellään projektio
      let proj = d3
        .geoMercator() 
        .fitSize([800,600]);
      proj.fitSize([800, 600], this.geojson);
      this.pathMaker = d3.geoPath().projection(proj);
    },
    setFill: function (feat) {
      if (this.clicked && feat.properties.posti_alue == this.clicked.properties.posti_alue) {
        return '#f99d1c';
      } else if (feat.properties.yksiot == "." && feat.properties.kaksiot == "." && feat.properties.kolmiot == "." ) {
        return 'whitesmoke';
      } else return this.selection.includes(feat.properties.posti_alue) ? '#007ac1' : '#eef2c2';
    }
  }
};
</script>

<style lang="scss" scoped>
  .mapcontainer {
    position: relative;
    svg {
      width: 100%;
      .feature {
        stroke: #c9c9c9;
      }
    }
    .details {
      position: absolute;
      right: 0;
      bottom: 0;

    }
  }
</style>