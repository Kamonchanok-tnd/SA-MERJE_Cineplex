import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../components/navbar/navbar";
import ticket from "../../assets/ticket.png";
import Poster from "../../assets/poster.jpg";
import TicketQRCode from "../../components/ticketqrcode/ticketqrcode";

import {
  GetShowtimeById,
  GetMovieById,
  GetPaymentByTicketID,
  GetBookingByTicketID,
} from "../../services/https/index";
import styles from "./ticket.module.css";

const Ticket: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { ticketID, selectedSeats } = location.state || {};
  console.log("Received in Ticket: ", { ticketID, selectedSeats });

  const [movieName, setMovieName] = useState<string>("Loading...");
  const [showDate, setShowDate] = useState<string>("Loading...");
  const [showTime, setShowTime] = useState<string>("Loading...");
  const [theaterID, setTheaterID] = useState<number | string>("Loading...");
  const [moviePoster, setMoviePoster] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(0);

  useEffect(() => {
    if (ticketID) {
      GetBookingByTicketID(ticketID)
        .then((booking) => {
          console.log("Booking Data:", booking);

          if (booking && booking.ShowTime && booking.ShowTime.ID) {
            console.log("เข้าGetBookingByTicketID");

            GetShowtimeById(booking.ShowTime.ID)
              .then((showtime) => {
                if (showtime) {
                  setShowDate(new Date(showtime.Showdate).toLocaleDateString());
                  setShowTime(new Date(showtime.Showdate).toLocaleTimeString());
                  setTheaterID(showtime.TheaterID || "Unknown");

                  if (showtime.MovieID) {
                    const posterUrl = `http://localhost:8000/api/movie/${showtime.MovieID}/poster`;
                    setMoviePoster(posterUrl);
        
                    GetMovieById(showtime.MovieID).then((movie) => {
                      if (movie) {
                        setMovieName(movie.MovieName);
                      }
                    });
                  }
                } else {
                  console.error("Showtime not found");
                }
              })
              .catch((error) => {
                console.error("Error fetching showtime:", error);
              });
          } else {
            console.error("Booking not found or ShowtimeID is missing");
          }
        })
        .catch((error) => {
          console.error("Error fetching booking:", error);
        });

      GetPaymentByTicketID(ticketID)
        .then((payment) => {
          if (payment && payment.TotalPrice) {
            setTotalPrice(payment.TotalPrice);
            console.log("ตังค์เข้ากี่บาทจ้ะ : ",payment.TotalPrice)
          }
        })
        .catch((error) => {
          console.error("Error fetching payment:", error);
        });
    }
  }, [ticketID]);

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>Purchase Complete</h1>
        <p className={styles.subtitle}>
          Show this ticket at cinema hall entrance
        </p>
        <div className={styles.ticketContainer}>
          <img src={ticket} alt="Ticket" className={styles.ticket} />
          <img
            src={moviePoster || Poster} // Use the fallback Poster image if moviePoster is null
            alt="Movie Poster"
            className={styles.poster}
          />
          <div className={styles.detailsContainer}>
            <div>
              <p className={styles.movieName}>{movieName}</p>
            </div>
            <div>
              <p className={styles.language}>TH</p>
              <p className={styles.sub}>ENG</p>
            </div>
            <div>
              <p className={styles.cinemaName}>The Mall Korat</p>
              <p className={styles.theater}>{theaterID}</p>
              <p className={styles.seatNumber}>
                {Array.isArray(selectedSeats)
                  ? selectedSeats.join(", ")
                  : selectedSeats || "No seats selected"}
              </p>
              <p className={styles.date}>{showDate || "Loading..."}</p>
              <p className={styles.time}>{showTime || "Loading..."}</p>
              <p className={styles.price}>
                {totalPrice} THB
              </p>
            </div>
            <div className={styles.qrCodeContainer}>
              <TicketQRCode ticketID={ticketID} />
            </div>
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={() => navigate("/myticket")}
          >
            My Ticket
          </button>
          <button className={styles.button} onClick={() => navigate("/home")}>
            Home
          </button>
        </div>
      </div>
    </>
  );
};

export default Ticket;
