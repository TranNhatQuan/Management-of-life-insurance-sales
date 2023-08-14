const { Account, User, Staff } = require("../models");
const db = require("../models/index");
const moment = require('moment-timezone'); // require

const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const createCustomerWithTransaction = async (name, email, phone, address, permission, username, password) => {
    //console.log('test1')
    const t = await db.sequelize.transaction(); // Bắt đầu transaction

    let isSuccess
    try {
        //console.log('test2')
        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(password, salt);
        //console.log('test3')
        const newAccount = await Account.create({
            username,

            password: hashPassword,

        }, { transaction: t });
        //console.log('test4')
        const newCustomer = await Staff.create({
            idAccount: newAccount.idAccount,
            name,
            mail: email,
            phone,
            address,
            isActive: 1

        }, { transaction: t });



        await t.commit(); // Lưu thay đổi và kết thúc transaction
        isSuccess = true
    } catch (error) {
        isSuccess = false
        await t.rollback(); // Hoàn tác các thay đổi và hủy bỏ transaction

    }

    return isSuccess
}

const createAccountForCustomer = async (req, res) => {


    try {
        const { phone, password, name } = req.body;
        if (phone === '' || password === '' || name === '') {
            return res.status(400).json({ isSuccess: false, mes: 'addStaff1' });
        }
        if (isNaN(phone) || password === undefined || name === undefined) {
            return res.status(400).json({ isSuccess: false, mes: 'addStaff2' });
        }
        //tạo ra một chuỗi ngẫu nhiên
        let isSuccess = await createCustomerWithTransaction(phone, password, name)

        res.status(200).json({

            isSuccess
        });

    } catch (error) {
        res.status(500).json({
            isExist: true,
            isSuccess: false
        });
    }
};
//tam thoi chua co

