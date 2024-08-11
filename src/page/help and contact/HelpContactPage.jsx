// HelpContactPage.js
import React from "react";
import "./helpcontactpage.css";
import { useEffect, useState } from "react";
import merinaSoftLogo from "../../image/logo.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "antd";
import { IoSearchSharp } from "react-icons/io5";
import axios from "axios";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const HelpContactPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lat = 23.7318169;
  const lng = 90.4203821;

  const handleOpnMapClick = () => {
    window.open("https://maps.google.com?q=" + lat + "," + lng);
  };
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_HELP_CENTER_URL,
  });
  const [serviceData, setServiceData] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [relatedService, setRelatedService] = useState("");
  const [message, setMessage] = useState("");
  const [related_service_id, setRelatedServiceId] = useState(null);
  const [FaqData, setFaqData] = useState([]);

  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        const response = await axiosInstance.get("/api/services/getAll");
        setServiceData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchFAQData = async () => {
      try {
        const response = await axiosInstance.get("/api/faq/getAll");
        const filter = response.data.filter(
          (data) => data.SoftwareName?.name === "Irani Mini Bazar"
        );
        setFaqData(filter);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchServiceData();
    fetchFAQData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // filter service id
  useEffect(() => {
    const filterData =
      serviceData &&
      serviceData.find((data) => data.service_name === relatedService);
    setRelatedServiceId(filterData?.id_service);
  }, [relatedService, serviceData]);

  // date
  const today = new Date();
  const date = today.toISOString();
  console.log(related_service_id);
  // save message
  const handleSubmit = async () => {
    try {
      const response = await axiosInstance.post(
        "/api/ticket/postTicketFromAnyPage",
        {
          name: name,
          email: email,
          subject: subject,
          related_service_id: related_service_id,
          message: message,
          software_name_id: 1,
          status_id: 1,
          date: date,
          last_update: date,
        }
      );

      if (response.status === 200) {
        alert("Data Add successfully!");
        setName("");
        setEmail("");
        setMessage("");
        setSubject("");
        setRelatedService("");
        setRelatedServiceId(null);
      } else {
        alert("Failed to save Supplier");
      }
    } catch (error) {
      console.error("Error saving brand name:", error);
    }
  };

  return (
    <div className="help-contact-page">
      <div className="cusotmer_help_qunation">
        <div className="help-center">
          <h1>Help Center</h1>
          <p>
            Welcome to our Help Center. Here you can find answers to frequently
            asked questions.
          </p>
          {/* Add FAQ content here */}
          <div className="faq">
            <div className="ticket-submit-section">
              <div className="submit_input">
                <input
                  type="text"
                  placeholder="Write your name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
                <input
                  type="email"
                  placeholder="Write your email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                />
              </div>
              <div className="submit_input">
                <input
                  type="text"
                  placeholder="Subject"
                  onChange={(e) => setSubject(e.target.value)}
                  value={subject}
                />
                <select
                  type="text"
                  placeholder="Related Service"
                  onChange={(e) => setRelatedService(e.target.value)}
                  value={relatedService}
                >
                  <option>Select Related Service</option>
                  {serviceData &&
                    serviceData.map((data) => (
                      <option>{data.service_name}</option>
                    ))}
                </select>
              </div>
              <div>
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your messages"
                  value={message}
                ></textarea>
              </div>
              <div>
                <button onClick={handleSubmit}>Submit</button>
              </div>
            </div>
          </div>
        </div>
        <div className="asked_quation">
          <div className="frequently_asked">Frequently Asked Questions:</div>
        </div>
        <div className="multiple_qustion_box">
          {FaqData &&
            FaqData.map((data) => (
              <div className="box box1">{data.question}</div>
            ))}
        </div>
      </div>
      <div className="contact-page">
        <span className="contact_info">Contact</span>
        <div className="contact-root-container">
          {/* <h1> Our Contact </h1> */}
          <div className="address-container">
            <div className="map-outside">
              <MapContainer
                center={[lat, lng]}
                zoom={17}
                className="map-container"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                  <Popup>MerinaSoft BD</Popup>
                </Marker>
              </MapContainer>
              <br />
              <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={handleOpnMapClick}
              >
                Click here to open in Google Map
              </Button>
            </div>
            <div className="address-outside">
              <div className="location-container">
                <br />
                <img className="address-logo" src={merinaSoftLogo} alt="" />
                <p className="address-header">
                  <b> MerinaSoft BD </b>
                </p>
                <p className="address-content">
                  2nd Floor, A&A Tower, 173 Arambagh, Dhaka 1000{" "}
                </p>
                <p className="address-content">
                  Website: <b> www.merinasoft.com </b>
                </p>
                <p className="address-content">
                  Email: <b> merinasoftteam@gmail.com </b>
                </p>
                <p className="address-content">
                  Phone: <b> +88017405700100, +8801704473813 </b>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpContactPage;
