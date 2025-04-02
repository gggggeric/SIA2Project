import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserCrud.css";

const UserCrudPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ 
        name: "", 
        email: "", 
        password: "", 
        address: "", 
        userType: "user",
        gender: "male" // Added gender with default value
    });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5001/admin/users");
            const usersWithId = response.data.map(user => ({
                ...user,
                id: user._id
            }));
            setUsers(usersWithId);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await axios.put(`http://localhost:5001/admin/users/${editingUser._id}`, formData);
                toast.success("User updated successfully!", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
            } else {
                await axios.post("http://localhost:5001/admin/users", formData);
                toast.success("User added successfully!", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
            }
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error("Error saving user!", {
                position: "bottom-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            address: user.address,
            userType: user.userType,
            gender: user.gender // Added gender to edit form
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5001/admin/users/${id}`);
                fetchUsers();
                toast.success("User deleted successfully!", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Error deleting user!", {
                    position: "bottom-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "colored",
                });
            }
        }
    };

    const resetForm = () => {
        setFormData({ 
            name: "", 
            email: "", 
            password: "", 
            address: "", 
            userType: "user",
            gender: "male" // Reset gender to default
        });
        setEditingUser(null);
    };

    const columns = [
        { field: "name", headerName: "Name", width: 150 },
        { field: "email", headerName: "Email", width: 200 },
        { field: "address", headerName: "Address", width: 250 },
        { field: "userType", headerName: "User Type", width: 120 },
        { field: "gender", headerName: "Gender", width: 100 }, // Added gender column
        {
            field: "actions",
            headerName: "Actions",
            width: 180,
            renderCell: (params) => (
                <>
                    <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        onClick={() => handleEdit(params.row)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        style={{ marginLeft: "10px" }}
                        onClick={() => handleDelete(params.row._id)}
                    >
                        Delete
                    </Button>
                </>
            ),
        },
    ];

    return (
        <>
            <Navbar />
            <div className="user-crud-container">
                <div className="user-table-container">
                    <h2>User List</h2>
                    <div style={{ height: 400, width: "100%" }}>
                        <DataGrid
                            rows={users}
                            columns={columns}
                            pageSize={5}
                            rowsPerPageOptions={[5]}
                        />
                    </div>
                </div>

                <div className="user-form-container">
                    <h2>{editingUser ? "Edit User" : "Add User"}</h2>
                    <form onSubmit={handleSubmit} className="user-form">
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Name"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            required
                            disabled={editingUser}
                        />
                        {!editingUser && (
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                required
                            />
                        )}
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Address"
                            required
                        />
                        <select
                            name="userType"
                            value={formData.userType}
                            onChange={handleChange}
                        >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">
                                {editingUser ? "Update User" : "Add User"}
                            </button>
                            {editingUser && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={resetForm}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default UserCrudPage;