import { PrismaClient } from "@prisma/client"
import { startOfMonth, endOfMonth, parseISO, format } from "date-fns"

const prisma = new PrismaClient()

export const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate, paymentType, status, studentId } = req.query

    // Build filter conditions
    const whereConditions = {}

    if (startDate && endDate) {
      whereConditions.paymentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    if (paymentType) {
      whereConditions.type = paymentType.toUpperCase()
    }

    if (status) {
      whereConditions.status = status.toUpperCase()
    }

    if (studentId) {
      whereConditions.studentId = studentId
    }

    // Get all payments based on filters
    const payments = await prisma.payment.findMany({
      where: whereConditions,
      include: {
        student: true,
      },
    })

    // Calculate total payments
    const totalPayment = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    )

    // Get student accounts for income calculations
    const studentAccounts = await prisma.studentAccount.findMany({
      where: {
        is_active: true,
      },
    })

    const incomeExpected = studentAccounts.reduce(
      (sum, account) => sum + account.tuitionFee,
      0
    )
    const accruedIncome = studentAccounts.reduce(
      (sum, account) => sum + (account.paidAmount || 0),
      0
    )
    const deferredIncome = incomeExpected - accruedIncome

    // Calculate monthly payments
    const monthlyPayments = await prisma.payment.groupBy({
      by: ["paymentDate"],
      _sum: {
        amount: true,
      },
      orderBy: {
        paymentDate: "asc",
      },
    })

    const formattedMonthlyPayments = monthlyPayments.map((mp) => ({
      month: format(mp.paymentDate, "MMM yyyy"),
      amount: mp._sum.amount,
    }))

    // Calculate payments by type
    const paymentsByType = await prisma.payment.groupBy({
      by: ["type"],
      _sum: {
        amount: true,
      },
    })

    const formattedPaymentsByType = paymentsByType.map((pt) => ({
      type: pt.type,
      amount: pt._sum.amount,
    }))

    // Calculate payment status
    const paymentStatus = await prisma.payment.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
      _sum: {
        amount: true,
      },
    })

    const formattedPaymentStatus = paymentStatus.map((ps) => ({
      status: ps.status,
      count: ps._count._all,
      amount: ps._sum.amount,
    }))

    res.json({
      success: true,
      data: {
        totalPayment,
        incomeExpected,
        accruedIncome,
        deferredIncome,
        monthlyPayments: formattedMonthlyPayments,
        paymentsByType: formattedPaymentsByType,
        paymentStatus: formattedPaymentStatus,
      },
    })
  } catch (error) {
    console.error("Error generating financial report:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate financial report",
      error: error.message,
    })
  }
}
