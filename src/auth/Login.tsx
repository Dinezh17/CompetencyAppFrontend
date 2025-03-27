import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Form, Input, Button, Card, Typography } from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { AuthContext } from "./AuthContext";

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext)!; // ✅ Access AuthContext
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/login/", values);

      const userData = {
        token: response.data.access_token,
        username: response.data.user,
        role: response.data.role,
        departmentId: response.data.department_id,
      };

      login(userData); // ✅ Update AuthContext
      alert("Login Successful!");
      navigate("/dashboard");
    } catch (error) {
      alert("Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-80 p-6 shadow-lg rounded-lg border border-gray-200">
        <div className="text-center mb-4">
          <Title level={4} className="text-gray-700">
            Login
          </Title>
        </div>

        <Form name="login" layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Enter your email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Enter your password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} className="w-full rounded-md" size="large">
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Text>Don't have an account?</Text>
          <Button type="link" onClick={() => navigate("/register")}>
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
