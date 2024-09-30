import { MembersInterface } from "../../interfaces/IMember";
import { ShowTimesInterface } from "../../interfaces/IShowtime";
import { BookingResponse } from "../../interfaces/IBooking"; // Import Interface ของ Tickets
import { RewardInterface } from "../../interfaces/IReward";

const apiUrl = "http://localhost:8000/api";

// ฟังก์ชันเพื่อดึงข้อมูลสมาชิกทั้งหมด
async function GetMembers() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/members`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

// ฟังก์ชันเพื่อลบสมาชิกตาม ID
async function DeleteMemberByID(
  id: Number | undefined,
  adminID?: number,
  password?: string
) {
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body:
      password && adminID ? JSON.stringify({ password, adminID }) : undefined, // ส่ง AdminID และ Password ถ้ามี
  };

  let res = await fetch(`${apiUrl}/members/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return true;
      } else {
        return res.json().then((err) => Promise.reject(err));
      }
    })
    .catch((error) => {
      console.error("Error deleting member:", error);
      return false;
    });

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูลสมาชิกตาม ID
async function GetMemberById(id: Number | undefined) {
  const requestOptions = {
    method: "GET",
  };

  let res = await fetch(`${apiUrl}/member/${id}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}

// ฟังก์ชันเพื่อสร้างสมาชิกใหม่
async function CreateMember(data: MembersInterface) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  let res = await fetch(`${apiUrl}/members`, requestOptions)
    .then((response) => response.json())
    .then((res) => {
      if (res.data) {
        return { status: true, message: res.data };
      } else {
        return { status: false, message: res.error };
      }
    });

  return res;
}

// ฟังก์ชันเพื่ออัปเดตข้อมูลสมาชิก
async function UpdateMember(data: MembersInterface) {
  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  let res = await fetch(`${apiUrl}/members/${data.ID}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูลหนังทั้งหมด
async function GetMovies() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/movies`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูลหนังตาม ID
async function GetMovieById(id: number | undefined) {
  if (id === undefined) {
    console.error("Movie ID is undefined");
    return false;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await fetch(`${apiUrl}/movie/${id}`, requestOptions);

    if (res.status === 200) {
      return await res.json();
    } else if (res.status === 404) {
      console.error("Movie not found");
      return false;
    } else {
      console.error("Failed to fetch movie, status code:", res.status);
      return false;
    }
  } catch (error) {
    console.error("Error fetching movie by ID:", error);
    return false;
  }
}

async function CreateMovie(formData: FormData) {
  const requestOptions = {
    method: "POST",
    body: formData,
  };

  let res = await fetch(`${apiUrl}/movies`, requestOptions)
    .then((response) => response.json())
    .then((res) => {
      if (res.data) {
        return { status: true, message: res.data };
      } else {
        return { status: false, message: res.error };
      }
    });

  return res;
}

// ฟังก์ชันเพื่ออัปเดตข้อมูลหนัง
async function UpdateMovie(movieId: number, formData: FormData) {
  const requestOptions = {
    method: "PATCH",
    body: formData,  // ส่ง formData โดยตรง ไม่ต้องใช้ JSON.stringify
  };

  let res = await fetch(`${apiUrl}/movies/${movieId}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error("Failed to update movie");
      }
    });

  return res;
}

// ฟังก์ชันเพื่อลบหนังตาม ID
async function DeleteMovieByID(id: Number | undefined) {
  const requestOptions = {
    method: "DELETE",
  };

  let res = await fetch(`${apiUrl}/movies/${id}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    }
  );

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูล Showtimes ทั้งหมด
async function GetShowtimes() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/showtimes`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูล Showtimes ตาม ID
async function GetShowtimeById(id: Number | undefined) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/showtimes/${id}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}

// ฟังก์ชันเพื่อสร้าง Showtimes ใหม่
async function CreateShowtime(data: ShowTimesInterface) {
  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  let res = await fetch(`${apiUrl}/showtimes`, requestOptions)
    .then((response) => response.json())
    .then((res) => {
      if (res.data) {
        return { status: true, message: res.data };
      } else {
        return { status: false, message: res.error };
      }
    });

  return res;
}

// ฟังก์ชันเพื่ออัปเดตข้อมูล Showtimes
async function UpdateShowtime(data: ShowTimesInterface) {
  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };

  let res = await fetch(`${apiUrl}/showtimes/${data.ID}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    }
  );

  return res;
}

// ฟังก์ชันเพื่อลบ Showtimes ตาม ID
async function DeleteShowtimeByID(id: Number | undefined) {
  const requestOptions = {
    method: "DELETE",
  };

  let res = await fetch(`${apiUrl}/showtimes/${id}`, requestOptions).then(
    (res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    }
  );

  return res;
}

async function CheckAdminPassword(adminID: number, password: string) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: adminID, password }), // ส่ง AdminID และ Password
  };

  let res = await fetch(`${apiUrl}/check-admin-password`, requestOptions)
    .then((response) => response.json())
    .then((res) => {
      if (res.success) {
        return { status: true };
      } else {
        return { status: false, message: res.error };
      }
    });

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูล Tickets ตาม ID
async function GetTicketById(id: Number | undefined) {
  if (!id || isNaN(Number(id))) {
    console.error("Invalid ID");
    return false;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  let res = await fetch(`${apiUrl}/tickets/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        console.error(`Error: Received status code ${res.status}`);
        return false;
      }
    })
    .catch((error) => {
      console.error("Error fetching ticket:", error);
      return false;
    });

  return res;
}

