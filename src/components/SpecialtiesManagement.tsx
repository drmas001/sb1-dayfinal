import React, { useState, useEffect } from 'react';
import { Activity, Users, CheckCircle, XCircle, Search, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Patient {
  mrn: string;
  patient_name: string;
  admission_date: string;
  discharge_date: string | null;
  patient_status: 'Active' | 'Discharged';
}

interface SpecialtyData {
  specialty: string;
  patients: Patient[];
}

const specialtiesList = [
  'General Internal Medicine',
  'Respiratory Medicine',
  'Infectious Diseases',
  'Neurology',
  'Gastroenterology',
  'Rheumatology',
  'Hematology',
  'Thrombosis Medicine',
  'Immunology & Allergy'
];

const SpecialtiesManagement: React.FC = () => {
  const [specialtiesData, setSpecialtiesData] = useState<SpecialtyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    fetchSpecialtiesData();
  }, []);

  const fetchSpecialtiesData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visits')
        .select(`
          mrn,
          admission_date,
          discharge_date,
          patient_status,
          specialty,
          patients (patient_name)
        `)
        .order('admission_date', { ascending: false });

      if (error) throw error;

      const groupedData = specialtiesList.map(specialty => ({
        specialty,
        patients: data
          .filter(visit => visit.specialty === specialty)
          .map(visit => ({
            mrn: visit.mrn,
            patient_name: visit.patients.patient_name,
            admission_date: new Date(visit.admission_date).toLocaleDateString(),
            discharge_date: visit.discharge_date ? new Date(visit.discharge_date).toLocaleDateString() : null,
            patient_status: visit.patient_status
          }))
      }));

      setSpecialtiesData(groupedData);
    } catch (error) {
      setError('Failed to fetch specialties data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = (patients: Patient[]) => {
    if (!sortConfig) return patients;
    return [...patients].sort((a, b) => {
      if (a[sortConfig.key as keyof Patient] < b[sortConfig.key as keyof Patient]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof Patient] > b[sortConfig.key as keyof Patient]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredData = specialtiesData.map(specialty => ({
    ...specialty,
    patients: specialty.patients.filter(patient =>
      patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mrn.includes(searchTerm)
    )
  }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Specialties Management</h1>
      
      <div className="mb-4">
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredData.map((specialty) => (
        <div key={specialty.specialty} className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-indigo-500" />
              {specialty.specialty}
            </h2>
          </div>
          {specialty.patients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('patient_name')} className="flex items-center">
                        Patient Name
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('mrn')} className="flex items-center">
                        MRN
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('admission_date')} className="flex items-center">
                        Admission Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button onClick={() => handleSort('discharge_date')} className="flex items-center">
                        Discharge Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedData(specialty.patients).map((patient) => (
                    <tr key={patient.mrn}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <Link to={`/patient/${patient.mrn}`} className="hover:text-indigo-600">
                            {patient.patient_name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.mrn}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.admission_date}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{patient.discharge_date || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          patient.patient_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {patient.patient_status === 'Active' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : (
                            <XCircle className="h-4 w-4 mr-1" />
                          )}
                          {patient.patient_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-5 sm:px-6 text-gray-500">No patients in this specialty</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SpecialtiesManagement;