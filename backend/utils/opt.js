export const generateOpt = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

export const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export const optValid = (user , otp) => {

    return user.otp === otp && user.otpExpiry > new Date();

}

