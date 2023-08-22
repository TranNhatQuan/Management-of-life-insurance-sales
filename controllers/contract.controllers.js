const { raw, text } = require("body-parser");
const db = require("../models/index");
const { Contract, Payment_schedule, Benefit_history, User, Staff, Insurance, Sub_insurance, Insurance_type, Detail_contract, Catalog_insurance, Catalog } = require("../models");
const { QueryTypes, Op, where, STRING } = require("sequelize");

const moment = require('moment-timezone'); // require
const nodemailer = require("nodemailer");
const { PDFDocument, rgb } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const { fail } = require("assert");
const path = require("path");
const createPayment = async (total, premiumPaymentTerm, frequency, idDetail_contract, idContract, idUser, idStaff, startDate, options) => {
    const start = new Date(startDate)
    let totalIndex = 1
    if (frequency == 0) {
        totalIndex = 1
        total = (total * Number(premiumPaymentTerm))
    } else {
        totalIndex = (Math.floor(premiumPaymentTerm / frequency))
        total = (total * Number(frequency))
    }



    let failPay = ''
    let isSuccessPay = true

    try {

        for (let index = 1; index <= totalIndex; index++) {

            if (index == 1) {
                let payment = await Payment_schedule.create({
                    idUser,
                    idStaff,
                    startDate: start,
                    endDate: start,
                    date: start,
                    status: 1,
                    total: total,
                    idContract,
                    idDetail_contract,
                    index: index,
                }, options);
            }
            else {
                let newMonth = start.getMonth() + frequency * (index - 1);

                // Tính toán năm mới nếu tháng mới là 12
                let newYear = start.getFullYear();


                // Tạo ngày bắt đầu mới với tháng và năm đã tính toán
                const newStart = new Date(newYear, newMonth, 1);

                // Lấy ngày cuối cùng của tháng mới tính toán và sử dụng làm newEnd
                const newEnd = new Date(newYear, newMonth + 1, 0, 23, 59, 59, 999);

                // Tạo ngày kết thúc mới dựa trên ngày cuối cùng của tháng

                let payment = await Payment_schedule.create({
                    idUser,
                    startDate: newStart,
                    endDate: newEnd,
                    idContract,
                    status: 2,
                    total: total,
                    idDetail_contract,
                    index: index,
                }, options);
            }
        }

    } catch (error) {
        isSuccessPay = false
        failPay = error.message
    }

    return { isSuccessPay, failPay }
}
const createDetailContract = async (status, start, idStaff, idInsurance, frequency, idUser, idContract, isMain, options) => {




    let fail = ''
    let isSuccess = true
    let total = 0
    try {



        const insurance = await Insurance.findOne({
            where: {
                idInsurance
            }
        })
        const endDate = new Date(start.getTime() + 30 * insurance.contractTerm * 24 * 60 * 60 * 1000);
        if (!insurance) {
            const msg = 'Bảo hiểm có mã: ' + idInsurance + ' không tồn tại!'
            isSuccess = false
            throw new Error(msg);
        }

        let detailContract = await Detail_contract.create({
            idInsurance,
            idContract,
            isMain,
            endDate: endDate,
            status: status,
            premium: insurance.premium,
            insuranceAmount: insurance.insuranceAmount,
            premiumPaymentTerm: insurance.premiumPaymentTerm,
        }, options);
        total = insurance.premium
        let { isSuccessPay, failPay } = await createPayment(total, insurance.premiumPaymentTerm, frequency,
            detailContract.idDetail_contract, idContract, idUser, idStaff, start, options)
        if (!isSuccessPay) {

            throw new Error(failPay);
        }






    } catch (error) {
        isSuccess = false
        fail = error.message
    }

    return { isSuccess, fail, total }
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

            include: [

                {
                    model: Contract,
                    include: [
                        {
                            model: Payment_schedule,
                            include: [
                                {
                                    model: Detail_contract,
                                    include: [
                                        {
                                            model: Insurance,
                                        }
                                    ]
                                }
                            ]

                        }
                    ]
                }
            ]
        })

        const uniquePairs = new Set(); // Sử dụng Set để theo dõi các cặp duy nhất
        payments = payments.filter((payment) => {
            let idContract = payment.Contract.dataValues.idContract;
            let index = payment.dataValues.index;

            let pair = `${idContract}-${index}`;

            if (uniquePairs.has(pair)) {

                return false; // Không bao gồm payment trong mảng mới
            } else {
                uniquePairs.add(pair);
                return true; // Bao gồm payment trong mảng mới
            }
        });
        payments.forEach((payment) => {


            let total = 0
            let totalText = ""
            let index = payment.index
            payment.Contract.Payment_schedules.forEach((paymentContract) => {
                if (index == paymentContract.index) {

                    let text = "Sản phẩm " + paymentContract.Detail_contract.Insurance.name + ": " + (Number(paymentContract.total) * 1000).toLocaleString() + " đồng<br>"
                    total += Number(paymentContract.total) * 1000
                    totalText += text
                }
            })
            total = total.toLocaleString()
            totalText += "Tổng " + total + " đồng"
            payment.dataValues.total = totalText


        });

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
const getListDetail = async (req, res) => {
    try {


        const staff = req.staff
        const name = staff.name

        let detailContracts = await Detail_contract.findAll({

            include: [

                {
                    model: Benefit_history,
                    attributes: ['total'],
                }
            ]
        })
        detailContracts.forEach((detail) => {
            let total = 0
            detail.Benefit_histories.forEach((benefit) => {
                total += benefit.total
            })
            delete detail.dataValues.Benefit_histories
            detail.dataValues.total = total

        })

        const error = req.flash('error')[0];
        return res.render('contract/listDetail', { error: error, detailContracts: detailContracts, name: name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi lấy danh sách chi tiết hợp đồng!');
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
        let subInsurance = await Insurance.findAll({
            where: {

                isMain: false,
            },
            include: [
                {
                    model: Sub_insurance,
                    as: 'subInsurance',
                    where: {
                        idMainInsurance: idInsurance
                    },
                    required: true,
                }
            ]


        })


        res.status(200).json({ insurance, subInsurance });

    } catch (error) {

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
const getFormAddDetailContract = async (req, res) => {
    try {
        const { idContract } = req.params

        return res.render('contract/addDetailContract', { idContract: idContract });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập chi tiết hợp đồng!');
        return res.status(500).json({ isSuccess: false })
    }
};

const getFromEditContract = async (req, res) => {
    try {
        const staff = req.staff
        const name = req.name
        const { idContract } = req.params
        const contract = await Contract.findOne({
            where: {
                idContract
            }
        })
        const detail_contracts = await Detail_contract.findAll({
            where: {
                idContract
            }
        })
        return res.render('contract/detailContract', { detail_contracts: detail_contracts, contract: contract, name });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo xem chi tiết hợp đồng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFromEditDetail = async (req, res) => {
    try {

        const { idDetail_contract } = req.params

        const detail_contract = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })
        return res.render('contract/editDetail', { detail_contract: detail_contract });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo xem chi tiết hợp đồng!');
        return res.status(500).json({ isSuccess: false })
    }
};
const getFormAddPayment = async (req, res) => {
    try {
        const { idDetail_contract } = req.params
        const detail = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })

        return res.render('contract/addPayment', { detail: detail });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập lịch trả phí!');
        return res.status(500).json({ isSuccess: false })
    }
};
const addPayment = async (req, res) => {
    try {
        const { idDetail_contract } = req.params
        let { index } = req.body

        const detailContract = await Detail_contract.findOne({
            where: {
                idDetail_contract
            },
            include: [
                {
                    model: Contract,
                }
            ]
        })

        if (detailContract) {
            const premiumPaymentTerm = detailContract.premiumPaymentTerm
            const frequency = detailContract.frequency
            let maxIndex
            if (premiumPaymentTerm == 0) {
                maxIndex = 1
            }
            else {
                maxIndex = premiumPaymentTerm / frequency
            }
            if (index > maxIndex) {
                req.flash('error', 'Khách hàng đã trả đủ số kỳ bảo hiểm!');
                return res.redirect(req.query.url);
            }
            else {
                const checkPay = await Payment_schedule.findOne({
                    where: {
                        idDetail_contract,
                        index: index,
                    }
                })
                if (!checkPay) {
                    const currentDate = new Date();

                    // Lấy ngày đầu tháng hiện tại
                    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                    const end = new Date(start.getTime() + (20 * 24 * 60 * 60 * 1000));
                    const pay = await Payment_schedule.create({

                        idUser: detailContract.Contract.idUser,
                        idDetail_contract: idDetail_contract,
                        startDate: start,
                        endDate: end,
                        status: 0,
                        total: detailContract.premium,
                        index: index,

                    })
                    const text = 'Tạo lịch trả phí thành công!'
                    req.flash('error', text);
                    return res.redirect(req.query.url);
                }
                else {
                    const text = 'Đã tồn tại lịch trả phí cho kỳ thứ: ' + index + '!'
                    req.flash('error', text);
                    return res.redirect(req.query.url);
                }
            }

        }
        else {
            req.flash('error', 'Không tìm thấy thông tin hợp đồng bạn chọn!');
            return res.redirect(req.query.url);
        }


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới lịch trả phí!');
        return res.redirect(req.query.url);
    }
};
const getFormAddBenefit = async (req, res) => {
    try {
        const { idDetail_contract } = req.params
        const detail = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })
        return res.render('contract/addBenefit', { detail: detail });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin chi trả!');
        return res.status(500).json({ isSuccess: false })
    }
};
const addDetail_contract = async (req, res) => {
    try {

        let { idContract, idInsurance, idBeneficiary } = req.body
        const contract = await Contract.findOne({
            where: {
                idContract
            }
        })

        if (contract) {
            const beneficiary = await User.findOne({
                where: {
                    idBeneficiary,
                    isActive: true,
                }
            })
            if (beneficiary) {
                const insurance = await Insurance.findOne({
                    where: {
                        idInsurance,
                        isMain: false,
                    }
                })
                if (insurance) {
                    const detail_contract = await Detail_contract.findOne({
                        where: {
                            idInsurance,
                            idBeneficiary,
                            status: {
                                [db.Sequelize.Op.or]: [1, 2],
                            }
                        }
                    })
                    if (detail_contract) {
                        req.flash('error', 'Khách hàng bạn chọn đang thụ hưởng sản phẩm phụ bạn chọn!');
                        return res.redirect(req.query.url);
                    }
                    else {
                        const start = new Date(contract.signDate)
                        const t = await db.sequelize.transaction(); // Bắt đầu transaction\
                        try {
                            const { isSuccess, fail } = await createDetailContract(start, contract.idStaff, idInsurance, contract.idUser,
                                idContract, false, idBeneficiary, { transaction: t })
                            if (isSuccess) {
                                await t.commit()
                            }
                            else {
                                throw new Error(fail);
                            }
                        } catch (error) {
                            await t.rollback()
                            const failContract = error.message
                            req.flash('error', 'Thêm mới sản phẩm phụ vào hợp đồng thất bại. ' + failContract);
                            return res.redirect(req.query.url);
                        }
                        req.flash('error', 'Thêm mới sản phẩm phụ vào hợp đồng thành công!');
                        return res.redirect(req.query.url);
                    }
                }
                else {
                    req.flash('error', 'Không tìm thấy sản phẩm phụ bạn chọn!');
                    return res.redirect(req.query.url);
                }
            }
            else {
                req.flash('error', 'Không tìm thấy khách hàng bạn chọn!');
                return res.redirect(req.query.url);
            }


        }
        else {
            req.flash('error', 'Không tìm thấy hợp đồng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới thông tin hợp đồng!');
        return res.redirect(req.query.url);
    }
};
const addBenefit = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        const { idDetail_contract } = req.params
        let { info, reason, total } = req.body
        const detailContract = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })
        if (detailContract) {
            console.log(total)
            if (total <= detailContract.insuranceAmount) {
                const benefits = await Benefit_history.findAll({
                    where: {
                        idDetail_contract
                    }
                })

                let totalSum = 0; // Khởi tạo biến để tính tổng

                // Dùng vòng lặp để duyệt qua từng phần tử trong mảng benefits
                for (const benefit of benefits) {
                    totalSum += benefit.total; // Cộng giá trị "total" vào tổng
                }
                console.log(totalSum)
                let newtotalSum = 0
                newtotalSum = Number(total) + Number(totalSum)
                console.log(newtotalSum)
                if (newtotalSum <= detailContract.insuranceAmount) {
                    console.log('test')
                    const newBenefit = await Benefit_history.create({
                        idStaff, idDetail_contract, date: new Date(), info, reason, total, idUser: detailContract.idBeneficiary
                    });
                    console.log('test2')
                    req.flash('error', 'Thêm mới thông tin chi trả thành công!');
                    return res.redirect(req.query.url);
                }
                else {
                    const text = 'Tổng số tiền chi trả không thể lớn hơn tổng giá trị bảo hiểm là: ' + detailContract.insuranceAmount + '000 đồng! Hiện đã chi trả cho khách hàng: ' + totalSum + '000 đồng.'
                    req.flash('error', text);
                    return res.redirect(req.query.url);
                }
            }
            else {
                const text = 'Số tiền chi trả không thể lớn hơn tổng giá trị bảo hiểm là: ' + detailContract.insuranceAmount + '000 đồng!'
                req.flash('error', text);
                return res.redirect(req.query.url);
            }

        }
        else {
            req.flash('error', 'Không tìm thấy thông tin hợp đồng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới thông tin chi trả!');
        return res.redirect(req.query.url);
    }
};
const getFormEditPayment = async (req, res) => {
    try {
        const idContract = req.query.idContract
        const total = req.query.total
        const index = req.query.index
        const status = req.query.status
        const idStaff = req.query.idStaff
        const info = req.query.info
        console.log('t')
        const payment_schedule = await Contract.findOne({
            where: {
                idContract
            }
        })
        if (!payment_schedule) {
            req.flash('error', 'Không tìm thấy lịch trả phí bạn chọn!');
            return res.status(500).json({ isSuccess: false })
        }
        return res.render('contract/editPayment', { payment_schedule: payment_schedule, info, total, index, status, idStaff });

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form sửa lịch trả phí!');
        return res.status(500).json({ isSuccess: false })
    }
};

