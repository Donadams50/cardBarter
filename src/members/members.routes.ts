import express from 'express';

import { verifyToken, isAdmin , isExchanger, isAdminOrSubadmin} from '../helpers/jwtTokenUtils';

import * as validator from '../validators/validator';

import * as member from './members.controller';

const router = express.Router();
const {
        expressValidator,
        postAdminValidator,
        postExchangerValidator,
        loginValidator,
        verifyUserValidator,
        userStatusValidator,
        changePasswordValidator,
        forgotPasswordValidator,
        resetPasswordValidator,
        postAccountDetailsValidator,
        updateAccountDetailsValidator,
        verifyForgotPasswordValidator,
        resendVerificationLinkValidator,
        createPinValidator,
        updatePinValidator,
        forgotPinValidator,
        resetPinValidator
} = validator;

router.post('/admin/new', verifyToken, isAdmin, postAdminValidator(), expressValidator, member.addAdmin);

router.post('/exchanger/new', postExchangerValidator(), expressValidator, member.addExchanger);

router.post('/exchanger/login', loginValidator(), expressValidator, member.loginExchanger);

router.post('/admin/login', loginValidator(), expressValidator, member.loginAdmin);

router.post('/verify/user', verifyUserValidator(), expressValidator, member.verifyUser);

router.post('/enable/user', verifyToken, isAdmin, userStatusValidator(), expressValidator, member.enableUser);

router.post('/disable/user', verifyToken, isAdmin, userStatusValidator(), expressValidator, member.disableUser);

router.post('/change/password', verifyToken,  changePasswordValidator(), expressValidator, member.changePassword);

router.post('/forgot/password', forgotPasswordValidator(), expressValidator, member.forgotPassword);

router.post("/link/verify/forgotpasswordcode" ,  verifyForgotPasswordValidator(), expressValidator,    member.verifyForgotpasswordlink)

router.post("/resendverificationlink", resendVerificationLinkValidator(), expressValidator,    member.resendVerificationLink)

router.post('/reset/password',  resetPasswordValidator(), expressValidator, member.resetPassword);

router.post('/accountdetails/new', verifyToken, isExchanger,  postAccountDetailsValidator(), expressValidator, member.createAccountDetails);

router.put('/accountdetails/:id', verifyToken, isExchanger,  updateAccountDetailsValidator(), expressValidator, member.updateAccountDetails);

router.delete("/accountdetails/:id",  verifyToken, isExchanger,   member.deleteAccountDetails)

router.post("/createpin", verifyToken, isExchanger, createPinValidator(), expressValidator,  member.createPin)

router.put("/changepin", verifyToken, isExchanger,   updatePinValidator(), expressValidator, member.updatePin)

router.post("/forgotpin", verifyToken, isExchanger, forgotPinValidator(), expressValidator ,  member.forgotPin)

router.post("/resetpin",  resetPinValidator(),  expressValidator, member.resetPin)

router.get("/walletbalance",  verifyToken, isExchanger,  member.findWalletBalance)

router.post("/link/verify/pincode" , verifyForgotPasswordValidator(),  expressValidator,  member.verifyForgotpasswordlink)

router.get('/members', verifyToken, isAdminOrSubadmin,  member.findAllMembers);

router.get('/members/:id', verifyToken,  member.findMembeById);

router.get("/banks/code",  verifyToken,  isExchanger, member.getBanksCode)

router.get("/dashboard/user",  verifyToken,  isExchanger, member.userDashboard)





export { router as memberRouter };
