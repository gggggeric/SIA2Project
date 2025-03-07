import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar"; // Import the Navbar component
import "./UserCrud.css"; // Import external styles

const UserCrudPage = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({ name: "", email: "", password: "", address: "", userType: "user" });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:5001/admin/users");
            setUsers(response.data);
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
            } else {
                await axios.post("http://localhost:5001/users/users", formData);
            }
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error("Error saving user:", error);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setFormData({ name: user.name, email: user.email, address: user.address, userType: user.userType });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5001/admin/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user:", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: "", email: "", password: "", address: "", userType: "user" });
        setEditingUser(null);
    };

    return (
        <>
            <Navbar /> {/* Navbar included here */}
            <div className="user-crud-container">
                {/* Left Side - Table */}
                <div className="user-table-container">
                    <h2>User List</h2>
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>User Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.address}</td>
                                    <td>{user.userType}</td>
                                    <td className="action-buttons">
                                        <button className="edit-btn" onClick={() => handleEdit(user)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Right Side - Form */}
                <div className="user-form-container">
                    <h2>{editingUser ? "Edit User" : "Add User"}</h2>
                    <form onSubmit={handleSubmit} className="user-form">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required disabled={editingUser} />
                        {!editingUser && <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" required />}
                        <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Address" required />
                        <select name="userType" value={formData.userType} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="form-buttons">
                            <button type="submit" className="submit-btn">{editingUser ? "Update User" : "Add User"}</button>
                            {editingUser && <button type="button" className="cancel-btn" onClick={resetForm}>Cancel</button>}
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default UserCrudPage;
