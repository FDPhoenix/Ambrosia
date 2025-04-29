//redux/bookingSlice.tsx
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
    userId: any;
    name: string;
    phone: string;
    email: string;
    bookingDate: string;
    startTime: string;
    tableId: string;
    dishes: { dishId: string; quantity: number }[];
}

const initialState: BookingState = {
    userId: null, // ✅ Thêm userId vào Redux state
    name: "",
    phone: "",
    email: "",
    bookingDate: "",
    startTime: "",
    tableId: "",
    dishes: [],
};


const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setBookingInfo: (state, action: PayloadAction<Partial<BookingState>>) => {
            return { ...state, ...action.payload };
        },
        resetBooking: () => initialState,
    },
});

export const { setBookingInfo, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
