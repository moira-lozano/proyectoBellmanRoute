<template>
  <div>
    <div class="container-fluid">
      <template v-if="stateForm === 0">
        <div class="col-12 mt-3">
          <card :title="table.title" :subTitle="table.subTitle">
            <button class="btn btn-outline-success" type="button" @click="store()">Agregar Productos</button>
            <div slot="raw-content" class="table-responsive">
              <table class="table" :class="tableClass">
                <thead>
                  <tr>
                    <th v-for="column in table.columns" :key="column">{{ column }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in paginatedProducts" :key="index">
                    <td>{{ item.id }}</td>
                    <td>{{ item.code }}</td>
                    <td>{{ item.name }}</td>
                    <td>{{ item.price }}</td>
                    <td>{{ item.date }}</td>
                    <td>{{ item.category.name }}</td>
                    <td>
                      <button class="btn btn-outline-warning" type="button" @click="edit(item)">Editar</button>
                      <button class="btn btn-outline-danger" type="button" @click="deleteItem(item.id)">Eliminar</button>
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
            <card :title="stateForm === 1 ? 'Agregar Producto' : 'Actualizar Datos'">
              <form @submit.prevent="send_form_data">
                <div class="col-12">
                  <label for="code" class="form-label">Código:</label>
                  <input type="text" class="form-control" id="code" v-model="formData.code" required placeholder="P001">
                </div>
                <div class="col-12">
                  <label for="name" class="form-label">Nombre:</label>
                  <input type="text" class="form-control" id="name" v-model="formData.name" required placeholder="Fideos">
                </div>
                <div class="col-12">
                  <label for="price" class="form-label">Precio:</label>
                  <input type="text" class="form-control" id="price" v-model="formData.price" required placeholder="10">
                </div>
                <div class="col-12">
                  <label for="date" class="form-label">Fecha:</label>
                  <input type="date" class="form-control" id="date" v-model="formData.date" required>
                </div>
                <div class="form-group row">
                  <label for="category_id" class="col-12">Categoría:</label>
                  <div class="col-sm-9">
                    <select id="category_id" class="form-control" v-model="formData.id_category" required>
                      <option value="" disabled>Seleccione Categoría</option>
                      <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn-success">Guardar</button>
                <button type="button" class="btn btn-secondary" @click="cancel">Cancelar</button>
              </form>
            </card>
          </div>
        </template>
      </form>
    </div>

    <b-modal id="confirmDeleteModal" @ok="confirmDelete" title="Confirmar eliminación">
      ¿Estás seguro de que deseas eliminar este producto?
    </b-modal>
  </div>
</template>

<script>
import axios from 'axios';
import toast from 'vue-toast-notification';
import { BModal } from 'bootstrap-vue';

const pageSize = 10; // Tamaño de página, ajusta según lo necesario

export default {
  components: {
    BModal
  },
  name: 'ProductManager',
  data() {
    return {
      table: {
        title: "Productos",
        subTitle: "Administra tus productos",
        columns: ["#", "Código", "Nombre", "Precio", "Fecha", "Categoría", "Opciones"],
      },
      products: [],
      categories: [],
      stateForm: 0,
      formData: {
        id: null,
        code: "",
        name: "",
        price: "",
        date: "",
        id_category: ""
      },
      productToDelete: null,
      currentPage: 1, // Página actual
    };
  },
  computed: {
    tableClass() {
      return `table-${this.type}`;
    },
    paginatedProducts() {
      const startIndex = (this.currentPage - 1) * pageSize;
      return this.products.slice(startIndex, startIndex + pageSize);
    },
    totalPages() {
      return Math.ceil(this.products.length / pageSize);
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
    async fetchProducts() {
      try {
        let response = await axios.get('/index-product');
        this.products = response.data.products;
        this.$toast.success(response.data.message);
      } catch (error) {
        toast.error(error.message);
      }
    },
    async getCategories() {
      try {
        let response = await axios.get('/show-categories');
        this.categories = response.data.categories;
      } catch (error) {
        toast.error(error.message);
      }
    },
    edit(item) {
      this.stateForm = 2;
      this.formData = { ...item };
    },
    store(){
      this.stateForm = 1;
      this.openForm('product', 'store');
    },
    deleteItem(itemId) {
      this.productToDelete = itemId;
      this.$bvModal.show('confirmDeleteModal');
    },
    async confirmDelete() {
      try {
        let res = await axios.post(`/delete-product/${this.productToDelete}`);
        this.$toast.success(res.data.message);
        this.fetchProducts();
      } catch (error) {
        this.$toast.error('Error al eliminar el producto.');
      }
    },
    async store_product() {
      try {
        let res = await axios.post("/store-product", {
          code: this.formData.code,
          name: this.formData.name,
          price: this.formData.price,
          date: this.formData.date,
          id_category: this.formData.id_category
        });
        this.$toast.success(res.data.message);
        this.fetchProducts();
        this.stateForm = 0;
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
    async updateProduct() {
      try {
        let res = await axios.post(`/update-product/${this.formData.id}`, {
          code: this.formData.code,
          name: this.formData.name,
          price: this.formData.price,
          date: this.formData.date,
          id_category: this.formData.id_category
        });
        this.$toast.success(res.data.message);
        this.fetchProducts();
        this.stateForm = 0;
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
    send_form_data() {
      if (this.stateForm == 1) {
        this.store_product();
      }
      else if (this.stateForm == 2) {
        this.updateProduct();
      }
    },
    openForm(model, action, data = []) {
      switch (model) {
        case "product": {
          switch (action) {
            case "store": {
              this.formData = {
                id: null,
                code: "",
                name: "",
                price: "",
                date: "",
                id_category: ""
              };
              break;
            }
            case "update": {
              this.formData = { ...data };
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
    this.fetchProducts();
    this.getCategories();
  },
};
</script>