const loginAdmin = async (req, res) => {
    try {
        const { password, username } = req.body;

        //console.log(account)
        let account = await Account.findOne({
            where: {
                username
            }
        })
        if (account) {
            const isAuth = bcrypt.compareSync(password, account.password);

            if (isAuth) {
                let staff = await Staff.findOne({
                    where: {
                        idAccount: account.idAccount,
                        isActive: 1,
                    },
                });
                if (!staff) {
                    req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
                    return res.redirect('/account/admin/login');
                }


                const token = jwt.sign({ idAccount: account.idAccount }, "hehehe", {
                    expiresIn: 30 * 60 * 60 * 60,
                });
                req.session.token = token;
                res.redirect('/staff/home');
            } else {
                req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
                return res.redirect('/account/admin/login');
            }
        }
        else {
            req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
            return res.redirect('/account/admin/login');
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        return res.redirect('/account/admin/login');
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const account = await Account.findOne({
            where: {
                username
            }
        })
        if (account) {
            const isAuth = bcrypt.compareSync(password, account.password);

            if (isAuth) {
                let customer

                customer = await User.findOne({
                    where: {
                        idAccount: account.idAccount,
                        isActive: 1,
                    },
                });
                if (!customer) {
                    req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
                    return res.redirect('/account/login');
                }



                const token = jwt.sign({ idAccount: account.idAccount }, "hehehe", {
                    expiresIn: 30 * 60 * 60 * 60,
                });
                req.session.token = token;
                res.redirect('/user/home');

            } else {
                req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
                return res.redirect('/account/login');
            }
        }
        else {
            req.flash('error', 'Sai tên tài khoản hoặc mật khẩu');
            return res.redirect('/account/login');
        }
        //console.log(account)

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra');
        return res.redirect('/account/login');
    }

};

const changePassword = async (req, res) => {
    const { oldPassword, newPassword, repeatPassword } = req.body;
    console.log("test")
    console.log(req.mail)
    try {
        const accountUpdate = await Account.findOne({
            where: {
                mail: req.mail,
            },
        });
        const isAuth = bcrypt.compareSync(oldPassword, accountUpdate.password);
        if (isAuth) {
            if (newPassword == repeatPassword) {
                if (newPassword == oldPassword) {
                    res.status(400).json({
                        status: true,
                    });
                } else {
                    //tạo ra một chuỗi ngẫu nhiên
                    const salt = bcrypt.genSaltSync(10);
                    //mã hoá salt + password
                    const hashPassword = bcrypt.hashSync(newPassword, salt);

                    accountUpdate.password = hashPassword;
                    await accountUpdate.save();
                    res.status(200).json({
                        status: true,
                        isSuccess: true
                    });
                }
            } else {
                res.status(400).json({
                    status: true,
                    isSuccess: false
                });
            }
        } else {
            res.status(400).json({
                status: false,
                isSuccess: false
            });
        }
    } catch (error) {
        res.status(500).json({
            status: true,
            isSuccess: false
        });
    }
};

const logout = async (req, res, next) => {
    delete req.session.token;

    return res.redirect('/account/login'); // Chuyển hướng về trang đăng nhập
};
const logoutAdmin = async (req, res, next) => {
    delete req.session.token;

    return res.redirect('/account/admin/login'); // Chuyển hướng về trang đăng nhập
};
const logoutUser = async (req, res, next) => {
    delete req.session.token;

    return res.redirect('/intro/home'); // Chuyển hướng về trang đăng nhập
};
const getLogin = async (req, res) => {
    const error = req.flash('error')[0];
    res.render('account/userLogin', { error: error });
};
const formForgotUser = async (req, res) => {
    const error = req.flash('error')[0];

    res.render('account/forgotUser', { error: error });
};
const forgotUser = async (req, res) => {
    try {


        const { mail } = req.body

        const user = await User.findOne({
            where: {
                mail
            }
        })

        if (user) {
            const randomID = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
            const isExist1 = await Account.findOne({
                where: {
                    forgot: randomID,
                },
            });
            if (isExist1) {
                req.flash('error', 'Có lỗi xảy ra1!');
                return res.redirect('/account/formForgotUser');
            } else {
                let account = await Account.findOne({
                    include: [
                        {
                            model: User,
                            where: {
                                idUser: user.idUser
                            }
                        }
                    ]
                })
                account.forgot = randomID
                await account.save()
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: "trannhatquan.2001@gmail.com", // generated ethereal user
                        pass: "bseuvtvsghpnrltz", // generated ethereal password
                    },
                });
                // send mail with defined transport object
                await transporter.sendMail({
                    from: "trannhatquan.2001@gmail.com", // sender address
                    to: `${mail}`, // list of receivers
                    subject: "Quên mật khẩu", // Subject line
                    text: "Quên mật khẩu", // plain text body
                    html: `Mã xác nhận của bạn là: ${randomID}`, // html body
                });
                const error = req.flash('error')[0];
                res.render('account/otpUser', { error: error, idAccount: account.idAccount });
            }
        }
        else {

            req.flash('error', 'Không tồn tại email!');
            return res.redirect('/account/formForgotUser');

        }
    }
    catch (error) {
        req.flash('error', 'Có lỗi xảy ra2!');
        return res.redirect('/account/formForgotUser');

    }


};
const confirmOTPUser = async (req, res) => {
    try {
        const error = req.flash('error')[0];
        const { idAccount } = req.params
        const { otp } = req.body
        const account = await Account.findOne({
            where: {
                forgot: otp,
                idAccount
            }
        })
        if (account) {
            const error = req.flash('error')[0];
            res.render('account/changePassUser', { error: error, idAccount: account.idAccount });

        }
        else {

            req.flash('error', 'Mã xác nhận sai!');
            const error = req.flash('error')[0];
            res.render('account/otpUser', { error: error, idAccount });

        }
    }
    catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        res.redirect('/account/forgotUser')

    }
};
const changePassAfterOTPStaff = async (req, res) => {
    try {

        const { idAccount } = req.body

        let account = await Account.findOne({
            where: {
                idAccount
            }
        })
        if (account) {
            const { newPassword, confirmPassword } = req.body
            if (newPassword != confirmPassword) {
                flash('error', 'Không tìm thấy tài khoản!');
                return res.redirect(req.query.url);
            }
            const salt = bcrypt.genSaltSync(10);
            //mã hoá salt + password
            const hashPassword = bcrypt.hashSync(newPassword, salt);
            account.password = hashPassword
            account.forgot = 0
            await account.save()
            req.flash('error', 'Đổi mật khẩu thành công!');
            return res.redirect('/account/admin/login');

        }
        else {
            req.flash('error', 'Không tìm thấy tài khoản!');
            const error = req.flash('error')[0];
            res.render('account/changePassStaff', { error: error, idAccount })
        }
    }
    catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.redirect('/account/admin/login');


    }
};
const changePassAfterOTPUser = async (req, res) => {
    try {

        const { idAccount } = req.body

        let account = await Account.findOne({
            where: {
                idAccount
            }
        })
        console.log(1)
        if (account) {
            const { newPassword, confirmPassword } = req.body
            if (newPassword != confirmPassword) {
                req.flash('error', 'Mật khẩu mới và mật khẩu xác nhận không giống nhau!');
                const error = req.flash('error')[0];
                res.render('account/changePassUser', { error: error, idAccount })
            }
            console.log(2)
            const salt = bcrypt.genSaltSync(10);
            //mã hoá salt + password
            const hashPassword = bcrypt.hashSync(newPassword, salt);
            console.log(3)
            account.password = hashPassword
            account.forgot = 0
            console.log(4)
            await account.save()
            console.log(5)
            req.flash('error', 'Đổi mật khẩu thành công!');
            const error = req.flash('error')[0];
            return res.redirect('/account/login');
        }
        else {
            req.flash('error', 'Không tìm thấy tài khoản!');
            const error = req.flash('error')[0];
            res.render('account/changePassUser', { error: error, idAccount })


        }
    }
    catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.redirect('/account/login');

    }
};
const formForgotStaff = async (req, res) => {
    const error = req.flash('error')[0];

    res.render('account/forgotStaff', { error: error });
};
const forgotStaff = async (req, res) => {
    try {
        const error = req.flash('error')[0];
        const { mail } = req.body
        const user = await Staff.findOne({
            where: {
                mail
            }
        })
        if (user) {
            const randomID = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
            const isExist1 = await Account.findOne({
                where: {
                    forgot: randomID,
                },
            });
            if (isExist1) {
                req.flash('error', 'Có lỗi xảy ra1!');
                return res.redirect('/account/formForgotStaff');
            } else {
                let account = await Account.findOne({
                    include: [
                        {
                            model: Staff,
                            where: {
                                idStaff: user.idStaff
                            }
                        }
                    ]
                })
                account.forgot = randomID
                await account.save()
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: "trannhatquan.2001@gmail.com", // generated ethereal user
                        pass: "bseuvtvsghpnrltz", // generated ethereal password
                    },
                });
                // send mail with defined transport object
                await transporter.sendMail({
                    from: "trannhatquan.2001@gmail.com", // sender address
                    to: `${mail}`, // list of receivers
                    subject: "Quên mật khẩu", // Subject line
                    text: "Quên mật khẩu", // plain text body
                    html: `Mã xác nhận của bạn là: ${randomID}`, // html body
                });
                const error = req.flash('error')[0];
                res.render('account/otpStaff', { error: error, idAccount: account.idAccount });
            }
        }
        else {
            req.flash('error', 'Không tồn tại email!');
            return res.redirect('/account/formForgotStaff');

        }
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra2!');

        return res.redirect('/account/formForgotStaff');
    }


};
const confirmOTPStaff = async (req, res) => {
    try {
        const error = req.flash('error')[0];
        const { idAccount } = req.params
        const { otp } = req.body
        const account = await Account.findOne({
            where: {
                forgot: otp,
                idAccount
            }
        })
        if (account) {




            const error = req.flash('error')[0];
            res.render('account/changePassStaff', { error: error, idAccount: account.idAccount });

        }
        else {

            req.flash('error', 'Mã xác nhận sai!');
            const error = req.flash('error')[0];
            res.render('account/otpStaff', { error: error, idAccount });

        }
    }
    catch (error) {
        req.flash('error', 'Có lỗi xảy ra!');
        return res.redirect('/account/forgotStaff');

    }
};
const getLoginAdmin = async (req, res) => {
    const error = req.flash('error')[0];
    res.render('account/adminLogin', { error: error });
};
const forgotPassword = async (req, res) => {
    const { mail } = req.body;
    try {
        const randomID = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000);
        const isExist1 = await Account.findOne({
            where: {
                forgot: randomID,
            },
        });
        if (isExist1 !== null) {
            res.status(400).json({
                isExist: true,
                isSuccess: false
            });
        } else {

            await Account.sequelize.query(
                "UPDATE accounts SET forgot = :randomID WHERE mail = :mail",
                {
                    type: QueryTypes.UPDATE,
                    replacements: {
                        randomID: randomID,
                        mail: mail,
                    },
                }
            );
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "n19dccn107@student.ptithcm.edu.vn", // generated ethereal user
                    pass: "bqztpfkmmbpzmdxl", // generated ethereal password
                },
            });
            // send mail with defined transport object
            await transporter.sendMail({
                from: "n19dccn107@student.ptithcm.edu.vn", // sender address
                to: `${mail}`, // list of receivers
                subject: "FORGOT PASSWORD", // Subject line
                text: "FORGOT PASSWORD", // plain text body
                html: `Mã xác nhận của bạn là: ${randomID}`, // html body
            });

            return res.status(200).json({
                isExist: true,
                isSuccess: true,
                message: `Mã xác minh đã được gửi về email: ${mail} vui lòng kiểm tra hòm thư!`,
            });
        }
    } catch (error) {
        res.status(500).json({
            isExist: true,
            isSuccess: false
        });
    }
};