// ฟังก์ชันเพื่อทำการจองที่นั่ง
async function bookSeats(
  showtimeID: number,
  theaterID: number,
  memberID: number,
  seats: string[]
): Promise<BookingResponse> {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      showtime_id: showtimeID,
      theater_id: theaterID,
      member_id: memberID,
      seats: seats,
    }),
  };

  try {
    const response = await fetch(`${apiUrl}/book-seats`, requestOptions);
    const res = await response.json();

    if (res.success) {
      // คืนค่า ticketID จาก backend หากมีการส่งกลับมา
      return { success: true, message: res.message, ticketID: res.ticketID };
    } else {
      return { success: false, message: res.error || "Booking failed" };
    }
  } catch (error) {
    console.error("Error booking seats:", error);
    return { success: false, message: "Booking failed" };
  }
}

// ฟังก์ชันเพื่อดึงข้อมูลที่นั่งที่ถูกจองสำหรับ Showtime และ Theater
async function GetBookedSeats(showtimeID: number, theaterID: number) {
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(
      `${apiUrl}/booked-seats/${showtimeID}`,
      requestOptions
    );

    if (!response.ok) {
      console.error(`Error: Received status code ${response.status}`);
      return false; // ส่ง false หากการร้องขอล้มเหลว
    }

    const res = await response.json(); // แปลงข้อมูลจาก JSON
    return res; // ส่งผลลัพธ์ JSON กลับไป
  } catch (error) {
    console.error("Error fetching booked seats:", error); // จัดการข้อผิดพลาด
    return false; // ส่ง false หากมีข้อผิดพลาด
  }
}
// ฟังก์ชันเพื่อดึงข้อมูลรางวัลทั้งหมด
async function GetReward() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/rewards`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

// ฟังก์ชันเพื่อดึงข้อมูลรางวัลตาม ID
async function GetRewardById(id: Number | undefined) {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/rewards/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json(); // ถ้าสถานะเป็น 200 ส่งข้อมูลกลับมา
      } else {
        return false; // ถ้าไม่ใช่สถานะ 200 ส่งค่ากลับเป็น false
      }
    })
    .catch((error) => {
      console.error("Error fetching reward by ID:", error);
      return false; // ส่งกลับ false หากเกิดข้อผิดพลาด
    });

  return res; // ส่งข้อมูลรางวัลที่ได้กลับไป
}

async function CreateReward(data: RewardInterface) {
  // คัดลอกข้อมูล โดยตัด `id` และ `imageUrl` ออก
  const { ID, imageUrl, ...rewardDataWithoutIdAndImageUrl } = data;

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rewardDataWithoutIdAndImageUrl), // ส่งเฉพาะข้อมูลที่ต้องการ
  };

  let res = await fetch(`${apiUrl}/rewards`, requestOptions)
    .then((response) => response.json())
    .then((res) => {
      if (res.data) {
        return { status: true, message: res.data };
      } else {
        return { status: false, message: res.error };
      }
    });

  return res;
}
const GetRewardsByMemberID = async (memberID: string) => {
  try {
    const response = await fetch(`${apiUrl}/mrewards/${memberID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Raw Response:", response);

    if (!response.ok) {
      // ถ้าไม่สำเร็จ อ่านข้อมูลจาก response.text() เพื่อดีบักข้อผิดพลาด
      const errorText = await response.text();
      console.error("Error response text:", errorText);
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // พยายามอ่านข้อมูล response.json() เพียงครั้งเดียว
    const data = await response.json();
    console.log("Data:", data); // ตรวจสอบข้อมูลที่ได้รับ
    return data;
  } catch (error) {
    console.error("Error fetching rewards:", error);
    throw error;
  }
};
// ฟังก์ชันสำหรับบันทึกโค้ด (POST)
const saveCodeReward = async (
  code: string,
  rewardId: number,
  memberId: string | null
) => {
  try {
    const response = await fetch(`${apiUrl}/codereward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reward_code: code,
        reward_id: rewardId,
        member_id: memberId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error saving code:", errorText);
      throw new Error("Failed to save code");
    }

    const data = await response.json();
    console.log("Backend Response:", data); // ตรวจสอบข้อมูลที่ได้รับจาก Backend
    console.log("Saved Reward Code:", data.reward_code); // ตรวจสอบว่า reward_code ถูกส่งกลับมาหรือไม่
    return data; // คืนค่าผลลัพธ์ที่บันทึกลงฐานข้อมูล
  } catch (error) {
    console.error("Error saving code reward:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับตรวจสอบโค้ดรางวัล
const CheckCodeReward = async (code: string) => {
  try {
    const response = await fetch(`${apiUrl}/codereward?code=${code}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from server:", errorText); // แสดงข้อผิดพลาดจากเซิร์ฟเวอร์
      throw new Error("Failed to check code reward");
    }

    const data = await response.json();
    console.log("Response data from server:", data); // แสดงข้อมูลการตอบกลับจากเซิร์ฟเวอร์
    return data;
  } catch (error) {
    console.error("Error checking code reward:", error); // แสดง error หากไม่สามารถตรวจสอบโค้ดได้
    throw error;
  }
};

