<template>
  <div>
    <div class="container-fluid">
      <template v-if="stateForm === 0">
        <div class="col-12 mt-3">
          <card :title="table.title" :subTitle="table.subTitle">
            <button class="btn btn-outline-success" type="button" @click="store()">Agregar</button>
            <div slot="raw-content" class="table-responsive">
              <table class="table" :class="tableClass">
                <thead>
                  <tr>
                    <th v-for="column in table.columns" :key="column">{{ column }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedCustomer" :key="index">
                    <td>{{ item.id }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.phone }}</td>
                    <td>{{ item.email }}</td>
                    <td>{{ item.city.name }}</td>
                    <!-- <td>{{ item.user.username }}</td> -->
                    <td>

                      <button class="btn btn-outline-warning" type="button" @click="edit(item)">Editar</button>
                      <button class="btn btn-outline-danger" type="button"
                        @click="eliminarItem(item.id)">Eliminar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </card>
          <!-- Agregar controles de paginación -->
          <nav aria-label="Page navigation example">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
                  <a class="page-link" href="#" aria-label="Previous" @click.prevent="prevPage">
                    <span aria-hidden="true">&laquo;</span>
                  </a>
                </li>
                <li class="page-item" v-for="page in paginatedPages" :key="page" :class="{ 'active': currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
                  <a class="page-link" href="#" aria-label="Next" @click.prevent="nextPage">
                    <span aria-hidden="true">&raquo;</span>
                  </a>
                </li>
              </ul>
            </nav>
        </div>
      </template>

      <form class="row g-3">
          <template v-if="stateForm === 1 || stateForm === 2">
            <div class="container mt-3">
              <card :title="stateForm === 1 ? 'Agregar Cliente' : 'Actualizar Datos'">
              <form @submit.prevent="send_form_data">

                <div class="col-12">
                    <label for="username" class="form-label"> Nombre: </label>
                    <input type="text" class="form-control" id="username" v-model="formData.username" required placeholder="Ana">
                  </div>

                  <div class="col-12">
                    <label for="password" class="form-label"> Contraseña: </label>
                    <input type="text" class="form-control" id="password" v-model="formData.password" >
                  </div>

                  <div class="col-12">
                    <label for="phone" class="form-label"> Teléfono: </label>
                    <input type="text" class="form-control" id="phone" v-model="formData.phone" required placeholder="123456">
                  </div>
                  <div class="col-12">
                    <label for="email" class="form-label"> Correo: </label>
                    <input type="text" class="form-control" id="email"  v-model="formData.email"  required placeholder="user@gmail.com">
                  </div>

                 <div class="form-group row">
                  <label for="city_id" class="col-12"> Ciudad:</label>
                  <div class="col-sm-9">
                    <select id="city_id" class="form-control" v-model="formData.city_id" required>
                      <option value="" disabled> Seleccione Ciudad</option>
                      <option v-for="city in cities" :key="city.id" :value="city.id">{{ city.name }}</option>
                    </select>
                  </div>
                </div>

                <!-- <div class="form-group row">
                  <label for="user_id" class="col-12"> Usuario:</label>
                  <div class="col-sm-9">
                    <option v-for="user in array_user" :key="user.id" :value="user.id">{{ user.name }}</option>
                  </div>
                </div> -->
                                    
                  <button type="submit" class="btn btn-success">Guardar</button>
                  <button type="button" class="btn btn-secondary" @click="cancel">Cancelar</button>

                </form>
              </card>
            </div>
          </template>
      </form>
    </div>
    <b-modal id="confirmDeleteModal" @ok="confirmDelete" title="Confirmar eliminación">
      ¿Estás seguro de que deseas eliminar este cliente?
    </b-modal>
  </div>
</template>



<script>
//import { PaperTable } from "@/components";
import axios from "axios";
import toast from "vue-toast-notification";
import { BModal } from 'bootstrap-vue';

const tableColumns = ["#", "Nombre", "Teléfono", "Correo", "Ciudad", "Opciones"];
const pageSize = 10; // Tamaño de página, ajusta según lo necesario


