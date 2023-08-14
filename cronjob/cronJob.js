const { Contract, Payment_schedule, Detail_contract, User, Insurance, Staff } = require("../models");
const db = require("../models/index");
const { QueryTypes, Op, where, STRING, Sequelize, sequelize } = require("sequelize");
const nodemailer = require("nodemailer");
const moment = require('moment');
const createPayment = async (users) => {
    try {

        users.forEach(async (user) => {
            let startDate = new Date(user['Contracts.Detail_contracts.startDate']);
            let currentDate = new Date();

            const yearDiff = currentDate.getFullYear() - startDate.getFullYear();
            const monthDiff = currentDate.getMonth() - startDate.getMonth();

            const monthsPassed = yearDiff * 12 + monthDiff;

            const roundedMonthsPassed = (monthsPassed / user['Contracts.Detail_contracts.frequency']) + 1;
            const isInteger = roundedMonthsPassed % 1 === 0;
            const endDate = new Date(currentDate.getTime() + (20 * 24 * 60 * 60 * 1000));
            let maxIndex
            if (user['Contracts.Detail_contracts.premiumPaymentTerm'] == 0) {
                maxIndex = 1
            }
            else {
                maxIndex = Math.floor(user['Contracts.Detail_contracts.premiumPaymentTerm'] / user['Contracts.Detail_contracts.frequency']);
            }

            if (roundedMonthsPassed <= maxIndex && isInteger) {
                const checkPay = await Payment_schedule.findOne({
                    where: {

                        idDetail_contract: user['Contracts.Detail_contracts.idDetail_contract'],
                        index: roundedMonthsPassed,
                    }
                })
                if (!checkPay) {

                    const pay = await Payment_schedule.create({

                        idUser: user['idUser'],
                        idDetail_contract: user['Contracts.Detail_contracts.idDetail_contract'],
                        startDate: currentDate,
                        endDate: endDate,
                        status: 0,
                        total: user['Contracts.Detail_contracts.premium'],
                        index: roundedMonthsPassed,

                    })
                    const mail = await sendMailPay(
                        pay.idPayment_schedule,
                        user['Contracts.idContract'], user['Contracts.Detail_contracts.Insurance.name'],
                        user['name'], currentDate, endDate, user['Contracts.Detail_contracts.premium'], user['mail']
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


            let detail = await Contract.findOne({
                where: {
                    idContract: contract.idContract,
                    status: 1,
                }

            })
            const [numAffectedRows, affectedRows] = await Detail_contract.update(
                { status: 2 },
                {
                    where: {
                        idContract: contract.idContract,
                        status: 1,
                    },
                }
                
               

            )
        detail.status = 2
        await detail.save()



    });
    return true
} catch (error) {
    return false
}


}
const changeContractToStatus3 = async (contracts) => {
    try {

        contracts.forEach(async (contract) => {
           
            
                let detail = await Contract.findOne({
                    where: {
                        idContract: contract.idContract,
                        status: 2,
                    }

                })
                const [numAffectedRows, affectedRows] = await Detail_contract.update(
                    { status: 3 },
                    {
                        where: {
                            idContract: contract.idContract,
                            status: 2,
                        },
                    }
                    
                   
    
                )
                detail.status = 3
                await detail.save()
            
        });
        return true
    } catch (error) {
        return false
    }


}
const cancelContractDueToUnpaid = async (payments) => {
    try {

        payments.forEach(async (payment) => {


            let pay = await Payment_schedule.findOne({
                idPayment_schedule: payment.idPayment_schedule
            })
            let user = await Payment_schedule.findOne({
                include: [{
                    model: Contract,
                    where: {
                        idContract: payment.idContract
                    },
                    required: true,
                }]
            })
            if (pay.status == 7) {
                let contract = await Contract.findOne({
                    where: {
                        idContract: payment.idContract
                    }
                })
                contract.status = 0
                await contract.save()
                let mail = await sendMailCancelContract(contract.idContract, contract.startDate, payment.endDate, user.mail)
            }
            else if (pay.status == 2) {
                pay.status = 3
            }
            else {
                currentStatus = Number(pay.status)
                currentStatus = currentStatus + 1
                currentTotal = Number(pay.status)
                currentTotal = Math.floor(currentTotal * 1.5)
                pay.status = Number(currentStatus)
                pay.total = Number(currentTotal)
            }
            let mail = sendMailPay(payment.idPayment_schedule, payment.idContract, user.name, payment.startDate, payment.endDate, total, user.mail)
            await pay.save()


        });
        return true
    } catch (error) {
        return false
    }


}
const sendMailPayment = async (idContract, signDate, endDate) => {
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
const sendMailCancelContract = async (idContract, startDate, endDate, email) => {
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
            html: `Kính gửi quý khách,<br>Chúng tôi xin thông báo với bạn hợp đồng số: ${idContract}(ký vào ngày: ${startDate}) đã bị huỷ do quá hạn đóng phí bảo hiểm(hạn vào ngày: ${endDate}). Chúng tôi rất lấy làm tiếc về việc này, mọi thắc mắc xin liên hệ theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn.<br>Trân trọng,<br> LIFE`, // html body
        });





        return true
    } catch (error) {
        return false
    }
}
const sendMailPayPlus = async (idPayment_schedule, idContract, nameInsurance, nameUser, startDate, endDate, total, email) => {
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
            subject: `Đơn thu phí - Hợp đồng ${idContract}`, // Subject line
            text: `Đơn thu phí - Hợp đồng ${idContract}`, // plain text body
            html: `Kính gửi ${nameUser},<br>Chúng tôi xin gửi đến bạn đơn thu phí bảo hiểm của chúng tôi. Đây là thông báo về việc thanh toán phí bảo hiểm theo hợp đồng đã ký kết.<br>Mã thu phí: ${idPayment_schedule}.<br>Mã hợp đồng: ${idContract}.<br>Ngày tạo: ${startDate}.<br>Ngày hết hạn thu phí: ${endDate}.<br>Tổng số tiền phải thanh toán: ${total} đồng.<br>Vui lòng thanh toán đúng số tiền trước khi hết tháng này này.Nếu bạn đã thanh toán hoặc có bất kỳ câu hỏi nào liên quan đến đơn thu phí này, xin vui lòng liên hệ với chúng tôi theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn và chúng tôi mong nhận được thanh toán đúng hạn.<br>Trân trọng,<br> LIFE`, // html body
        });





        return true
    } catch (error) {
        return false
    }
}
const sendMailPay = async (idPayment_schedule, idContract, nameUser, startDate, endDate, total, email) => {
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
            subject: `Đơn thu phí - Hợp đồng ${idContract}`, // Subject line
            text: `Đơn thu phí - Hợp đồng ${idContract}`, // plain text body
            html: `Kính gửi ${nameUser},<br>Chúng tôi xin gửi đến bạn đơn thu phí bảo hiểm của chúng tôi. Đây là thông báo về việc thanh toán phí bảo hiểm theo hợp đồng đã ký kết.<br>Mã thu phí: ${idPayment_schedule}.<br>Mã hợp đồng: ${idContract}.<br>Ngày tạo: ${startDate}.<br>Ngày hết hạn thu phí: ${endDate}.<br>Tổng số tiền phải thanh toán: ${total} đồng.<br>Vui lòng thanh toán đúng số tiền trước khi hết tháng này này.Nếu bạn đã thanh toán hoặc có bất kỳ câu hỏi nào liên quan đến đơn thu phí này, xin vui lòng liên hệ với chúng tôi theo thông tin dưới đây:<br>Email:trannhatquan.2001@gmail.com<br>Xin cảm ơn sự hợp tác của bạn và chúng tôi mong nhận được thanh toán đúng hạn.<br>Trân trọng,<br> LIFE`, // html body
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


        let payments = await Payment_schedule.findAll({
            raw: true,
            where: {
                status: {
                    [db.Sequelize.Op.gte]: 2 // Sử dụng Op.gte để lọc status lớn hơn hoặc bằng 2
                },
                startDate: {
                    [db.Sequelize.Op.lte]: now
                },
            }
        })
        console.log('checKpay2')
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
        if (detail_contractStatus2.length !== 0) {
            let changeToStatus2 = await changeDetailContractToStatus2(detail_contractStatus2)
        }

        let detail_contractStatus3 = await Detail_contract.findAll({
            raw: true,
            where: {
                status: 2,
                startDate: {
                    [db.Sequelize.Op.eq]: db.sequelize.literal(`DATE_ADD(DATE_SUB(NOW(), INTERVAL contractTerm MONTH), INTERVAL 1 DAY)`),
                }

            }
        })
        if (detail_contractStatus3.length !== 0) {
            let changeToStatus3 = await changeDetailContractToStatus3(detail_contractStatus3)
        }
        return true
    } catch (error) {
        return false
    }
}
const checkContract = async () => {
    try {
        const now = moment();

        let contractStatus2 = await Contract.findAll({
            raw: true,
            where: {
                status: 1,
                startDate: {
                    [db.Sequelize.Op.lte]: db.sequelize.literal(`DATE_ADD(DATE_SUB(NOW(), INTERVAL premiumPaymentTerm MONTH), INTERVAL 1 DAY)`),
                }
            }
        })
        if (contractStatus2.length !== 0) {
            let changeToStatus2 = await changeContractToStatus2(contractStatus2)
        }
        let contractStatus3 = await Contract.findAll({
            raw: true,
            where: {
                status: 2,
                endDate: {
                    [db.Sequelize.Op.lte]: now
                }

            }
        })
        if (contractStatus3.length !== 0) {
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
                                    [db.Sequelize.Op.gt]: db.sequelize.literal('DATE_SUB(NOW(), INTERVAL premiumPaymentTerm MONTH)'),
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
    sendMailPayStaff, checkPayment, checkDateDetailContract, checkContract
};