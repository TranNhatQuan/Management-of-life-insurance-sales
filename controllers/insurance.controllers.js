const { Insurance, Insurance_type, Catalog, Catalog_insurance, Sub_insurance, Detail_contract } = require("../models");
const { QueryTypes, Op, where } = require("sequelize");
const db = require("../models/index");
const moment = require('moment-timezone'); // require
const e = require("express");
const { updateData, getData } = require("../middlewares/getDataIntro/getData");
const getListInsurance = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name
        console.log(1)
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
        console.log(1.2)
        const catalogs = await Catalog.findAll({

        })
        console.log(2)
        await insurances.forEach((emp) => {
            let name = ''
            let index = 0
            emp.Catalog_insurances.forEach((catalog) => {
                index++
                name += ('\n' + index + '. ' + catalog.Catalog.dataValues.name + '')
            });

            emp.dataValues.type = emp.Insurance_type.dataValues.name
            delete emp.dataValues.Insurance_type
            delete emp.dataValues.idInsurance_type
            delete emp.dataValues.Catalog_insurances
            emp.dataValues.catalog = name
            if (emp.isMain == true) {
                emp.dataValues.isMain = "Sản phẩm chính"
            } else {
                emp.dataValues.isMain = "Sản phẩm bổ trợ của"
            }
        });
        console.log(3)
        const error = req.flash('error')[0];
        return res.render('insurance/listInsurance', { error: error, insurances: insurances, name: name, catalogs: catalogs });

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
const getFormAddSubInsurance = async (req, res) => {
    try {

        const { idInsurance } = req.params
        const types = await Insurance_type.findAll({
            where: {
                isDel: 0,
            },
            attributes: ['idInsurance_type', 'name']
        })

        const insurance = await Insurance.findOne({
            where: {

                isMain: true,
                idInsurance,
            },
        })

        return res.render('Insurance/addSubInsurance', { types: types, insurance: insurance });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập sản phẩm bổ trợ');
        return res.status(500).json({ isSuccess: false })
    }
};
const addSubInsurance = async (req, res) => {
    try {

        const { idInsurance } = req.params

        let { name, info, premium,
            insuranceAmount, idType } = req.body

        let isMain = false
        let insurance = await Insurance.findOne({
            where: {
                idInsurance: idInsurance,
                isMain: true,
            }
        })
        if (insurance) {
            let frequency = insurance.frequency
            let premiumPaymentTerm = insurance.premiumPaymentTerm
            let contractTerm = insurance.contractTerm
            const newInsurance = await Insurance.create({
                name, info, premium, premiumPaymentTerm, frequency,
                insuranceAmount, contractTerm, isMain, idInsurance_type: idType, isDel: 0, idMainInsurance: idInsurance

            });
            if (req.files && req.files.image1 && req.files.image2) {
                console.log('test');
                console.log(req.files.image1)
                const image1 = req.files.image1;
                filePath = `public/uploads/imageInsurance/${newInsurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

                // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
                await image1.mv(filePath);
                const image2 = req.files.image2;
                filePath = `public/uploads/infoInsurance/${newInsurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

                // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
                await image2.mv(filePath);
                console.log('test2');
            }
            req.flash('error', 'Thêm mới bảo hiểm thành công!');


            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Không tìm thấy bảo hiểm chính bạn chọn');
            return res.redirect('/insurance/listInsurance');
        }




    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới bảo hiểm');
        return res.redirect('/insurance/listInsurance');
    }
};
const addInsurance = async (req, res) => {
    try {

        const staff = req.staff

        let { name, info, premium, premiumPaymentTerm, frequency,
            insuranceAmount, contractTerm, idType, } = req.body


        let isMain = true


        const now = new Date()
        const newInsurance = await Insurance.create({
            name, info, premium, premiumPaymentTerm, frequency,
            insuranceAmount, contractTerm, isMain, idInsurance_type: idType, isDel: 0, idStaff: staff.idStaff, date: now

        });
        if (req.files && req.files.image1 && req.files.image2) {
            console.log('test');
            console.log(req.files.image1)
            const image1 = req.files.image1;
            filePath = `public/uploads/imageInsurance/${newInsurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

            // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
            await image1.mv(filePath);
            const image2 = req.files.image2;
            filePath = `public/uploads/infoInsurance/${newInsurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

            // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
            await image2.mv(filePath);
            console.log('test2');
        }




        req.flash('error', 'Thêm mới bảo hiểm thành công!');


        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới bảo hiểm');
        return res.redirect('/insurance/listInsurance');
    }
};
const getFormAddCatalog = async (req, res) => {
    try {


        return res.render('Insurance/addCatalog');

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập danh mục');
        return res.status(500).json({ isSuccess: false })
    }
};
const addCatalog = async (req, res) => {
    try {



        let { name, info } = req.body


        const newCatalog = await Catalog.create({
            name,
            info,
        });
        const update = await updateData()
        req.flash('error', 'Thêm mới danh mục thành công!');
        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới danh mục!');
        return res.redirect('/insurance/catalog');
    }
};
const getFormAddType = async (req, res) => {
    try {




        return res.render('Insurance/addType',);

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập loại bảo hiểm!');
        return res.status(500).json({ isSuccess: false })
    }
};
const addType = async (req, res) => {
    try {



        let { name, info } = req.body
        console.log('test2')
        const newType = await Insurance_type.create({
            name,
            info,
            isDel: false,
        });
        const update = await updateData()
        req.flash('error', 'Thêm mới loại bảo hiểm thành công!');


        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới loại bảo hiểm');
        return res.redirect('/insurance/listType');
    }
};
const getFormeditInsurance = async (req, res) => {
    try {
        const { idInsurance } = req.params



        let insurance = await Insurance.findOne({
            where: {
                idInsurance,
            }
        })
        if (insurance) {
            let types = await Insurance_type.findAll({
                where: {
                    isDel: false
                }
            })
            if (insurance.dataValues.isMain === true) {
                insurance.dataValues.isMain = 1
            }
            else {
                insurance.dataValues.isMain = 0
            }
            return res.render('Insurance/editInsurance', { types: types, insurance: insurance });
        }
        else {
            req.flash('error', 'Không tìm thấy bảo hiểm!');
            return res.status(500).json({ isSuccess: false })
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form sửa bảo hiểm!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editInsuranceCatalog = async (arr, idInsurance) => {

    arr.forEach(async element => {
        let insuranceCatalog = await Catalog_insurance.create({

            idInsurance,
            idCatalog: element

        })

    });
    return true
}
const editSub = async (arr, idInsurance) => {

    arr.forEach(async element => {
        let insuranceCatalog = await Sub_insurance.create({

            idMainInsurance: idInsurance,
            idSubInsurance: element,

        })

    });
    return true
}
const editMain = async (arr, idInsurance) => {

    arr.forEach(async element => {
        let insuranceCatalog = await Sub_insurance.create({

            idMainInsurance: element,
            idSubInsurance: idInsurance,

        })

    });
    return true
}
const addMain = async (req, res) => {
    try {

        const { idInsurance } = req.params



        let insurance = await Insurance.findOne({
            where: {
                idInsurance,
            }
        })
        if (insurance) {
            const { item } = req.body
            let sub_insurance = await Sub_insurance.destroy({
                where: {
                    idSubInsurance: idInsurance
                }
            })

            if (item != null) {
                let arr
                if (Array.isArray(item)) {
                    arr = item
                } else {
                    arr = [item]
                }
                const edit = await editMain(arr, idInsurance)
            }
            req.flash('error', 'Thêm sản phẩm chính cho sản phẩm bổ trợ thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Thêm sản phẩm chính cho sản phẩm bổ trợ thất bại, bảo hiểm bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi gắn sản phẩm chính cho sản phẩm bổ trợ!');
        return res.redirect(req.query.url);
    }
};
const addSub = async (req, res) => {
    try {

        const { idInsurance } = req.params



        let insurance = await Insurance.findOne({
            where: {
                idInsurance,
            }
        })
        if (insurance) {
            const { item } = req.body
            let sub_insurance = await Sub_insurance.destroy({
                where: {
                    idMainInsurance: idInsurance
                }
            })

            if (item != null) {
                let arr
                if (Array.isArray(item)) {
                    arr = item
                } else {
                    arr = [item]
                }
                const edit = await editSub(arr, idInsurance)
            }
            req.flash('error', 'Thêm sản phẩm bổ trợ vào sản phẩm chính thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Thêm sản phẩm bổ trợ vào sản phẩm chính thất bại, bảo hiểm bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi gắn sản phẩm bổ trợ vào sản phẩm chính!');
        return res.redirect(req.query.url);
    }
};
const addInsuranceIntoCatalog = async (req, res) => {
    try {

        const { idInsurance } = req.params



        let insurance = await Insurance.findOne({
            where: {
                idInsurance,
            }
        })
        if (insurance) {
            const { catalog } = req.body
            let insurance_catalog = await Catalog_insurance.destroy({
                where: {
                    idInsurance
                }
            })

            if (catalog != null) {
                let arr
                if (Array.isArray(catalog)) {
                    arr = catalog
                } else {
                    arr = [catalog]
                }
                const edit = await editInsuranceCatalog(arr, idInsurance)
            }
            req.flash('error', 'Thêm bảo hiểm vào danh mục thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Thêm bảo hiểm vào danh mục thất bại, bảo hiểm bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm bảo hiểm vào danh mục!');
        return res.redirect(req.query.url);
    }
};

const editInsurance = async (req, res) => {
    try {

        const { idInsurance } = req.params



        let insurance = await Insurance.findOne({
            where: {
                idInsurance,
            }
        })
        let contract = await Detail_contract.findOne({
            where:{
                idInsurance,
            }
        })
        if(contract){
            req.flash('error', 'Sửa bảo hiểm thất bại, bảo hiểm đã đã tồn tại trong ít nhất một hợp đồng!');
            return res.redirect(req.query.url);
        }
        if (insurance) {
           
            let { name, info, premium, premiumPaymentTerm, frequency,
                insuranceAmount, contractTerm, idInsurance_type } = req.body

            insurance.name = name
            insurance.info = info
            insurance.premium = premium
            insurance.premiumPaymentTerm = premiumPaymentTerm
            insurance.frequency = frequency
            insurance.insuranceAmount = insuranceAmount
            insurance.contractTerm = contractTerm
            insurance.idInsurance_type = idInsurance_type
            await insurance.save()
            if(insurance.isMain==true){
                let update = Insurance.update({
                    premiumPaymentTerm:premiumPaymentTerm,
                    frequency:frequency,
                    contractTerm:contractTerm
                },
                {
                    where:{
                        idMainInsurance:idInsurance
                    }
                })
            }
            if (req.files && req.files.image1 && req.files.image2) {
                console.log('test');
                console.log(req.files.image1)
                const image1 = req.files.image1;
                filePath = `public/uploads/imageInsurance/${insurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

                // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
                await image1.mv(filePath);
                const image2 = req.files.image2;
                filePath = `public/uploads/infoInsurance/${insurance.idInsurance}.jpg`; // Hoặc mở rộng tệp tin khác (png, jpeg, ...)

                // Lưu file ảnh từ yêu cầu vào thư mục 'uploads' trên server
                await image2.mv(filePath);
                console.log('test2');
            }
            req.flash('error', 'Sửa bảo hiểm thành công!');
            return res.redirect(req.query.url);
        }
        else {
            req.flash('error', 'Sửa bảo hiểm thất bại, bảo hiểm bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa bảo hiểm!');
        return res.redirect('/insurance/listInsurance');
    }
};
const getFormeditCatalog = async (req, res) => {
    try {
        const { idCatalog } = req.params

        let catalog = await Catalog.findOne({
            where: {
                idCatalog
            }
        })

        return res.render('insurance/editCatalog', { catalog: catalog });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form sửa danh mục');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFormAddInsuranceIntoCatalog = async (req, res) => {
    try {
        const { idInsurance } = req.params

        let insurance = await Insurance.findOne({
            where: {
                idInsurance
            },


            include: [
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
        const catalogs = await Catalog.findAll({

        })
        insurance.Catalog_insurances.forEach((item) => {
            let idCatalog = item['idCatalog']
            insurance.dataValues[idCatalog] = true
        });

        catalogs.forEach((item) => {

            if (insurance.dataValues[item.dataValues.idCatalog] == true) {
                item.dataValues.check = true
            }
        })


        return res.render('insurance/insurance_catalog', { catalogs: catalogs, idInsurance: idInsurance });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form thêm sản phẩm vào danh mục');
        return res.status(500).json({ isSuccess: false })
    }
};
const detailForUser = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        const { idInsurance } = req.params

        let insurance = await Insurance.findOne({
            where: {
                idInsurance,

            },
            include: [
                {
                    model: Insurance_type,

                }
            ]

        })

        let sub = await Insurance.findAll({
            where: {
                isMain: false,
                isDel: 0,
                idMainInsurance:idInsurance
            },
            
        })

        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('intro/detail', { error: error, name: name, listType, listPostType, listCatalog, insurance, sub });
        }
        else {
            return res.render('intro/detail', { error: error, listType, listPostType, listCatalog, insurance, sub });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách sản phẩm!');
        return res.redirect('/intro/home');
    }
};
const catalogForUser = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        const { idCatalog } = req.params

        let insurances = await Insurance.findAll({
            where: {
                isDel: 0,

            },
            include: [
                {
                    model: Catalog_insurance,
                    where: {
                        idCatalog,
                    },
                    required: true
                }
            ]
        })

        let type = await Catalog.findOne({
            where: {
                idCatalog
            }
        })

        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('intro/type', { error: error, name: name, listType, listPostType, listCatalog, insurances, type });
        }
        else {
            return res.render('intro/type', { error: error, listType, listPostType, listCatalog, insurances, type });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách sản phẩm!');
        return res.redirect('/intro/home');
    }
};
const listInsuranceForUser = async (req, res) => {
    try {

        const error = req.flash('error')[0];
        const { listType, listPostType, listCatalog } = await getData()
        const { idInsurance_type } = req.params
        let insurances = await Insurance.findAll({
            where: {
                idInsurance_type,
                isDel: 0
            }
        })
        let type = await Insurance_type.findOne({
            where: {
                idInsurance_type
            }
        })
        if (req.user) {
            const user = req.user
            const name = user.name
            return res.render('intro/type', { error: error, name: name, listType, listPostType, listCatalog, insurances, type });
        }
        else {
            return res.render('intro/type', { error: error, listType, listPostType, listCatalog, insurances, type });
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tới trang danh sách sản phẩm!');
        return res.redirect('/intro/home');
    }
};
const getFormAddSub = async (req, res) => {
    try {
        const { idInsurance } = req.params
        let insurance = await Insurance.findOne({
            where: {
                idInsurance: idInsurance,
                isMain: 1,
            },
        })
        let sub = await Insurance.findAll({
            where: {
                isMain: false,
                isDel: false,
            },


        })
        let insurance_sub = await Sub_insurance.findAll({
            where: {
                idMainInsurance: insurance.idInsurance,
            },
        })
        insurance_sub.forEach((item) => {
            let id = item['idSubInsurance']
            insurance.dataValues[id] = true
        })
        sub.forEach((item) => {
            if (insurance.dataValues[item.dataValues.idInsurance] == true) {
                item.dataValues.check = true
            }
        })


        return res.render('insurance/insurance_sub', { sub: sub, idInsurance: idInsurance });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form thêm sản phẩm bổ trợ');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFormAddMain = async (req, res) => {
    try {
        const { idInsurance } = req.params
        let insurance = await Insurance.findOne({
            where: {
                idInsurance: idInsurance,
                isMain: 0,
            },
        })
        let sub = await Insurance.findAll({
            where: {
                isMain: 1,
                isDel: false,
            },
        })
        let insurance_sub = await Sub_insurance.findAll({
            where: {
                idSubInsurance: insurance.idInsurance,
            },
        })
        insurance_sub.forEach((item) => {
            let id = item['idMainInsurance']
            insurance.dataValues[id] = true
        })
        sub.forEach((item) => {
            if (insurance.dataValues[item.dataValues.idInsurance] == true) {
                item.dataValues.check = true
            }
        })


        return res.render('insurance/insurance_main', { sub: sub, idInsurance: idInsurance });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form thêm sản phẩm chính');
        return res.status(500).json({ isSuccess: false })
    }
};
const editCatalog = async (req, res) => {
    try {

        const { idCatalog } = req.params
        let catalog = await Catalog.findOne({
            where: {
                idCatalog
            }
        })
        if (catalog) {
            let { name, info } = req.body
            catalog.name = name
            catalog.info = info
            await catalog.save()
        }
        else {
            req.flash('error', 'Danh mục bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

        const update = await updateData()

        req.flash('error', 'Sửa mới danh mục thành công!');
        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa danh mục!');
        return res.redirect('/insurance/listCatalog');
    }
};
const getFormeditType = async (req, res) => {
    try {
        const { idInsurance_type } = req.params
        let type = await Insurance_type.findOne({
            where: {
                idInsurance_type
            }
        })



        return res.render('Insurance/editType', { type: type });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form sửa loại bảo hiểm!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editType = async (req, res) => {
    try {

        const { idInsurance_type } = req.params
        let type = await Insurance_type.findOne({
            where: {
                idInsurance_type
            }

        })
        if (type) {
            let { name, info } = req.body
            type.name = name
            type.info = info

            await type.save()
        }
        else {
            req.flash('error', 'Loại bảo hiểm bạn chọn không tồn tại!');
            return res.redirect(req.query.url);
        }

        const update = await updateData()

        req.flash('error', 'Sửa loại bảo hiểm thành công!');


        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa loại bảo hiểm');
        return res.redirect('/insurance/listType');
    }
};
const deleteInsurance = async (req, res) => {
    try {
        const { idInsurance } = req.params

        let insurance = await Insurance.findOne({
            where: {
                idInsurance
            }
        })
        if (insurance) {
            await insurance.destroy()
        }
        else {
            req.flash('error', 'Bảo hiểm bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Xoá bảo hiểm có mã: ' + idInsurance + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá bảo hiểm thất bại, bảo hiểm đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động bảo hiểm để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteCatalog = async (req, res) => {
    try {
        const { idCatalog } = req.params

        let catalog = await Catalog.findOne({
            where: {
                idCatalog
            }
        })
        if (catalog) {
            await catalog.destroy()
        }
        else {
            req.flash('error', 'Danh mục bạn chọn không tồn tại bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }
        const update = await updateData()
        req.flash('error', 'Xoá danh mục có mã: ' + idCatalog + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá danh muc thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteType = async (req, res) => {
    try {
        const { idInsurance_type } = req.params

        let type = await Insurance_type.findOne({
            where: {
                idInsurance_type
            }
        })
        if (type) {
            await type.destroy()
        }
        else {
            req.flash('error', 'Loại bảo hiểm bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }
        const update = await updateData()
        req.flash('error', 'Xoá loại bảo hiểm có mã: ' + idInsurance_type + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá bảo loại hiểm thất bại, loại bảo hiểm có các sản phẩm bảo hiểm đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động loại bảo hiểm để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editIsDelType = async (req, res) => {
    try {
        const { idInsurance_type } = req.params
        const isDel = req.query.isDel
        let type = await Insurance_type.findOne({
            where: {
                idInsurance_type
            }
        })
        if (type) {
            if (isDel === 'true') {
                type.isDel = true
                req.flash('error', 'Ngừng hoạt động loại bảo hiểm có mã: ' + idInsurance_type + ' thành công!');
            }
            else {
                req.flash('error', 'Kích hoạt loại bảo hiểm có mã: ' + idInsurance_type + ' thành công!');
                type.isDel = false
            }
            await type.save()
        }
        else {
            req.flash('error', 'Loại bảo hiểm bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }
        const update = await updateData()
        req.flash('error', 'Ngừng hoạt động loại bảo hiểm có mã: ' + idInsurance_type + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Ngừng loại hiểm thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editIsDelInsurance = async (req, res) => {
    try {
        const { idInsurance } = req.params
        const isDel = req.query.isDel
        let type = await Insurance.findOne({
            where: {
                idInsurance
            }
        })
        if (type) {
            if (isDel === 'true') {
                type.isDel = true
                req.flash('error', 'Ngừng hoạt động bảo hiểm có mã: ' + idInsurance + ' thành công!');
            }
            else {
                type.isDel = false
                req.flash('error', 'Kích hoạt bảo hiểm có mã: ' + idInsurance + ' thành công!');
            }
            await type.save()
        }
        else {
            req.flash('error', 'Bảo hiểm bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Ngừng hoạt động bảo hiểm có mã: ' + idInsurance_type + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Ngừng hoạt động bảo hiểm thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
module.exports = {
    getListInsurance, getFormAddInsurance, addInsurance, getListInsuranceType, getCatalog,
    getFormAddType, addType, addCatalog, getFormAddCatalog, getFormeditCatalog, getFormeditInsurance,
    getFormeditType, editType, editCatalog, editInsurance, deleteCatalog, deleteInsurance, deleteType,
    editIsDelInsurance, editIsDelType, addInsuranceIntoCatalog, getFormAddInsuranceIntoCatalog,
    getFormAddSub, getFormAddMain, addMain, addSub, listInsuranceForUser, catalogForUser,
    detailForUser, getFormAddSubInsurance, addSubInsurance
};