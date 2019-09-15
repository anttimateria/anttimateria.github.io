<template>
  <div class="mapcontainer">
    <svg viewBox="0 0 800 600">
      <path v-for="(feature,i) in data" 
        v-bind:key="i"
        class="feature"
        v-bind:d="mdPath(feature)"
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
  props: ['selection', 'clicked'],
  data: function () {
    return {
      mdPath: () => {},
      data: {},
      geojson: null,
    }
  },
  mounted: function() {
    this.getGeoJSON();
  },
  methods: {
    getGeoJSON () {
      const cont = 'https://anttimateria.github.io/pno_pkseutu.geojson';
       d3.json(cont).then(res => {
         this.geojson = res;
         this.data = res.features;
       }).then(() => this.initMap()).catch(error => {});
    },
    initMap() {
      let proj = d3
        .geoMercator() // Määrittele projektio
        .fitSize([800,600]);
      proj.fitSize([800, 600], this.geojson);
      this.mdPath = d3.geoPath().projection(proj);
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
