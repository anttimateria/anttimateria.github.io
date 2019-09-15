<template>
<div id="app">
  <h3 class="app-headline"><span class="header-icon"></span>Kokeile mistä sinulla on varaa ostaa kerrostaloasunto</h3>
  
  <div class="inputbox">
    <p class="input-label">Millaista asuntoa etsit?</p>
    <div class="row">
      <button v-for="(koko, index) in asuntoKoot" 
              v-on:click="asuntoBtnClick(koko)" 
              v-bind:key="index" 
              v-bind:class="selected.val == koko.val && 'selected'">{{koko.name}}
      </button>
    </div>
  </div>
  
   <div class="inputbox">
    <p class="input-label">Haluatko asua alueella jossa asutaan keskimääräistä</p>
    <div class="row">
      <button v-for="(valjyys, index) in asumisvaljyydet" 
              v-on:click="valjyysBtnClick(valjyys)" 
              v-bind:key="index" 
              v-bind:class="selectedValjyys == valjyys && 'selected'">
        {{ valjyys }}
      </button>
    </div>
         <p><i>Asumisväljyys (m2) on se keskipinta-ala, joka saadaan, kun talouksien asuinhuoneistojen yhteispinta-ala jaetaan asukkaiden lukumäärällä. Tarkasteltavana olevien alueiden asumisväljyyden keskiarvo on 37.1 m2.</i></p>
  </div>
  
  <div class="inputbox">
    <p class="input-label">Paljonko olisit asunnosta valmis maksamaan? <b>{{ rangevalue > 0 ? rangevalue + ' €/neliö' : ''}}</b></p>
    <div class="row">
      <input class="inputrange" 
             type="range" 
             min="0" 
             max="8000" 
             step="10" 
             v-model="rangevalue" 
             v-on:change="updateView"></input>
    </div>
  </div>

  <p v-if="rangevalue > 0 && view.length > 0 && selected.val">
    <b>Näillä kriteereillä löytyi {{ view.length }} aluetta joista sinulla olisi varaa ostaa asunto.</b> 
    Hinta tarkoittaa kyseisen postinumeroalueen {{ selected.name.toLowerCase() }}iden keskimääräistä neliöhintaa.
   Osalle alueista ei ole tietoa saatavilla. Lähde: Tilastokeskus
  </p>
  <h3 v-if="rangevalue > 0 && view.length == 0 && selected.val">
    Näillä kriteereillä et saa asuntoa mistään pääkaupunkiseudulta.
  </h3>
<p v-if="rangevalue > 0 && !selected.val">
  <b>Valitse asuntotyyppi</b>
</p>
<Map v-bind:selection="selectedPnos" 
      v-bind:clicked="clicked"
      v-bind:geojson="geojson" ></Map>
<div v-if="rangevalue > 0 && view.length > 0 && selected.val">
  <p>Klikkaa aluetta niin näet kartalta missäpäin se sijaitsee.</p>
  <table>
    <tr>
      <th>Kunta</th>
      <th>Postinumeroalue</th>
      <th class="sortable" 
          v-on:click="sortResults">
        Hinta {{ sortOrder ? `&#8595;` : `&#8593;` }}
      </th>
    </tr>
    <tr v-for="(pnoalue, index) in view" 
        v-bind:key="index" 
        v-on:click="highlight(pnoalue)"
        v-bind:style="setStyle(pnoalue)">
      <td>{{ pnoalue.properties.kunta }}</td>
      <td>{{pnoalue.properties.posti_alue}} {{ pnoalue.properties.nimi }}</td>
      <td>{{pnoalue.properties[selected.val]}}</td>
    </tr>
  </table>
</div>
</div>
</template>

<script>
  import './../scss/styles.css';
  import Map from './components/Map.vue';
  import axios from 'axios';

