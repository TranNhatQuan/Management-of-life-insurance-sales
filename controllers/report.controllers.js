const { Post, Post_type, Staff, Contract, Detail_contract, Payment_schedule, Benefit_history, User, Insurance, Insurance_type, Sub_insurance } = require("../models");
const db = require("../models/index");
const { QueryTypes, Op, where, sequelize } = require("sequelize");
const moment = require('moment-timezone'); // require
const { raw, text } = require("body-parser");

const createReportInsurance = async (date, type) => {
    let startDate, endDate, start, end
    let insurances

    let check = 0
    if (type == 'day' || type == 'month' || type == 'year' || type == 'week') {
        console.log('testif')
        if (type == 'week') {
            startDate = moment(date).startOf('isoWeek').toDate();
            endDate = moment(date).endOf('isoWeek').toDate();
            type = 'Báo cáo theo tuần'
        }
        else {
            startDate = moment(date).startOf(type).toDate();
            endDate = moment(date).endOf(type).toDate();
            if (type == 'month') {
                type = 'Báo cáo theo tháng'
            }
            if (type == 'year') {
                type = 'Báo cáo theo năm'
            }
            if (type == 'day') {
                type = 'Báo cáo theo ngày'
            }
        }
        console.log(startDate)
        start = startDate
        console.log(start)
        end = endDate
        check = 1

        insurances = await Insurance.findAll({
            include: [
                {
                    model: Insurance_type,
                },

                {
                    model: Detail_contract,
                    include: [

                        {
                            model: Benefit_history,
                            where: {
                                date: {
                                    [Op.gte]: startDate,
                                    [Op.lte]: endDate
                                },
                            },
                            required: false
                        },
                        {
                            model: Contract,

                            required: false,

                            include: [
                                {
                                    model: Payment_schedule,
                                    where: {
                                        status: 1,
                                        date: {
                                            [Op.gte]: startDate,
                                            [Op.lte]: endDate
                                        },
                                    },
                                    required: false,

                                },
                            ],

                        },


                    ]
                },

            ]
        })

        startDate = new Date(startDate);
        let year = startDate.getFullYear();
        let month = String(startDate.getMonth() + 1).padStart(2, '0');
        let day = String(startDate.getDate()).padStart(2, '0');
        startDate = 'Ngày ' + day + ' tháng ' + month + ' năm ' + year
        endDate = new Date(endDate);
        year = endDate.getFullYear();
        month = String(endDate.getMonth() + 1).padStart(2, '0');
        day = String(endDate.getDate()).padStart(2, '0');
        endDate = 'Ngày ' + day + ' tháng ' + month + ' năm ' + year
        console.log(startDate)
    }
    else {

        type = 'Báo cáo tổng'
        check = 2
        insurances = await Insurance.findAll({

            include: [
                {
                    model: Insurance_type,
                },

                {
                    model: Detail_contract,

                    include: [

                        {
                            model: Benefit_history,

                            required: false
                        },
                        {
                            model: Contract,
                            required: false,
                            include: [
                                {
                                    model: Payment_schedule,
                                    where: {
                                        status: 1,

                                    },
                                    required: false,

                                },
                            ]
                        }
                    ]
                }
            ]
        })

    }
    let quantityInsurance = 0
    let totalInput = 0
    let totalOutput = 0
    let totalQuantityContract = 0
    let totalQuantityContractCancel = 0
    let totalQuantityContractPayInDate = 0
    let totalQuantityContractInDate = 0
    let totalNewContract = 0
    insurances.forEach((insurance) => {

        quantityInsurance += 1
        insurance.dataValues.typeName = insurance.Insurance_type.dataValues.name
        delete insurance.dataValues.Insurance_type

        if (insurance.isDel == 1) {
            insurance.dataValues.isDel = 'Đã huỷ'
        }
        else {
            insurance.dataValues.isDel = 'Còn hoạt động'
        }

        let input = 0
        let output = 0

        let quantityContract = 0
        let quantityContractCancel = 0
        let quantityContractPayInDate = 0
        let quantityContractInDate = 0
        let newContract = 0


        insurance.Detail_contracts.forEach((detail) => {
            if (check = 1) {

                const startUTC = moment(start).utc();
                const endUTC = moment(end).utc();
                const detailStartDateUTC = moment(detail.Contract.startDate).utc();



                if (detailStartDateUTC >= startUTC && detailStartDateUTC <= endUTC) {
                    console.log(2)
                    if (detail.Contract != null) {
                        newContract += 1
                    }
                    quantityContract += 1
                    if (detail.status == 0) {
                        quantityContractCancel += 1

                    }
                    if (detail.status == 1) {
                        quantityContractPayInDate += 1
                    }
                    if (detail.status == 2) {
                        quantityContractInDate += 1
                    }
                }
            } else {
                if (detail.Contract != null) {
                    newContract += 1
                }
                quantityContract += 1
                if (detail.status == 0) {
                    quantityContractCancel += 1

                }
                if (detail.status == 1) {
                    quantityContractPayInDate += 1
                }
                if (detail.status == 2) {
                    quantityContractInDate += 1
                }
            }




            detail.Benefit_histories.forEach((benefit) => {
                output += Number(benefit.total) * 1000
            })

            detail.Contract.Payment_schedules.forEach((payment) => {

                input += Number(payment.total) * 1000
                //console.log(input)
            })

            //insurance.dataValues.Contract = detail.dataValues.Contract
        })

        delete insurance.dataValues.Detail_contracts
        insurance.dataValues.input = input.toLocaleString()
        insurance.dataValues.output = output.toLocaleString()
        insurance.dataValues.newContract = newContract.toLocaleString()
        insurance.dataValues.quantityContract = quantityContract.toLocaleString()
        insurance.dataValues.quantityContractCancel = quantityContractCancel.toLocaleString()
        insurance.dataValues.quantityContractInDate = quantityContractInDate.toLocaleString()
        insurance.dataValues.quantityContractPayInDate = quantityContractPayInDate.toLocaleString()
        totalNewContract += newContract
        totalQuantityContract += quantityContract
        totalQuantityContractCancel += quantityContractCancel
        totalQuantityContractInDate += quantityContractInDate
        totalQuantityContractPayInDate += quantityContractPayInDate
        totalInput += input
        totalOutput += output
    })
    totalInput = totalInput.toLocaleString()
    totalOutput = totalOutput.toLocaleString()
    totalNewContract = totalNewContract.toLocaleString()
    totalQuantityContract = totalQuantityContract.toLocaleString()
    totalQuantityContractCancel = totalQuantityContractCancel.toLocaleString()
    totalQuantityContractInDate = totalQuantityContractInDate.toLocaleString()
    totalQuantityContractPayInDate = totalQuantityContractPayInDate.toLocaleString()
    const report = {
        type, startDate, endDate, totalInput, totalOutput, totalQuantityContract, totalQuantityContractCancel,
        totalQuantityContractInDate, totalQuantityContractPayInDate, quantityInsurance, totalNewContract
    }

    return { report, insurances }
}
const reportInsurance = async (req, res) => {
    try {
        const date = req.query.date
        // type == 'day' || type == 'month' || type == 'year' || type == 'week' ||  type == 'all'
        const type = req.query.type
        const { report, insurances } = await createReportInsurance(date, type)
        const staff = req.staff
        const name = staff.name
        const error = req.flash('error')[0];
        return res.render('report/reportInsurance', { error: error, report: report, name: name, insurances: insurances });
    } catch (error) {

        req.flash('error', 'Có lỗi xảy ra khi tạo báo cáo!');
        return res.redirect(req.query.url);
    }
};
const reportOneInsurance = async (req, res) => {
    try {
        const date = req.query.date
        // 0: all, 1: year, 2: quý, 3: month, 4: tuần, 5: ngày
        const type = req.query.type
        const { idInsurance } = req.params
        let insurances = await Insurance.findAll({
            where: {
                idInsurance
            },
            include: [
                {
                    model: Detail_contract,
                    attributes: ['idDetail_contract', 'status'],
                    include: [
                        {
                            model: Payment_schedule,
                            where: {
                                status: 2
                            },
                            attributes: ['total'],
                        },
                        {
                            model: Benefit_history,
                            attributes: ['total'],
                        }
                    ]
                },
                {
                    model: Sub_insurance,
                    include: [
                        {
                            model: Insurance,
                            as: 'subInsurance',
                            include: [
                                {
                                    model: Detail_contract,
                                    attributes: ['idDetail_contract', 'status'],
                                    include: [
                                        {
                                            model: Payment_schedule,
                                            where: {
                                                status: 2
                                            },
                                            attributes: ['total'],
                                        },
                                        {
                                            model: Benefit_history,
                                            attributes: ['total'],
                                        }
                                    ]
                                },
                            ]
                        }
                    ]
                }
            ]
        })



        res.status(200).json({ insurances });

    } catch (error) {

        res.status(500).send('Đã xảy ra lỗi khi xử lý PDF.');
    }
};

const fake = async (req, res) => {
    try {

        const date = req.query.date
        // 0: all, 1: year, 3: month, 4: tuần, 5: ngày
        const type = req.query.type
        const { idInsurance } = req.params
        const { report, insurances } = await createReportInsurance(date, type)

        res
            .status(200)
            .json({
                report, insurances, isSuccess: true
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
    reportInsurance, reportOneInsurance, fake

};