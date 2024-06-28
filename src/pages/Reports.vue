<template>
  <div>


    <!--Charts-->
    <div class="row">
      <div class="col-12">
        <chart-card title="Ordenes de Clientes Frecuentes" sub-title="" :chart-data="customers.data"
          :chart-options="customers.options">
          <div slot="legend">
            <div><label for="userTypeSelect">Filtrar por mes:</label>
              <select id="selectMes" v-model="selectMes" @change="getCustomers">
                <option v-for="(month, index) in months" :key="index" :value="month.value">{{ month.label }}</option>
              </select>
            </div>
          </div>
        </chart-card>

      </div>

      <div class="col-md-6 col-12">
        <chart-card title="Viajes de Choferes" sub-title="" :chart-data="driversChart.data" chart-type="Pie">
          <div slot="legend">
            <div><label for="userTypeSelect">Filtrar por mes:</label>
              <select id="monthSelect" v-model="selectedMonth" @change="getDrivers">
                <option v-for="(month, index) in months" :key="index" :value="month.value">{{ month.label }}</option>
              </select>
            </div>
            <div><label for="userTypeSelect">Filtrar por estado:</label>
              <select id="stateSelect" v-model="selectedState" @change="getDrivers">
                <option v-for="(state, index) in states" :key="index" :value="state.value">{{ state.label }}</option>
              </select>
            </div>
          </div>
        </chart-card>
      </div>

      <div class="col-md-6 col-12">
        <chart-card title="Ordenes" sub-title="" :chart-data="yearChart.data" :chart-options="yearChart.options">
          <span slot="footer">
            <i class="ti-check"></i> Informacion de las Ordenes realizadas
          </span>
          <div slot="legend">
            <i class="fa fa-circle text-info"></i> Ordenes
            <div><label for="userTypeSelect">Filtrar por año:</label>
              <select id="stateSelect" v-model="selectYear" @change="getOrdersYear">
                <option v-for="(year, index) in years" :key="index" :value="year.label">{{ year.label }}</option>
              </select>
            </div>
          </div>

        </chart-card>

      </div>
    </div>

  </div>
</template>
<script>
import axios from 'axios';
import Chartist from "chartist";
import { ChartCard } from "@/components/index";
export default {
  name: 'Reports',
  components: {

    ChartCard,
  },

  data() {
    return {

      selectedMonth: '6',
      months: [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },

      ],
      selectMes: '6',
      months: [
        { value: '1', label: 'Enero' },
        { value: '2', label: 'Febrero' },
        { value: '3', label: 'Marzo' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Mayo' },
        { value: '6', label: 'Junio' },
        { value: '7', label: 'Julio' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' },

      ],
      selectedState: '1',
      states: [
        { value: '1', label: 'terminado' },
        { value: '2', label: 'progreso' },
        { value: '3', label: 'pendiente' },

      ],

      selectYear: '2024',
      years: [
        { value: '1', label: '2023' },
        { value: '2', label: '2024' },
        { value: '3', label: '2025' },
        { value: '3', label: '2026' },
        { value: '3', label: '2027' },
        { value: '3', label: '2028' },
        { value: '3', label: '2029' },
      ],

      yearChart: {
        data: {
          labels: [

          ],
          series: [


          ],
        },
        options: {
          seriesBarDistance: 5,
          axisX: {
            showGrid: false,
          },
          height: "245px",
        },
      },

      driversChart: {
        data: {
          labels: [
          ],
          series: [

          ]
        },

        options: {},
      },

      //PARA EL PRIMER GRAFICO
      customers: {
        data: {
          labels: [

          ],
          series: [

          ],
        },
        options: {
          low: 0,
          high: 20,
          showArea: true,
          height: "245px",
          axisX: {
            showGrid: false,
          },
          lineSmooth: Chartist.Interpolation.simple({
            divisor: 3,
          }),
          showLine: true,
          showPoint: false,
        },
      },

      loading: false,    // Indicador de carga
      error: null
    };
  },


  methods: {
    async getCustomers() {
      try {
        this.loading = true;  // Habilitar el indicador de carga
        var request = { mes: this.selectMes };
        // Realizar la solicitud GET a /api/customers
        const response = await axios.post('/customers-frec',request);
        this.customers.data.labels = [];
        this.customers.data.series = [];
        const s = [];

        for (let i = 0; i < response.data.length; i++) {
          this.customers.data.labels.push(response.data[i].customer.nombre);
          s.push(response.data[i].total_orders);
        }
        this.customers.data.series.push(s);
      } catch (error) {

        this.error = error;
        console.error('Error al obtener las ciudades:', error);

      } finally {
        this.loading = false;  // Deshabilitar el indicador de carga
      }
    },
    async getDrivers() {
      try {
        this.loading = true;
        var request = { state: this.selectedState, mes: this.selectedMonth };
        const response = await axios.post('/drivers', request);

        // Limpiar datos anteriores
        this.driversChart.data.labels = [];
        this.driversChart.data.series = [];
        for (let i = 0; i < response.data.orders.length; i++) {
          this.driversChart.data.labels.push(response.data.orders[i].driver.name);
          this.driversChart.data.series.push(response.data.orders[i].order_count);
        }
      } catch (error) {
        this.error = error;
        console.error('Error al obtener los choferes:', error);
      } finally {
        this.loading = false;
      }
    },


    //ORDENES POR AÑO

    async getOrdersYear() {
      try {
        this.loading = true;
        var request = { year: this.selectYear };

        const response = await axios.post('/orders-year', request);
        this.yearChart.data.labels = [];
        this.yearChart.data.series = [];
        var d = [];
        for (let i = 0; i < response.data.orders.length; i++) {

          this.yearChart.data.labels.push(response.data.orders[i].month);
          d.push(response.data.orders[i].total_orders);
        }
        this.yearChart.data.series.push(d);
        this.loading = false;


      } catch (error) {

        this.error = error;
        console.error('Error al obtener las ordenes:', error);

      } finally {
        this.loading = false;
      }
    }
  },
  watch: {

  },
  mounted() {
    this.getCustomers();
    this.getDrivers();
    this.getOrdersYear();
  },

};

</script>
