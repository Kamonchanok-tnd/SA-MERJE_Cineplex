import React, { useState, useEffect, useRef } from "react";
import "./Showtime.css";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FireOutlined,
  SmileOutlined,
  WarningOutlined,
  HeartOutlined,
  RocketOutlined,
  CrownOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  SearchOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { Select, DatePicker, TimePicker, message, Modal } from "antd";
import moment, { Moment } from "moment";
import { TheatersInterface } from "../../interfaces/ITheater";
import { ShowTimesInterface } from "../../interfaces/IShowtime";
import { MoviesInterface } from "../../interfaces/IMovie";
import Table from "react-bootstrap/Table";
const { Option } = Select;
import { Card } from "antd";

interface ShowTimeInterface extends ShowTimesInterface {
  startTime: number;
  endTime: number;
  theater: string;
  movieTitle?: string;
  movieType?: string;
}

const showtimes = Array.from({ length: 14 }, (_, i) => 9 + i);

const colors = [
  "#FFA500",
  "#FFD700",
  "#FFFF00",
  "#4CAF50",
  "#ADFF2F",
  "#00FF00",
  "#20B2AA",
  "#ecb6ef",
  "#8A2BE2",
  "#EE82EE",
  "#C71585",
];

const ShowtimeManagement: React.FC = () => {
  const [schedule, setSchedule] = useState<ShowTimeInterface[]>([]);
  const [colorMap, setColorMap] = useState<{ [key: string]: string }>({});
  const [movies, setMovies] = useState<MoviesInterface[]>([]);
  const [theaters, setTheaters] = useState<TheatersInterface[]>([]);
  const [selectedDate, setSelectedDate] = useState<Moment | null>(null);
  const [selectedTime, setSelectedTime] = useState<Moment | null>(null);
  const [selectedMovieID, setSelectedMovieID] = useState<number | undefined>(
    undefined
  );
  const [selectedTheaterID, setSelectedTheaterID] = useState<
    number | undefined
  >(undefined);
  const [reload, setReload] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(
    null
  );
  const isManualUpdate = useRef(false);
  const [moviePoster, setMoviePoster] = useState<string | null>(null); // State for poster

  useEffect(() => {
    if (!isManualUpdate.current && selectedDate) {
      fetch("http://localhost:8000/api/showtimes")
        .then((response) => response.json())
        .then((data) => {
          const transformedSchedule: ShowTimeInterface[] = data.flatMap(
            (item: any) => {
              const Showdate = moment(item.Showdate);

              if (
                selectedDate &&
                Showdate.format("YYYY-MM-DD") !==
                  selectedDate.format("YYYY-MM-DD")
              ) {
                return [];
              }

              const startTime = Showdate.hours();
              const durationInMinutes = Math.ceil(item.Movie.MovieDuration);
              const endTime = Math.min(
                startTime + Math.ceil(durationInMinutes / 60),
                23
              );
              const theater = item.Theater.TheaterName;
              const movieTitle = item.Movie.MovieName;
              const movieType = item.Movie.MovieType;

              return [
                {
                  ID: item.ID,
                  startTime,
                  endTime,
                  theater,
                  movieTitle,
                  movieType,
                },
              ];
            }
          );

          setSchedule(transformedSchedule);

          const newColorMap: { [key: string]: string } = {};
          let colorIndex = 0;
          transformedSchedule.forEach((showtime) => {
            if (showtime.movieTitle && !newColorMap[showtime.movieTitle]) {
              newColorMap[showtime.movieTitle] =
                colors[colorIndex % colors.length];
              colorIndex++;
            }
          });
          setColorMap(newColorMap);
        })
        .catch((error) => {
          console.error("Error fetching showtimes:", error);
        });
    }
  }, [reload, selectedDate]);

  useEffect(() => {
    fetch("http://localhost:8000/api/movies")
      .then((response) => response.json())
      .then((data) => {
        setMovies(data);
      })
      .catch((error) => console.error("Error fetching movies:", error));

    fetch("http://localhost:8000/api/theaters")
      .then((response) => response.json())
      .then((data) => {
        setTheaters(data);
      })
      .catch((error) => console.error("Error fetching theaters:", error));
  }, []);

  // ฟังก์ชันตรวจสอบประเภทหนังแล้วคืนค่าไอคอนที่เหมาะสม
  const getmovieTypeIcon = (movieType: string | undefined) => {
    switch (movieType) {
      case "Action":
      case "Adventure":
        return <FireOutlined style={{ marginRight: "8px" }} />;
      case "Comedy":
        return <SmileOutlined style={{ marginRight: "8px" }} />;
      case "Horror":
        return <WarningOutlined style={{ marginRight: "8px" }} />;
      case "Romantic":
        return <HeartOutlined style={{ marginRight: "8px" }} />;
      case "Sci-Fi":
        return <RocketOutlined style={{ marginRight: "8px" }} />;
      case "Drama":
        return <CrownOutlined style={{ marginRight: "8px" }} />;
      case "Mystery":
      case "Thriller":
        return <EyeOutlined style={{ marginRight: "8px" }} />;
      case "War":
        return <ThunderboltOutlined style={{ marginRight: "8px" }} />;
      case "Crime":
        return <SearchOutlined style={{ marginRight: "8px" }} />;
      case "History":
        return <HistoryOutlined style={{ marginRight: "8px" }} />;
      default:
        return null; // ถ้าไม่มีประเภทตรงกับที่ระบุ จะไม่แสดงไอคอน
    }
  };

  const disabledHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < 9 || i > 22) {
        hours.push(i);
      }
    }
    return hours;
  };

  const disabledMinutes = (selectedHour: number) => {
    if (selectedHour === 8 || selectedHour === 22) {
      return Array.from({ length: 60 }, (_, i) => i);
    }
    return [];
  };

  const handleDateChange = (date: Moment | null) => {
    if (!isManualUpdate.current) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (time: Moment | null) => {
    if (!isManualUpdate.current) {
      setSelectedTime(time);
    }
  };

  const handleAddShowTime = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedMovieID ||
      !selectedTheaterID
    ) {
      message.error("Please select all fields");
      return;
    }

    const combinedDateTime = moment(selectedDate).set({
      date: selectedDate.date(),
      month: selectedDate.month(),
      hour: selectedTime?.hour() || 0,
      minute: selectedTime?.minute() || 0,
      second: 0,
      millisecond: 0,
    });

    const newShowTimeStart = combinedDateTime.hours();
    const movieDuration =
      movies.find((movie) => movie.ID === selectedMovieID)?.MovieDuration || 0;
    const durationInHours = Math.ceil(movieDuration / 60);
    const newShowTimeEnd = Math.min(
      newShowTimeStart + Math.ceil(durationInHours),
      22
    );
    const newShowTimeEnd2 = newShowTimeStart + Math.ceil(durationInHours);

    if (newShowTimeEnd2 > 23) {
      message.error("End time exceeds 23:00, cannot add showtime");
      return;
    }
    const isConflict = schedule.some((showtime) => {
      if (
        showtime.theater ===
        theaters.find((theater) => theater.ID === selectedTheaterID)
          ?.TheaterName
      ) {
        const existingStart = showtime.startTime;
        const existingEnd = showtime.endTime;
        return newShowTimeStart < existingEnd && newShowTimeEnd > existingStart;
      }
      return false;
    });

    if (isConflict) {
      message.error(
        "There is a conflict with another showtime in the same theater."
      );
      return;
    }

    const newShowTime = {
      Showdate: combinedDateTime.toISOString(),
      MovieID: selectedMovieID,
      TheaterID: selectedTheaterID,
    };

    fetch("http://localhost:8000/api/showtimes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newShowTime),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((error) => {
            throw new Error(error.error || "Error creating showtime");
          });
        }
        return response.json();
      })
      .then((data) => {
        message.success("ShowTime created successfully");
        setReload(!reload);
      })
      .catch((error) => {
        message.error("Error creating showtime");
        console.error("Error creating showtime:", error);
      });
  };

  const handleUpdateShowTime = () => {
    if (
      !selectedDate ||
      !selectedTime ||
      !selectedMovieID ||
      !selectedTheaterID ||
      !selectedShowtimeId
    ) {
      message.error("Please select all fields");
      return;
    }

    // คำนวณเวลารวมจากวันที่และเวลา
    const combinedDateTime = moment(selectedDate).set({
      date: selectedDate.date(),
      month: selectedDate.month(),
      hour: selectedTime?.hour() || 0,
      minute: selectedTime?.minute() || 0,
      second: 0,
      millisecond: 0,
    });

    const newShowTimeStart = combinedDateTime.hours();
    const movieDuration =
      movies.find((movie) => movie.ID === selectedMovieID)?.MovieDuration || 0;
    const durationInHours = Math.ceil(movieDuration / 60);
    const newShowTimeEnd = newShowTimeStart + Math.ceil(durationInHours);

    // ตรวจสอบว่าเวลาสิ้นสุดเกิน 23:00 หรือไม่
    if (newShowTimeEnd > 23) {
      message.error("End time exceeds 23:00, cannot update showtime");
      return;
    }

    // ตรวจสอบว่ารอบฉายใหม่ชนกับรอบอื่นในโรงเดียวกันหรือไม่
    const isConflict = schedule.some((showtime) => {
      // ตรวจสอบเฉพาะโรงภาพยนตร์ที่เลือกและไม่ตรวจสอบรอบฉายที่กำลังอัปเดต
      if (
        showtime.theater ===
          theaters.find((theater) => theater.ID === selectedTheaterID)
            ?.TheaterName &&
        showtime.ID !== selectedShowtimeId
      ) {
        const existingStart = showtime.startTime;
        const existingEnd = showtime.endTime;
        // ตรวจสอบว่ารอบฉายใหม่ไปทับกับรอบที่มีอยู่หรือไม่
        return newShowTimeStart < existingEnd && newShowTimeEnd > existingStart;
      }
      return false;
    });

    // ถ้าพบรอบชนกัน
    if (isConflict) {
      message.error(
        "There is a conflict with another showtime in the same theater."
      );
      return;
    }

    // เตรียมข้อมูลสำหรับอัปเดต
    const formattedDateTime = combinedDateTime.format("YYYY-MM-DDTHH:mm:ssZ");

    const updateShowTime = {
      Showdate: formattedDateTime,
      MovieID: selectedMovieID,
      TheaterID: selectedTheaterID,
    };

    console.log("Update Showtime Data:", JSON.stringify(updateShowTime));

    // ส่งคำขออัปเดตข้อมูลไปยัง API
    fetch(`http://localhost:8000/api/showtimes/${selectedShowtimeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateShowTime),
    })
      .then(async (response) => {
        const responseBody = await response.text();
        console.log("Response Body:", responseBody);

        if (!response.ok) {
          try {
            const errorData = JSON.parse(responseBody);
            throw new Error(errorData.error || "Error updating showtime");
          } catch (e) {
            throw new Error("Unexpected error format received from the server");
          }
        }

        return JSON.parse(responseBody);
      })
      .then((data) => {
        message.success("ShowTime updated successfully");
        setReload(!reload);
        setPopupVisible(false); // ปิด popup เมื่ออัปเดตเสร็จสิ้น
      })
      .catch((error) => {
        message.error(`Error updating showtime: ${error.message}`);
        console.error("Error updating showtime:", error);
      });
  };

  const handleDeleteShowTime = () => {
    if (!selectedShowtimeId) {
      message.error("Please select a showtime to delete");
      return;
    }

    Modal.confirm({
      title: "Are you sure you want to delete?",
      content:
        "This information will be permanently deleted and cannot be recovered.",
      centered: true, // ให้ Modal อยู่กึ่งกลาง
      okText: "confirm",
      cancelText: "cancel",
      okButtonProps: { danger: true }, // ปรับสีปุ่มยืนยันให้เป็นปุ่มลบ
      onOk: () => {
        fetch(`http://localhost:8000/api/showtimes/${selectedShowtimeId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => {
            if (!response.ok) {
              return response.json().then((error) => {
                throw new Error(error.error || "Error deleting showtime");
              });
            }
            return response.json();
          })
          .then(() => {
            message.success("ShowTime deleted successfully");
            setReload(!reload);
            setPopupVisible(false); // ปิด popup เมื่อทำการลบเสร็จ
          })
          .catch((error) => {
            message.error(`Error deleting showtime: ${error}`);
            console.error("Error deleting showtime:", error);
          });
      },
      onCancel: () => {
        console.log("Cancel deletion");
      },
    });
  };

  const handleClick = (showtime: ShowTimeInterface) => {
    isManualUpdate.current = true;

    setSelectedTime(moment({ hour: showtime.startTime, minute: 0 }));
    setSelectedMovieID(
      movies.find((movie) => movie.MovieName === showtime.movieTitle)?.ID
    );
    setSelectedTheaterID(
      theaters.find((theater) => theater.TheaterName === showtime.theater)?.ID
    );
    const selectedMovie = movies.find(
      (movie) => movie.MovieName === showtime.movieTitle
    );

    if (selectedMovie) {
      // ถ้าเจอหนังโดยใช้ movieName หา movie.ID แล้วนำไปสร้าง URL ของโปสเตอร์
      setSelectedMovieID(selectedMovie.ID);
      const posterUrl = `http://localhost:8000/api/movie/${selectedMovie.ID}/poster`;
      setMoviePoster(posterUrl); // ตั้งค่า poster ใน state
    } else {
      setMoviePoster(null); // ถ้าไม่เจอหนัง ตั้งค่าให้เป็น null
    }

    const foundShowtime = schedule.find(
      (s) =>
        s.startTime === showtime.startTime &&
        s.theater === showtime.theater &&
        s.movieTitle === showtime.movieTitle
    );

    console.log("Selected Showtime ID:", foundShowtime?.ID);
    console.log("Date:", selectedDate?.format("YYYY-MM-DD"));
    console.log("Time:", showtime.startTime + ":00");
    console.log("Movie:", showtime.movieTitle);
    console.log("Theater:", showtime.theater);

    setSelectedShowtimeId(foundShowtime?.ID || null);

    setTimeout(() => {
      isManualUpdate.current = false;
    }, 0);

    setPopupVisible(true); // แสดง popup update
  };

  return (
    <div className="showtime">
      <div className="app">
        <Card style={{ margin: "20px" }}>
          {/* Header Section */}
          <div className="header">
            <div className="header-item">
              <label>Date:</label>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                allowClear={false}
              />
            </div>
            <div className="header-item">
              <label>Time:</label>
              <TimePicker
                value={selectedTime}
                format="HH:mm"
                disabledHours={disabledHours}
                disabledMinutes={disabledMinutes}
                onChange={handleTimeChange}
                allowClear={false}
              />
            </div>
            <div className="header-item search-movie-container">
              <label>Movie:</label>
              <Select
                value={selectedMovieID}
                showSearch
                className="movie-select"
                allowClear
                placeholder="Select a Movie"
                style={{ width: 200 }}
                optionFilterProp="children"
                onChange={(value) => setSelectedMovieID(value as number)}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {movies.map((movie) => (
                  <Option key={movie.ID} value={movie.ID}>
                    {movie.MovieName}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="header-item search-theater-container">
              <label>Theater:</label>
              <Select
                value={selectedTheaterID}
                showSearch
                className="theater-select"
                allowClear
                placeholder="Select a Theater"
                style={{ width: 200 }}
                optionFilterProp="children"
                onChange={(value) => setSelectedTheaterID(value as number)}
                filterOption={(input, option) =>
                  option?.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
              >
                {theaters.map((theater) => (
                  <Option key={theater.ID} value={theater.ID}>
                    {theater.TheaterName}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="header-item">
              <button className="aadd-btn" onClick={handleAddShowTime}>
                <PlusOutlined /> Add
              </button>
            </div>
          </div>

          {/* Showtime Table Section */}
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Theater / Time</th>
                {showtimes.map((time) => (
                  <th key={time}>{time}:00</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {theaters.map((theater) => (
                <tr key={theater.ID}>
                  <td>{theater.TheaterName}</td>
                  {showtimes.map((time) => {
                    const showtime = schedule.find(
                      (s) =>
                        s.startTime === time &&
                        s.theater === theater.TheaterName
                    );
                    if (showtime && time === showtime.startTime) {
                      const colSpan = showtime.endTime - showtime.startTime;
                      return (
                        <td
                          key={time}
                          colSpan={colSpan}
                          className="showtime-cell"
                          style={{
                            backgroundColor: colorMap[showtime.movieTitle!],
                            textAlign: "center",
                            cursor: "pointer",
                          }}
                          onClick={() => handleClick(showtime)}
                        >
                          {getmovieTypeIcon(showtime.movieType)}{" "}
                          {/* เรียกฟังก์ชันเพื่อตรวจสอบ movieType */}
                          {showtime.movieTitle}
                        </td>
                      );
                    } else if (
                      showtime &&
                      time < showtime.endTime &&
                      time > showtime.startTime
                    ) {
                      return null;
                    } else if (
                      !schedule.some(
                        (s) =>
                          s.startTime <= time &&
                          s.endTime > time &&
                          s.theater === theater.TheaterName
                      )
                    ) {
                      return <td key={time}></td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Popup สำหรับการอัปเดตและลบ */}
          <Modal
            title="Update Showtime"
            visible={popupVisible}
            onCancel={() => setPopupVisible(false)}
            footer={null}
            className="modal-content" // เพิ่ม className ที่นี่
          >
            <div className="modal-content">
              <Card
                style={{
                  padding: "0",
                  margin: "20",
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "20px",
                }}
              >
                {moviePoster ? (
                  <img
                    src={moviePoster}
                    alt="Movie Poster"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "50vh",
                      aspectRatio: "2 / 3",
                      objectFit: "cover",
                      margin: "20",
                      padding: "0",
                    }}
                  />
                ) : (
                  <p>No Poster Available</p>
                )}
              </Card>
              <div className="header-item">
                <label style={{ color: "black" }}>Date:</label>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  allowClear={false}
                />
              </div>
              <div className="header-item">
                <label style={{ color: "black" }}>Time:</label>
                <TimePicker
                  value={selectedTime}
                  format="HH:mm"
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  onChange={handleTimeChange}
                  allowClear={false}
                />
              </div>
              <div className="header-item">
                <label style={{ color: "black" }}>Movie:</label>
                <Select
                  value={selectedMovieID}
                  showSearch
                  className="movie-select"
                  allowClear
                  placeholder="Select a Movie"
                  style={{ width: 200 }}
                  optionFilterProp="children"
                  onChange={(value) => setSelectedMovieID(value as number)}
                  filterOption={(input, option) =>
                    option?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {movies.map((movie) => (
                    <Option key={movie.ID} value={movie.ID}>
                      {movie.MovieName}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className="header-item">
                <label style={{ color: "black" }}>Theater:</label>
                <Select
                  value={selectedTheaterID}
                  showSearch
                  className="theater-select"
                  allowClear
                  placeholder="Select a Theater"
                  style={{ width: 200 }}
                  optionFilterProp="children"
                  onChange={(value) => setSelectedTheaterID(value as number)}
                  filterOption={(input, option) =>
                    option?.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {theaters.map((theater) => (
                    <Option key={theater.ID} value={theater.ID}>
                      {theater.TheaterName}
                    </Option>
                  ))}
                </Select>
              </div>

              <button className="uupdate-btn" onClick={handleUpdateShowTime}>
                Update <EditOutlined />
              </button>
              <button className="ddelete-btn" onClick={handleDeleteShowTime}>
                Delete <DeleteOutlined />
              </button>
            </div>
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default ShowtimeManagement;
