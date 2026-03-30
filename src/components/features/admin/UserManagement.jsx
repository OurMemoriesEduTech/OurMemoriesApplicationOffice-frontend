// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Modal,
  Badge,
  Toast,
  ToastContainer,
  Row,
  Col,
  InputGroup,
  FormControl,
  Card,
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import {
  FiPlus,
  FiDownload,
  FiSearch,
  FiEdit2,
  FiToggleLeft,
  FiTrash2,
  FiUsers,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import axios from "axios";
import "./UserManagement.css";

const UserManagement = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    role: "USER",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    };

  // Toast
  const [toast, setToast] = useState({
    show: false,
    msg: "",
    variant: "success",
  });

  // -------------------------------------------------
  // Fetch all users on mount
  // -------------------------------------------------
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/users`,
        {
          withCredentials: true,
        },
      );
      setUsers(response.data);
      setFiltered(response.data);
    } catch (err) {
      showToast("Failed to load users", "danger");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------
  // Filtering
  // -------------------------------------------------
  useEffect(() => {
    let list = users;

    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }
    if (filterRole) list = list.filter((u) => u.role === filterRole);
    if (filterStatus) list = list.filter((u) => u.status === filterStatus);

    setFiltered(list);
  }, [search, filterRole, filterStatus, users]);

  // -------------------------------------------------
  // Modal helpers
  // -------------------------------------------------
  const openAdd = () => {
    setEditing(null);
    setForm({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      role: "USER",
      password: "",
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      email: user.email || "",
      role: user.role || "USER",
      password: "", // don't prefill password
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------
  // CRUD Operations (Real API Calls)
  // -------------------------------------------------
  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      showToast("First name, last name and email are required.", "danger");
      return;
    }

    setSaving(true);

    try {
      if (editing) {
        // Update
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/users/${editing.id}`,
          form,
          {
            withCredentials: true,
          },
        );
        showToast("User updated successfully.");
      } else {
        // Create
        await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/users`, form, {
          withCredentials: true,
        });
        showToast("User added successfully.");
      }

      fetchUsers(); // Refresh list
      closeModal();
    } catch (err) {
      showToast(err.response?.data?.message || "Operation failed", "danger");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/users/${id}/toggle-status`,
        {},
        {
          withCredentials: true,
        },
      );
      showToast("Status changed successfully.");
      fetchUsers();
    } catch (err) {
      showToast("Failed to change status", "danger");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api"}/admin/users/${id}`, {
        withCredentials: true,
      });
      showToast("User deleted successfully.", "danger");
      fetchUsers();
    } catch (err) {
      showToast("Failed to delete user", "danger");
    }
  };

  const showToast = (msg, variant = "success") => {
    setToast({ show: true, msg, variant });
    setTimeout(
      () => setToast({ show: false, msg: "", variant: "success" }),
      3000,
    );
  };

  // -------------------------------------------------
  // CSV Export (using real filtered data)
  // -------------------------------------------------
  const exportCSV = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Phone Number",
      "Email",
      "Role",
      "Status",
    ];
    const rows = filtered.map((u) => [
      u.id,
      u.firstName || "",
      u.lastName || "",
      u.phoneNumber || "",
      u.email,
      u.role,
      u.status,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `users_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <AdminLayout>
      <Container fluid>
        {/* Professional Header */}
        <div className="user-management-header mb-4">
          <Row className="align-items-center">
            <Col md={8}>
              <div className="header-title">
                <FiUsers size={40} />
                <h1 className="mb-0">User Management</h1>
              </div>
              <p className="header-subtitle">
                Manage applicants and administrator accounts
              </p>
            </Col>
            <Col md={4} className="text-md-end">
              <div className="stats-card">
                <div className="stats-card-value">{users.length}</div>
                <div className="stats-card-label">Total Users</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 d-flex gap-2 flex-wrap">
          <Button className="btn-add-user" onClick={openAdd}>
            <FiPlus size={18} /> Add New User
          </Button>
          <Button className="btn-action-secondary" onClick={exportCSV}>
            <FiDownload className="me-2" size={18} /> Export CSV
          </Button>
        </div>

        {/* Professional Filters */}
        <Card className="filter-card mb-4">
          <Card.Body>
            <div className="d-flex align-items-center mb-3">
              <FiSearch
                className="me-2"
                style={{ color: "#1e3a8a" }}
                size={20}
              />
              <h6 className="mb-0 fw-bold" style={{ color: "#1e3a8a" }}>
                Filter Users
              </h6>
            </div>
            <Row className="g-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-2"
                    style={{ color: "#475569" }}
                  >
                    Search by Name or Email
                  </Form.Label>
                  <InputGroup className="input-group-pro">
                    <InputGroup.Text
                      style={{
                        backgroundColor: "#f1f5f9",
                        borderColor: "#e2e8f0",
                      }}
                    >
                      <FiSearch size={18} style={{ color: "#64748b" }} />
                    </InputGroup.Text>
                    <FormControl
                      placeholder="Enter name or email..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ borderColor: "#e2e8f0" }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-2"
                    style={{ color: "#475569" }}
                  >
                    Role
                  </Form.Label>
                  <Form.Select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="form-select-pro"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <option value="">All Roles</option>
                    <option value="USER">👤 Applicant</option>
                    <option value="ADMIN">⚙️ Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label
                    className="small fw-bold mb-2"
                    style={{ color: "#475569" }}
                  >
                    Status
                  </Form.Label>
                  <Form.Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="form-select-pro"
                    style={{ borderColor: "#e2e8f0" }}
                  >
                    <option value="">All Status</option>
                    <option value="ACTIVE">✓ Active</option>
                    <option value="SUSPENDED">⏸ Suspended</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="outline-secondary"
                  className="w-100 btn-reset-pro"
                  onClick={() => {
                    setSearch("");
                    setFilterRole("");
                    setFilterStatus("");
                  }}
                  style={{ borderRadius: "8px", fontWeight: "600" }}
                >
                  Clear All
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Professional Table */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Loading users...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-icon">
              <FiUsers size={48} />
            </div>
            <p className="empty-state-message">
              No users match the filters. Try adjusting your search criteria.
            </p>
          </div>
        ) : (
          <div className="table-professional">
            <Table hover responsive className="mb-0">
              <thead>
                <tr>
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                    }}
                  >
                    User Name
                  </th>
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                    }}
                  >
                    Email Address
                  </th>
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                    }}
                  >
                    Status
                  </th>
                  {/* <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                      textAlign: "center",
                    }}
                  >
                    Created At 
                  </th> */}
                  <th
                    style={{
                      color: "#1e3a8a",
                      fontWeight: "600",
                      padding: "15px",
                      textAlign: "center",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, index) => (
                  <tr
                    key={u.id}
                    className="table-row-pro"
                    style={{ borderBottom: "1px solid #e2e8f0" }}
                  >
                    <td
                      style={{
                        padding: "12px 15px",
                        color: "#64748b",
                        fontWeight: "500",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 15px",
                        color: "#1e293b",
                        fontWeight: "600",
                      }}
                    >
                      {u.role === "ADMIN" ? (
                        <FiUserX
                          className="me-2"
                          size={16}
                          style={{ color: "#ef4444" }}
                        />
                      ) : (
                        <FiUserCheck
                          className="me-2"
                          size={16}
                          style={{ color: "#3b82f6" }}
                        />
                      )}
                      {u.firstName} {u.lastName}
                    </td>
                    <td style={{ padding: "12px 15px", color: "#64748b" }}>
                      {u.email}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <Badge
                        bg={u.role === "ADMIN" ? "danger" : "primary"}
                        className="badge-pro"
                        style={{
                          fontSize: "0.85rem",
                          padding: "6px 12px",
                          borderRadius: "6px",
                        }}
                      >
                        {u.role === "ADMIN" ? "⚙️ Admin" : "👤 Applicant"}
                      </Badge>
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <Badge
                        bg={u.status === "ACTIVE" ? "success" : "secondary"}
                        className="badge-status-pro"
                        style={{
                          fontSize: "0.85rem",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {u.status === "ACTIVE" ? (
                          <>✓ Active</>
                        ) : (
                          <>⏸ Suspended</>
                        )}
                      </Badge>
                    </td>
                    {/* <td style={{ padding: '12px 15px', color: '#64748b', fontSize: '0.9rem' }}>{formatDate(u.createdAt) || 'N/A'}</td> */}
                    <td style={{ padding: "12px 15px", textAlign: "center" }}>
                      <div
                        className="btn-group-pro"
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                        }}
                      >
                        <Button
                          size="sm"
                          className="btn-action-small"
                          onClick={() => openEdit(u)}
                          style={{
                            backgroundColor: "#3b82f6",
                            borderColor: "#3b82f6",
                            color: "white",
                            borderRadius: "6px",
                            fontWeight: "600",
                            padding: "6px 12px",
                          }}
                          title="Edit"
                        >
                          <FiEdit2 size={14} className="me-1" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          className="btn-action-small"
                          onClick={() => toggleStatus(u.id)}
                          style={{
                            backgroundColor:
                              u.status === "ACTIVE" ? "#f59e0b" : "#10b981",
                            borderColor:
                              u.status === "ACTIVE" ? "#f59e0b" : "#10b981",
                            color: "white",
                            borderRadius: "6px",
                            fontWeight: "600",
                            padding: "6px 12px",
                          }}
                          title={u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        >
                          <FiToggleLeft size={14} className="me-1" />{" "}
                          {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          className="btn-action-small"
                          onClick={() => deleteUser(u.id)}
                          style={{
                            backgroundColor: "#ef4444",
                            borderColor: "#ef4444",
                            color: "white",
                            borderRadius: "6px",
                            fontWeight: "600",
                            padding: "6px 12px",
                          }}
                          title="Delete"
                        >
                          <FiTrash2 size={14} className="me-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* ---------- Professional Add / Edit Modal ---------- */}
        <Modal
          show={showModal}
          onHide={closeModal}
          centered
          className="modal-professional"
        >
          <Modal.Header
            closeButton
            style={{
              backgroundColor: "#1e3a8a",
              color: "white",
              borderRadius: "12px 12px 0 0",
              border: "none",
            }}
          >
            <Modal.Title className="fw-bold" style={{ fontSize: "1.3rem" }}>
              {editing ? "✏️ Edit User" : "➕ Add New User"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ backgroundColor: "#f8fafc", padding: "24px" }}>
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold mb-2"
                      style={{ color: "#1e3a8a" }}
                    >
                      First Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="e.g. John"
                      className="form-control-pro"
                      style={{
                        borderRadius: "8px",
                        borderColor: "#e2e8f0",
                        padding: "10px 12px",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label
                      className="fw-bold mb-2"
                      style={{ color: "#1e3a8a" }}
                    >
                      Last Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="e.g. Applicant"
                      className="form-control-pro"
                      style={{
                        borderRadius: "8px",
                        borderColor: "#e2e8f0",
                        padding: "10px 12px",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-bold mb-2"
                  style={{ color: "#1e3a8a" }}
                >
                  Phone Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="+27 123 456 789"
                  className="form-control-pro"
                  style={{
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    padding: "10px 12px",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-bold mb-2"
                  style={{ color: "#1e3a8a" }}
                >
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="form-control-pro"
                  style={{
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    padding: "10px 12px",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label
                  className="fw-bold mb-2"
                  style={{ color: "#1e3a8a" }}
                >
                  Role Assignment
                </Form.Label>
                <Form.Select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-select-pro"
                  style={{
                    borderRadius: "8px",
                    borderColor: "#e2e8f0",
                    padding: "10px 12px",
                  }}
                >
                  <option value="USER">
                    👤 User - Can submit applications
                  </option>
                  <option value="ADMIN">⚙️ Admin - Full system access</option>
                </Form.Select>
              </Form.Group>

              {!editing && (
                <Form.Group className="mb-4">
                  <Form.Label
                    className="fw-bold mb-2"
                    style={{ color: "#1e3a8a" }}
                  >
                    Temporary Password
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Leave blank to auto-generate"
                    className="form-control-pro"
                    style={{
                      borderRadius: "8px",
                      borderColor: "#e2e8f0",
                      padding: "10px 12px",
                    }}
                  />
                  <Form.Text className="text-muted small mt-1">
                    User will be prompted to change this on first login
                  </Form.Text>
                </Form.Group>
              )}
            </Form>
          </Modal.Body>

          <Modal.Footer
            style={{
              backgroundColor: "#f1f5f9",
              borderTop: "1px solid #e2e8f0",
              padding: "16px 24px",
              gap: "12px",
            }}
          >
            <Button
              variant="outline-secondary"
              onClick={closeModal}
              style={{ borderRadius: "8px", fontWeight: "600" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                backgroundColor: "#3b82f6",
                borderColor: "#3b82f6",
                borderRadius: "8px",
                fontWeight: "600",
                padding: "8px 20px",
              }}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : editing ? (
                "💾 Save Changes"
              ) : (
                "➕ Add User"
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* ---------- Professional Toast Notifications ---------- */}
        <ToastContainer position="bottom-end" className="p-3">
          <Toast
            show={toast.show}
            bg={toast.variant}
            onClose={() => setToast({ ...toast, show: false })}
            delay={3000}
            autohide
          >
            <Toast.Header
              style={{
                backgroundColor:
                  toast.variant === "danger" ? "#ef4444" : "#10b981",
                color: "white",
                borderRadius: "8px 8px 0 0",
                border: "none",
              }}
            >
              <strong className="me-auto">
                {toast.variant === "danger" ? "✕ Error" : "✓ Success"}
              </strong>
            </Toast.Header>
            <Toast.Body
              style={{
                backgroundColor:
                  toast.variant === "danger" ? "#fef2f2" : "#ecfdf5",
                color: toast.variant === "danger" ? "#ef4444" : "#10b981",
                borderRadius: "0 0 8px 8px",
                fontWeight: "500",
              }}
            >
              {toast.msg}
            </Toast.Body>
          </Toast>
        </ToastContainer>
      </Container>
    </AdminLayout>
  );
};

export default UserManagement;
