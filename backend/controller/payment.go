package controller

import (
	"net/http"
	"io"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)
// POST /payments
func CreatePayment(c *gin.Context) {
	var payment entity.Payment
	if err := c.ShouldBindJSON(&payment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	
	// ตรวจสอบว่ามี Member และ Ticket ที่ระบุไว้หรือไม่
	var member entity.Member
	if err := db.First(&member, payment.MemberID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Member not found"})
		return
	}
    
	var ticket entity.Ticket
	if err := db.First(&ticket, payment.TicketID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
		return
	}

	// ตรวจสอบว่า rewardID ถูกส่งมาหรือไม่
	if payment.RewardID != nil {
		var reward entity.Reward
		if err := db.First(&reward, payment.RewardID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Reward not found"})
			return
		}
	}

	// สร้างข้อมูลการชำระเงินใหม่
	payment.PaymentTime = time.Now()
	if err := db.Create(&payment).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Created success", "data": payment})
}


func GetPaymentByTicketID(c *gin.Context) {
    ticketID := c.Param("ticketid")
    var payment entity.Payment

    db := config.DB()
    // ดึงข้อมูลการชำระเงินที่มี TicketID ตรงกับที่ระบุ
    if err := db.Preload("Member").Preload("Ticket").Where("ticket_id = ?", ticketID).First(&payment).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
        return
    }
    c.JSON(http.StatusOK, payment)
}

// PATCH /payments/status/:ticketID
func UpdatePaymentStatusByTicketID(c *gin.Context) {
    ticketID := c.Param("ticketID")
    var payment entity.Payment

    db := config.DB()

    // ค้นหาการชำระเงินที่มี TicketID ตรงกับที่ระบุ
    if err := db.Where("ticket_id = ?", ticketID).First(&payment).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
        return
    }

    // Bind ข้อมูลสถานะใหม่ที่ได้รับจาก client
    var updateData struct {
        Status string `json:"status"`
    }
    if err := c.ShouldBindJSON(&updateData); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payload"})
        return
    }

    // อัปเดตสถานะของการชำระเงิน
    payment.Status = updateData.Status
    if err := db.Save(&payment).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Payment status updated successfully"})
}

// PATCH /payments/status/:ticketID
func UpdatePaymentSlipByTicketID(c *gin.Context) {
    // รับ ticketID จาก form-data
    ticketID := c.PostForm("ticketID")
    if ticketID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket ID is required"})
        return
    }

    var payment entity.Payment
    db := config.DB()

    // ค้นหาการชำระเงินที่มี TicketID ตรงกับที่ระบุ
    if err := db.Where("ticket_id = ?", ticketID).First(&payment).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
        return
    }

    // รับไฟล์ slip จาก request
    file, _, err := c.Request.FormFile("Slip")
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "No slip file provided"})
        return
    }
    defer file.Close()

    // อ่านข้อมูล slip เป็น byte
    slipData, err := io.ReadAll(file)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read slip data"})
        return
    }

    // อัปเดตข้อมูล slip ในตาราง payment
    payment.Slip = slipData

    // รับข้อมูลสถานะใหม่ที่ได้รับจาก client ผ่าน form-data สำหรับการชำระเงิน
    paymentStatus := c.PostForm("status")
    if paymentStatus == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Payment status is required"})
        return
    }

    // อัปเดตสถานะของการชำระเงิน
    payment.Status = paymentStatus

    // บันทึกการอัปเดตข้อมูลการชำระเงินในฐานข้อมูล
    if err := db.Save(&payment).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update payment status"})
        return
    }

    // รับข้อมูลสถานะใหม่ที่ได้รับจาก client ผ่าน form-data สำหรับตาราง ticket
    ticketStatus := c.PostForm("ticketStatus")
    if ticketStatus == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Ticket status is required"})
        return
    }

    // อัปเดตสถานะของ ticket ที่ตรงกับ ticketID
    if err := db.Model(&entity.Ticket{}).Where("id = ?", ticketID).Update("status", ticketStatus).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ticket status"})
        return
    }

    var ticket entity.Ticket
    if err := db.Where("id = ?", ticketID).First(&ticket).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Ticket not found"})
        return
    }

    // อัปเดตคะแนนให้กับสมาชิกตาม point ของ ticket
    var member entity.Member
    if err := db.Where("id = ?", payment.MemberID).First(&member).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Member not found"})
        return
    }

    // เพิ่มคะแนนให้กับสมาชิก
    member.TotalPoint += ticket.Point
    if err := db.Save(&member).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update member points"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Payment status, slip, ticket status, and member points updated successfully"})
}

