import {pagination} from './elements.js';
let productModal = '';

const app = Vue.createApp({
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      isNew: '',
      productsList: [],
      pagination: {},
      productsNum: '',
      tempProduct: {
        imagesUrl: [],       // 圖一 ~ 圖五   
      },
    }
  },
  components: {
    pagination,
  },
  methods: {
    checkLogin() {              // axios check 確認登入狀態
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
      axios.defaults.headers.common.Authorization = token;
      
      axios.post(`${this.url}/api/user/check`)
        .then(res => {
          console.log('帳號認證(成功)', res);

          if(!res.data.success){
            this.swalFn(res.data.message, 'warning', 3000, '即將引導至登入畫面')
            setTimeout(() => {window.location.href='login_page.html';}, 3000)
          }

        })
        .catch(err => {
          console.dir('帳號認證(失敗)', err);
        })
    },
    getData(page = 1) {                 // axios get 取得資料
      const url = `${this.url}/api/${this.pathApi}/admin/products?page=${page}`;
      axios.get(url)
        .then(res => {
          if(res.data.success){
            this.productsList = res.data.products;
            this.productsNum = this.productsList.length;
            this.pagination = res.data.pagination;
            console.log('取得資料(全部資料)', res);
            console.log('取得資料(成功)', res.data.products);
            console.log('取得this資料(成功)',this.productsList);
          }else{
            console.log('取得資料(錯誤)', res.data.message);
          }
        })
        .catch(err => {
          console.dir('取得資料(失敗)', err);
        })
    },
    resetData() {               // 重新整理資料
      this.swalFn('正在重整資料', 'info')
      this.getData();
    },
    openProductModal(isNew, item) {   // 打開產品修改的視窗
      if (isNew === 'isNew'){
        this.isNew = true;
        this.tempProduct = {
          category: '請選擇分類',
          is_enabled: false,
          imageUrl: 'https://images.unsplash.com/photo-1574626003470-ac963a52dc7e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80',
          imagesUrl: [],
        }
        productModal.show();

      }else if(isNew === 'edite'){
        this.isNew = false;
        // 使用深層拷貝，避免修改圖片但未存檔的狀況下時影響到暫存資料
        this.tempProduct = JSON.parse(JSON.stringify(item));
        if(this.tempProduct.imagesUrl === undefined){
          this.tempProduct.imagesUrl =  [];
        }
        productModal.show();
      }
      
    },
    updateProduct(tempProduct){            // axios post/put 資料
      console.log('暫存資料', tempProduct);

      let url = `${this.url}/api/${this.pathApi}/admin/product`;
      let http = 'post';

      if(!this.isNew){
        url = `${this.url}/api/${this.pathApi}/admin/product/${tempProduct.id}`;
        http = 'put';
      }

      axios[http](url, { data: tempProduct })
      .then(res => {
        if(res.data.success) {
          console.log('新增/修改資料(成功)', res);
          productModal.hide();
          this.getData();
          this.swalFn(res.data.message, 'success')
          }else{
            console.log('新增/修改資料(錯誤)', res);
            this.swalFn(res.data.message, 'error', 10000)
            return;
          }
        })
        .catch(err => {
          console.dir('新增/修改資料(失敗)', err);
        })

    },
    deleteData(product) {       // 刪除產品
      const url = `${this.url}/api/${this.pathApi}/admin/product/${product.id}`;
      console.log('id', product.id);
      axios.delete(url)
        .then(res => {
          if(res.data.success) {
            console.log('刪除資料(成功)', res);
            this.swalFn(res.data.message, 'success');
            this.getData();
          }else{
            console.log('刪除資料(錯誤)', res);
            this.swalFn(res.data.message, 'error', 10000)
            return;
          }
        })
        .catch(err => {
          console.dir('刪除資料(失敗)', err);
        })
    },
    swalFn(title, icon, timer = 2000, text, button = false) {             // 一般提示視窗
      // success (成功) ； error (叉叉) ； warning(警告) ； info (說明)
      const txt = { title, text, icon, button, timer };
      swal(txt);
    },
    delSwalFn(product) {        // 刪除的確認視窗
      const txt = {
        title: `確定要刪除 [${product.title}] 嗎？`,
        text: '請注意，刪除後將無法復原！',
        icon: 'warning',
        buttons: ["取消", "確定刪除"],
        dangerMode: true,
      }
      swal(txt)
      .then(willDelete => {        // 針對選項執行不同動作
        if (willDelete) {
          this.deleteData(product);
        } else {
          this.swalFn('已取消操作', 'error', 1500);
        }

      });
    },
  },
  mounted() {
    // 定義新增/修改產品視窗的元素位置
    productModal = new bootstrap.Modal(document.querySelector('.js_productModal'));

    this.checkLogin();
    this.getData();
  }
});

