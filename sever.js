const express = require("express");
const session = require('express-session');
const flash = require('connect-flash');
const {sequelize} = require("./models");
const {rootRouter} = require("./routers")
const cookieParser = require("cookie-parser");
const port = 3007;
const app = express();
const cors = require("cors");
const ejsMate = require('ejs-mate');
app.use(flash());
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Cấu hình flash message

// Định dạng tệp view EJS sẽ được lưu trữ trong thư mục "views"
app.set('views', './public/views');
app.use(cookieParser());
app.use(cors());
//cài ứng dụng sử dụng json
app.use(express.json());
//cài static file
app.use(
  express.urlencoded({
    extended: true,
  }),
);

//dùng router
app.use(rootRouter);
const cron = require('cron');
const { checkContractPayment, checkPayment, checkDateDetailContract, checkContract } = require("./cronjob/cronJob");
// const job = new cron.CronJob('*/30 * * * * *', async () => {
//   await checkContractPayment()
// });
const job = new cron.CronJob('0 0 0 * * *', async () => {
  // job này chạy mỗi ngày vào 00:00:00
  await checkContractPayment()
  await checkPayment()
  await checkDateDetailContract()
  await checkContract()
});

job.start(); // Bắt đầu chạy CronJob

//lắng nghe sự kiện kết nối
app.listen(port, async () => {
    console.log(`App listening on http://localhost:${port}`);
    try {
        await sequelize.authenticate();
        console.log('Kết nối thành công!.');
      } catch (error) {
        console.error('Kết nối thất bại:', error);
      }
})