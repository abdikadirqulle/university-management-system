import { prisma } from "../config/db.js"

// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        student: {
          select: {
            studentId: true,
            fullName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching payments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            studentId: true,
            fullName: true,
            email: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Error fetching payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get payments by student ID
const getPaymentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { studentId },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    const payments = await prisma.payment.findMany({
      where: { studentId },
      orderBy: {
        paymentDate: "desc",
      },
    })

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    console.error("Error fetching student payments:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching student payments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Create payment
const createPayment = async (req, res) => {
  try {
    const {
      studentId,
      amount,
      paymentDate,
      dueDate,
      status,
      type,
      forwarded,
      extraFee,
    } = req.body

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { studentId },
    })

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      })
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        paymentDate: new Date(paymentDate),
        type,
        // kuwan ka saar
        dueDate: new Date(dueDate),
        status,
        forwarded: forwarded ? parseFloat(forwarded) : null,
        extraFee: extraFee ? parseFloat(extraFee) : null,
      },
    })

// Update the student account with the payment amount
// if (status === "paid" || status === "partial") {
  await prisma.studentAccount.updateMany({
    where: { studentId },
    data: {
      paidAmount: {
        increment: parseFloat(amount)
      }
      
    }
  });
// }
    

    res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error while creating payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Update payment
const updatePayment = async (req, res) => {
  try {
    const { id, studentId } = req.params
    const {
      amount,
      paymentDate,
      dueDate,
      status,
      type,
      forwarded,
      extraFee,
    } = req.body

    // Check if payment exists
    const existingPayment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!existingPayment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Update payment
    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount ? parseFloat(amount) : undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status || undefined,
        type: type || undefined,
        forwarded: forwarded ? parseFloat(forwarded) : undefined,
        extraFee: extraFee ? parseFloat(extraFee) : undefined,
      },
    })

    // Update the student account with the payment amount
  
      await prisma.studentAccount.updateMany({
        where: { studentId },
        data: {
          paidAmount: {
            increment: parseFloat(amount)
          }
        }
      });
    
    
    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: updatedPayment,
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error while updating payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { id, studentId } = req.params

    // Check if payment exists
    const payment = await prisma.payment.findUnique({
      where: { id },
    })

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Delete payment
    await prisma.payment.delete({
      where: { id },
    })

    // Update the student account with the payment amount
    await prisma.studentAccount.updateMany({
      where: { studentId },
      data: {
        paidAmount: {
          decrement: parseFloat(payment.amount)
          }
        }
      });
  
    
    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error while deleting payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Get payment statistics
const getPaymentStatistics = async (req, res) => {
  try {
    // Get total payments
    const totalPayments = await prisma.payment.count()

    // Get total paid amount
    const paidPayments = await prisma.payment.aggregate({
      where: {
        status: "paid",
      },
      _sum: {
        amount: true,
      },
    })

    // Get total pending amount
    const pendingPayments = await prisma.payment.aggregate({
      where: {
        status: "pending",
      },
      _sum: {
        amount: true,
      },
    })

    // Get total overdue amount
    const overduePayments = await prisma.payment.aggregate({
      where: {
        status: "overdue",
      },
      _sum: {
        amount: true,
      },
    })

    // Get payment counts by type
    const paymentsByType = await prisma.payment.groupBy({
      by: ["type"],
      _count: {
        id: true,
      },
      _sum: {
        amount: true,
      },
    })

    res.status(200).json({
      success: true,
      statistics: {
        totalPayments,
        totalPaid: paidPayments._sum.amount || 0,
        totalPending: pendingPayments._sum.amount || 0,
        totalOverdue: overduePayments._sum.amount || 0,
        paymentsByType,
      },
    })
  } catch (error) {
    console.error("Error fetching payment statistics:", error)
    res.status(500).json({
      success: false,
      message: "Server error while fetching payment statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export {
  getAllPayments,
  getPaymentById,
  getPaymentsByStudentId,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStatistics,
}
