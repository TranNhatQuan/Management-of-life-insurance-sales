const { Insurance, Insurance_type, Catalog, Catalog_insurance} = require("../models");
const { QueryTypes, Op, where } = require("sequelize");
const db = require("../models/index");
const moment = require('moment-timezone'); // require
const getListInsurance = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let insurances = await Insurance.findAll({

            //raw: true,
            include:[
                {
                    model: Insurance_type,
                    attributes: ['name']
                },
                {
                    model: Catalog_insurance,
                    include:[
                        {
                            model:Catalog,
                            attributes: ['name'],
                        }
                    ]
                }
            ]
        })

        await insurances.forEach((emp) => {
            let name =''
            emp.Catalog_insurances.forEach((catalog) => {
                name += catalog.Catalog.dataValues.name+";"
            });
            emp.dataValues.type = emp.Insurance_type.dataValues.name
            delete emp.dataValues.Insurance_type
            delete emp.dataValues.idInsurance_type
            delete emp.dataValues.Catalog_insurances
            emp.dataValues.catalog = name
            
        });
        const error = req.flash('error')[0];
        return res.render('insurance/listInsurance', { error: error, insurances: insurances, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách bảo hiểm');
        return res.redirect('/staff/home');
    }
};
const getFormAddInsurance = async (req, res) => {
    try {

       
        const insurances = await Insurance.findAll({
            where:{
                isDel:0
            },
            attributes:['idInsurance','name']
        })
   
        return res.render('Insurance/addInsurance', {insurances: insurances});

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};

module.exports = {
  getListInsurance, getFormAddInsurance
};