const editPayment = async (req, res) => {
    try {


        const { idContract, index, status, idStaff, info } = req.body

        await Payment_schedule.update(
            {
                info: info,
                status: status,
                idStaff: idStaff
            },
            {
                where: {
                    idContract: idContract, index: index
                }
            }
        )
        const text = 'Sửa lịch trả phí thành công!'
        req.flash('error', text);
        return res.redirect(req.query.url);


    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi sửa lịch trả phí!');
        return res.redirect(req.query.url);
    }
};
const getFormEditBenefit = async (req, res) => {
    try {
        const { idBenefit_history } = req.params
        let now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        now = '' + year + '-' + month + '-' + day
        let benefit_history = await Benefit_history.findOne({
            where: {
                idBenefit_history
            }
        })
        if (!benefit_history) {
            req.flash('error', 'Không tìm thấy thông tin chi trả bạn chọn!');
            return res.status(500).json({ isSuccess: false })
        }
        return res.render('contract/editBenefit', { benefit_history: benefit_history, now: now });



    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi tạo form nhập thông tin chi trả!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editDetail = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        const { idDetail_contract } = req.params

        let detail_contract = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })

        let { status } = req.body

        if (detail_contract) {




            detail_contract.status = status

            await detail_contract.save()

            req.flash('error', 'Sửa thông tin chi tiết hợp đồng thành công!');
            return res.redirect(req.query.url);



        }
        else {
            req.flash('error', 'Không tìm thấy chi tiết hợp đồng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra sửa chi tiết hợp đồng!');
        return res.redirect(req.query.url);
    }
};
const editContract = async (req, res) => {
    try {
        const staff = req.staff

        const { idContract } = req.params
        let contract = await Contract.findOne({
            where: {
                idContract
            }
        })
        let { status, idStaff } = req.body

        if (contract) {
            const user = await Staff.findOne({
                where: {
                    idStaff
                }
            })
            if (user) {
                contract.status = status
                contract.idStaff = idStaff
                await contract.save()
                if (req.files && req.files.pdfFile) {
                    console.log('test')

                    const pdfFile = req.files.pdfFile;
                    filePath = `public/uploads/${contract.idContract}.pdf`;

                    // Lưu file PDF từ yêu cầu vào thư mục 'uploads' trên server
                    await pdfFile.mv(filePath);
                    console.log('test2')
                }

                req.flash('error', 'Sửa thông tin hợp đồng thành công!');
                return res.redirect(req.query.url);
            }
            else {
                req.flash('error', 'Sửa thông tin hợp đồng thát bai, mã khách hàng không tồn tại!');
                return res.redirect(req.query.url);
            }


        }
        else {
            req.flash('error', 'Không tìm thấy hợp đồng bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới thông tin chi trả!');
        return res.redirect(req.query.url);
    }
};
const editBenefit = async (req, res) => {
    try {
        const staff = req.staff
        const idStaff = staff.idStaff
        const { idBenefit_history } = req.params
        let benefit_history = await Benefit_history.findOne({
            where: {
                idBenefit_history
            }
        })
        let { date, info, reason, total } = req.body

        if (benefit_history) {
            const idDetail_contract = benefit_history.idDetail_contract
            const detailContract = await Detail_contract.findOne({
                where: {
                    idDetail_contract
                }
            })

            if (total <= detailContract.insuranceAmount) {
                const benefits = await Benefit_history.findAll({
                    where: {
                        idDetail_contract
                    }
                })

                let totalSum = 0; // Khởi tạo biến để tính tổng

                // Dùng vòng lặp để duyệt qua từng phần tử trong mảng benefits
                for (const benefit of benefits) {
                    totalSum += benefit.total; // Cộng giá trị "total" vào tổng
                }
                let newtotalSum = 0
                newtotalSum = Number(total) + Number(totalSum) - Number(benefit_history.total)
                if (newtotalSum <= detailContract.insuranceAmount) {
                    benefit_history.idStaff = idStaff
                    benefit_history.info = info
                    benefit_history.total = total
                    benefit_history.reason = reason
                    benefit_history.date = date
                    await benefit_history.save()
                    req.flash('error', 'Sửa đổi thông tin chi trả thành công!');
                    return res.redirect(req.query.url);
                }
                else {
                    const text = 'Tổng số tiền chi trả không thể lớn hơn tổng giá trị bảo hiểm là: ' + detailContract.insuranceAmount + '000 đồng! Hiện đã chi trả cho khách hàng: ' + totalSum + '000 đồng.'
                    req.flash('error', text);
                    return res.redirect(req.query.url);
                }
            }
            else {
                const text = 'Số tiền chi trả không thể lớn hơn tổng giá trị bảo hiểm là: ' + detailContract.insuranceAmount + '000 đồng!'
                req.flash('error', text);
                return res.redirect(req.query.url);
            }

        }
        else {
            req.flash('error', 'Không tìm thấy thông tin chi trả bạn chọn!');
            return res.redirect(req.query.url);
        }

    } catch (error) {
        req.flash('error', 'Có lỗi xảy ra khi thêm mới thông tin chi trả!');
        return res.redirect(req.query.url);
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

        res.status(500).send('Đã xảy ra lỗi khi xử lý PDF.');
    }
};
const addContract = async (req, res) => {
    try {

        let { idUser, idInsurance, startDate, selectedSubInsuranceIds, frequency } = req.body
        frequency = Number(frequency)
        const user = await User.findOne({
            where: {
                idUser,
                isActive: 1,
            }
        })

        if (!user) {
            req.flash('error', 'Thêm mới hợp đồng thất bại, mã khách hàng: ' + idUser + ' không tồn tại!');
            return res.redirect(req.query.url);
        }
        const insurance = await Insurance.findOne({
            where: {
                idInsurance,
                isMain: true,
            }
        })

        if (!insurance) {
            req.flash('error', 'Thêm mới hợp đồng thất bại, mã sản phẩm: ' + idInsurance + ' không tồn tại!');
            return res.redirect(req.query.url);
        }
        const currentContract = await Contract.findOne({
            where: {
                idUser,

                status: {
                    [db.Sequelize.Op.or]: [1, 2],
                }

            },
            include: [
                {
                    model: Detail_contract,
                    where: {
                        idInsurance,
                        isMain: true,
                    },
                    required: true,
                }
            ]
        })

        if (currentContract) {
            req.flash('error', 'Thêm mới hợp đồng thất bại, mã sản phẩm: ' + idInsurance + ' đang được áp dụng với khách hàng!');
            return res.redirect(req.query.url);
        }

        const staff = req.staff
        const start = new Date(startDate)
        const endDate = new Date(start.getTime() + 30 * insurance.contractTerm * 24 * 60 * 60 * 1000);
        const t = await db.sequelize.transaction(); // Bắt đầu transaction\

        let failContract = ''
        let filePath = ''
        let totalContract = 0
        let status = 1
        if (frequency == 0) {
            status = 2
        }
        try {

            let contract = await Contract.create({
                idUser,
                status: status,
                pdf: '/public/uploads/',
                startDate: start,

                idStaff: staff.idStaff,
                frequency: frequency,

            }, { transaction: t })

            if (!req.files || !req.files.pdfFile) {
                throw new Error('Đã xảy ra lỗi khi gửi file!');
            }

            const pdfFile = req.files.pdfFile;
            filePath = `public/uploads/${contract.idContract}.pdf`;

            // Lưu file PDF từ yêu cầu vào thư mục 'uploads' trên server
            await pdfFile.mv(filePath);

            let { isSuccess, fail, total } = await createDetailContract(status, start, staff.idStaff, idInsurance, frequency, idUser, contract.idContract, true, { transaction: t })
            if (!isSuccess) {
                throw new Error(fail);
            }

            totalContract += Number(total)
            let id = ''
            for (const item of selectedSubInsuranceIds) {
                if (item != '[') {
                    if (item == ']' || item == ',') {
                        let { isSuccess, fail, total } = await createDetailContract(status, start, staff.idStaff, id, frequency, idUser, contract.idContract, false, { transaction: t })
                        totalContract += Number(total)
                        if (!isSuccess) {
                            throw new Error(fail);
                        }
                        id = ''
                    }
                    else {
                        id += item
                    }
                }
            }
            await t.commit();
        } catch (error) {
            await t.rollback();
            failContract = error.message
            req.flash('error', 'Thêm mới hợp đồng thất bại. ' + failContract);
            return res.redirect(req.query.url);
        }
        req.flash('error', 'Thêm mới hợp đồng thành công!');
        const title = 'Thông báo về việc hợp đồng bảo hiểm'
        const content = 'Kính gửi quý khách,<br>Hợp đồng bảo hiểm của bạn đã được nhân viên ghi vào hệ thống, bạn có thể tra cứu thông tin và trả tiền bảo hiểm ngay trên trang web của chúng tôi: life.vn<br>Mọi thắc mắc xin vui lòng liên hệ với chúng tôi theo thông tin dưới đây:<br>trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn.<br>Trân trọng,<br> LIFE'
        const sendMailToUser = await sendMail(user.mail, content, title, filePath)
        return res.redirect(req.query.url);
    } catch (error) {
        req.flash('error', 'Đã xảy ra lỗi khi thêm hợp đồng!');
        return res.redirect(req.query.url);
    }
};
const fake = async (req, res) => {
    try {
        //const { idInsurance } = req.params

        const payments = await Payment_schedule.findAll({
            where: {
                idUser: 1,

            },
            include: [
                {
                    model: Detail_contract,
                    include: [
                        {
                            model: Insurance,

                        }
                    ]
                },
                {
                    model: Contract,
                    include: [
                        {
                            model: Payment_schedule
                        }
                    ]
                }
            ]
        })


        res
            .status(200)
            .json({
                payments
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
const sendMail = async (email, content, title, pdf) => {
    try {
        console.log('test')
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "trannhatquan.2001@gmail.com", // generated ethereal user
                pass: "bseuvtvsghpnrltz", // generated ethereal password
            },
        });
        console.log('startSendMail')
        console.log(pdf)
        if (pdf) {

            const pdfAttachmentContent = fs.readFileSync(pdf);
            await transporter.sendMail({
                from: 'trannhatquan.2001@gmail.com', // Địa chỉ email người gửi
                to: email, // Địa chỉ email người nhận
                subject: title, // Tiêu đề email
                text: title, // Nội dung văn bản của email (không hiển thị khi email được xem dưới dạng HTML)
                html: content, // Nội dung email được viết bằng HTML
                attachments: [
                    {
                        filename: 'HopDong.pdf', // Tên tệp đính kèm (có thể đặt lại tùy chọn)
                        content: pdfAttachmentContent, // Nội dung tệp PDF đính kèm
                        contentType: 'application/pdf', // Kiểu nội dung của tệp đính kèm (đối với PDF, kiểu này là "application/pdf")
                    },
                ],
            });
            console.log('endSendMailWithAtt')
        }
        else {
            await transporter.sendMail({
                from: 'trannhatquan.2001@gmail.com', // Địa chỉ email người gửi
                to: email, // Địa chỉ email người nhận
                subject: title, // Tiêu đề email
                text: title, // Nội dung văn bản của email (không hiển thị khi email được xem dưới dạng HTML)
                html: content, // Nội dung email được viết bằng HTML
            });
            console.log('endSendMailWith')
        }
        return true
    } catch (error) {
        return false
    }
}
const editStatusDetail_contract = async (req, res) => {
    try {
        const { idDetail_contract } = req.params
        const status = req.query.status
        let contract = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })
        if (contract) {
            contract.status = status
            await contract.save()
            req.flash('error', 'Thay đổi trạng thái phần có mã: ' + idDetail_contract + ' trong hợp đồng thành công!');
            return res.status(200).json({ isSuccess: true });
        }
        else {
            req.flash('error', 'Chi tiết hợp đồng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }



    } catch (error) {
        req.flash('error', 'Thay đổi trạng thái chi tiết hợp đồng thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editStatusContract = async (req, res) => {
    try {
        const { idContract } = req.params
        const status = req.query.status
        let contract = await Contract.findOne({
            where: {
                idContract
            }
        })
        if (contract) {
            contract.status = status
            await contract.save()
            req.flash('error', 'Thay đổi trạng thái hợp đồng có mã: ' + idContract + ' thành công!');
            return res.status(200).json({ isSuccess: true });
        }
        else {
            req.flash('error', 'Hợp đồng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }



    } catch (error) {
        req.flash('error', 'Thay đổi trạng thái hợp đồng thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
const editStatusPayment = async (req, res) => {
    try {
        const { idPayment_schedule } = req.params
        const status = req.query.status
        let contract = await Payment_schedule.findOne({
            where: {
                idPayment_schedule
            }
        })
        if (contract) {
            contract.status = status
            await contract.save()
            req.flash('error', 'Thay đổi trạng thái lịch trả phí có mã: ' + idPayment_schedule + ' thành công!');
            return res.status(200).json({ isSuccess: true });
        }
        else {
            req.flash('error', 'Lịch trả phí bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }



    } catch (error) {
        req.flash('error', 'Thay đổi trạng thái lịch trả phí thất bại!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteBenefit = async (req, res) => {
    try {
        const { idBenefit_history } = req.params

        let insurance = await Benefit_history.findOne({
            where: {
                idBenefit_history
            }
        })
        if (insurance) {
            await insurance.destroy()
        }
        else {
            req.flash('error', 'Thông tin chi trả bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Xoá thông tin chi trả có mã: ' + idBenefit_history + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá thông tin chi trả thất bại, thông tin chi trả đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deletePayment = async (req, res) => {
    try {
        const { idPayment_schedule } = req.params

        let insurance = await Payment_schedule.findOne({
            where: {
                idPayment_schedule
            }
        })
        if (insurance) {
            await insurance.destroy()
        }
        else {
            req.flash('error', 'Lịch trả phí bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Xoá lịch trả phí có mã: ' + idPayment_schedule + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá lịch trả phí thất bại, lịch trả phí đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteDetail_contract = async (req, res) => {
    try {
        const { idDetail_contract } = req.params

        let insurance = await Detail_contract.findOne({
            where: {
                idDetail_contract
            }
        })
        if (insurance) {
            await insurance.destroy()
        }
        else {
            req.flash('error', 'Chi tiết hợp đồng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Xoá chi tiết hợp đồng có mã: ' + idDetail_contract + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá chi tiết hợp đồng thất bại, chi tiết hợp đồng đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
const deleteContract = async (req, res) => {
    try {
        const { idContract } = req.params

        let insurance = await Contract.findOne({
            where: {
                idContract
            }
        })
        if (insurance) {
            await insurance.destroy()
        }
        else {
            req.flash('error', 'Hợp đồng bạn chọn không tồn tại!');
            return res.status(404).json({ isSuccess: false })
        }

        req.flash('error', 'Xoá hợp đồng có mã: ' + idContract + ' thành công!');
        return res.status(200).json({ isSuccess: true });

    } catch (error) {
        //req.flash('error', 'Có lỗi xảy ra khi lấy danh sách nhân viên');
        req.flash('error', 'Xoá hợp đồng thất bại, hợp đồng đã được ghi nhận ở các bảng khác, bạn có thể ngừng hoạt động hợp đồng để thay cho biện pháp xoá!');
        return res.status(500).json({ isSuccess: false })
    }
};
module.exports = {
    getListBenefit, getListContract, getListPayment, getFormAddContract, addContract, getDetailAndSub,
    fake, sendMail, getFormAddBenefit, getFormAddPayment, getFormEditBenefit,
    getFormEditPayment, addBenefit, addPayment, editBenefit, editPayment,
    getFormAddDetailContract, getFromEditContract, addDetail_contract, editContract,
    editStatusContract, editStatusDetail_contract, editStatusPayment,
    deleteBenefit, deleteContract, deleteDetail_contract, deletePayment,
    getListDetail, getFromEditDetail, editDetail

};