const verify = async (req, res, next) => {
    const { verifyID, mail } = req.body;
    const account = await Account.findOne({
        where: {
            forgot: verifyID,
            mail
        },
        raw: true,
    });
    if (account) {
        res.status(200).json({
            message: `Mã xác nhận chính xác!`,
            isSuccess: true
        });
    } else {
        res.status(400).json({
            message: `Mã xác nhận không chính xác!`,
            isSuccess: false
        });
    }
};

const accessForgotPassword = async (req, res, next) => {
    const { mail, password, repeatPassword } = req.body;
    if (password != repeatPassword) {
        res.status(400).json({
            message: `Mật khẩu lặp lại không chính xác!`,
            isSuccess: false
        });
    } else {
        const salt = bcrypt.genSaltSync(10);
        //mã hoá salt + password
        const hashPassword = bcrypt.hashSync(password, salt);
        try {
            const accountUpdate = await Account.findOne({
                where: {
                    mail,
                },
            });
            accountUpdate.password = hashPassword;
            accountUpdate.forgot = 0;

            await accountUpdate.save();
            res.status(200).json({
                message: `Lấy lại mật khẩu thành công!`,
                isSuccess: true
            });
        } catch (error) {
            res.status(500).json({
                message: `Lấy lại mật khẩu thất bại!`,
                isSuccess: false
            });
        }
    }
};




module.exports = {
    // getDetailTaiKhoan,
    login, logout, createAccountForCustomer, changePassword, forgotPassword, loginAdmin, verify, accessForgotPassword,
    getLogin, getLoginAdmin, logoutAdmin, createCustomerWithTransaction, logoutUser,
    formForgotStaff, formForgotUser, forgotStaff, forgotUser, confirmOTPStaff, confirmOTPUser,
    changePassAfterOTPStaff, changePassAfterOTPUser
};