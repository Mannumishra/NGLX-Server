const ErrorHander = require("../utils/Errorhandler");
const User = require("../models/Usermodel");
const sendToken = require("../utils/sendToken");
const sendEmail = require("../utils/SendMail");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Check if OTP is expired
function isOtpExpired(otpGeneratedAt) {
  const now = new Date();
  const expiryTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return now - otpGeneratedAt > expiryTime;
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please Enter Name, Email, and Password"
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: "Email already exists"
      });
    }



    const otp = generateOtp()

    const mailOption = {
      email: email,
      subject: "Registeration Email Verification",
      message: `Your OTP${otp}`
    }

    // Attempt to create the user
    user = await User.create({
      name,
      email,
      otpForVerification: otp,
      password,
    });

    await sendEmail(mailOption)

    // Check if the user was successfully created
    if (!user) {
      return res.status(500).json({
        success: false,
        error: "Failed to create user"
      });
    }

    // If the user was successfully created, send token
    sendToken(user, 201, res);
  } catch (error) {
    //console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
};

exports.verifyOtpForSignIn = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate email format
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }
    console.log(req.body)
    // Validate OTP format (numeric string of length 6)
    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid OTP',
      });
    }

    const existingUserByMail = await User.findOne({ email: email });
    console.log("User", existingUserByMail)
    if (!existingUserByMail) {
      return res.status(404).json({
        success: false,
        message: 'User not registered',
      });
    }

    // Check if user is already verified
    if (existingUserByMail.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already verified',
      });
    }
    const NumberOtp = Number(otp)
    console.log(NumberOtp)
    // Check if OTP matches and is within the expiration time
    if (existingUserByMail.otpForVerification === NumberOtp) {
      const otpGeneratedAt = existingUserByMail.OtpGeneratedAt; // assuming you store the OTP generation time in the user document
      if (!isOtpExpired(otpGeneratedAt)) {
        // Verify user
        existingUserByMail.isActive = true;
        await existingUserByMail.save();
        const emailOptions = {
          email: email,
          subject: 'Welcome to NGL-X - Verification Successful',
          message: `
            <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f6f6f6;
                  }
                  .container {
                    width: 100%;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    margin: 20px auto;
                    max-width: 600px;
                  }
                  .header {
                    background-color: #0044cc;
                    padding: 10px;
                    border-radius: 10px 10px 0 0;
                    text-align: center;
                    color: #ffffff;
                  }
                  .content {
                    padding: 20px;
                    text-align: center;
                  }
                  .content h1 {
                    color: #333333;
                  }
                  .content p {
                    font-size: 16px;
                    color: #666666;
                  }
                  .button {
                    display: inline-block;
                    margin: 20px 0;
                    padding: 10px 20px;
                    font-size: 16px;
                    color: #ffffff;
                    background-color: #0044cc;
                    border-radius: 5px;
                    text-decoration: none;
                  }
                  .footer {
                    text-align: center;
                    padding: 20px;
                    font-size: 12px;
                    color: #999999;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Welcome to NGL-X</h2>
                  </div>
                  <div class="content">
                    <h1>Congratulations, ${existingUserByMail.name}!</h1>
                    <p>Your email has been successfully verified. We are excited to have you on board.</p>
                    <a target="_blank" href="" class="button">Visit Our Website</a>
                    <p>Thank you for joining us at NGL-X. If you have any questions, feel free to contact our support team.</p>
                  </div>
                  <div class="footer">
                    &copy; ${new Date().getFullYear()} Camro Company. All rights reserved.
                  </div>
                </div>
              </body>
            </html>
          `}
          try {
            await sendEmail(emailOptions);
          } catch(error) {
            console.error('Error sending verification email:', error);
            return res.status(500).json({
              success: false,
              message: 'Error sending verification email',
            });
          }

        return res.status(200).json({
            success: true,
            message: 'User verified successfully',
          });
        } else {
          return res.status(401).json({
            success: false,
            message: 'OTP has expired',
          });
      }
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

  } catch (error) {
    console.error('Error during user verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

exports.ResendSignOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(403).json({
        success: false,
        msg: "Please provide an email"
      });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User Not Available With this Email"
      });
    }

    const otp = generateOtp();
    user.otpForVerification = otp;


    await user.save();

    const options = {
      email: email,
      subject: "Sign In OTP Request - Resend OTP",
      message: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f6f6f6;
                }
                .container {
                  width: 100%;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  margin: 20px auto;
                  max-width: 600px;
                }
                .header {
                  background-color: #0044cc;
                  padding: 10px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                  color: #ffffff;
                }
                .content {
                  padding: 20px;
                  text-align: center;
                }
                .content h1 {
                  color: #333333;
                }
                .content p {
                  font-size: 16px;
                  color: #ffffff;
                  background-color: #ff0000;
                  padding: 10px;
                  border-radius: 5px;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  font-size: 12px;
                  color: #999999;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Sign In OTP Request - Resend OTP</h2>
                </div>
                <div class="content">
                  <p>Your new OTP for Sign-In : <strong>${otp}</strong></p>
                  <p>Please use this OTP to sign in to your account.</p>
                  <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
                <div class="footer">
                  &copy; ${new Date().getFullYear()} Camro Company. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `
    };

    await sendEmail(options);

    return res.status(200).json({
      success: true,
      msg: "OTP resent to your email"
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      msg: "Internal Server Error"
    });
  }
};

//Login
exports.LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        msg: "Please Filled All Required Filled"
      })
    }
    //after this check user
    const existUser = await User.findOne({ email })
    if (!existUser) {
      return res.status(401).json({
        success: false,
        msg: "user is not find"
      })
    }
    //if user found
    const checkPassword = await existUser.comparePassword(password)
    if (!checkPassword) {
      return res.status(401).json({
        success: false,
        msg: "Password is Invalid"
      })
    }

    sendToken(existUser, 201, res)

  } catch (error) {
    //console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error"
    });
  }
}

//Logout
exports.Logout = async (req, res) => {
  try {
    // Clear the JWT token cookie
    res.clearCookie('token');

    // Send a success response
    return res.status(200).json({
      success: true,
      msg: "Logout successful"
    });
  } catch (error) {
    // Handle errors
    console.error(error);
    return res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
};


//get-All-users
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}, { password: 0 });
    if (!allUsers.length > 0) {
      return res.status(403).json({
        success: false,
        msg: "Not available"
      });
    }
    res.status(200).json({
      success: true,
      users: allUsers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
}

//Password Change

//get token from cookies
exports.getTokenFromCookies = async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({
        success: true,
        msg: "Please Login To Access this"
      });
    }
    res.status(200).json({
      success: true,
      data: token
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Internal server error"
    });
  }
}


exports.PasswordChangeRequest = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(403).json({
        success: false,
        msg: "Please Fill All Required Fields"
      });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: "User Not Available With this Email"
      });
    }

    const otp = generateOtp();
    user.ForgetPasswordOTP = otp;
    user.OtpGeneratedAt = new Date();

    await user.save();

    const options = {
      email: email,
      subject: "Password Reset Request",
      message: `
          <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f6f6f6;
                }
                .container {
                  width: 100%;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  margin: 20px auto;
                  max-width: 600px;
                }
                .header {
                  background-color: #0044cc;
                  padding: 10px;
                  border-radius: 10px 10px 0 0;
                  text-align: center;
                  color: #ffffff;
                }
                .content {
                  padding: 20px;
                  text-align: center;
                }
                .content p {
                  font-size: 16px;
                  color: #ffffff;
                  background-color: #ff0000;
                  padding: 10px;
                  border-radius: 5px;
                }
                .footer {
                  text-align: center;
                  padding: 20px;
                  font-size: 12px;
                  color: #999999;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                  <p>Your OTP for password reset is: <strong>${otp}</strong></p>
                  <p>Please use this OTP to reset your password.</p>
                  <p>If you didn't request this password reset, please ignore this email.</p>
                </div>
                <div class="footer">
                  &copy; ${new Date().getFullYear()} Camro Company. All rights reserved.
                </div>
              </div>
            </body>
          </html>
        `
    };


    await sendEmail(options);

    return res.status(200).json({
      success: true,
      msg: "OTP sent to your email"
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      success: false,
      msg: "Internal Server Error"
    });
  }
};

//Verify OTP and Change Password
exports.VerifyOtp = async (req, res) => {
  try {
    const { otp } = req.body; // Ensure newPassword is retrieved from req.body
    const { email , newPassword } = req.params; // email is retrieved from req.params

    if (!email || !otp || !newPassword) {
      return res.status(403).json({
        success: false,
        msg: "Please Fill All Required Fields"
      });
    }
    console.log(req.body)
    const user = await User.findOne({ email: email });
    // console.log(user)
    // if (!user || user.ForgetPasswordOTP !== otp) {
    //   return res.status(401).json({
    //     success: false,
    //     msg: "Invalid OTP or Email"
    //   });
    // }

    if (isOtpExpired(user.OtpGeneratedAt)) {
      return res.status(401).json({
        success: false,
        msg: "OTP has expired"
      });
    }


    user.password = newPassword
    user.ForgetPasswordOTP = null;
    user.OtpGeneratedAt = null;

    await user.save();

    return res.status(200).json({
      success: true,
      msg: "Password updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(501).json({
      success: false,
      msg: "Internal Server Error"
    });
  }
};