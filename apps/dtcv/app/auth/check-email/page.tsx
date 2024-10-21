import Link from "next/link";
import { Suspense } from "react";
import Spinner from "@/components/ui/spinner"; // Import the Spinner component

const CheckEmailContent = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <div className="flex-grow flex items-center justify-center relative z-10">
        <div className="w-full max-w-md p-8 bg-card shadow-md rounded-lg text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Check your email
          </h1>
          <p className="text-muted-foreground mb-6">
            We've sent a confirmation link to your email address. Please check
            your inbox and click the link to verify your account.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            If you can't find the email, please check your spam folder or try
            again.
          </p>
          <Link
            href="/login"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function CheckEmail() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner />
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
