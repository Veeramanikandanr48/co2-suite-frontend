"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-provider"
import { EyeIcon, EyeOffIcon, Loader2, X } from "lucide-react"
import FormInput from "~/components/reusables/form-fields/form-input";
import logo from "../../../../public/images/OMAI-Logo-RGB-Color.svg"
import { useRouter } from "next/navigation"
import { LoginFormData } from "~/types/users"
import { FORM_DEFAULT_VALUES } from "~/lib/variables"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider, SubmitHandler } from "react-hook-form"
import { LoginFormSchema } from "~/lib/schemas"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { LOGIN_TEST_IDS } from "~/components/test-ids/login-ids";
import { useLoader } from "@/context/loader-context";

const RESEND_COUNTDOWN_TIME = 30;

// Components
const defaultFormValues: LoginFormData = FORM_DEFAULT_VALUES.loginForm;

const ForgotPasswordModal = ({ isOpen, onClose, email }: { isOpen: boolean; onClose: () => void; email?: string }) => {
  const [countdown, setCountdown] = useState(RESEND_COUNTDOWN_TIME);
  const [isResendDisabled, setIsResendDisabled] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isOpen && isResendDisabled) {
      timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setIsResendDisabled(false);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen, isResendDisabled]);

  if (!isOpen) return null;

  const handleResendClick = () => {
    setIsResendDisabled(true);
    setCountdown(RESEND_COUNTDOWN_TIME);
  };

  const handleClose = () => {
    setIsResendDisabled(true);
    setCountdown(RESEND_COUNTDOWN_TIME);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent 
        data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_MODAL}
        className="bg-white h-[239px] w-[503px] absolute p-6  rounded-lg shadow-md text-center"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <button
          data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_ICON}
          onClick={handleClose}
          className="absolute top-4 right-4 text-button-close transition-colors"
          aria-label="Close modal"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="text-base font-medium text-black relative top-6">Reset Password</h2>

        {/* Content */}
        <div className="flex flex-col gap-0 mt-6">
          <p className="text-base text-modal-content font-normal">
            Check your email for the reset link sent to
          </p>
          <p className="text-base text-modal-content font-bold">{email}</p>
        </div>

        {/* Resend Section */}
        <div className="flex items-center justify-center text-xs text-input-placeholder italic ">
          <p>Didn&apos;t receive the link?</p>
          <button
            data-testid={LOGIN_TEST_IDS.RESEND_LINK_BUTTON}
            onClick={!isResendDisabled ? handleResendClick : undefined}
            disabled={isResendDisabled}
            className={`ml-1 font-bold ${isResendDisabled
              ? 'text-black cursor-not-allowed italic'
              : 'text-link hover:text-link-active cursor-pointer italic'
              }`}
            tabIndex={isResendDisabled ? -1 : 0}
            aria-disabled={isResendDisabled}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (!isResendDisabled) handleResendClick();
              }
            }}
          >
            {isResendDisabled ? `Re-send link in ${countdown}s` : 'Resend link'}
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-center">
          <Button
            data-testid={LOGIN_TEST_IDS.MODAL_CLOSE_BUTTON}
            variant="outline"
            onClick={handleClose}
            className="w-[190px] h-[38px] text-white bg-primary-500 hover:bg-primary-600 mt-2"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { signIn, user, accessToken } = useAuth();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoader();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: defaultFormValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const { handleSubmit, formState: { isDirty } } = form;

  useEffect(() => {
    if (user && accessToken) {
      router.push("/device-integration/system-integration");
    } 
  }, [user, accessToken, router]);

  const handleFormSubmit: SubmitHandler<LoginFormData> = async (values) => {
    try {
      setIsLoading(true)
      await signIn(values.username, values.password);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  return (
  <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5]">
  <div className="w-full max-w-[500px]">
    <FormProvider {...form}>
      <form
        data-testid={LOGIN_TEST_IDS.FORM}
        id="login-form"
        onSubmit={handleSubmit(handleFormSubmit)}
        className="bg-white rounded-xl p-8 shadow-sm w-[456px] border border-input-border flex flex-col gap-4"
      >
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
              <Image
                src={logo}
                alt="Origin Medical Logo"
                width={150}
                height={40}
                priority
              />
          <h5 className="text-center text-xl font-semibold text-text-primary">
            Exam Assistant - Admin Mode
          </h5>
        </div>

        <div className="gap-5 mt-10">
          {/* Username Field */}
          <div className="mb-6">
            <FormInput
              data-testid={LOGIN_TEST_IDS.USERNAME_INPUT}
              name="username"
              label="Username"
              type="email"
              placeholder="Enter your email"
              disabled={isLoading}
              vertical
              className={`w-[384px] h-[44px] placeholder:font-normal text-base font-`}
              labelClassName="text-sm font-medium"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <div className="relative">
              <FormInput
                data-testid={LOGIN_TEST_IDS.PASSWORD_INPUT}
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                disabled={isLoading}
                vertical
                className={`w-[384px] h-[44px] placeholder:font-normal text-base`}
                labelClassName="text-sm font-medium"
              />
              <Button
                data-testid={LOGIN_TEST_IDS.SHOW_PASSWORD_BUTTON}
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-12 -translate-y-1/2 flex items-center justify-center text-gray-400 hover:bg-white"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeOffIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex justify-end">
              <button
                data-testid={LOGIN_TEST_IDS.FORGOT_PASSWORD_BUTTON}
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-link hover:text-link-active mt-1 underline italic"
              >
                Forgot password
              </button>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="flex flex-row justify-center mt-6">
          <Button
            data-testid={LOGIN_TEST_IDS.LOGIN_BUTTON}
            type="submit"
            disabled={isLoading || !isDirty}
            className="w-[190px] h-[38px] rounded-[4px] bg-primary text-sm font-bold text-light-100 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-primary/50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>

    <p className="text-center text-sm text-header-secondary mt-10 mr-8">
      © 2024 Origin Medical. All rights reserved.
    </p>
  </div>

  <ForgotPasswordModal
    isOpen={showForgotPasswordModal}
    onClose={() => setShowForgotPasswordModal(false)}
    email={form.getValues("username")}
  />
</div>
  );
};

export default SignIn;