export default {
  components: {
    BModal
  },
  name: "Table-userCustomer",
  props: {
    type: {
      type: String, // striped | hover
      default: "striped",
    },
  },
 /*  components: {
    PaperTable
  }, */
  data() {
    return {
      activeTab: 'admin',
      table: {
        title: "Clientes",
        subTitle: "Administra tus clientes",
        columns: [...tableColumns],
        data: [],
      },
      customers: [],
      stateForm: 0,

      cities: [],
      array_user: [],

      formData: {
        nombre: "",
        phone: "",
        email: "",
        city: "",
        city_id: 0,
        //user: "",
        //user_id: 0,
        id_customer: 0,
        username: "",
        password: "",
      },
      clienteToDelete: null,
      currentPage: 1, // Página actual
    };
  },
  computed: {
    tableClass() {
      return `table-${this.type}`;
    },
    paginatedCustomer() {
      const startIndex = (this.currentPage - 1) * pageSize;
      return this.customers.slice(startIndex, startIndex + pageSize);
    },
    totalPages() {
      return Math.ceil(this.customers.length / pageSize);
    },
    paginatedPages() {
      let pages = [];
      let startPage = Math.floor((this.currentPage - 1) / 10) * 10 + 1;
      let endPage = Math.min(startPage + 9, this.totalPages);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    },
  },
  methods: {
    async getCustomer() {
      try {
        let resp = await axios.get("/show-customer");
        this.customers = resp.data.customers;
        //console.log("datos para citeis ", resp.data)
        this.$toast.success(resp.data.message);
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
    async getCities() {
      try {
        let resp = await axios.get("/show-cities");
        console.log("datos para la ciudad ", resp.data)
        this.cities = resp.data.cities;

      } catch (error) {
        this.$toast.error(error.message);
      }
    },

    async getUser(){
      try {
        let resp = await axios.get("/show-customer");
        this.customers = resp.data.data.customers;
        //console.log("datos para citeis ", resp.data)
        this.$toast.success(resp.data.message);
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
    edit(row) {
      this.stateForm = 2,
        this.openForm('customer', 'update', row);
    },
    store(){
      this.stateForm = 1,
        this.openForm('customer', 'store');
    },

    eliminarItem(itemId){
      this.clienteToDelete = itemId;
      this.$bvModal.show('confirmDeleteModal');
    },

    async confirmDelete() {
      try {
        let res = await axios.post(`/delete-customer/${this.clienteToDelete}`);
        this.$toast.success(res.data.message);
        this.getCustomer();
      } catch (error) {
        this.$toast.error('Error al eliminar el cliente.');
      }
    },

    async store_customer() {
      try {
        let res = await axios
          .post("/signup-customer/", {
            device_name: "web",
            username: this.formData.username,
            phone: this.formData.phone,
            email: this.formData.email,
            id_cities: this.formData.city_id,
            password: this.formData.password

          });
        this.$toast.success(res.data.message);
        this.getCustomer();
        this.stateForm=0;
      } catch (error) {
        this.$toast.error(error.message);
      }
     },
    async update_customer() {
      try {
        let res = await axios
          .post(`/update-customer/${this.formData.id}`, {
            id_customer: this.formData.id,
            username: this.formData.username,
            phone: this.formData.phone,
            email: this.formData.email,
            id_cities: this.formData.city_id,
            password: this.formData.password

          })
        this.$toast.success(res.data.message);
        this.getCustomer();
        this.stateForm=0;

      } catch (error) {
        this.$toast.error(error.message);
      }

    },
    send_form_data() {
      if (this.stateForm == 1) {
        this.store_customer();
      }
      else if (this.stateForm == 2) {
        this.update_customer();
      }
    },
    openForm(model, action, data = []) {
      console.log("datos para editar ", data)
      switch (model) {
        case "customer": {
          switch (action) {
            case "store": {

              this.nombre = "";
              this.phone = "";
              this.email = "";
              this.city = "";
              this.identity_document_type_id = "";
              this.synchronized = "";
              this.action_type = 1;
              this.listado = 2;
              break;
            }
            case "update": {

              this.formData.id_customer = data['id'];
              this.formData.nombre = data["nombre"];
              this.formData.email = data["email"];
              this.formData.city = data["city"];
              this.formData.city_id = data["id_cities"];
              //this.formData.user_id = data["id_user"];

              break;
            }

          }

        }
      }
    },
    cancel() {
      this.stateForm = 0;
    },
    changePage(page) {
      this.currentPage = page;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    }
  },
  mounted() {
    this.getCustomer();
    this.getCities();
  },
};
</script>
