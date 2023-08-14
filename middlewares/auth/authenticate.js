const jwt = require("jsonwebtoken");
const { Account, Staff, User } = require("../../models");
const authenticate = async (req, res, next) => {

  try {
    const token = req.headers.access_token;
    if (!token) {
      return res.status(403).json({ message: "Vui lòng đăng nhập!", isSuccess: false });
    }
    const data = jwt.verify(token, "hehehe");


    const account = await Account.findOne({
      where: { phone: data.phone },
      attributes: ['idAcc', 'phone', 'role'],
    })
    req.account = account;


    return next();
  } catch {
    return res.status(403).json({ message: "Vui lòng đăng nhập!", isSuccess: false });
  }
}
const checkAuth = async (req, res, next) => {

  try {
    if (!req.session.token) {
      return next();
    }
    else {
      const token = req.session.token
      const data = jwt.verify(token, "hehehe");

      const user = await User.findOne({
        where: { idAccount: data.idAccount, isActive: 1 },

      })
      if (user) {
        req.user = user;


        return next();
      }
      else {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.redirect('/intro/home');
      }
    }


  } catch {
    req.flash('error', 'Có lỗi xảy ra');
    return res.redirect('/account/login');
  }
}

const authenticateUser = async (req, res, next) => {

  try {
    if (!req.session.token) {
      req.flash('error', 'Vui lòng đăng nhập');
      return res.redirect('/account/login');
    }
    const token = req.session.token
    const data = jwt.verify(token, "hehehe");
    //console.log(1)
    //console.log(data)
    const user = await User.findOne({
      where: { idAccount: data.idAccount, isActive: 1 },

    })
    if (user) {
      req.user = user;
      //console.log(2)

      return next();
    }
    else {
      req.flash('error', 'Vui lòng đăng nhập');
      return res.redirect('/account/login');
    }

  } catch {
    req.flash('error', 'Có lỗi xảy ra');
    return res.redirect('/account/login');
  }
}
const authenticateStaff = async (req, res, next) => {

  try {
    if (!req.session.token) {
      req.flash('error', 'Vui lòng đăng nhập');
      return res.redirect('/account/admin/login');
    }
    const token = req.session.token
    const data = jwt.verify(token, "hehehe");
    //console.log(1)
    //console.log(data)
    const staff = await Staff.findOne({
      where: { idAccount: data.idAccount, isActive: 1 },

    })
    if (staff) {
      req.staff = staff;
      //console.log(2)

      return next();
    }
    else {
      req.flash('error', 'Vui lòng đăng nhập');
      return res.redirect('/account/admin/login');
    }

  } catch {
    req.flash('error', 'Có lỗi xảy ra');
    return res.redirect('/account/admin/login');
  }
}

module.exports = {
  authenticateStaff, authenticate, authenticateUser, checkAuth
}