/** @format */

import { use } from "react";
import BookingDetailsClient from "@/components/details/BookingDetailsClient";

export default function TransferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    return (
        <div className="p-4 md:p-8">
            <BookingDetailsClient bookingId={id} type="transfer" />
        </div>
    );
}
