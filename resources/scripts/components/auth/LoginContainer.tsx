/* eslint-disable prettier/prettier */

import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import tw from 'twin.macro';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';
import login from '@/api/auth/login';
import { useStoreState } from 'easy-peasy';  // Added import for useStoreState

interface Values {
    username: string;
    password: string;
}

const LoginContainer: React.FC<RouteComponentProps> = ({ history }) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, [clearFlashes]);

    const onSubmit = async (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        try {
            const response = await login({ ...values, recaptchaData: token });
            if (response.complete) {
                const redirectUrl: string = response.intended || '/';
                window.location.href = redirectUrl;
            } else {
                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            }
        } catch (error) {
            console.error(error);
            setToken('');
            if (ref.current) ref.current.reset();
            setSubmitting(false);
            clearAndAddHttpError({ error });
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Login Form Section */}
            <div className="flex-1 flex items-center justify-center bg-gray-800 p-8">
                <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl p-8">
                    <h2 className="text-3xl font-bold mb-6 text-center text-white">Login to Continue</h2>
                    <Formik
                        initialValues={{ username: '', password: '' }}
                        validationSchema={object().shape({
                            username: string().required('A username or email must be provided.'),
                            password: string().required('Please enter your account password.'),
                        })}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-6">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                                        Username or Email
                                    </label>
                                    <Field
                                        id="username"
                                        name="username"
                                        type="text"
                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <ErrorMessage name="username" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                                        Password
                                    </label>
                                    <Field
                                        id="password"
                                        name="password"
                                        type="password"
                                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Logging In...' : 'Login'}
                                </button>
                                {recaptchaEnabled && (
                                    <Reaptcha
                                        ref={ref}
                                        size={'invisible'}
                                        sitekey={siteKey || '_invalid_key'}
                                        onVerify={(response) => setToken(response)}
                                        onExpire={() => setToken('')}
                                    />
                                )}
                                <div className="text-center">
                                    <Link
                                        to="/auth/password"
                                        css={tw`text-sm text-blue-400 hover:text-blue-300`}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    <p className="text-center text-gray-500 text-xs mt-8">
                        &copy; 2021 - {new Date().getFullYear()} Astral-Cloud
                    </p>
                </div>
            </div>
            {/* Image Section */}
            <div className="hidden lg:block lg:w-1/2 bg-cover bg-center" style={{ backgroundImage: `url('https://th.bing.com/th/id/R.7b6e101024245dbee204e43664272065?rik=AoJEa3%2b6Z%2bfQew&pid=ImgRaw&r=0')` }}>
            </div>
        </div>
    );
};

export default LoginContainer;
