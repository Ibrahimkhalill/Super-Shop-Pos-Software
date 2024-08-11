import "./my-support-ticket.css";
import React, { useState, useEffect } from "react";
import { Modal } from "antd";
import { IoSend } from "react-icons/io5";
import Merinasoft from "../../image/merinasoft.png";
import axios from "axios";
import { RotatingLines } from "react-loader-spinner";
function MySupportTicket() {
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_HELP_CENTER_URL,
  });

  const [visible, setVisible] = useState(false);
  const [ticketSupportData, setTicketSupportData] = useState([]);
  const [questionData, setQuestionData] = useState([]);
  const [ticketNo, setTicketNo] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [dateTime, setDateTime] = useState("");
  const [updateDateTime, setUpdateDateTime] = useState("");
  const [message, setMessage] = useState("");
  const [replyDateTime, setReplyDateTime] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoding] = useState(false);
  const OpenModal = (data) => {
    setVisible(true);
    setTicketNo(data.Ticket?.ticket_no);
    setDateTime(data.last_update);
    setTicketId(data.Ticket?.id_ticket);

    setStatus(data.Status?.status_name);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const fetchTicketSupportData = async () => {
    try {
      const response = await axiosInstance.get("/api/ticketsupport/getAll");
      const filter = response.data.filter(
        (data) => data.Ticket?.SoftwareName?.name === "Irani Mini Bazar"
      );
      setTicketSupportData(filter);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchQuestionData = async () => {
    try {
      const response = await axiosInstance.get("/api/message/getAll");
      setQuestionData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchData = () => {
    fetchTicketSupportData();

    fetchQuestionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);
  /// date
  const today = new Date();
  const date = today.toISOString();

  useEffect(() => {
    const date = convertLocaltime(dateTime);
    setUpdateDateTime(date);
  }, [dateTime]);

  const convertLocaltime = (utcDateString) => {
    const date = new Date(utcDateString);
    const localDateString = date.toLocaleString();
    return localDateString;
  };

  const convertLocalDate = (utcDateString) => {
    const date = new Date(utcDateString);
    const localDateString = date.toLocaleDateString(); // Extract the date part
    return localDateString;
  };
  const convertLocalTime = (utcDateString) => {
    const date = new Date(utcDateString);
    const localtime = date.toLocaleTimeString();

    return localtime;
  };

  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/message/postMessageFromAnyPage",
        {
          message: message,
          ticket_id: ticketId,
          status_id: 1,
          date: date,
        }
      );

      if (response.status === 200) {
        setMessage("");
        setStatus("Pending");
        fetchQuestionData();
        fetchTicketSupportData();
      } else {
        alert("Failed to send message");
      }
    } catch (error) {
      console.error("Error send message:", error);
    }
  };

  useEffect(() => {
    if (ticketNo) {
      const filter = ticketSupportData.find(
        (data) => data.Ticket.ticket_no === ticketNo
      );
      setStatus(filter?.Status?.status_name);
    }
  }, [ticketNo, ticketSupportData]);


  return (
    <div className="conatiner-support-ticket">
      <div
        className={`${
          isLoading ? "loader_spriner" : ""
        } my-support-ticket-table`}
      >
        {isLoading ? (
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="64"
            visible={true}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Serial</th>
                <th>Ticket No</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Relatd Service</th>
                <th>Message</th>

                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {ticketSupportData &&
                ticketSupportData.map((data, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{data.Ticket.ticket_no}</td>
                    <td>{data.Ticket.name}</td>
                    <td>{data.Ticket.email}</td>
                    <td>{data.Ticket.subject}</td>
                    <td>{data.Ticket.Service?.service_name}</td>
                    <td
                      onClick={() => OpenModal(data)}
                      className={`${
                        data.Status?.status_name === "Pending"
                          ? "pending"
                          : "open"
                      }`}
                    >
                      {data.Status?.status_name}
                    </td>
                    <td>{convertLocaltime(data.last_update)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="popup-window_view_ticket">
        <Modal
          title="View Ticket"
          open={visible}
          onCancel={handleCancel}
          width="auto"
          //   width={600}
          footer={null}
          style={{
            top: 46,
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: "100%", // Allow the modal to expand horizontally
            width: "auto",
          }}
          className="custom-modal"
        >
          <div className="container_view_ticket">
            <div className="first_row_div_view_ticket">
              {questionData &&
                questionData
                  .filter((data) => data.Ticket?.ticket_no === ticketNo)
                  .map((item) => (
                    <>
                      <div className="date_time_message">
                        <span> {convertLocalDate(item.date)}</span> AT
                        <span>{convertLocalTime(item.date)}</span>
                      </div>
                      <div className="question_title">{item.message}</div>
                      {item.Reply ? (
                        <div className="merinasoft_reply_section">
                          <div className="logo_view_ticket">
                            <img src={Merinasoft} alt="" width={25} />
                          </div>
                          <div className="date_time_message">
                            <span> {convertLocalDate(item.Reply?.date)}</span>{" "}
                            AT
                            <span>{convertLocalTime(item.Reply?.date)}</span>
                          </div>

                          <div className="answer-section">
                            {item.Reply?.reply}
                          </div>
                        </div>
                      ) : (
                        ""
                      )}
                    </>
                  ))}
            </div>
            {status !== "Pending" ? (
              <div className="view_ticket_reply_input">
                <textarea
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={handleSubmit}>
                  <IoSend />
                </button>
              </div>
            ) : (
              ""
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default MySupportTicket;
