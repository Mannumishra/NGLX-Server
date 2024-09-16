const User = require("../models/Usermodel")
const passwordValidator = require('password-validator');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const fs = require("fs")
const jwt = require("jsonwebtoken");
const { uploadImage } = require("../utils/cloudinary");
const { transporter } = require("../utils/mailTransporter");


// old image delete
const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    const publicId = fileName.split('.')[0];
    return `${parts[parts.length - 2]}/${publicId}`;
};


const schema = new passwordValidator();
schema
    .is().min(5)
    .is().max(10)
    .has().uppercase(1)
    .has().lowercase(1)
    .has().digits(1)
    .has().not().spaces()
    .has().symbols(1);

const createUser = async (req, res) => {
    try {
        console.log("I am hit ", req.body)
        console.log("I am hit ", req.file)
        const { name, email, phone, password } = req.body;
        const errorMessage = [];
        if (!name) errorMessage.push("Name is required");
        if (!email) errorMessage.push("Email is required");
        if (!phone) errorMessage.push("Phone is required");
        if (!password) errorMessage.push("Password is required");
        if (!req.file) errorMessage.push("Image is must required is required");
        if (errorMessage.length > 0) {
            return res.status(400).json({
                success: false,
                message: errorMessage.join(", "),
            });
        }
        if (!schema.validate(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 5-10 characters, include uppercase, lowercase, digit, symbol, no spaces.",
            });
        }
        const exitdata = await User.findOne({ $or: [{ email: email }, { phone: phone }] })
        if (exitdata) {
            return res.status(400).json({
                success: false,
                message: exitdata.email === email ? "Email is already registered ." : "Phone number is already registered ."
            });
        }
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        let imageUrl = "";
        if (req.file) {
            imageUrl = await uploadImage(req.file.path)
        }
        fs.unlinkSync(req.file.path)
        const data = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            image: imageUrl
        });
        await data.save();
        // Prepare user email template with a simple success message
        //         const userEmailTemplate = `
        //         <div style="font-family: Arial, sans-serif; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        //             <div style="background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center; max-width: 600px; width: 100%;">
        //                 <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="Zens Logo" style="width: 150px; margin-bottom: 20px;" />
        //                 <h2>Registration Successful, ${name}!</h2>
        //                 <p style="font-size: 16px;">We are happy to inform you that your registration with Zens has been completed successfully.</p>
        //                 <p style="font-size: 16px;">If you have any questions, feel free to contact us.</p>
        //                 <p style="font-size: 16px;">Thank you,</p>
        //                 <p style="font-size: 16px;">Zens Team</p>
        //             </div>
        //         </div>
        //      `;

        //         const adminEmailTemplate = `
        //      <div style="font-family: Arial, sans-serif; color: #333; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        //          <div style="background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); text-align: center; max-width: 600px; width: 100%;">
        //              <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="Zens Logo" style="width: 150px; margin-bottom: 20px;" />
        //              <h2>New User Registered</h2>
        //              <p style="font-size: 16px;">A new user has registered on Zens with the following details:</p>
        //              <ul style="font-size: 16px; line-height: 1.6; list-style: none; padding: 0;">
        //                  <li>Name: ${name}</li>
        //                  <li>Email: ${email}</li>
        //                  <li>Phone: ${phone}</li>
        //              </ul>
        //              <p style="font-size: 16px;">Please follow up if necessary.</p>
        //              <p style="font-size: 16px;">Zens Admin</p>
        //          </div>
        //      </div>
        //   `;
        //         // Send email to user
        //         await transporter.sendMail({
        //             from: process.env.MAIL_SEND,
        //             to: email,
        //             subject: "Registration Successful!",
        //             html: userEmailTemplate,
        //         });

        //         // Send email to admin
        //         await transporter.sendMail({
        //             from: process.env.MAIL_SEND,
        //             to: process.env.MAIL_SEND,
        //             subject: "New User Registration",
        //             html: adminEmailTemplate,
        //         });
        return res.status(200).json({
            success: true,
            message: "Registration successful",
            data,
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getAllUser = async (req, res) => {
    try {
        const data = await User.find()
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Found Successfully",
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const getGetSingleUser = async (req, res) => {
    try {
        const { id } = req.params
        const data = await User.findById(id)
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        res.status(200).json({
            success: true,
            message: "User Found Successfully",
            data: data
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, phone, address, city, state, pin } = req.body
        const errorMessage = []
        if (!name) errorMessage.push("Name is must Required")
        if (!email) errorMessage.push("Email is must Required")
        if (!phone) errorMessage.push("phone is must Required")
        if (errorMessage > 0) {
            return res.status(400).json({
                success: false,
                message: errorMessage.push(",")
            })
        }
        const data = await User.findById(id)
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Record Not Found"
            })
        }
        let imageUrl = data.image;
        if (req.file) {
            const oldimage = getPublicIdFromUrl(imageUrl)
            await deleteImage(oldimage);
            imageUrl = await uploadImage(req.file.path);
            fs.unlinkSync(req.file.path)
        }
        const updateUser = await User.findByIdAndUpdate(id, { name, email, phone, address, city, state, pin, image: imageUrl }, { new: true })
        return res.status(200).json({
            success: true,
            message: "User Profile Update Successfully",
            data: updateUser
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }
        const data = await User.findOne({ email });
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }
        const checkPassword = await bcrypt.compare(password, data.password);
        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid Password"
            });
        }
        const key = data.role === "user" ? process.env.SALT_KEY_USER : process.env.SALT_KEY_ADMIN;

        // Define the payload with limited data
        const payload = { id: data._id, role: data.role, email: data.email };

        // Generate JWT
        jwt.sign(payload, key, { expiresIn: process.env.JWT_EXPIRE }, (err, token) => {
            console.log(payload ,key )
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: "Error generating token"
                });
            }
            return res.status(200).json({
                success: true,
                message: "Login Successfully",
                data: data,
                token: token
            });
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const forgetPassword1 = async (req, res) => {
    try {
        const { email } = req.body
        const data = await User.findOne({ email: email })
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "Email is not found"
            })
        }
        else {
            let otp = Math.floor(100000 + Math.random() * 900000);
            data.otp = otp
            await data.save()
            const mailOptions = {
                from: process.env.MAIL_SENDER,
                to: data.email,
                subject: "Password Reset OTP - Zens",
                html: `
                    <html>
                    <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; box-sizing: border-box;">
                            <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="Zens Logo" style="display: block; margin: 0 auto; width: 200px;"/>
                            <h2 style="color: #0056b3; font-size: 24px; margin: 0 0 10px;">Hello ${data.name},</h2>
                            <p style="font-size: 16px; margin: 0 0 10px;">We received a request to reset your password. To complete the process, please use the OTP below:</p>
                            <h3 style="font-size: 24px; color: #e74c3c; margin: 0 0 10px;">${data.otp}</h3>
                            <p style="font-size: 14px; color: #555; margin: 0 0 20px;">For security reasons, please do not share this OTP with anyone. If you did not request a password reset, you can safely ignore this email.</p>
                            <p style="margin: 0 0 10px;">Thank you,<br>
                            <strong>Zens</strong></p>
                            <p style="font-size: 12px; color: #aaa; margin: 0;">If you have any questions or need further assistance, please contact our support team.</p>
                        </div>
                    </body>
                    </html>
                `
            };
            await transporter.sendMail(mailOptions, (err) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: "Email Address Is Not Found"
                    })
                }
                else {
                    res.status(200).json({
                        success: true,
                        message: "Otp Send successfully"
                    })
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const forgetPassword2 = async (req, res) => {
    try {
        const { email, otp } = req.body
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Otp is required"
            })
        }
        const data = await User.findOne({ email: email })
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        else {
            if (otp == data.otp) {
                return res.status(200).json({
                    success: true,
                    message: "Otp Verify Successfully"
                })
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP"
                });
            }
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const forgetPassword3 = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "password is required"
            })
        }
        const data = await User.findOne({ email: email })
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            })
        }
        else {
            if (!schema.validate(password)) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be 5-10 characters, include uppercase, lowercase, digit, symbol, no spaces.",
                })
            }
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            data.password = hashedPassword
            await data.save()

            // Send confirmation email
            const mailOptions = {
                from: 'your-email@gmail.com',
                to: email,
                subject: 'Password Reset Successfully',
                html: `
                <html>
                <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0;">
                    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; box-sizing: border-box;">
                        <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="Zens Logo" style="display: block; margin: 0 auto; width: 200px;"/>
                        <h2 style="color: #0056b3; font-size: 24px; margin: 0 0 10px;">Hello ${data.name},</h2>
                        <p style="font-size: 16px; margin: 0 0 10px;">Your password has been reset successfully. If you did not request this change, please contact our support team immediately.</p>
                        <p style="font-size: 14px; color: #555; margin: 0 0 20px;">Thank you,<br><strong>Zens</strong></p>
                        <p style="font-size: 12px; color: #aaa; margin: 0;">If you have any questions or need further assistance, please contact our support team.</p>
                    </div>
                </body>
                </html>
            `
            };

            await transporter.sendMail(mailOptions);

            res.status(200).json({
                success: true,
                message: "Password Reset Successfully"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


const changePassword = async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const data = await User.findOne({ email: email });
        if (!data) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }
        const comparePassword = await bcrypt.compare(currentPassword, data.password);
        if (!comparePassword) {
            return res.status(404).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        if (!schema.validate(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be 5-10 characters, include uppercase, lowercase, digit, symbol, no spaces.",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        data.password = hashedPassword;
        await data.save();

        // Send confirmation email
        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Password Changed Successfully',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Changed Successfully</title>
                </head>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;">
                    <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <div style="text-align: center;">
                            <img src="https://urjjafrontend-git-main-mannu-s-projects.vercel.app/static/media/ZENS%20logo%20TM%20CDR%20(1).20ad0761e23f3c801c7f.png" alt="ZENS Logo" style="max-width: 150px; height: auto;">
                        </div>
                        <div style="text-align: center; padding: 20px;">
                            <h1 style="color: #007bff;">Password Changed Successfully</h1>
                            <p style="color: #333; font-size: 16px;">Dear User ${data.name},</p>
                            <p style="color: #333; font-size: 16px;">Your password has been changed successfully. If you did not request this change, please contact our support immediately.</p>
                            <p style="color: #333; font-size: 16px;">Thank you for using our service!</p>
                        </div>
                        <div style="text-align: center; padding: 20px; font-size: 14px; color: #888;">
                            &copy; 2024 ZENS. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Password changed successfully and confirmation email sent."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

module.exports = {
    createUser, getAllUser, getGetSingleUser, login, forgetPassword1, forgetPassword2, forgetPassword3, updateUser, changePassword
};
