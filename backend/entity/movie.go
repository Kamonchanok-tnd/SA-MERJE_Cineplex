package entity

import (
	"gorm.io/gorm"
)

type Movie struct {
	gorm.Model
	MovieName     string
	MovieType     string
	MovieDuration int
	Director      string
	Actor         string
	Synopsis      string
	ReleaseDate   string  
	Poster        []byte  `gorm:"type:blob"`     // เก็บภาพโปสเตอร์เป็น blob เนื่องจากมีความคมชัดมากกว่า

	Showtimes []ShowTimes `gorm:"foreignKey:MovieID"`
}
