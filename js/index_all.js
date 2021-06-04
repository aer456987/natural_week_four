const app = {
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io',
      pathApi: 'toriha_vuetestapi',
      loginStatus: false,
      loginDatas: {
        userData: {
          username: '',
          password: '',
        },
        isFill: true,         // 判斷登入按鈕是否為禁用
      },
      errorStatus: {          // 錯誤資料整合
        isEmailError: false,  // 判斷欄位是否輸入錯誤
        emailErrorMsg: '',
        isPwError: false,     // 判斷欄位是否輸入錯誤
        pwErrorMsg: '',
        error: '',
      }
    }
  },
  methods: {
    fromValidateFn(txt){       // 驗證輸入
      const errorStatus = this.errorStatus;
      const loginDatas = this.loginDatas;

      if(txt === 'email'){
        loginDatas.isFill = true;
        this.emailValidateFn(errorStatus, loginDatas);

      }else if(txt === 'password'){
        loginDatas.isFill = true;
        this.pwValidateFn(errorStatus, loginDatas);
      }

      if(loginDatas.userData.username && loginDatas.userData.password){
        loginDatas.isFill = false;
      }

    },
    emailValidateFn(status, datas){
      const isMail = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
      status.isEmailError = true;
      datas.isFill = true;

      if (!isMail.test(datas.userData.username)) {
        status.emailErrorMsg = 'email格式錯誤';
      }
      else {
        status.isEmailError = false;
      }
    },
    pwValidateFn(status, datas){
      const isText = /^[a-zA-Z0-9]+$/;
      // const include = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,15}$/;
      const password = datas.userData.password;
      status.isPwError = true;
      datas.isFill = true;

      if (!isText.test(password)) {
        status.pwErrorMsg = '請勿包含特殊字元';
      } else if (password.length < 6) {
        status.pwErrorMsg = '請勿少於6個字';
      } else if (password.length > 15) {
        status.pwErrorMsg = '請勿超過15個字';
      } 
      // else if (!include.test(password)) {
      //   status.pwErrorMsg = '至少包括一個大小寫字母或數字';
      // } 
      else {
        status.isPwError = false;
      }
    },
    loginFn() {             // 登入事件
      this.loginDatas.error = '資料驗證中，請稍後';
      axios.post(`${this.url}/admin/signin`, this.loginDatas.userData)
      .then(res => {
        if(res.data.success){
          console.log('登入(成功)', res);
          this.loginDatas.error = '登入成功';
        }else{
          console.log('登入(錯誤)', res.data);
          this.loginDatas.error = `${res.data.message}, 請檢察帳號密碼`;
          return;
        }

        const {token, expired} = res.data;
        document.cookie = `hexToken=${token}; expires=${new Date(expired)}`;
        this.loginStatus = true;
        })
        .catch(err => {
          console.dir('登入(失敗)', err);
        })
    },
    checkLogin() {          // axios check 確認登入狀態
      axios.post(`${this.url}/api/user/check`)
        .then(res => {
          if(res.data.success){
            console.log('前台帳號認證(成功)', res);
            this.loginStatus = true;
          }else{
            console.log('前台帳號認證(錯誤)', res);
            this.loginStatus = false;
          }
        })
        .catch(err => {
          console.dir('前台帳號認證(失敗)', err);
        })
    },
    swalFn(title, icon, timer = 2000, text, button = false) {             // 一般提示視窗
      // success (成功) ； error (叉叉) ； warning(警告) ； info (說明)
      const txt = {
        title,
        text,
        icon,
        button,
        timer,
      };
      swal(txt);
    }
  },
  mounted() {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;

    this.checkLogin();
  }
}

Vue.createApp(app).mount('.js_index');