const { Insurance, Insurance_type, Catalog, Catalog_insurance } = require("../models");
const { QueryTypes, Op, where } = require("sequelize");
const db = require("../models/index");
const moment = require('moment-timezone'); // require
const getListInsurance = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let insurances = await Insurance.findAll({

            //raw: true,
            include: [
                {
                    model: Insurance_type,
                    attributes: ['name']
                },
                {
                    model: Catalog_insurance,
                    include: [
                        {
                            model: Catalog,
                            attributes: ['name'],
                        }
                    ]
                }
            ]
        })

        await insurances.forEach((emp) => {
            let name = ''
            emp.Catalog_insurances.forEach((catalog) => {
                name += catalog.Catalog.dataValues.name + ";"
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
const getCatalog = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let catalogs = await Catalog.findAll({



        })

        const error = req.flash('error')[0];
        return res.render('insurance/listCatalog', { error: error, catalogs: catalogs, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách các danh mục!');
        return res.redirect('/insurance/listInsurance');
    }
};
const getListInsuranceType = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let types = await Insurance_type.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('insurance/listType', { error: error, types: types, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách loại bảo hiểm');
        return res.redirect('/insurance/listInsurance');
    }
};
const getFormAddInsurance = async (req, res) => {
    try {


        const types = await Insurance_type.findAll({
            where: {
                isDel: 0,
            },
            attributes: ['idInsurance_type', 'name']
        })

        return res.render('Insurance/addInsurance', { types: types });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập nhân viên');
        return res.status(500).json({ isSuccess: false })
    }
};
const addInsurance = async (req, res) => {
    try {



        let { name, info, premium, premiumPaymentTerm, frequency,
            insuranceAmount, contractTerm, isMain, idType, } = req.body
        console.log('test2')
        if (isMain) {
            isMain = true
        }
        else {
            isMain = false
        }
        console.log(name, info, premium, premiumPaymentTerm, frequency,
            insuranceAmount, contractTerm, isMain, idType)
        const newInsurance = await Insurance.create({
            name, info, premium, premiumPaymentTerm, frequency,
            insuranceAmount, contractTerm, isMain, idInsurance_type: idType, isDel: 0

        });
        console.log(newInsurance)
        console.log('test1')




        req.flash('error', 'Thêm mới bảo hiểm thành công!');


        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới bảo hiểm');
        return res.redirect('/insurance/listInsurance');
    }
};
module.exports = {
    getListInsurance, getFormAddInsurance, addInsurance, getListInsuranceType, getCatalog,

};