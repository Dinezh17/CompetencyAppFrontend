
import  { useState, useEffect } from 'react';
import axios from 'axios';

interface Competency {
  code: string;
  name: string;
}

interface Role {
  role_code: string;
  name: string;
}

const RoleCompetencyAssignment = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompetencies, setSelectedCompetencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, compsRes] = await Promise.all([
          axios.get('/roles'),
          axios.get('/competencies')
        ]);
        setRoles(rolesRes.data);
        setCompetencies(compsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!selectedRole || selectedCompetencies.length === 0) return;
    
    setLoading(true);
    try {
      await axios.post(`/roles/${selectedRole}/competencies`, selectedCompetencies);
      alert('Competencies assigned successfully!');
      setSelectedCompetencies([]);
    } catch (error) {
      console.error('Assignment failed:', error);
      alert('Failed to assign competencies');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assign Competencies to Role</h1>
      
      <div className="space-y-6">
        {/* Role Selection Dropdown */}
        <div>
          <label className="block mb-2 font-medium">Select Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select a Role --</option>
            {roles.map(role => (
              <option key={role.role_code} value={role.role_code}>
                {role.name} ({role.role_code})
              </option>
            ))}
          </select>
        </div>

        {/* Competency Multi-select */}
        <div>
          <label className="block mb-2 font-medium">Select Competencies:</label>
          <select
            multiple
            size={8}
            value={selectedCompetencies}
            onChange={(e) => 
              setSelectedCompetencies(
                Array.from(e.target.selectedOptions, opt => opt.value)
              )
            }
            className="w-full p-2 border rounded"
            disabled={!selectedRole}
          >
            {competencies.map(comp => (
              <option key={comp.code} value={comp.code}>
                {comp.name} ({comp.code})
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            Hold Ctrl/Cmd to select multiple
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedRole || selectedCompetencies.length === 0 || loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Assigning...' : 'Assign Competencies'}
        </button>
      </div>
    </div>
  );
};

export default RoleCompetencyAssignment;