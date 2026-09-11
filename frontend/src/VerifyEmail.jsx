import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { API_URL } from "./services/api";

import "./App.css";


function VerifyEmail() {

  const { token } = useParams();

  const navigate = useNavigate();

  const [status, setStatus] =
    useState("loading");

  const [message, setMessage] =
    useState(
      "Verifying your email..."
    );


  useEffect(() => {

    const verifyEmail = async () => {

      console.log(
        "TOKEN FROM URL:",
        token
      );


      if (!token) {

        setStatus("error");

        setMessage(
          "Verification token is missing."
        );

        return;
      }


      try {

        const url =
          `${API_URL}/api/auth/verify-email/${encodeURIComponent(
            token
          )}`;


        console.log(
          "VERIFY URL:",
          url
        );


        const response =
          await fetch(url, {
            method: "GET",
            headers: {
              Accept:
                "application/json",
            },
          });


        const data =
          await response.json();


        console.log(
          "VERIFY RESPONSE:",
          data
        );


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Verification failed."
          );

        }


        setStatus("success");

        setMessage(
          data.message ||
            "Your email has been verified successfully."
        );

      } catch (error) {

        console.error(
          "VERIFY EMAIL ERROR:",
          error
        );

        setStatus("error");

        setMessage(
          error.message ||
            "Unable to verify your email."
        );

      }

    };


    verifyEmail();

  }, [token]);


  return (

    <div className="login-page">

      <section className="right-side">

        <div
          className="login-card"
          style={{
            maxWidth: "480px",
            margin: "auto",
            textAlign: "center",
          }}
        >

          {/* LOADING */}

          {status === "loading" && (

            <>

              <div
                style={{
                  width: 64,
                  height: 64,
                  margin:
                    "0 auto 20px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "50%",
                  background:
                    "#fff3f3",
                  color:
                    "#ef2027",
                  fontSize: 28,
                }}
              >

                <i className="fa-solid fa-spinner fa-spin"></i>

              </div>


              <h2>
                Verifying your email
              </h2>


              <p>
                Please wait while we
                verify your email address.
              </p>

            </>

          )}


          {/* SUCCESS */}

          {status === "success" && (

            <>

              <div
                style={{
                  width: 64,
                  height: 64,
                  margin:
                    "0 auto 20px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "50%",
                  background:
                    "#ecfdf3",
                  color:
                    "#12b76a",
                  fontSize: 28,
                }}
              >

                <i className="fa-solid fa-check"></i>

              </div>


              <h2>
                Email verified!
              </h2>


              <p>
                {message}
              </p>


              <button
                className="login-btn"
                style={{
                  marginTop: 20,
                }}
                onClick={() =>
                  navigate(
                    "/login"
                  )
                }
              >
                Continue to Login
              </button>

            </>

          )}


          {/* ERROR */}

          {status === "error" && (

            <>

              <div
                style={{
                  width: 64,
                  height: 64,
                  margin:
                    "0 auto 20px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius:
                    "50%",
                  background:
                    "#fef3f2",
                  color:
                    "#f04438",
                  fontSize: 28,
                }}
              >

                <i className="fa-solid fa-xmark"></i>

              </div>


              <h2>
                Verification failed
              </h2>


              <p>
                {message}
              </p>


              <Link
                to="/login"
                className="login-btn"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  marginTop: 20,
                  textDecoration:
                    "none",
                }}
              >
                Back to Login
              </Link>

            </>

          )}

        </div>

      </section>

    </div>

  );
}


export default VerifyEmail;