import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Poster from "../../assets/poster.jpg";
import IconDate from "../../assets/icondate.png";
import Icontime from "../../assets/icontime.png";
import Iconlo from "../../assets/iconlo.png";
import Iconsound from "../../assets/iconsound.png";
import Iconsub from "../../assets/iconsub.png";
import Iconcoin from "../../assets/iconcoin.png";
import Iconchair from "../../assets/iconchair.png";
import BGPromptPay from "../../assets/bg-qrcode.jpg";
import PromptPayQRCode from "../../components/promptpayqrcode/promptpayqrcode.tsx";
import CheckSlip from "../../components/checkslip/checkslip";
import Success from "../../assets/success.png";
import Unsuccess from "../../assets/unsuccess.png";

import {
  GetShowtimeById,
  GetMovieById,
  GetPaymentByTicketID,
  updateTicketStatus,
  updatePaymentStatus,
  saveSlipAndUpdateStatus,
} from "../../services/https/index";
import styles from "./ScanPayment.module.css";

// นำเข้า Alert จาก Ant Design
import { Alert } from "antd";

const ScanPayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { selectedSeats, showtimeID, ticketID } = location.state || {};
  console.log("Received in ScanPayment: ", {
    selectedSeats,
    showtimeID,
    ticketID,
  });

  const [movieName, setMovieName] = useState<string>("Loading...");
  const [showDate, setShowDate] = useState<string>("Loading...");
  const [showTime, setShowTime] = useState<string>("Loading...");
  const [theaterID, setTheaterID] = useState<number | string>("Loading...");
  const [moviePoster, setMoviePoster] = useState<string | null>(null);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);

  const [timeLeft, setTimeLeft] = useState(600); // Time countdown in seconds
  const [files, setFiles] = useState<File | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isCheckingSlip, setIsCheckingSlip] = useState<boolean>(false);
  const [checkSlipUsed, setCheckSlipUsed] = useState<boolean>(true);
  const [timeUpPopup, setTimeUpPopup] = useState(false);

  // State สำหรับควบคุมการแสดงผล Alert
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ใช้ ref เพื่อจัดการการเรียกใช้ CheckSlip
  const checkSlipRef = useRef<{ checkSlip: () => void }>(null);

  useEffect(() => {
    if (showtimeID) {
      GetShowtimeById(showtimeID).then((showtime) => {
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
        }
      });
    }

    if (ticketID) {
      GetPaymentByTicketID(ticketID)
        .then((payment) => {
          if (payment && payment.TotalPrice) {
            setTotalPrice(payment.TotalPrice);
          }
        })
        .catch((error) => {
          console.error("Error fetching payment:", error);
        });
    }
  }, [showtimeID, ticketID]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          handleTimeUp(); // Call the function to update status and show popup
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleTimeUp = async () => {
    if (ticketID) {
      try {
        await updatePaymentStatus(ticketID, "unfinish");
        await updateTicketStatus(ticketID, "unfinish");
        setTimeUpPopup(true); // Show the time-up popup
      } catch (error) {
        console.error("Error updating status:", error);
      }
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = async () => {
    try {
      if (ticketID) {
        await updatePaymentStatus(ticketID, "unfinish");
        await updateTicketStatus(ticketID, "unfinish");
        showAlert("error", "ชำระเงินไม่สำเร็จ");
        navigate("/home");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showAlert("error", "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const handleCloseCancelConfirmation = () => {
    setShowCancelConfirmation(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files[0]);
      setShowButtons(true);
    }
  };

  const handleReset = () => {
    setFiles(null);
    setShowButtons(false);
  };

  const handleSlipCheckResult = async (result: boolean) => {
    setIsCheckingSlip(false); // ปิดสถานะการตรวจสอบหลังการตรวจเสร็จสิ้น
  
    if (result && files) {
      try {
        const saveResult = await saveSlipAndUpdateStatus(
          ticketID,
          files,
          "Paid", // Payment status
          "Booked" // Ticket status set to "Booked"
        );
        setShowSuccessPopup(true);
        showAlert("success", "Payment Successful!");
        setCheckSlipUsed(false); // Stop using CheckSlip
      } catch (error) {
        console.error("Error during saving payment:", error);
        showAlert(
          "error",
          "เกิดข้อผิดพลาดในการบันทึกการชำระเงิน โปรดลองใหม่อีกครั้ง"
        );
      }
    } else {
      showAlert("error", "Slip ไม่ถูกต้อง กรุณาอัพโหลดสลิปใหม่");
    }
  };
  

  const handleSubmit = async () => {
    if (!files || !ticketID) {
      console.error("No file selected or ticket ID is missing");
      return;
    }
  
    // ป้องกันการกดปุ่มซ้ำหากการตรวจสอบกำลังทำงาน
    if (isCheckingSlip) {
      return;
    }
  
    setIsCheckingSlip(true);
  
    // ใช้ setTimeout เพื่อให้ React อัปเดตสถานะให้ครบก่อนเรียก checkSlipRef
    setTimeout(() => {
      if (checkSlipRef.current) {
        checkSlipRef.current.checkSlip(); // เรียกการตรวจสอบสลิปใน CheckSlip component
      }
    }, 0);
  };
  

  const handleOkClick = () => {
    setShowSuccessPopup(false);
    navigate("/ticket", { state: { ticketID, selectedSeats } });
  };

  const showAlert = (type: "success" | "error", message: string) => {
    if (showSuccessPopup || timeUpPopup) {
      // ถ้ามี popup ใดๆ กำลังแสดงอยู่ จะไม่แสดง alert
      return;
    }
    setAlert({ type, message });
  };

  return (
    <>
      <div className={styles.container}>
        {/* Content ด้านบน */}
        <div className={styles.content}>
          <img
            src={moviePoster || Poster}
            alt="Movie Poster"
            className={styles.poster}
          />
          <div className={styles.details}>
            <h1 className={styles.title}>{movieName}</h1>
            <div className={styles.infoGroup}>
              <div className={styles.infoItem}>
                <img src={IconDate} alt="date" className={styles.icon} />{" "}
                <span>{showDate}</span>
              </div>
              <div className={styles.infoItem}>
                <img src={Icontime} alt="time" className={styles.icon} />{" "}
                <span>{showTime}</span>
              </div>
              <div className={styles.infoItem}>
                <img src={Iconlo} alt="location" className={styles.icon} />{" "}
                <span>The Mall Korat</span>
              </div>
              <div className={styles.infoItem}>
                <h2>Theater {theaterID}</h2>
              </div>
              <div className={styles.languagesInfo}>
                <div className={styles.info}>
                  <img src={Iconsound} alt="sound" className={styles.icon} /> TH
                </div>
                <div className={styles.info}>
                  <img src={Iconsub} alt="subtitle" className={styles.icon} />{" "}
                  ENG
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content สำหรับ Select Seat และ Total */}
        <div className={styles.selectSeatContent}>
          <div className={styles.item}>
            <h3 className={styles.label}>Select Seat</h3>
            <div className={styles.innerContent}>
              <img src={Iconchair} alt="seat" className={styles.icon} />
              <span className={styles.text}>
                {selectedSeats && selectedSeats.length > 0
                  ? selectedSeats.join(", ")
                  : "No seats selected"}
              </span>
            </div>
          </div>
          <div className={styles.item}>
            <h3 className={styles.label}>Total</h3>
            <div className={styles.innerContent}>
              <img src={Iconcoin} alt="total" className={styles.icon} />
              <span className={styles.text}>
                {" "}
                {totalPrice !== 0 ? totalPrice : 0} THB
              </span>
            </div>
          </div>
        </div>

        {/* Content สำหรับ PromptPay QR Code */}
        <div className={styles.paymentContent}>
          <div className={styles.timeLeft}>
            <p>Time left to purchase</p>
            <div className={styles.timer}>{formatTime(timeLeft)}</div>
          </div>
          <img
            src={BGPromptPay}
            alt="PromptPay QR Code"
            className={styles.bgqrCode}
          />

          {/* แสดง PromptPay QR Code */}
          <div className={styles.qrCodeContent}>
            <div className={styles.qrCodeOverlay}>
              <PromptPayQRCode
                phoneNumber="" //ใส่เบอร์ promtpay
                amount={totalPrice !== null ? totalPrice : undefined}
              />
            </div>
          </div>

          {/* Content สำหรับการอัปโหลดสลิปและการยกเลิก */}
          <div className={styles.buttonGroup}>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={handleCancelClick}
            >
              Cancel
            </button>
            <label htmlFor="file-upload" className={styles.button}>
              Upload Slip
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className={styles.fileInput}
            />
          </div>

          {/* การยืนยันการยกเลิก */}
          {showCancelConfirmation && (
            <div className={styles.confirmationOverlay}>
              <div className={styles.confirmationBox}>
                <p>คุณต้องการยกเลิกการชำระเงินและออกจากหน้านี้หรือไม่?</p>
                <div className={styles.confirmationButtons}>
                  <button
                    className={styles.button}
                    style={{ backgroundColor: "#fff", color: "#000" }}
                    onClick={handleConfirmCancel}
                  >
                    ใช่
                  </button>
                  <button
                    className={`${styles.button} ${styles.cancelButton}`}
                    style={{ backgroundColor: "#077bce", color: "#fff" }}
                    onClick={handleCloseCancelConfirmation}
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Display uploaded slip */}
          {files && (
            <div className={styles.screenshotContainer}>
              <img
                src={URL.createObjectURL(files)}
                alt="Slip"
                className={styles.screenshot}
              />
            </div>
          )}

          {/* Confirm and Reset Buttons */}
          {showButtons && (
            <div className={styles.paymentButtonWrapper}>
              <button
                className={`${styles.button} ${styles.cancelButton}`}
                onClick={handleReset}
              >
                Reset
              </button>
              <button className={styles.button} onClick={handleSubmit}>
                Confirm
              </button>
            </div>
          )}
        </div>

        {/* Render CheckSlip component only if isCheckingSlip is true */}
        {isCheckingSlip && checkSlipUsed && (
          <CheckSlip
            ref={checkSlipRef} // ส่ง ref ให้กับ CheckSlip component
            file={files}
            totalPrice={totalPrice}
            onResult={handleSlipCheckResult}
          />
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className={styles.rewardPopupOverlay}>
            <div className={styles.rewardPopup}>
              <img
                src={Success} // เปลี่ยน yourImagePath เป็น path ของรูปภาพที่ต้องการใช้
                alt="Success"
                className={styles.popupImage} // คุณสามารถกำหนดสไตล์ให้กับรูปภาพได้
              />
              <p className={styles.rewardPopupMessage}>Payment Successful!</p>
              <button
                className={styles.rewardPopupButton}
                onClick={handleOkClick}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Time Up Popup */}
        {timeUpPopup && (
          <div className={styles.rewardPopupOverlay}>
            <div className={styles.rewardPopup}>
              <img
                src={Unsuccess}
                alt="Time Up"
                className={styles.popupImage} // คุณสามารถกำหนดสไตล์ให้กับรูปภาพได้
              />
              <p className={styles.rewardPopupMessage}>
                หมดเวลาในการชำระเงิน กรุณาทำรายการจองใหม่อีกครั้ง
              </p>
              <button
                className={styles.rewardPopupButton}
                onClick={handleConfirmCancel}
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Alert for success or error messages */}
        {alert && (
          <div className={`${styles.alertWrapper} ${styles.alertPosition}`}>
            <Alert
              message={alert.message}
              type={alert.type}
              showIcon
              closable
              onClose={() => setAlert(null)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default ScanPayment;
