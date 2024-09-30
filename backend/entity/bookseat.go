package entity

import (
	"gorm.io/gorm"
)

type BookSeat struct {
	gorm.Model
	SeatID uint `gorm:"not null"`
	Seat   Seat `gorm:"foreignKey:SeatID"`

	BookingID uint    `gorm:"not null"` 
	Booking   Booking `gorm:"foreignKey:BookingID"`
}
