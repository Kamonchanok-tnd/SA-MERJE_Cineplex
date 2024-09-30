package entity

import "gorm.io/gorm"
import "time"

type Booking struct {
	gorm.Model
	BookingTime time.Time 

	MemberID   uint
	ShowTimeID uint
	SeatID     uint
	TicketID   uint

	Member   Member    `gorm:"foreignKey:MemberID"`
	ShowTime ShowTimes `gorm:"foreignKey:ShowTimeID"`
	Seat     Seat      `gorm:"foreignKey:SeatID"`
	Ticket   Ticket    `gorm:"foreignKey:TicketID"`
}