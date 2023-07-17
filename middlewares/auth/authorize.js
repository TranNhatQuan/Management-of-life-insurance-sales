const { splitPermission } = require("../../controllers/staff.controllers");
const { Account, User, Staff } = require("../../models");
const { QueryTypes } = require("sequelize");

const authorize = (role) => async (req, res, next) => {
    try {
        
        const staff = req.staff
        const idStaff = staff.idStaff
        const check = await splitPermission(role, idStaff, 0)
        
        if (check) {
          
            next()
        }
        
        else {
            req.flash('error', 'Bạn không có quyền truy cập chức năng này!');
            return res.redirect(req.query.url);
            
        }




    } catch (error) {
        req.flash('error', 'Có lỗi đã xảy ra.');
        return res.redirect('/account/admin/login');
    }

};

module.exports = {
    authorize,
}