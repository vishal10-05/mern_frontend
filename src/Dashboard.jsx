import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

function Dashboard({ setIsLoggedIn, user }) {
    const [rooms, setRooms] = useState([]);
    const [room, setRoom] = useState({ guestName: "", hotel: "", roomNumber: "" });
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && user.email) {
            fetchRooms();
        }
    }, [user]);

    const fetchRooms = async () => {
        try {
            const response = await axios.get("https://mern-backend-vto0.onrender.com/viewRooms", {
                params: { email: user.email }
            });
            setRooms(response.data);
        } catch (error) {
            toast.error("Failed to fetch rooms");
        }
    };

    const handleChange = (e) => {
        setRoom({ ...room, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (!user || !user.email) {
            toast.error("User not authenticated. Please log in again.");
            setIsLoggedIn(false);
            navigate('/');
            return;
        }

        const { guestName, hotel, roomNumber } = room;
        if (!guestName.trim() || !hotel.trim() || !roomNumber.trim()) {
            toast.error("All fields are required and cannot be empty!");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = { ...room, createdBy: user.email };
            if (editId) {
                await axios.put(`https://mern-backend-vto0.onrender.com/editRoom/${editId}`, payload);
                toast.success("Room Updated Successfully");
            } else {
                await axios.post("https://mern-backend-vto0.onrender.com/addRoom", payload);
                toast.success("Room Added Successfully");
            }
            setRoom({ guestName: "", hotel: "", roomNumber: "" });
            setEditId(null);
            await fetchRooms();
        } catch (error) {
            toast.error(error.response?.data?.error || error.message || "Failed to add room");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (room) => {
        setRoom({ guestName: room.guestName, hotel: room.hotel, roomNumber: room.roomNumber });
        setEditId(room._id);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this room?")) {
            try {
                await axios.delete(`https://mern-backend-vto0.onrender.com/deleteRoom/${id}`);
                toast.success("Room Deleted Successfully");
                await fetchRooms();
            } catch (error) {
                toast.error("Failed to delete room");
            }
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        navigate('/');
    };

    return (
        <div className="dashboard-container justify-centre">
            <div className="dashboard-header">
                <h1>Hotel Room Management for {user?.name}</h1>
                <div className="action-buttons">
                    <Link 
                        to="#" 
                        onClick={() => setRoom({ guestName: "", hotel: "", roomNumber: "" })} 
                        className="text-blue-500 hover:underline"
                    >
                        Add New Room →
                    </Link>
                    <button 
                        onClick={handleLogout} 
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit}>
                    <input
                        name="guestName"
                        placeholder="Guest Name"
                        value={room.guestName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="hotel"
                        placeholder="Room Type"
                        value={room.hotel}
                        onChange={handleChange}
                        required
                    />
                    <input
                        name="roomNumber"
                        placeholder="Room Number"
                        value={room.roomNumber}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : editId ? "Update Room" : "Add Room"}
                    </button>
                </form>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Sl.No</th>
                            <th>Guest Name</th>
                            <th>Room Type</th>
                            <th>Room Number</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((r, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{r.guestName}</td>
                                <td>{r.hotel}</td>
                                <td>{r.roomNumber}</td>
                                <td className="action-icons">
                                    <button onClick={() => handleEdit(r)} className="edit">
                                        <FaEdit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(r._id)} className="delete">
                                        <FaTrash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ToastContainer position="top-left" autoClose={3000} hideProgressBar closeOnClick />
        </div>
    );
}

export default Dashboard;