// ฟังก์ชันสำหรับตรวจสอบโค้ดแลกเปลี่ยน (GET)
const checkExistingCodeReward = async (rewardId: number) => {
  try {
    const response = await fetch(
      `${apiUrl}/check-code-reward?reward_id=${rewardId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.warn("Code reward not found for reward_id:", rewardId);
        return null; // ถ้าไม่พบโค้ด ให้คืนค่า null
      }
      const errorText = await response.text();
      console.error("Error checking code:", errorText);
      throw new Error("Failed to check code reward");
    }

    const data = await response.json();
    return data; // คืนค่าโค้ดที่มีอยู่ถ้ามี
  } catch (error) {
    console.error("Error checking existing code reward:", error);
    throw error;
  }
};

// ฟังก์ชันสำหรับเช็คอินด้วย TicketID
async function Checkin(TicketID: Number) {
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ticket_id: TicketID,
      time_stamp: new Date().toISOString(), // กำหนด timestamp
      status: "Check in", // สถานะของการเช็คอิน
    }),
  };

  try {
    const response = await fetch(
      `${apiUrl}/checkin/${TicketID}`,
      requestOptions
    );
    const res = await response.json();

    if (res.success) {
      return { status: true, message: "complete" };
    } else if (response.status === 409) {
      return { status: false, message: "failed" };
    } else {
      return { status: false, message: "Ticket not found" };
    }
  } catch (error) {
    return { status: false, message: "failed" };
  }
}
// ฟังก์ชันสำหรับดึงข้อมูลทั้งหมดใน ticketcheck
async function GetTicketcheck() {
  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(`${apiUrl}/checkin`, requestOptions); // แก้ไขเส้นทางตรงนี้
    const res = await response.json();

    if (res.data) {
      return res.data;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error fetching ticket check data:", error);
    return false;
  }
}

export const getRewardCode = async (code: string) => {
  try {
    const response = await fetch(`${apiUrl}/checkreward/${code}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reward code:", error);
    throw error;
  }
};

export const updateRewardCodeStatus = async (
  code: string,
  newStatus: boolean
) => {
  try {
    const response = await fetch(`${apiUrl}/updaterewardstatus/${code}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }), // ส่งสถานะใหม่
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating reward code status:", error);
    throw error;
  }
};

async function ReleaseSeats() {
  const requestOptions = {
    method: "PATCH", // ใช้ PATCH สำหรับการอัปเดต
    headers: {
      "Content-Type": "application/json",
    },
  };

  let res = await fetch(`${apiUrl}/release-seats`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    })
    .catch((error) => {
      console.error("Error releasing seats:", error);
      return false;
    });

  return res;
}

export async function GetDiscountRewardsByMemberID(memberID: number) {
  try {
    const response = await fetch(
      `${apiUrl}/rewards/member/${memberID}/discount`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    console.log("API response data:", data);

    // Check if data is an object and has a 'data' field that is an array
    if (data && Array.isArray(data.data)) {
      return data.data; // Return the array of rewards directly
    } else {
      console.warn("Expected an array but got something else", data);
      return []; // Return an empty array if the structure is unexpected
    }
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return []; // Return an empty array in case of error
  }
}

export async function createPayment(paymentData: any) {
  try {
    const response = await fetch(`${apiUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      throw new Error("Failed to create payment record");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function updateRewardStatus(rewardID: string) {
  try {
    const response = await fetch(`${apiUrl}/rewards/${rewardID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: false }),
    });

    if (!response.ok) {
      throw new Error("Failed to update reward status");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating reward status:", error);
    throw error;
  }
}

export async function GetPaymentByTicketID(ticketID: number) {
  try {
    const response = await fetch(`${apiUrl}/payments/ticket/${ticketID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch payment record");
    }

    const paymentData = await response.json();
    return paymentData;
  } catch (error) {
    console.error("Error fetching payment:", error);
    throw error;
  }
}

export async function updatePaymentStatus(ticketID: number, status: string) {
  try {
    const response = await fetch(`${apiUrl}/payments/status/${ticketID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Failed to update payment status");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

// อัปเดตสถานะของ ticket
export async function updateTicketStatus(ticketID: number, status: string, ticketPoint?: number) {
  try {
    // กำหนดชนิดของ body ให้ครอบคลุมทั้งสองค่า
    const body: { status: string; ticketpoint?: number } = { status };
    
    // ถ้ามี ticketPoint ให้เพิ่มเข้าไปใน request body
    if (ticketPoint !== undefined) {
      body.ticketpoint = ticketPoint;
    }

    const response = await fetch(`${apiUrl}/tickets/status/${ticketID}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error("Failed to update ticket status");
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
}

export async function GetBookingByTicketID(ticketID: number) {
  try {
    const response = await fetch(`${apiUrl}/bookings/ticket/${ticketID}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch booking record");
    }

    const bookingData = await response.json();
    return bookingData;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
}

export const saveSlipAndUpdateStatus = async (
  ticketID: string,
  slipFile: File,
  paymentStatus: string,
  ticketStatus: string // Add ticketStatus parameter
) => {
  const formData = new FormData();
  formData.append("ticketID", ticketID);
  formData.append("Slip", slipFile);
  formData.append("status", paymentStatus); // Payment status
  formData.append("ticketStatus", ticketStatus); // Ticket status

  const response = await fetch(`${apiUrl}/payments/upload-slip`, {
    method: "PATCH",
    body: formData,
  });

  const result = await response.json();
  return result;
};

async function GetTheaterById(id: number | undefined) {
  if (!id || isNaN(Number(id))) {
    console.error("Invalid Theater ID");
    return false;
  }

  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await fetch(`${apiUrl}/theater/${id}`, requestOptions);

    if (res.status === 200) {
      return res.json();
    } else if (res.status === 404) {
      console.error("Theater not found");
      return false;
    } else {
      console.error(`Failed to fetch theater, status code: ${res.status}`);
      return false;
    }
  } catch (error) {
    console.error("Error fetching theater by ID:", error);
    return false;
  }
}

async function GetTimeByShowtime(showtimeID: number): Promise<string | false> { 
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const response = await fetch(`${apiUrl}/showtimes/${showtimeID}/time`, requestOptions);

    if (!response.ok) {
      console.error(`Error: Received status code ${response.status}`);
      return false;
    }

    const data = await response.json();

    // แก้จาก data.time เป็น data.showtime
    return data.showtime;  // คืนค่าเวลาในรูปแบบ "hh:mm"
  } catch (error) {
    console.error("Error fetching showtime time:", error);
    return false;
  }
}

const fetchBookedSeatsService = async (showtimeID: number, seatMap: any) => {
  try {
    const response = await fetch(`${apiUrl}/booked-seats/${showtimeID}`);
    const seatsData = await response.json();
    if (response.ok && seatsData.data) {
      const bookedSeatsArray = seatsData.data.map((seatID: number) => seatMap[seatID]);
      return bookedSeatsArray;
    } else {
      console.log('No bookings found for this showtime.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    throw error; // ส่งต่อ error กลับไปให้ handle ด้านนอก
  }
};

export {
  GetTicketById,
  GetMembers,
  GetTheaterById,
  GetTimeByShowtime,
  CreateMember,
  DeleteMemberByID,
  GetMemberById,
  UpdateMember,
  GetMovies,
  GetMovieById,
  CreateMovie,
  UpdateMovie,
  DeleteMovieByID,
  GetShowtimes,
  GetShowtimeById,
  CreateShowtime,
  UpdateShowtime,
  DeleteShowtimeByID,
  bookSeats,
  GetBookedSeats, // เพิ่มฟังก์ชัน GetBookedSeats เพื่อดึงข้อมูลที่นั่งที่ถูกจอง
  CheckAdminPassword,
  GetReward,
  GetRewardById,
  CreateReward,
  GetRewardsByMemberID,
  saveCodeReward,
  CheckCodeReward,
  checkExistingCodeReward,
  Checkin,
  GetTicketcheck,
  ReleaseSeats,
  fetchBookedSeatsService
};
