const { Contract, Payment_schedule, Detail_contract, User, Insurance, Staff } = require("../models");
const db = require("../models/index");
const { QueryTypes, Op, where, STRING, Sequelize, sequelize } = require("sequelize");
const nodemailer = require("nodemailer");
const moment = require('moment');
const createPayment = async (users) => {
    try {

        users.forEach(async (user) => {
            const startDate = new Date(user['Contracts.Detail_contracts.startDate'])
            const endDate = new Date(startDate.getTime() + (20 * 24 * 60 * 60 * 1000));
            const timePassed = Date.now() - startDate
            const daysPassed = Math.floor(timePassed / (24 * 60 * 60 * 1000))
            const roundedMonthsPassed = Math.round(daysPassed / (30 * user['Contracts.Detail_contracts.premiumTerm']));

            if (roundedMonthsPassed <= user['Contracts.Detail_contracts.premiumPaymentTerm']) {
                const checkPay = await Payment_schedule.findOne({
                    where: {
                        idUser: user['idUser'],
                        idDetail_contract: user['Contracts.Detail_contracts.idDetail_contract'],
                        index: roundedMonthsPassed,
                    }
                })
                if (!checkPay) {

                    const pay = await Payment_schedule.create({

                        idUser: user['idUser'],
                        idDetail_contract: user['Contracts.Detail_contracts.idDetail_contract'],
                        startDate: user['Contracts.Detail_contracts.startDate'],
                        endDate: endDate,
                        status: 0,
                        total: user['Contracts.Detail_contracts.premium'],
                        index: roundedMonthsPassed,

                    })
                    const mail = await sendMailPay(
                        pay.idPayment_schedule,
                        user['Contracts.idContract'], user['Contracts.Detail_contracts.Insurance.name'],
                        user['name'], startDate, endDate, user['Contracts.Detail_contracts.premium'], user['mail']
                    )
                }
            }






        });
        return true
    } catch (error) {
        return false
    }


}
const changeDetailContractToStatus2 = async (detail_contracts) => {
    try {

        detail_contracts.forEach(async (detail_contract) => {
            let detail = await Detail_contract.findOne({
                where: {
                    idDetail_contract: detail_contract.idDetail_contract,
                    status: 1,
                }

            })
            detail.status = 2
            await detail.save()
        });
        return true
    } catch (error) {
        return false
    }


}
const changeDetailContractToStatus3 = async (detail_contracts) => {
    try {

        detail_contracts.forEach(async (detail_contract) => {
            let detail = await Detail_contract.findOne({
                where: {
                    idDetail_contract: detail_contract.idDetail_contract,
                    status: 2,
                }

            })
            detail.status = 3
            await detail.save()
        });
        return true
    } catch (error) {
        return false
    }


}
const changeContractToStatus2 = async (contracts) => {
    try {

        contracts.forEach(async (contract) => {
            let check = await Detail_contract.findAll({
                where: {
                    status: 1
                }
            })
            if (check.length === 0) {
                let detail = await Contract.findOne({
                    where: {
                        idContract: contract.idContract,
                        status: 1,
                    }

                })
                detail.status = 2
                await detail.save()
            }


        });
        return true
    } catch (error) {
        return false
    }


}
const changeContractToStatus3 = async (contracts) => {
    try {

        contracts.forEach(async (contract) => {
            let check = await Detail_contract.findAll({
                where: {
                    [Op.or]: [
                        { status: 1 },
                        { status: 2 }
                    ]

                }
            })
            if (check.length === 0) {
                let detail = await Contract.findOne({
                    where: {
                        idContract: contract.idContract,
                        status: 2,
                    }

                })
                detail.status = 3
                await detail.save()
            }
        });
        return true
    } catch (error) {
        return false
    }


}
const cancelContractDueToUnpaid = async (payments) => {
    try {

        payments.forEach(async (payment) => {
            const detail_contract = await Detail_contract.findOne({
                where: {
                    idDetail_contract: payment.idDetail_contract
                }

            })
            let contract = await Contract.findOne({
                where: {
                    idContract: detail_contract.idContract
                }
            })
            if (contract.status != 0) {
                let details = await Detail_contract.update(
                    { status: 0 },
                    {
                        where: {
                            idContract: contract.idContract
                        }
                    }
                );
                contract.status = 0
                await contract.save()
                let mail = await sendMailCancelContract(contract.idContract, contract.signDate, payment.endDate)
            }

        });
        return true
    } catch (error) {
        return false
    }


}
const sendMailCancelContract = async (idContract, signDate, endDate) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "trannhatquan.2001@gmail.com", // generated ethereal user
                pass: "bseuvtvsghpnrltz", // generated ethereal password
            },
        });

        await transporter.sendMail({
            from: "trannhatquan.2001@gmail.com", // sender address
            to: `${email}`, // list of receivers
            subject: `Huỷ hợp đồng - ${idContract}`, // Subject line
            text: `Huỷ hợp đồng - ${idContract}`, // plain text body
            html: `Kính gửi quý khách,<br>Chúng tôi xin thông báo với bạn hợp đồng số: ${idContract}(ký vào ngày: ${signDate}) đã bị huỷ do quá hạn đóng phí bảo hiểm(hạn vào ngày: ${endDate}). Chúng tôi rất lấy làm tiếc về việc này, mọi thắc mắc xin liên hệ theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn.<br>Trân trọng,<br> LIFE`, // html body
        });





        return true
    } catch (error) {
        return false
    }
}
const sendMailPay = async (idPayment_schedule, idContract, nameInsurance, nameUser, startDate, endDate, total, email) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "trannhatquan.2001@gmail.com", // generated ethereal user
                pass: "bseuvtvsghpnrltz", // generated ethereal password
            },
        });

        await transporter.sendMail({
            from: "trannhatquan.2001@gmail.com", // sender address
            to: `${email}`, // list of receivers
            subject: `Đơn thu phí - ${nameInsurance}`, // Subject line
            text: `Đơn thu phí - ${nameInsurance}`, // plain text body
            html: `Kính gửi ${nameUser},<br>Chúng tôi xin gửi đến bạn đơn thu phí bảo hiểm của chúng tôi. Đây là thông báo về việc thanh toán phí bảo hiểm theo hợp đồng đã ký kết.<br>Mã thu phí: ${idPayment_schedule}.<br>Mã hợp đồng: ${idContract}.<br>Tên bảo hiểm: ${nameInsurance}<br>Ngày tạo: ${startDate}.<br>Ngày hết hạn thu phí: ${endDate}.<br>Tổng số tiền phải thanh toán: ${total}.000 đồng.<br>Vui lòng thanh toán đúng số tiền trong vòng 20 ngày kể từ ngày nhận email này.Nếu bạn đã thanh toán hoặc có bất kỳ câu hỏi nào liên quan đến đơn thu phí này, xin vui lòng liên hệ với chúng tôi theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn và chúng tôi mong nhận được thanh toán đúng hạn.<br>Trân trọng,<br> LIFE`, // html body
        });





        return true
    } catch (error) {
        return false
    }
}
const sendMailPayStaff = async () => {
    try {

        const now = moment();


        let staffs = await Staff.findAll({
            where: {
                isActive: 1
            },
            attributes: ['idStaff', 'mail', 'name'],
            raw: true,
            include: [
                {
                    model: Contract,
                    where: {
                        status: 1
                    },
                    attributes: ['idContract'],

                    include: [
                        {
                            model: Detail_contract,
                            include: [

                            ]
                        }
                    ]

                }
            ]
        })

        const isCreate = await createPayment(staffs)

        return true
    } catch (error) {
        return false
    }
}
const checkPayment = async () => {
    try {

        const now = moment();
        const oneDayBefore = now.clone().subtract(1, 'day');

        let payments = await Payment_schedule.findAll({
            raw: true,
            where: {
                status: 0,
                endDate: oneDayBefore
            }
        })
        if (payments.length !== 0) {
            let cancel = await cancelContractDueToUnpaid(payments)

        }

        return true
    } catch (error) {
        return false
    }
}
const checkDateDetailContract = async () => {
    try {
        let detail_contractStatus2 = await Detail_contract.findAll({
            raw: true,
            where: {
                status: 1,
                startDate: {
                    [db.Sequelize.Op.eq]: db.sequelize.literal(`DATE_ADD(DATE_SUB(NOW(), INTERVAL premiumPaymentTerm MONTH), INTERVAL 1 DAY)`),
                }

            }
        })
        if(detail_contractStatus2.length!==0){
            let changeToStatus2 = await changeDetailContractToStatus2(detail_contractStatus2)
        }
        
        let detail_contractStatus3 = await Detail_contract.findAll({
            raw: true,
            where: {
                status: 2,
                startDate: {
                    [db.Sequelize.Op.eq]: db.sequelize.literal(`DATE_ADD(DATE_SUB(NOW(), INTERVAL premiumPaymentTerm MONTH), INTERVAL 1 DAY)`),
                }

            }
        })
        if(detail_contractStatus3.length!==0){
            let changeToStatus3 = await changeDetailContractToStatus3(detail_contractStatus3)
        }
        return true
    } catch (error) {
        return false
    }
}
const checkContract = async () => {
    try {


        let contractStatus2 = await Contract.findAll({
            raw: true,
            where: {
                status: 1,
            }
        })
        if(contractStatus2.length!==0){
            let changeToStatus2 = await changeContractToStatus2(contractStatus2)
        }
        let contractStatus3 = await Contract.findAll({
            raw: true,
            where: {
                status: 2,


            }
        })
        if(contractStatus3.length!==0){
            let changeToStatus3 = await changeContractToStatus3(contractStatus3)
        }
        return true
    } catch (error) {
        return false
    }
}
const checkContractPayment = async () => {
    try {

        const now = moment();


        let users = await User.findAll({
            where: {
                isActive: 1
            },
            attributes: ['idUser', 'mail', 'name'],
            raw: true,
            include: [
                {
                    model: Contract,
                    where: {
                        status: 1
                    },
                    attributes: ['idContract'],

                    include: [
                        {
                            model: Detail_contract,
                            include: [
                                {
                                    model: Insurance,
                                    attributes: ['name'],
                                }
                            ],
                            where: {
                                status: 1,
                                startDate: {
                                    [db.Sequelize.Op.and]: [
                                        {
                                            [db.Sequelize.Op.gt]: db.sequelize.literal('DATE_SUB(NOW(), INTERVAL premiumPaymentTerm MONTH)'),
                                        },

                                        db.sequelize.literal(`(DATEDIFF(NOW(), startDate) / 30) % frequency = 0`),

                                    ]
                                }

                            },

                        }
                    ]

                }
            ]
        })
        if (users.length !== 0) {
            const isCreate = await createPayment(users)
        }


        return true
    } catch (error) {
        return false
    }
}

module.exports = {
    checkContractPayment, sendMailPayStaff, checkPayment, checkDateDetailContract, checkContract
};