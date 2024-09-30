package entity

import "gorm.io/gorm"
import "time"

type Payment struct {
	gorm.Model
	TotalPrice  int    //จริงๆควรใช้ float64
	Status      string
	PaymentTime time.Time 
	Slip        []byte    `gorm:"type:blob"`
	MemberID    uint
	Member      Member    `gorm:"foreignKey:MemberID"`

	TicketID uint   
	Ticket   Ticket `gorm:"foreignKey:TicketID"` 

	RewardID *uint  // ใช้ *uint เพื่อให้ RewardID สามารถเป็น null ได้
	Reward   Reward `gorm:"foreignKey:RewardID"` 
}
