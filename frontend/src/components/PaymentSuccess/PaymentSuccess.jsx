import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PAY_URL} from "../../index";

const PaymentSuccess = () => {
    const [message, setMessage] = useState("Processing your payment...");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const paymentId = searchParams.get("payment_id");

        if (!paymentId) {
            setMessage("Payment ID not provided.");
            return;
        }

        fetch(`${PAY_URL}payment/check_status/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ payment_id: paymentId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    setMessage(data.message);
                } else {
                    setMessage("Failed to process payment. Please contact support.");
                }
            })
            .catch((error) => {
                console.error("Error checking payment status:", error);
                setMessage("Error processing payment. Please try again later.");
            });
    }, [searchParams]);

    return (
        <div>
            <h1>Payment Status</h1>
            <p>{message}</p>
        </div>
    );
};

export default PaymentSuccess;