// 將 model 註冊成元件
app.component('productModal',{
  props: ['tempProduct', 'isNew'],
  template: `
    <div class="js_productModal modal fade row m-1" tabindex="-1" 
      aria-labelledby="exampleModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered col-md-12">
        <div class="modal-content">
          <div class="modal-header px-4 bg_gray_green">
            <h5 class="modal-title" id="exampleModalLabel">{{ isNew ? '新增產品' : '修改產品' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-3">
            <div class="container-fluid">
              <form class="row" novalidate>
                <div class="col-5">

                  <div class="row mb-3">
                    <div class="col-12 mb-3">
                      <label class="m-2" for="mainImgUrl">主圖網址</label>
                      <input type="url" 
                        name="主圖網址" 
                        placeholder="請輸入主圖網址" 
                        id="mainImgUrl" 
                        class="form-control p-2" 
                        v-model="tempProduct.imageUrl">
                    </div>
                    <div class="col-12">
                      <img class="img-fluid" :src="tempProduct.imageUrl" alt="主圖預覽">
                    </div>
                  </div>

                  <div class="col-12 mb-3">
                    <div v-if="Array.isArray(tempProduct.imagesUrl)">
                      <div class="mt-3" v-for="(imgUrl, key) in tempProduct.imagesUrl" :key="key+1">
                        <label :for="key+1" class="my-2">
                          圖片網址 {{ key + 1 }}
                        </label>
                        <input type="url" 
                          :id="key+1" 
                          :name="key+1" 
                          placeholder="請輸入圖片網址" 
                          class="form-control p-2" 
                          v-model="tempProduct.imagesUrl[key]">

                          <div class="position-relative">
                            
                            <div class="position-absolute bottom-0 end-0">
                              <button type="button" title="刪除圖片"
                                class="btn btn-outline-danger border-2 m-2 px-3 py-2" 
                                @click="tempProduct.imagesUrl.splice(key, 1)">
                                ✘
                              </button>
                            </div>

                            <img class="img-fluid py-3" :src="imgUrl" alt="圖片預覽">
                          </div>
                      </div>

                      <div class="row">
                        <div v-if="Array.isArray(tempProduct.imagesUrl)" class="col-12">
                          <button  type="button" 
                            class="btn btn-outline-success w-100 my-3" 
                            @click="tempProduct.imagesUrl.push('')">
                            新增圖片
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div class="col-7">
                  <div class="row">
                    <div class="col-12 mb-3">
                      <label for="productTitle" class="m-2">品名</label>
                      <input type="text" 
                        name="品名" 
                        placeholder="請輸入品名"
                        id="productTitle" 
                        class="form-control p-2" 
                        v-model="tempProduct.title">
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productCategory" class="m-2">產品分類</label>
                      <select 
                        id="productCategory" 
                        class="form-select p-2" 
                        v-model="tempProduct.category">
                        <option disabled>請選擇分類</option>
                        <option value="飼料">飼料</option>
                        <option value="籠具">籠具</option>
                        <option value="玩具">玩具</option>
                        <option value="其餘用品">其餘用品</option>
                      </select>
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productUnit" class="m-2">單位</label>
                      <input type="text" 
                        name="單位" 
                        placeholder="請輸入單位" 
                        id="productUnit" 
                        class="form-control p-2" 
                        v-model="tempProduct.unit">
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productOriginPrice" class="m-2">原價</label>
                      <input type="number" 
                        min="1" 
                        name="原價" 
                        placeholder="請輸入原價" 
                        id="productOriginPrice" 
                        class="form-control p-2" 
                        v-model.number="tempProduct.origin_price">
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productPrice" class="m-2">售價</label>
                      <input type="number" 
                        min="1" 
                        name="售價" 
                        placeholder="請輸入售價" 
                        id="productPrice" 
                        class="form-control p-2" 
                        v-model.number="tempProduct.price">
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productDescription" class="m-2">產品描述</label>
                      <textarea 
                        rows="3" 
                        placeholder="請輸入產品描述" 
                        id="productDescription" 
                        class="form-control p-2" 
                        v-model="tempProduct.description"></textarea>
                    </div>

                    <div class="col-6 mb-3">
                      <label for="productContent" class="m-2">說明內容</label>
                      <textarea 
                        rows="3" 
                        placeholder="請輸入說明內容" 
                        id="productContent" 
                        class="form-control p-2" 
                        v-model="tempProduct.content"></textarea>
                    </div>

                    <div 
                      class="col-12 mb-3 form-check d-flex justify-content-end align-items-center">
                      <input type="checkbox" 
                        name="啟用狀態" 
                        value="啟用狀態"
                        id="enabled_status" 
                        class="form-check-input m-2" 
                        v-model="tempProduct.is_enabled">
                      <label for="enabled_status" class="">是否啟用</label>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
            <button type="submit" class="btn btn-success" 
              @click="$emit('updateProduct', tempProduct)">儲存</button>
          </div>
        </div>
      </div>
    </div>`,
})

app.mount('.js_backstage');