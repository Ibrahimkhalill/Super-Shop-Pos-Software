import React from "react";
import { useState } from "react";
import supershopimg from "../../image/supershop.webp";
import supershoplogo from "../../image/logo.png";
import "./loginpage.css";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
const SuperShopLogin = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const [isLoading, setIsLoading] = useState(false);
  const [passShow, setPassShow] = useState(false);

  // const [selectedOption, setSelectedOption] = useState("admin");

  const axiosInstance = axios.create({baseURL: process.env.REACT_APP_BASE_URL,})
  // Handle Click From Submition
  const handleFromSignIn = async (event) => {
    event.preventDefault();

    // Input validation
    if (!userName) {
      toast.error("Username is required", {
        position: "bottom-center",
      });
      return;
    }

    if (!password) {
      toast.error("Password is required", {
        position: "bottom-center",
      });
      return;
    } else if (password.length < 6) {
      toast.error("Password must be at least 6 characters long", {
        position: "bottom-center",
      });
      return;
    }

    // Input validation End
    setIsLoading(true);
    try {
      await axiosInstance.post("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          username: userName,
          password: password,
          // roles: [selectedOption],
        }),
      })
        .then((res) => res.json())
        .then((resJson) => {
          const data = JSON.parse(JSON.stringify(resJson));
          console.log("text.accessToken" + data.accessToken);
          // localStorage.setItem("x-access-token", data.accessToken)
          localStorage.setItem("username", userName)
          sleep(1000).then(() => {
            setIsLoading(false);
          });
          toast("Data sent successfully!");
          // history.push('/salepage',{ data });
          navigate("/home", {
            state: {
              id: data.id,
              username: data.username,
              email: data.email,
              roles: data.roles,
              accessToken: data.accessToken,
            },
          });
        });
    } catch (error) {
      console.error("Error saving data:" + error);
      toast("Error sending data: " + error);
    }
  };

  return (
    <div className="full_div_login_page">
      <img className="img-full-view" src={supershopimg} alt="" />
      <div className="bg-tranparant-background"></div>
      <div className="container_super_shop_login">
        
        <div className="container_super_shop_all">
          {/* <img className="super-shop-img" src={supershopimg} alt="" /> */}
          <span className="heading">Sign-In</span>
          <div className="logo-login-container">
            <img className="super-shop-logo" src={supershoplogo} alt="" />
            <div className="bg-tranparant-login"></div>
          </div>
          <form className="from_super_shop_login" action="">
            <div className="input_field_super_shop_login">
              <input
                type="text"
                placeholder="Username"
                onChange={(event) => setUserName(event.target.value)}
                required
              />
            </div>
            <div className="input_field_super_shop_login">
              <input
                type={!passShow ? "password" : "text"}
                placeholder="Password"
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              {passShow ? (
                <FaEye
                  className="icon-login"
                  onClick={() => setPassShow(!passShow)}
                />
              ) : (
                <FaEyeSlash
                  className="icon-login"
                  onClick={() => setPassShow(!passShow)}
                />
              )}
            </div>
            <button
              className="login-button"
              type="submit"
              onClick={handleFromSignIn}
            >
              Sign In
            </button>
          </form>
        {isLoading && (
          <div className="loader-container">
            <RotatingLines color="#333" height={50} width={50} />
          </div>
        )}
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
};

export default SuperShopLogin;
