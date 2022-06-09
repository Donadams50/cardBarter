import bcrypt from 'bcryptjs';

export const hashPassword = async (userPassword: string) => {
        const convertedUserPassword = userPassword.toString();
        const harshPassword = await bcrypt.hash(convertedUserPassword, 10);
        return harshPassword;
};

export const comparePassword = async (password: any, hashedPassword: string) => {
        const convertedPassword = password.toString();
        return bcrypt.compare(convertedPassword, hashedPassword);
};
