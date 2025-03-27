import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Form, Input, Select, Radio } from "antd";

// Define types for the form and department
interface Department {
  id: number;
  name: string;
}

interface RegistrationFormData {
  username: string;
  email: string;
  password: string;
  role: "HR" | "HOD";
  department_id: number;
}

const UserRegistration: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get<Department[]>(
          "http://127.0.0.1:8000/departments/"
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        alert("Failed to fetch departments");
      }
    };

    fetchDepartments();
  }, []);

  // Handle form submission
  const onFinish = async (values: RegistrationFormData) => {
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/register/", values);

      // ✅ Show success message using alert
      alert("Registration successful!");

      // ✅ Navigate to login page
      navigate("/login");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.detail || "Registration failed!");
      } else {
        alert("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div
        className="w-96 p-6 shadow-lg rounded-lg border border-gray-200 bg-white"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">User Registration</h2>
        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          {/* Username Field */}
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: "Please input your username!" },
              { min: 3, message: "Username must be at least 3 characters" },
            ]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          {/* Email Field */}
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please input your password!" },
              { min: 6, message: "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          {/* Role Selection */}
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role!" }]}
          >
            <Radio.Group>
              <Radio value="HR">HR</Radio>
              <Radio value="HOD">HOD</Radio>
            </Radio.Group>
          </Form.Item>

          {/* Department Selection */}
          <Form.Item
            name="department_id"
            label="Department"
            rules={[{ required: true, message: "Please select a department!" }]}
          >
            <Select placeholder="Select a department">
              {departments.map((dept) => (
                <Select.Option key={dept.id} value={dept.id}>
                  {dept.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
              Register
            </Button>
          </Form.Item>

          <div className="text-center">
            <span>Already have an account? </span>
            <Button type="link" onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default UserRegistration;
