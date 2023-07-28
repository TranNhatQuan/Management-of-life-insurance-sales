const { raw, text } = require("body-parser");
const db = require("../models/index");
const { Contract, Payment_schedule, Benefit_history, User, Staff, Insurance, Sub_insurance, Detail_contract } = require("../models");
const { QueryTypes, Op, where, STRING } = require("sequelize");
const { getIngredientByIdRecipe, changeQuantityIngredientShopWithTransaction } = require("./post.controllers")
const moment = require('moment-timezone'); // require
const { PDFDocument, rgb } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const createDetailContract = async (startDate, idStaff, idInsurance, idUser, idContract, isMain, idBeneficiary, options) => {
    const start = new Date(startDate)



    console.log('testDetail1')
    let fail = ''
    let isSuccess = true
    try {
        console.log('testDetail2')
        const currentDetal = await Detail_contract.findOne({
            where: {
                idBeneficiary,
                idInsurance,
                status: {
                    [db.Sequelize.Op.or]: [1, 2],
                }
            }
        })
        if (currentDetal) {
            fail = 'Khách hàng ' + idBeneficiary + ' hiện đang có bảo hiểm mã: ' + idInsurance + ' . Không thể đăng ký bảo hiểm trùng!'
            isSuccess = false
        }
        const insurance = await Insurance.findOne({
            where: {
                idInsurance
            }
        })
        console.log('testDetail3')
        if (!insurance) {
            isSuccess = false
        }
        const endDate = new Date(start.getTime() + 30 * insurance.contractTerm * 24 * 60 * 60 * 1000);
        console.log('testDetail4')
        console.log(
            idInsurance,
            idContract,
            idBeneficiary,
            isMain,
            start,
            endDate,
            1,
            insurance.premium,
            insurance.premiumPaymentTerm,
            insurance.frequency,
            insurance.insuranceAmount,
            insurance.contractTerm,)
        let detailContract = await Detail_contract.create({
            idInsurance,
            idContract,
            idBeneficiary,
            isMain,
            startDate: start,
            endDate: endDate,
            status: 1,
            premium: insurance.premium,
            premiumPaymentTerm: insurance.premiumPaymentTerm,
            frequency: insurance.frequency,
            insuranceAmount: insurance.insuranceAmount,
            contractTerm: insurance.contractTerm,
        }, options);

        console.log('testDetail5')
        const pay = await Payment_schedule.create({

            idUser: idUser,
            idStaff,
            idDetail_contract: detailContract.idDetail_contract,
            startDate: start,
            endDate: start,
            date: start,
            status: 1,
            total: insurance.premium,
            index: 1,

        }, options)
        console.log('testDetail6')





    } catch (error) {
        isSuccess = false
    }

    return { isSuccess, fail }
}
const getListContract = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let contracts = await Contract.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listContract', { error: error, contracts: contracts, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách hợp đồng');
        return res.redirect('/staff/home');
    }
};
const getListPayment = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let payments = await Payment_schedule.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listPayment', { error: error, payments: payments, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách phiếu thu phí');
        return res.redirect('/staff/home');
    }
};
const getListBenefit = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let benefits = await Benefit_history.findAll({

            //raw: true,

        })

        const error = req.flash('error')[0];
        return res.render('contract/listBenefit', { error: error, benefits: benefits, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách thông tin chi trả');
        return res.redirect('/staff/home');
    }
};
const getDetailAndSub = async (req, res) => {
    try {


        const { idInsurance } = req.params
        let insurance = await Insurance.findOne({
            where: {
                idInsurance
            }
        })
        let subInsurance = await Sub_insurance.findAll({
            where: {
                idMainInsurance: idInsurance,
            },
            include: [
                {
                    model: Insurance,
                    as: 'subInsurance',
                }
            ],
            raw: true,

        })
        subInsurance = subInsurance.map(item => {
            return {
                idInsurance: item['subInsurance.idInsurance'],
                name: item['subInsurance.name'],
                premium: item['subInsurance.premium'],
                premiumPaymentTerm: item['subInsurance.premiumPaymentTerm'],
                frequency: item['subInsurance.frequency'],
                insuranceAmount: item['subInsurance.insuranceAmount'],
                contractTerm: item['subInsurance.contractTerm'],
            }
        })

        res.status(200).json({ insurance, subInsurance });

    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi xử lý PDF.');
    }
};
const getFormAddContract = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        const users = await User.findAll({
            where: {
                isActive: 1
            }
        })

        const insurances = await Insurance.findAll({
            where: {
                isMain: 1,
                isDel: 0,
            },

        })
        let now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        now = '' + year + '-' + month + '-' + day

        const error = req.flash('error')[0];
        return res.render('contract/addContract', { error: error, name: name, users: users, insurances: insurances, now: now });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi mở form nhập hợp đồng mới!');
        return res.redirect('/staff/home');
    }
};
const addPdf = async (req, res) => {
    try {
        if (!req.files || !req.files.pdfFile) {
            return res.status(400).send('Không tìm thấy file PDF.');
        }

        const pdfFile = req.files.pdfFile;
        const filePath = `public/uploads/${pdfFile.name}`;

        // Lưu file PDF từ yêu cầu vào thư mục 'uploads' trên server
        await pdfFile.mv(filePath);




        pdfParse(filePath).then((data) => {
            const pdfContent = data.text;
            res.render('contract/showPdf', { pdfContent, pdfUrl: '/uploads/JD-back-end.pdf' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Đã xảy ra lỗi khi xử lý PDF.');
    }
};
const addContract = async (req, res) => {
    try {

        let { idUser, idInsurance, signDate, selectedSubInsuranceIds } = req.body
        console.log('test')
        const user = await User.findOne({
            where: {
                idUser,
                isActive: 1,
            }
        })
        console.log('test2')
        if (!user) {
            req.flash('error', 'Thêm mới hợp đồng thất bại, mã khách hàng: ' + idUser + ' không tồn tại!');
            return res.redirect(req.query.url);
        }

        console.log('test3')
        const staff = req.staff
        const start = new Date(signDate)

        const t = await db.sequelize.transaction(); // Bắt đầu transaction\
        let failContract = ''
        try {
            console.log('testaddContract1')
            let contract = await Contract.create({
                idUser,
                status: 1,
                pdf: '/public/uploads/',
                signDate: start,
                idStaff: staff.idStaff,
            }, { transaction: t })
            console.log('testaddContract2')
            if (!req.files || !req.files.pdfFile) {
                failContract = 'Đã xảy ra lỗi khi gửi file pdf!'
                await t.rollback()
            }
            console.log('testaddContract2.5')
            const pdfFile = req.files.pdfFile;
            const filePath = `public/uploads/${contract.idContract}.pdf`;
            console.log('testaddContract2.6')
            // Lưu file PDF từ yêu cầu vào thư mục 'uploads' trên server
            await pdfFile.mv(filePath);
            console.log('testaddContract3')
            let { isSuccess, fail } = await createDetailContract(start, staff.idStaff, idInsurance, idUser, contract.idContract, true, idUser, { transaction: t })
            if (!isSuccess) {
                failContract = fail
                await t.rollback()
            }
            for (const item of selectedSubInsuranceIds) {

                if (item != '[' && item != ']' && item != ',') {
                    const id = 'beneficiary_' + item
                    const idBeneficiary = req.body[id]


                    if (Array.isArray(idBeneficiary)) {


                        // Lặp qua từng phần tử trong mảng idBeneficiary và in giá trị của nó
                        for (const beneficiary of idBeneficiary) {
                            const userSub = await User.findOne({
                                where: {
                                    idUser: beneficiary,
                                    isActive: 1,
                                }
                            })
                            if (!userSub) {
                                failContract = "Mã khách hàng thụ hưởng: " + beneficiary + " không tồn tại!"
                                await t.rollback()
                            }
                            let { isSuccess, fail } = await createDetailContract(start, staff.idStaff, item, idUser, contract.idContract, true, beneficiary, { transaction: t })
                            if (!isSuccess) {
                                failContract = fail
                                await t.rollback()
                            }
                        }
                    } else {
                        const userSub = await User.findOne({
                            where: {
                                idUser: idBeneficiary,
                                isActive: 1,
                            }
                        })
                        if (!userSub) {
                            failContract = "Mã khách hàng thụ hưởng: " + idBeneficiary + " không tồn tại!"
                            await t.rollback()
                        }
                        let { isSuccess, fail } = await createDetailContract(start, staff.idStaff, item, idUser, contract.idContract, true, idBeneficiary, { transaction: t })
                        if (!isSuccess) {
                            failContract = fail
                            await t.rollback()
                        }
                    }

                }

            }


            await t.commit(); // Lưu thay đổi và kết thúc transaction

        } catch (error) {

            await t.rollback(); // Hoàn tác các thay đổi và hủy bỏ transaction
            req.flash('error', 'Thêm mới hợp đồng thất bại. ' + failContract);
            return res.redirect(req.query.url);
        }


        req.flash('error', 'Thêm mới hợp đồng thành công!');
        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Đã xảy ra lỗi khi thêm hợp đồng!');
        return res.redirect(req.query.url);
    }
};
const fake = async (req, res) => {
    try {
        console.log('test')
        const detail = await Detail_contract.create({
            idInsurance: 2,
            idContract: 2,
            idBeneficiary: 1,
            isMain: true,
            status: 1,
            startDate: "2023-07-28T00:00:00.000Z",
            endDate: "2023-07-29T00:00:00.000Z",
            premium: 300,
            premiumPaymentTerm: 3,
            frequency: 1,
            contractTerm: 30,
            insuranceAmount: 10000,
        })
        console.log('test2')


        res
            .status(200)
            .json({
                detail, isSuccess: true
            });
    } catch (error) {
        req.flash('error', 'Đã xảy ra lỗi khi thêm hợp đồng!');
        res
            .status(500)
            .json({
                isSuccess: false
            });
    }
};
module.exports = {
    getListBenefit, getListContract, getListPayment, getFormAddContract, addContract, getDetailAndSub, fake

};