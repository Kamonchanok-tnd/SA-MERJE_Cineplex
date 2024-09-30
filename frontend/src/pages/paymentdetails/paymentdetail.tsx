import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Poster from "../../assets/poster.jpg";
import IconDate from "../../assets/icondate.png";
import Icontime from "../../assets/icontime.png";
import Iconlo from "../../assets/iconlo.png";
import Iconsound from "../../assets/iconsound.png";
import Iconsub from "../../assets/iconsub.png";
import Iconcoupon from "../../assets/iconcoupon.png";
import Iconcoin from "../../assets/iconcoin.png";
import Iconchair from "../../assets/iconchair.png";
import PromptPayLogo from "../../assets/promptpaylogo.png";
import {
  GetShowtimeById,
  GetMovieById,
  GetDiscountRewardsByMemberID,
  createPayment,
  updateRewardStatus,
  updateTicketStatus,
  updatePaymentStatus,
} from "../../services/https/index"; // Adjust path as needed
import styles from "./PaymentDetail.module.css"; // Import the CSS module

// เพิ่มการนำเข้า Alert จาก Ant Design
import { Alert } from "antd";

interface SelectedCoupon {
  id: string;
  discount: string;
  name: string;
}

const PaymentDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get state passed from SeatMap
  const { totalPrice, selectedSeats, showtimeID, ticketID } =
    location.state || {};
  console.log("Received in PaymentDetail: ", {
    totalPrice,
    selectedSeats,
    showtimeID,
    ticketID,
  });

  const [movieName, setMovieName] = useState<string>("Loading...");
  const [showDate, setShowDate] = useState<string>("Loading...");
  const [showTime, setShowTime] = useState<string>("Loading...");
  const [theaterID, setTheaterID] = useState<number | string>("Loading...");
  const [moviePoster, setMoviePoster] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]); // Store fetched coupons
  const [selectedCoupon, setSelectedCoupon] = useState<SelectedCoupon | null>(
    null
  );
  const [discountedTotalPrice, setDiscountedTotalPrice] =
    useState<number>(totalPrice); // New state to store the discounted total price

  // State สำหรับควบคุมการแสดงผล Alert
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    // Fetch showtime and movie details
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

    // Fetch coupons (rewards) based on memberID
    const memberID = parseInt(localStorage.getItem("id") || "0", 10);
    if (memberID) {
      GetDiscountRewardsByMemberID(memberID).then((rewards) => {
        console.log("Fetched Rewards:", rewards);

        if (Array.isArray(rewards)) {
          setCoupons(rewards); // Set the coupons state directly with the rewards array
        } else {
          console.warn("No rewards data found");
          setCoupons([]); // Set to an empty array if no data found
        }
      });
    }
  }, [showtimeID]);

  const handleCouponChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [id, discount, name] = e.target.value.split("|"); // เพิ่มการแยก name
    if (id && discount && name) {
      setSelectedCoupon({ id, discount, name }); // อัปเดตคูปองที่เลือก
      console.log("Coupon selected:", { id, discount, name });
    } else {
      console.error("Failed to parse selected coupon");
    }
  };

  const handleApplyCoupon = () => {
    console.log("Apply Click!!!!");

    if (selectedCoupon) {
      const discount = parseInt(selectedCoupon.discount);
      console.log("Apply value:", selectedCoupon.discount);

      if (discount > totalPrice) {
        setSelectedCoupon(null)
        setAlert({
          type: "error",
          message: "ไม่สามารถใช้คูปองนี้ได้ เนื่องจากส่วนลดเกินกว่าราคาสินค้า",
        });

        return;
      }

      setDiscountedTotalPrice(Math.max(0, totalPrice - discount));
      console.log(
        "Discounted Total Price:",
        Math.max(0, totalPrice - discount)
      ); // แสดงค่าหลังใช้คูปอง

      // อัปเดต select box ให้แสดงคูปองที่เลือก
      setSelectedCoupon({
        id: selectedCoupon.id,
        discount: selectedCoupon.discount,
        name: selectedCoupon.name,
      });
    } else {
      console.warn("No valid coupon selected");
    }
  };

  const handleCancel = () => {
    setSelectedCoupon(null); // Reset the selected coupon value to null
    setDiscountedTotalPrice(totalPrice); // Reset the discounted total price
    console.log("Coupon selection canceled"); // แสดงข้อความเมื่อยกเลิกการเลือกคูปอง
  };

  const handleConfirm = async () => {
    try {
      const memberID = parseInt(localStorage.getItem("id") || "0", 10);
      if (!memberID || !ticketID) {
        console.error("Member ID, Ticket ID หายไปหรือไม่ถูกต้อง");
        return;
      }

      // ถ้าผู้ใช้เลือกคูปอง ให้ใช้ ID ของคูปองนั้น, ถ้าไม่เลือก ให้ส่งเป็น null
      const selectedCouponId = selectedCoupon ? selectedCoupon.id : null;

      const paymentData = {
        totalPrice: discountedTotalPrice,
        status: "Pending",
        memberID: memberID,
        ticketID: ticketID,
        rewardID: selectedCoupon ? Number(selectedCoupon.id) : null, // แปลง id เป็น number หรือส่ง null หากไม่มีการเลือก coupon
      };

      console.log("Sending Payment Data:", paymentData);

      // เรียกใช้ฟังก์ชันสร้างการชำระเงิน
      const paymentResult = await createPayment(paymentData);
      console.log("Payment created:", paymentResult);

      // อัปเดตสถานะรางวัลหากมีการเลือกคูปอง
      if (selectedCouponId) {
        const updateRewardResult = await updateRewardStatus(selectedCouponId);
        console.log("Reward status updated:", updateRewardResult);
      }

      // ถ้าราคาหลังส่วนลดเป็น 0 ให้ไปที่หน้า ticket
      if (discountedTotalPrice === 0) {
        if (ticketID) {
          try {
            await updatePaymentStatus(ticketID, "Paid");
            await updateTicketStatus(ticketID, "Booked",0);
          } catch (error) {
            console.error("Error updating status:", error);
          }
        }
        setAlert({ type: "success", message: "การชำระเงินสำเร็จ!" });
        navigate("/ticket", { state: { ticketID, showtimeID, selectedSeats} });
      } else {
        // ถ้าราคาหลังส่วนลดมากกว่า 0 ให้ไปที่หน้า scanpayment
        setAlert({ type: "success", message: "ดำเนินการชำระเงิน" });
        navigate("/scanpayment", {
          state: { ticketID, showtimeID, selectedSeats },
        });
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setAlert({
        type: "error",
        message: "มีข้อผิดพลาดในการประมวลผลการชำระเงินของคุณ โปรดลองอีกครั้ง",
      });
    }
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
                {discountedTotalPrice ? `${discountedTotalPrice} THB` : "0 THB"}
              </span>
            </div>
          </div>
        </div>

        {/* Content สำหรับ Select Coupon และ Payment Method */}
        <div className={styles.contentColumn}>
          <div className={styles.fullWidth}>
            <h3 className={styles.label}>Select Coupon</h3>
            <div className={styles.couponContent}>
              <img src={Iconcoupon} alt="coupon" className={styles.icon} />
              <select
                className={styles.select}
                value={
                  selectedCoupon
                    ? `${selectedCoupon.id}|${selectedCoupon.discount}|${selectedCoupon.name}`
                    : ""
                } // กำหนด value เป็น id, discount และ name ของคูปองที่ถูกเลือก
                onChange={handleCouponChange}
              >
                <option value="">Select Coupon</option>
                {Array.isArray(coupons) && coupons.length > 0 ? (
                  coupons.map((coupon) => (
                    <option
                      key={coupon.rewardID}
                      value={`${coupon.rewardID}|${coupon.discount}|${coupon.rewardName}`}
                    >
                      {coupon.rewardName}
                    </option>
                  ))
                ) : (
                  <option>No Coupons Available</option>
                )}
              </select>

              <div className={styles.buttonGroup}>
                <button className={styles.button} onClick={handleApplyCoupon}>
                  Apply
                </button>
                <button className={styles.cancelbutton} onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div className={styles.fullWidth}>
            <h3 className={styles.label}> Payment Method</h3>
            <div className={styles.paymentContent}>
              <img
                src={PromptPayLogo}
                alt="PromptPay"
                className={styles.promptPayLogo}
              />
            </div>
            <div className={styles.paymentButtonWrapper}>
              <button className={styles.confirmButton} onClick={handleConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>

        {/* แสดง Alert ถ้ามี */}
        {alert && (
          <div className={styles.alertContainer}>
            <Alert
              message={alert.message}
              type={alert.type}
              showIcon
              closable
              afterClose={() => setAlert(null)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentDetail;
