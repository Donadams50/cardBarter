import { NextFunction, Request, Response } from 'express';
import { body, validationResult, ValidationError, ValidationChain, Result } from 'express-validator';

export const expressValidator = (req: Request, res: Response, next: NextFunction): any => {
        const errors: Result<ValidationError> = validationResult(req);
        const messages: ValidationError[] = [];
        if (!errors.isEmpty()) {
                for (const i of errors.array()) {
                        messages.push(i);
                }
                return res.status(400).send({ message: 'Bad Request', data: errors, status: 400 });
        }
        next();
};

// post new admin validator
export const postAdminValidator = (): ValidationChain[] => [
        body('firstName').notEmpty().withMessage('First Name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('role').notEmpty().withMessage('Role Name is required'),
        body('lastName').notEmpty().withMessage('expiry is required'),
        body('email').notEmpty().withMessage('First Name is required'),
        body('phoneNumber').notEmpty().withMessage('Phone number is required'),
        body('password').notEmpty().withMessage('Password is required'),
];

// post exchanger validator
export const postExchangerValidator = (): ValidationChain[] => [
        body('firstName').notEmpty().withMessage('First Name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('role').notEmpty().withMessage('Role Name is required'),
        body('lastName').notEmpty().withMessage('expiry is required'),
        body('email').notEmpty().withMessage('First Name is required'),
        body('phoneNumber').notEmpty().withMessage('Phone number is required'),
        body('password').notEmpty().withMessage('Password is required'),
];

// login validator
export const loginValidator = (): ValidationChain[] => [
        body('email').notEmpty().withMessage('First Name is required'),
        body('password').notEmpty().withMessage('Password is required'),
];

// verify user validator
export const verifyUserValidator = (): ValidationChain[] => [
        body('verificationCode').notEmpty().withMessage('Verification code is required'),
];

// enable or disable user validator
export const userStatusValidator = (): ValidationChain[] => [
        body('userId').notEmpty().withMessage('User id is required'),
];

export const changePasswordValidator = (): ValidationChain[] => [
        body('oldPassword').notEmpty().withMessage('Old password is required'),
        body('newPassword').notEmpty().withMessage('New password required'),
];

export const forgotPasswordValidator = (): ValidationChain[] => [
        body('email').notEmpty().withMessage('Email is required')
];

export const verifyForgotPasswordValidator = (): ValidationChain[] => [
        body('code').notEmpty().withMessage('Code is required')
];


export const resendVerificationLinkValidator = (): ValidationChain[] => [
        body('email').notEmpty().withMessage('Email is required')
];

export const resetPasswordValidator = (): ValidationChain[] => [
        body('code').notEmpty().withMessage('Code is required'),
        body('newPassword').notEmpty().withMessage('New password required'),
];

export const postAccountDetailsValidator = (): ValidationChain[] => [
        body('accountName').notEmpty().withMessage('Account name is required'),
        body('accountNumber').notEmpty().withMessage('Account number required'),
        body('bankName').notEmpty().withMessage('Bank  name is required'),
        body('bankCode').notEmpty().withMessage('Bank code required'),
];

export const updateAccountDetailsValidator = (): ValidationChain[] => [
        body('accountName').notEmpty().withMessage('Account name is required'),
        body('accountNumber').notEmpty().withMessage('Account number required'),
        body('bankName').notEmpty().withMessage('Bank  name is required'),
        body('bankCode').notEmpty().withMessage('Bank code required')
];

export const createPinValidator = (): ValidationChain[] => [
        body('pin').notEmpty().withMessage('Pin is required')
];

export const updatePinValidator = (): ValidationChain[] => [
        body('oldPin').notEmpty().withMessage('Old pin is required'),
        body('newPin').notEmpty().withMessage('New Pin is required'),
];


export const forgotPinValidator = (): ValidationChain[] => [
        body('email').notEmpty().withMessage('Email  is required'),
        body('phoneNumber').notEmpty().withMessage('Phone number is required'),
];

export const resetPinValidator = (): ValidationChain[] => [
        body('pin').notEmpty().withMessage('Pin  is required'),
        body('code').notEmpty().withMessage('Code is required'),
];

export const postSubcategoryValidator = (): ValidationChain[] => [
        body('categoryname').notEmpty().withMessage('Category name is required'),
        body('categoryId').notEmpty().withMessage('Category Id required'),
        body('subcategoryname').notEmpty().withMessage('Sub category  name is required'),
        body('termsandconditions').notEmpty().withMessage('Terms and Condition is required'),
        body('nairarate').notEmpty().withMessage('Naira rate is required'),
        body('btcrate').notEmpty().withMessage('Btc rate is required'),
        body('cardapproveltime').notEmpty().withMessage('Card Approval time is required'),
        body('minimumAmount').notEmpty().withMessage('Minimum Amount is required'),
        body('maximumAmount').notEmpty().withMessage('Maximum amount is required'),
];

export const postContactSupportValidator = (): ValidationChain[] => [
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('email').notEmpty().withMessage('Email is required'),
        body('message').notEmpty().withMessage('Message is required'),
        body('subject').notEmpty().withMessage('Subject is required')
];



export const postGiftcardTradeValidator = (): ValidationChain[] => [
        body('subCategoryId').notEmpty().withMessage('Sub category id is required'),
        body('categoryId').notEmpty().withMessage('category id  is required'),
        body('imageUrl').notEmpty().isArray().withMessage(' Image url is required and must be an array'),
        body('amount').notEmpty().withMessage('Amount is required'),
     //   body('comment').optional().withMessage('Comment is required'),
        body('cardAmount').notEmpty().withMessage('card amount is required')
];




export const postConfigurationValidator = (): ValidationChain[] => [
        body('minimumWithdrawer').notEmpty().isNumeric().withMessage('Minumum withdrawwer is required and must be a number'),
        body('maximumWithdrawer').notEmpty().isNumeric().withMessage('Maximum withdrawer is required and must be a number'), 
];


export const postWithdrawRequestValidator = (): ValidationChain[] => [
        body('amount').notEmpty().isNumeric().withMessage('Amount is required and must be a number'),
        body('accountName').notEmpty().withMessage('Account name is required and must be a number'), 
        body('accountNumber').notEmpty().withMessage('Account name is required and must be a number'), 
        body('bankName').notEmpty().withMessage('Account name is required and must be a number'), 
        body('bankCode').notEmpty().withMessage('Account name is required and must be a number'), 
        body('narration').notEmpty().withMessage('Account name is required and must be a number'), 
        body('pin').notEmpty().withMessage('Pin is required and must be a number'), 
];



export const postFileValidator = (): ValidationChain[] => [
        body('file').notEmpty().withMessage('file is required'), 
];