export default {
  name: 'App',
  data: function () {
    return {
    rangevalue: 0,
    data: null,
    geojson: null,
    selected: {},
    selectedValjyys: null,
    view: [],
    asuntoKoot: [{name: 'Yksiö', val: 'yksiot'}, 
                 {name: 'Kaksio', val: 'kaksiot'}, 
                 {name: 'Kolmio', val: 'kolmiot'}],
    asumisvaljyydet: ['ahtaammin', 'tilavammin'],
    sortOrder: true,
    clicked: null
    }
  },
  computed: {
    selectedPnos: function () {
      return this.view.map((el, i) => el.properties.posti_alue);
    }
  },
  components: {
    Map
  },
  mounted: function () {
    this.getGeoJSON();
  },
  methods: {
    // Haetaan data
    getGeoJSON () {
      const cont = 'https://anttimateria.github.io/pno_pkseutu.geojson';
       axios.get(cont).then(res => {
         this.geojson = res.data;
         this.data = res.data.features;
       }).catch(error => console.log(error));
    },
    // Listan järjestäjäfunktio, laskeva tai nouseva
    sorter() {
      const v = this.selected.val;
      return this.sortOrder ? (a,b) => a.properties[v] - b.properties[v] : (a, b) => b.properties[v] - a.properties[v];
    },
    // Kun klikkaat taulukon 'Hinta'-headeria niin tämä funktio järjestää datan joko laskevaan tai nousevaan järjestykseen
    sortResults() {
      this.sortOrder = !this.sortOrder;
      this.updateView();
    },
    // Filtteröi ja päivittää esitettävän datan inputin perusteella
    updateView() {
      const v = this.selected.val;
      const filtered1 = this.data.filter((el, i) => this.check(el.properties[v]));
      const filtered2 = filtered1.filter((el, i) => this.checkValjyys(el.properties.te_as_valj))
      const sorted = filtered2.sort(this.sorter());
      
      this.view = sorted;
      
      if (this.clicked && !this.selectedPnos.includes(this.clicked.properties.posti_alue)) {
        this.clicked = null;
      }
    },
    // Filtteröintiä varten
    check (val) {
      return parseInt(val) >= 0 && parseInt(val) <= this.rangevalue;
    },
    // Funktio asumisväljyyden filtteriä varten
    // Keskiarvo laskettu Tilastokeskuksen datasta
    checkValjyys(val) {
      switch(this.selectedValjyys) {
        case null:
          return true;
        case this.asumisvaljyydet[0]:
          return val <= 37.1;
        case this.asumisvaljyydet[1]:
          return val > 37.1; 
      }
    },
    asuntoBtnClick (el) {
      if (this.selected.val == el.val) {
        this.selected = {};
      } else {
        this.selected = el;
      }
      this.updateView();
    },
    valjyysBtnClick(el) {
      if(this.selectedValjyys == el) {
        this.selectedValjyys = null;
       } else {
         this.selectedValjyys = el;
       }
      this.updateView();
    },
    highlight(el) {
      if (this.clicked && this.clicked.properties.posti_alue == el.properties.posti_alue) {
        this.clicked = null;
      } else this.clicked = el;
    },
    setStyle(alue) {
      if (this.clicked && this.clicked.properties.posti_alue == alue.properties.posti_alue) {
        return {fontWeight: 'bold', backgroundColor: 'rgb(255, 214, 157)'};
      } else return null;
    }
  },
};
</script>

<style lang="scss" scoped>
  body {
    margin: 0;
    padding: 0;
  }
  
  #app {
  font-family: 'Roboto';
  font-size: 14px;
  text-align: left;
  margin: 0 auto;
  max-width: 500px;
  padding-top: 40px;
  
  .app-headline {
    font-size: 18px;
    color: #000;
    margin-bottom: 5px;
    position: relative;
    padding-left: 38px;
    min-height: 36px;
    padding-top: 7px;
  }
  
  .header-icon {
    width: 30px;
    height: 34px;
    position: absolute;
    left: 0;
    top: 0;
    background-image: url(https://interactive.hs.fi/arkku/img/assets/arrow_icon_dark_blue.svg);
    background-repeat: no-repeat;
    background-size: cover;
  }
  
  .input-label {
    font-size: 14px;
    color: black;
    font-weight: normal;
    padding: 10px 0 0 0;
    margin-top: 0;
  }

  div {
    position: relative;
  }

  .row {
    display: flex;
    flex-direction: row;
    margin: 0 auto;
    justify-content: center;
  }
  
  table {
    font-size: 14px;
    width: 100%;
    border-collapse: collapse;
    tr {
      cursor: pointer;
      padding: 0;
      margin-bottom: 5px;
      border-collapse: collapse;
      td, th {
        padding: 10px 4px 10px 4px;
        margin: 0;
        text-align: left;
      }
      .sortable {
        cursor: pointer;
      }
      &:nth-child(even) {
            background-color: rgba(38,59,102,0.05);
      }
      &:hover {
        background-color: rgb(218, 218, 218);
      }
    }
  }
  
  button {
    margin: 0 10px 0 0;
    padding: 5px 12px;
    border-radius: 0;
    border: 1px solid rgb(17,41, 69);
    cursor: pointer;
    font-weight: bold;
    &:focus {
      outline: none;
    }
    &:hover {
      opacity: 0.65;
    }
  }
  
  .inputbox {
    background-color: rgba(38,59,102,0.05);
    padding: 10px 10px 18px 10px;
    margin: 3px 0;
    text-align: center;
  }
  
  .inputrange {
    width: 80%;
    height: 6px;
    border-radius: 4px;
    padding: 4px;
    position: relative;
    margin: 10px 0;
    box-shadow: none !important;
    &::after {
      content: '8000 €/neliö';
      position: absolute;
      right: 0;
      bottom: -1.5em;
    }
    &::before {
      content: '0';
      position: absolute;
      left: 0;
      bottom: -1.5em;
    }
  }
  
  .selected {
    background-color: rgb(17,41, 69);
    color: white;
  }
}
</style>